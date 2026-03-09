import { createPublicClient, getContract, http } from "viem";
import { sepolia } from "viem/chains";

const PROOF_OF_LIABILITIES = {
  chain: sepolia,
  address: "0xCd99C5896C79E5354C7aEed5A99Cd2C22C7c1551",
  abi: [
    {
      type: "constructor",
      inputs: [
        { name: "_owner", type: "address", internalType: "address" },
        {
          name: "_verifier",
          type: "address",
          internalType: "contract IVerifier",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "VERIFIER",
      inputs: [],
      outputs: [
        { name: "", type: "address", internalType: "contract IVerifier" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "acceptOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addSnapshot",
      inputs: [
        { name: "rootHash", type: "bytes32", internalType: "bytes32" },
        { name: "rootBalance", type: "uint128", internalType: "uint128" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "pendingOwner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "renounceOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "sCurrentSnapshot",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "sSnapshots",
      inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      outputs: [
        { name: "rootHash", type: "bytes32", internalType: "bytes32" },
        { name: "rootBalance", type: "uint128", internalType: "uint128" },
        { name: "timestamp", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "verifyCurrentSnapshot",
      inputs: [
        { name: "proof", type: "bytes", internalType: "bytes" },
        { name: "userHash", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [{ name: "verified", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "verifySnapshot",
      inputs: [
        { name: "snapshotId", type: "uint256", internalType: "uint256" },
        { name: "proof", type: "bytes", internalType: "bytes" },
        { name: "userHash", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [{ name: "verified", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "OwnershipTransferStarted",
      inputs: [
        {
          name: "previousOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "newOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "OwnershipTransferred",
      inputs: [
        {
          name: "previousOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "newOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ProofOfLiabilities__NewSnapshot",
      inputs: [
        {
          name: "snapshotId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "rootHash",
          type: "bytes32",
          indexed: false,
          internalType: "bytes32",
        },
        {
          name: "rootBalance",
          type: "uint128",
          indexed: false,
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "OwnableInvalidOwner",
      inputs: [{ name: "owner", type: "address", internalType: "address" }],
    },
    {
      type: "error",
      name: "OwnableUnauthorizedAccount",
      inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    {
      type: "error",
      name: "ProofOfLiabilities__SnapshotDoesNotExist",
      inputs: [],
    },
  ],
} as const;

export const PROOF_OF_LIABILITIES_CONTRACT = getContract({
  abi: PROOF_OF_LIABILITIES.abi,
  address: PROOF_OF_LIABILITIES.address,
  client: createPublicClient({
    chain: PROOF_OF_LIABILITIES.chain,
    transport: http(),
  }),
});
