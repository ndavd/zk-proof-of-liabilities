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
import { toast } from "sonner";
import { Loader } from "@/Loader";
import { InfoTooltip } from "@/InfoTooltip";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "@/HybridTooltip";

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

  return (
    <div className="text-sm flex gap-4 flex-col max-h-[50vh] overflow-y-auto">
      <KeyValueGrid>
        <div>
          <span className="text-secondary-foreground/60">[private]</span>{" "}
          Username:
        </div>
        <CodeValue>{userData.username}</CodeValue>
        <InfoTooltip info="Private nonce value attributed to the user.">
          <span className="text-secondary-foreground/60">[private]</span> Nonce:
        </InfoTooltip>
        <CodeValue>{userData.nonce}</CodeValue>
        <div>
          <span className="text-secondary-foreground/60">[private]</span>{" "}
          Balance:
        </div>
        <CodeValue>{userData.balance.toString()}</CodeValue>
        <div className="mt-4">
          <InfoTooltip info="User identifier used in the circuit. Composed of the hash of the username and nonce.">
            <span className="text-secondary-foreground/60">[private]</span> ID:
          </InfoTooltip>
        </div>
        <CodeValue className="mt-4">{userId}</CodeValue>
        <InfoTooltip info="User hash public input. Composed of the hash of the ID and balance.">
          [public] Hash:
        </InfoTooltip>
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
          <HybridTooltip>
            <HybridTooltipContent>
              <a
                href={`https://sepolia.etherscan.io/address/${PROOF_OF_LIABILITIES_CONTRACT.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View verifier contract
              </a>
            </HybridTooltipContent>
            <HybridTooltipTrigger asChild>
              <div className="p-2">
                <InfoIcon className="size-4" />
              </div>
            </HybridTooltipTrigger>
          </HybridTooltip>
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
