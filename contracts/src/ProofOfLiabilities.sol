// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IVerifier {
    function verify(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool);
}

/// @title ProofOfLiabilities
/// @notice Allows an exchange to add liability snapshots and lets users verify their balance is correctly included via a ZK Merkle Sum Tree proof.
contract ProofOfLiabilities is Ownable2Step {
    /// @notice Liability snapshot containing the Merkle Sum Tree root.
    struct Snapshot {
        bytes32 rootHash;
        uint128 rootBalance;
        uint256 timestamp;
    }

    mapping(uint256 => Snapshot) public sSnapshots;
    uint256 public sCurrentSnapshot;

    IVerifier public immutable VERIFIER;

    event ProofOfLiabilities__NewSnapshot(
        uint256 indexed snapshotId, bytes32 rootHash, uint128 rootBalance, uint256 timestamp
    );

    error ProofOfLiabilities__SnapshotDoesNotExist();

    modifier onlyValidSnapshot(uint256 snapshotId) {
        _onlyValidSnapshot(snapshotId);
        _;
    }

    constructor(address _owner, IVerifier _verifier) Ownable(_owner) {
        VERIFIER = _verifier;
    }

    /// @notice Adds a new liability snapshot. Only callable by the owner.
    /// @param rootHash The Merkle Sum Tree root hash.
    /// @param rootBalance The Merkle Sum Tree root balance i.e. the total liabilities.
    function addSnapshot(bytes32 rootHash, uint128 rootBalance) public onlyOwner {
        uint256 timestamp = block.timestamp;
        uint256 newSnapshot = sCurrentSnapshot + 1;
        sSnapshots[newSnapshot] = Snapshot({rootHash: rootHash, rootBalance: rootBalance, timestamp: timestamp});
        sCurrentSnapshot = newSnapshot;
        emit ProofOfLiabilities__NewSnapshot(newSnapshot, rootHash, rootBalance, timestamp);
    }

    /// @notice Verifies a user's inclusion proof against the current snapshot.
    /// @param proof The ZK proof bytes.
    /// @param userHash The user's leaf hash.
    /// @return verified Whether the proof is valid.
    function verifyCurrentSnapshot(bytes memory proof, bytes32 userHash)
        public
        view
        onlyValidSnapshot(sCurrentSnapshot)
        returns (bool verified)
    {
        Snapshot memory snapshot = sSnapshots[sCurrentSnapshot];
        bytes32[] memory publicInputs = _makePublicInputs(snapshot.rootHash, snapshot.rootBalance, userHash);
        verified = _tryVerify(proof, publicInputs);
    }

    /// @notice Verifies a user's inclusion proof against a specific snapshot.
    /// @param snapshotId The snapshot ID.
    /// @param proof The ZK proof bytes.
    /// @param userHash The user's leaf hash.
    /// @return verified Whether the proof is valid.
    function verifySnapshot(uint256 snapshotId, bytes memory proof, bytes32 userHash)
        public
        view
        onlyValidSnapshot(snapshotId)
        returns (bool verified)
    {
        Snapshot memory snapshot = sSnapshots[snapshotId];
        bytes32[] memory publicInputs = _makePublicInputs(snapshot.rootHash, snapshot.rootBalance, userHash);
        verified = _tryVerify(proof, publicInputs);
    }

    function _tryVerify(bytes memory proof, bytes32[] memory publicInputs) private view returns (bool) {
        try VERIFIER.verify(proof, publicInputs) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }

    function _makePublicInputs(bytes32 rootHash, uint128 rootBalance, bytes32 userHash)
        internal
        pure
        returns (bytes32[] memory publicInputs)
    {
        publicInputs = new bytes32[](3);
        publicInputs[0] = rootHash;
        publicInputs[1] = bytes32(uint256(rootBalance));
        publicInputs[2] = userHash;
    }

    function _onlyValidSnapshot(uint256 snapshotId) internal view {
        if (snapshotId == 0 || snapshotId > sCurrentSnapshot) {
            revert ProofOfLiabilities__SnapshotDoesNotExist();
        }
    }
}
