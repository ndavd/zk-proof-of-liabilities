import fs from "fs";
import * as z from "zod";
import Papa from "papaparse";
import {
  buildMerkleSumTree,
  buildMerkleSumTreeProof,
  getMerkleSumTreeRoot,
  stringToField,
  type Node,
} from "sdk";

const csvPathArg = process.argv[2];
const provingId = process.argv[3];

if (!csvPathArg || !provingId) {
  console.log(
    `Usage: bun run generate-prover-toml <path-to-user-data.csv> <proving-user-id>\nExample: bun run generate-prover-toml ./scripts/users-example-data.csv Alice`,
  );
  process.exit(0);
}

if (!csvPathArg.endsWith(".csv")) {
  console.error("Missing or invalid argument <path-to-user-data.csv>");
  process.exit(1);
}

if (!fs.existsSync(csvPathArg)) {
  console.error(`"${csvPathArg}" does not exist`);
  process.exit(1);
}

const csvResult = Papa.parse(
  fs
    .readFileSync(csvPathArg, "utf8")
    .split("\n")
    .filter((line) => line.trim() != "")
    .join("\n"),
  {
    header: true,
  },
);

if (csvResult.errors.length > 0) {
  console.error("Error parsing csv", csvResult.errors[0]);
  process.exit(1);
}

const usersDataZodSchema = z
  .object({
    id: z.string().nonempty(),
    balance: z.coerce.bigint(),
  })
  .array()
  .nonempty();

const parsedDataResult = usersDataZodSchema.safeParse(csvResult.data);

if (parsedDataResult.error) {
  console.error("Invalid csv data", parsedDataResult.error);
  process.exit(1);
}

const usersData = parsedDataResult.data;

const provingUserIdIndex = usersData.findIndex(({ id }) => id == provingId);

if (provingUserIdIndex == -1) {
  console.error(`User with id ${provingId} not found`);
  process.exit(1);
}

const t = buildMerkleSumTree(usersData, 20);
const p = buildMerkleSumTreeProof(t, provingUserIdIndex);
const root = getMerkleSumTreeRoot(t);

const toProverToml = (
  proof: ReturnType<typeof buildMerkleSumTreeProof>,
  root: Node,
  leaf: Node,
  leafId: bigint,
): string => {
  const arr = (values: (string | number)[]) => `[${values.join(", ")}]`;

  return [
    `path_indices = ${arr(proof.pathIndices)}`,
    `sibling_hashes = ${arr(proof.siblings.map((s) => `"0x${s.hash.toString(16)}"`))}`,
    `sibling_balances = ${arr(proof.siblings.map((s) => s.balance.toString()))}`,
    `root_hash = "0x${root.hash.toString(16)}"`,
    `root_balance = "${root.balance.toString()}"`,
    `leaf_hash = "0x${leaf.hash.toString(16)}"`,
    `leaf_balance = "${leaf.balance.toString()}"`,
    `leaf_id = "${leafId.toString()}"`,
  ].join("\n");
};

console.log(
  toProverToml(p, root, t[0]![provingUserIdIndex]!, stringToField(provingId)!),
);
