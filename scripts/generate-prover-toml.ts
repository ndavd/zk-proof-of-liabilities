import fs from "fs";
import * as z from "zod";
import Papa from "papaparse";
import {
  buildMerkleSumTree,
  buildMerkleSumTreeProof,
  getMerkleSumTreeRoot,
  hashUser,
  userDataToUserId,
  type Node,
} from "sdk";

const csvPathArg = process.argv[2];
const provingUsername = process.argv[3];

if (!csvPathArg || !provingUsername) {
  console.log(
    `Usage: bun run generate-prover-toml <path-to-user-data.csv> <proving-username>\nExample: bun run generate-prover-toml ./scripts/users-example-data.csv Alice`,
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
    username: z.string().nonempty(),
    nonce: z.union([z.string(), z.number().nonnegative()]),
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

const provingUserIndex = usersData.findIndex(
  ({ username }) => username == provingUsername,
);

if (provingUserIndex == -1) {
  console.error(`User with username ${provingUsername} not found`);
  process.exit(1);
}

const t = buildMerkleSumTree(usersData, 20);
const p = buildMerkleSumTreeProof(t, provingUserIndex);
const root = getMerkleSumTreeRoot(t);

const toProverToml = (
  proof: ReturnType<typeof buildMerkleSumTreeProof>,
  root: Node,
  user: Node,
  userId: bigint,
): string => {
  const arr = (values: (string | number)[]) => `[${values.join(", ")}]`;

  return [
    `path_indices = ${arr(proof.pathIndices.map((p) => `"${p}"`))}`,
    `sibling_hashes = ${arr(proof.siblings.map((s) => `"0x${s.hash.toString(16)}"`))}`,
    `sibling_balances = ${arr(proof.siblings.map((s) => `"${s.balance.toString()}"`))}`,
    `root_hash = "0x${root.hash.toString(16)}"`,
    `root_balance = "${root.balance.toString()}"`,
    `user_hash = "0x${user.hash.toString(16)}"`,
    `user_balance = "${user.balance.toString()}"`,
    `user_id = "0x${userId.toString(16)}"`,
  ].join("\n");
};

console.log(
  toProverToml(
    p,
    root,
    t[0]![provingUserIndex]!,
    userDataToUserId(usersData![provingUserIndex]!),
  ),
);
