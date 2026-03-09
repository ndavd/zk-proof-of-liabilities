import fs from "fs";
import * as z from "zod";
import Papa from "papaparse";
import { buildCircuitInputs, MerkleSumTree } from "sdk";

const csvPathArg = process.argv[2];
const provingUsername = process.argv[3];

if (!csvPathArg || !provingUsername) {
  console.log(
    `Usage: bun run generate-prover-toml {path-to-user-data.csv} {proving-username}\nExample: bun run generate-prover-toml ./mock-data/users.csv Alice`,
  );
  process.exit(0);
}

if (!csvPathArg.endsWith(".csv")) {
  console.error("Missing or invalid argument {path-to-user-data.csv}");
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

const t = new MerkleSumTree(usersData);

const {
  path_indices,
  sibling_hashes,
  sibling_balances,
  root_hash,
  root_balance,
  user_hash,
  user_balance,
  user_id,
} = buildCircuitInputs(t, usersData[provingUserIndex]!, provingUserIndex);

const stringifyArr = (values: string[]) =>
  `[${values.map((v) => `"${v}"`).join(", ")}]`;

const toml = [
  `path_indices = ${stringifyArr(path_indices)}`,
  `sibling_hashes = ${stringifyArr(sibling_hashes)}`,
  `sibling_balances = ${stringifyArr(sibling_balances)}`,
  `root_hash = "${root_hash}"`,
  `root_balance = "${root_balance}"`,
  `user_hash = "${user_hash}"`,
  `user_balance = "${user_balance}"`,
  `user_id = "${user_id}"`,
].join("\n");

console.log(toml);
