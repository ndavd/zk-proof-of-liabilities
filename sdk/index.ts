import { poseidon2Hash } from "@zkpassport/poseidon2";
import utils from "./utils";

const BIT_SIZE = 254;

export const stringToField = (input: string) =>
  utils.stringToField(input, BIT_SIZE);

export interface Leaf {
  id: string;
  balance: bigint;
}

export interface Node {
  hash: bigint;
  balance: bigint;
}

const hashLeaf = (leaf: Leaf): Node => {
  const idField = stringToField(leaf.id);
  if (idField == null) {
    throw Error("Leaf has invalid id");
  }
  return {
    hash: poseidon2Hash([idField, leaf.balance]),
    balance: leaf.balance,
  };
};

const EMPTY_LEAF: Node = {
  hash: poseidon2Hash([BigInt(0), BigInt(0)]),
  balance: BigInt(0),
};

export const buildMerkleSumTree = (leaves: Leaf[], depth: number): Node[][] => {
  const capacity = 2 ** depth;
  if (leaves.length > capacity) {
    throw Error(`Too many leaves for depth ${depth}`);
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
      ...leaves.map(hashLeaf),
      ...Array(capacity - leaves.length).fill(EMPTY_LEAF),
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
