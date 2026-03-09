import { CodeValue } from "@/CodeValue";
import {
  type UserData,
  type Node,
  buildMerkleSumTreeProof,
  userDataToUserId,
  toHex32,
} from "sdk";
import Circuit from "../../target/zk_proof_of_liabilities.json";
import { useCallback, useState } from "react";
import { Noir, type CompiledCircuit } from "@noir-lang/noir_js";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { createPublicClient, getContract, http, toHex, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { KeyValueGrid } from "@/KeyValueGrid";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Loader } from "@/Loader";

const ProofOfLiabilitiesAbi = {
  abi: [
    {
      type: "constructor",
      inputs: [
        { name: "_owner", type: "address", internalType: "address" },
        {
          name: "_verifier",
          type: "address",
          internalType: "contract IVerifier",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "VERIFIER",
      inputs: [],
      outputs: [
        { name: "", type: "address", internalType: "contract IVerifier" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "acceptOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addSnapshot",
      inputs: [
        { name: "rootHash", type: "bytes32", internalType: "bytes32" },
        { name: "rootBalance", type: "uint128", internalType: "uint128" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "pendingOwner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "renounceOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "sCurrentSnapshot",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "sSnapshots",
      inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      outputs: [
        { name: "rootHash", type: "bytes32", internalType: "bytes32" },
        { name: "rootBalance", type: "uint128", internalType: "uint128" },
        { name: "timestamp", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "verifyCurrentSnapshot",
      inputs: [
        { name: "proof", type: "bytes", internalType: "bytes" },
        { name: "userHash", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [{ name: "verified", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "verifySnapshot",
      inputs: [
        { name: "snapshotId", type: "uint256", internalType: "uint256" },
        { name: "proof", type: "bytes", internalType: "bytes" },
        { name: "userHash", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [{ name: "verified", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "OwnershipTransferStarted",
      inputs: [
        {
          name: "previousOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "newOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "OwnershipTransferred",
      inputs: [
        {
          name: "previousOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "newOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ProofOfLiabilities__NewSnapshot",
      inputs: [
        {
          name: "snapshotId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "rootHash",
          type: "bytes32",
          indexed: false,
          internalType: "bytes32",
        },
        {
          name: "rootBalance",
          type: "uint128",
          indexed: false,
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "OwnableInvalidOwner",
      inputs: [{ name: "owner", type: "address", internalType: "address" }],
    },
    {
      type: "error",
      name: "OwnableUnauthorizedAccount",
      inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    {
      type: "error",
      name: "ProofOfLiabilities__SnapshotDoesNotExist",
      inputs: [],
    },
  ],
} as const;

const CONTRACT_ADDRESS = "0xCd99C5896C79E5354C7aEed5A99Cd2C22C7c1551";

const verifierContract = getContract({
  abi: ProofOfLiabilitiesAbi.abi,
  address: CONTRACT_ADDRESS,
  client: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
});

export interface ProofDialogProps {
  tree: Node[][];
  root: Node;
  userData: UserData;
  userIndex: number;
}

export const ProofDialogContent = ({
  tree,
  root,
  userData,
  userIndex,
}: ProofDialogProps) => {
  const { pathIndices, siblings } = buildMerkleSumTreeProof(tree, userIndex);
  const user = tree[0][userIndex];
  const [zkp, setZkp] = useState<Hex>();
  const [verified, setVerified] = useState<boolean>();

  const [pendingZkpMsg, setPendingZkpMsg] = useState<string>();
  const [pendingVerifiedMsg, setPendingVerifiedMsg] = useState<string>();
  const isPendingZkp = pendingZkpMsg !== undefined;
  const isPendingVerifiedMsg = pendingVerifiedMsg !== undefined;

  const userHash = toHex32(user.hash);
  const userId = toHex32(userDataToUserId(userData));

  const generateProof = useCallback(async () => {
    try {
      const noir = new Noir(Circuit as CompiledCircuit);
      setPendingZkpMsg("Creating Barretenberg API...");
      const api = await Barretenberg.new();
      const backend = new UltraHonkBackend(Circuit.bytecode, api);
      setPendingZkpMsg("Generating witness...");
      const { witness } = await noir.execute({
        path_indices: pathIndices,
        sibling_hashes: siblings.map((s) => `0x${s.hash.toString(16)}`),
        sibling_balances: siblings.map((s) => s.balance.toString()),
        root_hash: `0x${root.hash.toString(16)}`,
        root_balance: root.balance.toString(),
        user_hash: userHash,
        user_balance: user.balance.toString(),
        user_id: userId,
      });
      setPendingZkpMsg("Generating proof...");
      const { proof } = await backend.generateProof(witness, {
        verifierTarget: "evm",
      });
      setZkp(toHex(proof));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(e.name, {
          description: e.message.slice(0, 300),
        });
      }
    } finally {
      setPendingZkpMsg(undefined);
    }
  }, [pathIndices, root, userHash, userId, user.balance, siblings]);

  const verifyProof = useCallback(async () => {
    if (!zkp) return;
    try {
      setPendingVerifiedMsg("Verifying...");
      const v = await verifierContract.read.verifySnapshot([
        BigInt(1),
        zkp,
        userHash,
      ]);
      setVerified(v);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(e.name, {
          description: e.message.slice(0, 300),
        });
      }
    } finally {
      setPendingVerifiedMsg(undefined);
    }
  }, [zkp, userHash]);

  const openVerifierContract = () => {
    window.open(
      `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="text-sm flex gap-4 flex-col max-h-[50vh] overflow-y-auto">
      <KeyValueGrid>
        <div>
          <span className="text-secondary-foreground/60">[private]</span>{" "}
          Username:
        </div>
        <CodeValue>{userData.username}</CodeValue>
        <div>
          <Tooltip>
            <TooltipContent>
              Private nonce value attributed to the user.
            </TooltipContent>
            <TooltipTrigger asChild>
              <div className="flex gap-1 items-center">
                <InfoIcon className="size-3" />
                <span className="text-secondary-foreground/60">[private]</span>{" "}
                Nonce:
              </div>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <CodeValue>{userData.nonce}</CodeValue>
        <div>
          <span className="text-secondary-foreground/60">[private]</span>{" "}
          Balance:
        </div>
        <CodeValue>{userData.balance.toString()}</CodeValue>
        <div className="mt-4">
          <Tooltip>
            <TooltipContent>
              User identifier used in the circuit. Composed of the hash of the
              username and nonce.
            </TooltipContent>
            <TooltipTrigger asChild>
              <div className="flex gap-1 items-center">
                <InfoIcon className="size-3" />
                <span className="text-secondary-foreground/60">[private]</span>{" "}
                ID:
              </div>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <CodeValue className="mt-4">{userId}</CodeValue>
        <div>
          <Tooltip>
            <TooltipContent>
              User hash public input. Composed of the hash of the ID and
              balance.
            </TooltipContent>
            <TooltipTrigger>
              <div className="flex gap-1 items-center">
                <InfoIcon className="size-3" />
                <span>[public] Hash:</span>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <CodeValue>{userHash}</CodeValue>
      </KeyValueGrid>
      <div className="flex gap-4 items-center">
        <Button
          className="w-fit"
          variant="outline"
          onClick={generateProof}
          disabled={zkp !== undefined}
        >
          Generate ZKP
        </Button>
        {isPendingZkp ? (
          <Loader className="size-4">{pendingZkpMsg}</Loader>
        ) : (
          <>
            {zkp !== undefined ? (
              <div>
                ZKP:{" "}
                <CodeValue copyValue={zkp}>
                  {zkp.slice(0, 30)}...{zkp.slice(-32)}
                </CodeValue>
              </div>
            ) : (
              <div />
            )}
          </>
        )}
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex gap-1 items-center">
          <Tooltip>
            <TooltipContent>View verifier contract</TooltipContent>
            <TooltipTrigger asChild>
              <Button
                onClick={openVerifierContract}
                className="w-fit"
                variant="ghost"
              >
                <InfoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
          <Button
            disabled={zkp === undefined || verified !== undefined}
            className="w-fit"
            variant="outline"
            onClick={verifyProof}
          >
            Verify on-chain
          </Button>
        </div>
        {isPendingVerifiedMsg ? (
          <Loader className="size-4">{pendingVerifiedMsg}</Loader>
        ) : (
          <>
            {verified !== undefined ? (
              <>
                {verified ? (
                  <span className="text-green-500 font-medium">
                    Verified ✅
                  </span>
                ) : (
                  <span className="text-destructive">
                    Proof is not valid ❌
                  </span>
                )}
              </>
            ) : (
              <div />
            )}
          </>
        )}
      </div>
    </div>
  );
};
