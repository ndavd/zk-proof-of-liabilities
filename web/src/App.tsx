import { useState } from "react";
import { DataTable } from "@/DataTable";
import { GithubLogoIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ColumnDef } from "@tanstack/react-table";
import {
  buildMerkleSumTree,
  getMerkleSumTreeRoot,
  toHex32,
  type UserData,
} from "sdk";
import { CodeValue } from "@/CodeValue";
import { ProofDialogContent } from "@/ProofDialogContent";
import { ModeToggle } from "@/ModeToggle";
import { KeyValueGrid } from "@/KeyValueGrid";

const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "nonce",
    header: "Nonce",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
];

const DATA: UserData[] = [
  { username: "Bob", nonce: 23, balance: BigInt(31704) },
  { username: "Carol", nonce: 72, balance: BigInt(18729) },
  { username: "David", nonce: 15, balance: BigInt(16299) },
  { username: "Erin", nonce: 76, balance: BigInt(19456) },
  { username: "Frank", nonce: 41, balance: BigInt(24031) },
  { username: "Grace", nonce: 56, balance: BigInt(19800) },
  { username: "Heidi", nonce: 13, balance: BigInt(23359) },
  { username: "Ivan", nonce: 64, balance: BigInt(9426) },
  { username: "Judy", nonce: 16, balance: BigInt(18071) },
  { username: "Mallory", nonce: 22, balance: BigInt(29537) },
  { username: "Michael", nonce: 91, balance: BigInt(24295) },
  { username: "Olivia", nonce: 14, balance: BigInt(10918) },
  { username: "Oscar", nonce: 87, balance: BigInt(986) },
  { username: "Peggy", nonce: 65, balance: BigInt(17865) },
  { username: "Rupert", nonce: 53, balance: BigInt(6395) },
  { username: "Alice", nonce: 58, balance: BigInt(20284) },
  { username: "Sybil", nonce: 82, balance: BigInt(17055) },
  { username: "Trent", nonce: 89, balance: BigInt(21326) },
  { username: "Trudy", nonce: 19, balance: BigInt(11018) },
  { username: "Victor", nonce: 16, balance: BigInt(21535) },
  { username: "Walter", nonce: 12, balance: BigInt(19823) },
  { username: "Wendy", nonce: 54, balance: BigInt(15647) },
];

export function App() {
  const [selectedUser, setSelectedUser] = useState<{
    userData: UserData;
    userIndex: number;
  }>();

  const tree = buildMerkleSumTree(DATA, 20);
  const root = getMerkleSumTreeRoot(tree);

  return (
    <>
      <div className="mx-auto container min-h-svh py-6">
        <div className="flex gap-2 flex-col mb-10">
          <div className="flex gap-2 justify-between items-start">
            <h1 className="text-3xl font-bold text-primary-foreground">
              ZK Proof of Liabilities
            </h1>
            <ModeToggle />
          </div>
          <p>
            Cryptographically prove to each user that their balance is correctly
            included in the total liabilities without revealing any data from
            the other users.
          </p>
          <a
            className="flex flex-row gap-2 items-center w-fit"
            href="https://github.com/ndavd/zk-proof-of-liabilities"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about the project on GitHub
            <GithubLogoIcon />
          </a>
        </div>
        <KeyValueGrid>
          <p>Root hash:</p>
          <CodeValue>{toHex32(root.hash)}</CodeValue>
          <p>Total liabilities:</p>
          <CodeValue>{root.balance.toString()}</CodeValue>
        </KeyValueGrid>
        <br />
        <p>Click on a user to generate their ZKP.</p>
        <DataTable
          columns={columns}
          data={DATA}
          onRowClick={(row, index) => {
            setSelectedUser({ userData: row, userIndex: index });
          }}
        />
      </div>
      <Dialog
        open={selectedUser !== undefined}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(undefined);
        }}
      >
        <DialogContent
          className="w-full sm:max-w-5xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-xl">
              {selectedUser?.userData.username}'s ZKP
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <ProofDialogContent
              tree={tree}
              root={root}
              userData={selectedUser.userData}
              userIndex={selectedUser.userIndex}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
