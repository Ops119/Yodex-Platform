// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "../src/YodexCore.sol";
contract NotOwner { function tryExecute(YodexAccount a,address target) external returns(bool ok){(ok,)=address(a).call(abi.encodeWithSelector(a.execute.selector,target,0,hex""));} }
contract YodexCoreTest {
    YodexFactory factory = new YodexFactory();
    // address(this) is the LIQUIDITY wallet (first constructor argument).
    YodexToken token = new YodexToken(address(this),address(0x1001),address(0x1002),address(0x1003),address(0x1004),address(0x1005));
    function testFixedSupplyAndDecimals() public view {
        require(token.decimals()==18,"DECIMALS");
        require(token.cap()==230_000_000 * 10**18,"CAP");
        require(token.totalSupply()==token.cap(),"SUPPLY");
        require(token.balanceOf(address(this))==69_000_000 ether,"LIQUIDITY");
    }
    function testAllocationTotals() public view {
        require(token.balanceOf(address(this)) == 69_000_000 ether, "LIQUIDITY");
        require(token.balanceOf(address(0x1001)) == 34_500_000 ether, "COMMUNITY");
        require(token.balanceOf(address(0x1002)) == 57_500_000 ether, "TREASURY");
        require(token.balanceOf(address(0x1003)) == 23_000_000 ether, "DEVELOPMENT");
        require(token.balanceOf(address(0x1004)) == 11_500_000 ether, "TEAM");
        require(token.balanceOf(address(0x1005)) == 34_500_000 ether, "PRESALE");
    }
    function testAllocationsSumToSupply() public view {
        uint256 sum=token.balanceOf(address(this))+token.balanceOf(address(0x1001))+token.balanceOf(address(0x1002))+token.balanceOf(address(0x1003))+token.balanceOf(address(0x1004))+token.balanceOf(address(0x1005));
        require(sum==token.totalSupply(),"SUM");
    }
    function testRejectsZeroAllocationWallet() public {
        try new YodexToken(address(0),address(0x1001),address(0x1002),address(0x1003),address(0x1004),address(0x1005)) { revert("NO_REVERT"); }
        catch Error(string memory reason) { require(keccak256(bytes(reason))==keccak256("ZERO_ALLOCATION_WALLET"),"REASON"); }
    }
    function testRejectsDuplicateAllocationWallet() public {
        try new YodexToken(address(0x1001),address(0x1001),address(0x1002),address(0x1003),address(0x1004),address(0x1005)) { revert("NO_REVERT"); }
        catch Error(string memory reason) { require(keccak256(bytes(reason))==keccak256("DUPLICATE_ALLOCATION_WALLET"),"REASON"); }
    }
    function testPredictAndCreate() public {bytes32 salt=keccak256("test");address predicted=factory.predict(address(this),salt);address account=factory.create(address(this),salt);require(predicted==account,"PREDICT");require(YodexAccount(payable(account)).owner()==address(this),"OWNER");}
    function testTokenCapAndTransfers() public {token.transfer(address(0xBEEF),20 ether);require(token.balanceOf(address(0xBEEF))==20 ether,"TRANSFER");}
    function testVaultDepositWithdraw() public {YodexVault vault=new YodexVault(address(token));token.approve(address(vault),60 ether);vault.deposit(60 ether);require(vault.shares(address(this))==60 ether,"DEPOSIT");vault.withdraw(20 ether);require(vault.shares(address(this))==40 ether,"WITHDRAW");}
    function testOrderCancellation() public {YodexOrderBook book=new YodexOrderBook();token.approve(address(book),10 ether);uint256 id=book.open(address(token),10 ether);book.cancel(id);require(token.balanceOf(address(this))==69_000_000 ether,"REFUND");}
    // The original version called execute() with empty calldata on the token, which has no fallback, so it always reverted.
    function testOnlyOwnerExecution() public {
        YodexAccount a=new YodexAccount(address(this));
        token.transfer(address(a),5 ether);
        a.execute(address(token),0,abi.encodeWithSelector(token.transfer.selector,address(0xBEEF),5 ether));
        require(token.balanceOf(address(0xBEEF))==5 ether,"EXECUTE");
        NotOwner stranger=new NotOwner();
        require(!stranger.tryExecute(a,address(token)),"NOT_OWNER_ALLOWED");
    }
}
