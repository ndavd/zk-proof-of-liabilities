import { poseidon2Hash } from "@zkpassport/poseidon2";
import { toHex, type Hex } from "viem";

export const DEPTH = 20;
export const FIELD_BITS = 254;

/**
 * Encodes a UTF-8 string into a field element for use in ZK circuits.
 * Splits the string into chunks of `chunkSize` bytes, packs each chunk
 * into a field element little-endian, then hashes them with Poseidon2.
 * Returns `null` if the input is empty or chunkSize is less than 1.
 */
const hashStringToField = (input: string, chunkSize: number): bigint | null => {
  const trimmed = input.trim();
  if (trimmed === "" || chunkSize < 1) return null;
  const bytes = new TextEncoder().encode(trimmed);
  const fields: bigint[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    let value = 0n;
    for (let j = 0; j < chunk.length; j++) {
      value |= BigInt(chunk[j]!) << BigInt(j * 8);
    }
    fields.push(value);
  }
  return poseidon2Hash(fields);
};

export interface UserData {
  username: string;
  nonce: number | string;
  balance: bigint;
}

const toHex32 = (value: Parameters<typeof toHex>[0]) => {
  return toHex(value, { size: 32 });
};

export class Hash {
  constructor(public readonly value: bigint) {}

  toString(): Hex {
    return toHex32(this.value);
  }
}

export interface Node {
  hash: Hash;
  balance: bigint;
}

const userDataToUserId = (user: UserData): bigint => {
  const userId = hashStringToField(
    `${user.username}${user.nonce}`,
    Math.floor(FIELD_BITS / 8),
  );
  if (userId == null) {
    throw Error(`User has invalid user id: ${user.username}${user.nonce}`);
  }
  return userId;
};

export const userDataToUserIdHex = (
  ...params: Parameters<typeof userDataToUserId>
) => {
  return toHex32(userDataToUserId(...params));
};

/**
 * Computes the leaf hash: H(ID, balance).
 */
export const hashUserData = (user: UserData): Hash => {
  return new Hash(poseidon2Hash([userDataToUserId(user), user.balance]));
};

const EMPTY_LEAF: Node = {
  hash: new Hash(poseidon2Hash([BigInt(0), BigInt(0)])),
  balance: BigInt(0),
};

export class MerkleSumTree {
  private readonly levels: Node[][];

  constructor(users: UserData[]) {
    const capacity = 2 ** DEPTH;
    if (users.length > capacity) {
      throw Error(`Too many users for depth ${DEPTH}`);
    }

    const EMPTY_NODES: Node[] = [EMPTY_LEAF];
    for (let i = 0; i < DEPTH; i++) {
      const previousNode = EMPTY_NODES[i]!;
      EMPTY_NODES.push({
        hash: new Hash(
          poseidon2Hash([
            previousNode.balance,
            previousNode.hash.value,
            previousNode.balance,
            previousNode.hash.value,
          ]),
        ),
        balance: BigInt(0),
      });
    }

    const levels: Node[][] = [
      [
        ...users.map((u) => ({ hash: hashUserData(u), balance: u.balance })),
        ...Array(capacity - users.length).fill(EMPTY_LEAF),
      ],
    ];

    for (let i = 0; i < DEPTH; i++) {
      const levelBellow = levels[i]!;
      levels.push(
        Array.from({ length: levelBellow.length / 2 }, (_, j) => {
          const leftNode = levelBellow[j * 2]!;
          const rightNode = levelBellow[j * 2 + 1]!;

          if (leftNode === EMPTY_NODES[i] && rightNode === EMPTY_NODES[i]) {
            return EMPTY_NODES[i + 1]!;
          }

          return {
            hash: new Hash(
              poseidon2Hash([
                leftNode.balance,
                leftNode.hash.value,
                rightNode.balance,
                rightNode.hash.value,
              ]),
            ),
            balance: leftNode.balance + rightNode.balance,
          };
        }),
      );
    }

    this.levels = levels;
  }

  get root(): Node {
    return this.levels[this.levels.length - 1]![0]!;
  }

  getLeaf(index: number): Node {
    return this.levels[0]![index]!;
  }

  getProof(index: number): {
    siblings: Node[];
    pathIndices: number[];
  } {
    const siblings = [];
    const pathIndices = [];

    for (const layer of this.levels.slice(0, -1)) {
      const isLeft = index % 2 == 0;
      siblings.push(layer[isLeft ? index + 1 : index - 1]!);
      pathIndices.push(isLeft ? 0 : 1);
      index = Math.floor(index / 2);
    }

    return { siblings, pathIndices };
  }
}

export interface CircuitInputs {
  path_indices: string[];
  sibling_hashes: Hex[];
  sibling_balances: string[];
  root_hash: Hex;
  root_balance: string;
  user_hash: Hex;
  user_balance: string;
  user_id: Hex;
}

export const buildCircuitInputs = (
  tree: MerkleSumTree,
  userData: UserData,
  userIndex: number,
): CircuitInputs => {
  const { siblings, pathIndices } = tree.getProof(userIndex);
  const userNode = tree.getLeaf(userIndex);
  const root = tree.root;
  return {
    path_indices: pathIndices.map((s) => s.toString()),
    sibling_hashes: siblings.map((s) => s.hash.toString()),
    sibling_balances: siblings.map((s) => s.balance.toString()),
    root_hash: root.hash.toString(),
    root_balance: root.balance.toString(),
    user_hash: userNode.hash.toString(),
    user_balance: userNode.balance.toString(),
    user_id: toHex32(userDataToUserId(userData)),
  };
};

export const toInputMap = (
  circuitInputs: CircuitInputs,
): Record<string, string | string[]> => {
  return { ...circuitInputs };
};
