import { CodeValue } from "@/CodeValue";
import {
  type UserData,
  MerkleSumTree,
  buildCircuitInputs,
  toInputMap,
} from "sdk";
import Circuit from "@/artifacts/zk_proof_of_liabilities.json";
import { PROOF_OF_LIABILITIES_CONTRACT } from "@/contracts/ProofOfLiabilities";
import { useCallback, useState, type RefObject } from "react";
import { Noir, type CompiledCircuit } from "@noir-lang/noir_js";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { toHex, type Hex } from "viem";
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

export interface ProofDialogProps {
  tree: MerkleSumTree;
  userData: UserData;
  userIndex: number;
  circuitBackend: RefObject<UltraHonkBackend | undefined>;
  proofs: RefObject<Map<Hex, Hex>>;
}

export const ProofDialogContent = ({
  tree,
  userData,
  userIndex,
  circuitBackend,
  proofs,
}: ProofDialogProps) => {
  const circuitInputs = buildCircuitInputs(tree, userData, userIndex);

  const userHash = circuitInputs.user_hash;
  const userId = circuitInputs.user_id;

  const [zkp, setZkp] = useState<Hex | undefined>(proofs.current.get(userId));
  const [verified, setVerified] = useState<boolean>();

  const [pendingZkpMsg, setPendingZkpMsg] = useState<string>();
  const [pendingVerifiedMsg, setPendingVerifiedMsg] = useState<string>();
  const isPendingZkp = pendingZkpMsg !== undefined;
  const isPendingVerifiedMsg = pendingVerifiedMsg !== undefined;

  const generateProof = useCallback(async () => {
    try {
      const noir = new Noir(Circuit as CompiledCircuit);
      setPendingZkpMsg("Creating Barretenberg API...");
      let backend: UltraHonkBackend;
      if (circuitBackend.current !== undefined) {
        backend = circuitBackend.current;
      } else {
        const api = await Barretenberg.new();
        backend = new UltraHonkBackend(Circuit.bytecode, api);
        circuitBackend.current = backend;
      }
      setPendingZkpMsg("Generating witness...");
      const { witness } = await noir.execute(toInputMap(circuitInputs));
      setPendingZkpMsg("Generating proof...");
      const { proof } = await backend.generateProof(witness, {
        verifierTarget: "evm",
      });
      const p = toHex(proof);
      setZkp(p);
      proofs.current.set(circuitInputs.user_id, p);
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
  }, [circuitInputs, circuitBackend, proofs]);

  const verifyProof = useCallback(async () => {
    if (!zkp) return;
    try {
      setPendingVerifiedMsg("Verifying...");
      const v = await PROOF_OF_LIABILITIES_CONTRACT.read.verifySnapshot([
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
      `https://sepolia.etherscan.io/address/${PROOF_OF_LIABILITIES_CONTRACT.address}`,
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
            <TooltipTrigger asChild>
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
                autoFocus={false}
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
