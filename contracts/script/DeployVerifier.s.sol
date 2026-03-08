// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {HonkVerifier} from "../src/Verifier.sol";

contract DeployVerifierScript is Script {
    function run() public returns (HonkVerifier verifier) {
        vm.startBroadcast();
        verifier = new HonkVerifier();
        vm.stopBroadcast();
    }
}
