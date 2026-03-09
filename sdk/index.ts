import { poseidon2Hash } from "@zkpassport/poseidon2";
import { toHex } from "viem";

/**
 * Encodes a UTF-8 string into a field element for use in ZK circuits.
 * Splits the string into chunks of `chunkSize` bytes, packs each chunk
 * into a field element little-endian, then hashes them with Poseidon2.
 * Returns `null` if the input is empty or chunkSize is less than 1.
 */
export const hashStringToField = (
  input: string,
  chunkSize: number,
): bigint | null => {
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

export interface Node {
  hash: bigint;
  balance: bigint;
}

export const userDataToUserId = (user: UserData): bigint => {
  const userId = hashStringToField(`${user.username}${user.nonce}`, 31);
  if (userId == null) {
    throw Error(`User has invalid user id: ${user.username}${user.nonce}`);
  }
  return userId;
};

export const hashUser = (user: UserData): Node => {
  return {
    hash: poseidon2Hash([userDataToUserId(user), user.balance]),
    balance: user.balance,
  };
};

const EMPTY_LEAF: Node = {
  hash: poseidon2Hash([BigInt(0), BigInt(0)]),
  balance: BigInt(0),
};

export const buildMerkleSumTree = (
  users: UserData[],
  depth: number,
): Node[][] => {
  const capacity = 2 ** depth;
  if (users.length > capacity) {
    throw Error(`Too many users for depth ${depth}`);
  }

  const EMPTY_NODES: Node[] = [EMPTY_LEAF];
  for (let i = 0; i < depth; i++) {
    const previousNode = EMPTY_NODES[i]!;
    EMPTY_NODES.push({
      hash: poseidon2Hash([
        previousNode.balance,
        previousNode.hash,
        previousNode.balance,
        previousNode.hash,
      ]),
      balance: BigInt(0),
    });
  }

  const levels = [
    [
      ...users.map(hashUser),
      ...Array(capacity - users.length).fill(EMPTY_LEAF),
    ],
  ];

  for (let i = 0; i < depth; i++) {
    const levelBellow = levels[i]!;
    levels.push(
      Array.from({ length: levelBellow.length / 2 }, (_, j) => {
        const leftNode = levelBellow[j * 2]!;
        const rightNode = levelBellow[j * 2 + 1]!;

        if (leftNode === EMPTY_NODES[i] && rightNode === EMPTY_NODES[i]) {
          return EMPTY_NODES[i + 1]!;
        }

        return {
          hash: poseidon2Hash([
            leftNode.balance,
            leftNode.hash,
            rightNode.balance,
            rightNode.hash,
          ]),
          balance: leftNode.balance + rightNode.balance,
        };
      }),
    );
  }

  return levels;
};

export const buildMerkleSumTreeProof = (
  levels: Node[][],
  index: number,
): {
  siblings: Node[];
  pathIndices: number[];
} => {
  const siblings = [];
  const pathIndices = [];

  for (const layer of levels.slice(0, -1)) {
    const isLeft = index % 2 == 0;
    siblings.push(layer[isLeft ? index + 1 : index - 1]!);
    pathIndices.push(isLeft ? 0 : 1);
    index = Math.floor(index / 2);
  }

  return { siblings, pathIndices };
};

export const getMerkleSumTreeRoot = (levels: Node[][]): Node => {
  return levels[levels.length - 1]![0]!;
};

export const toHex32 = (value: Parameters<typeof toHex>[0]) => {
  return toHex(value, { size: 32 });
};
