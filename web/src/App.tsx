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

import { type UserData } from "sdk";

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
  const [selected, setSelected] = useState<UserData | null>(null);

  return (
    <>
      <div className="mx-auto container min-h-svh py-6">
        <div className="flex gap-2 flex-col mb-10">
          <h1 className="text-3xl font-bold">ZK Proof of Liabilities</h1>
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
            <GithubLogoIcon />
            Learn more on GitHub
          </a>
        </div>
        <p className="text-sm mb-1">Click on a user to generate the ZKP.</p>
        <DataTable columns={columns} data={DATA} onRowClick={setSelected} />
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="w-full sm:max-w-5xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{selected?.username}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="text-sm">
              <div>
                <span className="font-medium">Nonce:</span> {selected.nonce}
              </div>
              <div>
                <span className="font-medium">Balance:</span>{" "}
                {selected.balance.toString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
