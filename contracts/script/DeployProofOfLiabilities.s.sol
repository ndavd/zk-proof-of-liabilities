// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ProofOfLiabilities, IVerifier} from "../src/ProofOfLiabilities.sol";

contract DeployVerifierScript is Script {
    function run(address owner, IVerifier verifier) public returns (ProofOfLiabilities c) {
        require(owner != address(0));
        require(address(verifier) != address(0));
        vm.startBroadcast();
        c = new ProofOfLiabilities(owner, verifier);
        vm.stopBroadcast();
    }
}
