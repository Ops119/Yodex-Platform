// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "../src/YodexCore.sol";
// Run with: forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --account <keystore-name>   (see docs/DEPLOY.md)
interface Vm { function startBroadcast() external; function stopBroadcast() external; function envAddress(string calldata) external returns(address); }
contract Deploy {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    function run() external returns(address,address,address,address,address) {
        vm.startBroadcast();
        YodexFactory factory = new YodexFactory();
        YodexToken token = new YodexToken(
            vm.envAddress("LIQUIDITY_WALLET"),
            vm.envAddress("COMMUNITY_WALLET"),
            vm.envAddress("TREASURY_WALLET"),
            vm.envAddress("DEVELOPMENT_WALLET"),
            vm.envAddress("TEAM_WALLET"),
            vm.envAddress("PRESALE_WALLET")
        );
        YodexVault vault = new YodexVault(address(token));
        YodexOrderBook book = new YodexOrderBook();
        YodexSwapAdapter swap = new YodexSwapAdapter();
        vm.stopBroadcast();
        return (address(factory),address(token),address(vault),address(book),address(swap));
    }
}
