// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// EDUCATIONAL TESTNET CODE. UNAUDITED. Not ERC-4337 compliant.
contract YodexAccount {
    address public owner;
    mapping(address => bool) public modules;
    bool public paused;
    event Executed(address indexed target, uint256 value, bytes result);
    event ModuleUpdated(address indexed module, bool enabled);
    modifier onlyOwner() { require(msg.sender == owner, "NOT_OWNER"); _; }
    constructor(address initialOwner) { require(initialOwner != address(0), "ZERO_OWNER"); owner = initialOwner; }
    receive() external payable {}
    function transferOwnership(address next) external onlyOwner { require(next != address(0), "ZERO_OWNER"); owner = next; }
    function setPaused(bool state) external onlyOwner { paused = state; }
    function setModule(address module, bool enabled) external onlyOwner { require(module.code.length > 0, "NOT_CONTRACT"); modules[module] = enabled; emit ModuleUpdated(module, enabled); }
    function execute(address target, uint256 value, bytes calldata data) external onlyOwner returns (bytes memory result) {
        require(!paused, "PAUSED"); require(target != address(this), "SELF_CALL");
        (bool ok, bytes memory out) = target.call{value:value}(data);
        if (!ok) { assembly { revert(add(out,32), mload(out)) } }
        emit Executed(target,value,out); return out;
    }
}
contract YodexFactory {
    event AccountCreated(address indexed owner, address indexed account, bytes32 indexed salt);
    function create(address owner, bytes32 salt) external returns (address account) {
        bytes32 finalSalt = keccak256(abi.encode(owner,salt));
        account = address(new YodexAccount{salt:finalSalt}(owner)); emit AccountCreated(owner,account,salt);
    }
    function predict(address owner, bytes32 salt) external view returns (address) {
        bytes32 s = keccak256(abi.encode(owner,salt));
        bytes32 hash = keccak256(abi.encodePacked(type(YodexAccount).creationCode, abi.encode(owner)));
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff),address(this),s,hash)))));
    }
}
contract YodexToken {
    // TESTNET ONLY. Fixed-supply ERC-20-compatible prototype; unaudited.
    string public constant name = "YODEX Test Utility";
    string public constant symbol = "YDXT";
    uint8 public constant decimals = 18;
    uint256 public constant MAX_SUPPLY_TOKENS = 230_000_000;
    uint256 public constant cap = MAX_SUPPLY_TOKENS * (10 ** uint256(decimals));
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint256)) public allowance;
    event Transfer(address indexed from,address indexed to,uint256 amount);
    event Approval(address indexed owner,address indexed spender,uint256 amount);
    // Allocation wallets must be separately configured and reviewed before deployment.
    // Distribution is fixed at creation; there is no additional mint function.
    constructor(
        address liquidity,
        address community,
        address treasury,
        address development,
        address team,
        address presale
    ) {
        address[6] memory recipients = [liquidity, community, treasury, development, team, presale];
        uint256[6] memory percentages = [uint256(30), 15, 25, 10, 5, 15];
        totalSupply = cap;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "ZERO_ALLOCATION_WALLET");
            for (uint256 j = 0; j < i; j++) {
                require(recipients[i] != recipients[j], "DUPLICATE_ALLOCATION_WALLET");
            }
            uint256 amount = cap * percentages[i] / 100;
            balanceOf[recipients[i]] = amount;
            emit Transfer(address(0), recipients[i], amount);
        }
    }
    function approve(address spender,uint256 amount) external returns(bool) {
        allowance[msg.sender][spender]=amount;
        emit Approval(msg.sender,spender,amount);
        return true;
    }
    function transfer(address to,uint256 amount) external returns(bool) {
        _move(msg.sender,to,amount);
        return true;
    }
    function transferFrom(address from,address to,uint256 amount) external returns(bool) {
        uint256 a=allowance[from][msg.sender];
        require(a>=amount,"ALLOWANCE");
        if(a!=type(uint256).max){
            allowance[from][msg.sender]=a-amount;
            emit Approval(from,msg.sender,a-amount);
        }
        _move(from,to,amount);
        return true;
    }
    function _move(address from,address to,uint256 amount) internal {
        require(to!=address(0),"ZERO");
        require(balanceOf[from]>=amount,"BALANCE");
        balanceOf[from]-=amount;
        balanceOf[to]+=amount;
        emit Transfer(from,to,amount);
    }
}
interface IERC20Y { function transfer(address,uint256) external returns(bool); function transferFrom(address,address,uint256) external returns(bool); function balanceOf(address) external view returns(uint256); }
contract YodexVault {
    // Single-asset 1:1 shares, NO YIELD, NOT ERC-4626. Testnet custody example only.
    IERC20Y public immutable asset;
    mapping(address=>uint256) public shares;
    uint256 public totalShares;
    bool private locked;
    event Deposit(address indexed user,uint256 amount);
    event Withdraw(address indexed user,uint256 amount);
    modifier nonReentrant(){require(!locked,"LOCKED");locked=true;_;locked=false;}
    constructor(address token){require(token.code.length>0,"TOKEN");asset=IERC20Y(token);}
    function deposit(uint256 amount) external nonReentrant {require(amount>0,"AMOUNT");uint256 beforeBal=asset.balanceOf(address(this));require(asset.transferFrom(msg.sender,address(this),amount),"TRANSFER");require(asset.balanceOf(address(this))-beforeBal==amount,"FEE_TOKEN");shares[msg.sender]+=amount;totalShares+=amount;emit Deposit(msg.sender,amount);}
    function withdraw(uint256 amount) external nonReentrant {require(amount>0 && shares[msg.sender]>=amount,"SHARES");shares[msg.sender]-=amount;totalShares-=amount;require(asset.transfer(msg.sender,amount),"TRANSFER");emit Withdraw(msg.sender,amount);}
}
contract YodexOrderBook {
    // Escrowed limit-order demonstration. No price oracle, fill or DEX integration.
    struct Order {address owner;address token;uint256 amount;bool active;}
    mapping(uint256=>Order) public orders;
    uint256 public nextId=1;
    bool private locked;
    event OrderOpened(uint256 indexed id,address indexed owner,address token,uint256 amount);
    event OrderCancelled(uint256 indexed id);
    modifier nonReentrant(){require(!locked,"LOCKED");locked=true;_;locked=false;}
    function open(address token,uint256 amount) external nonReentrant returns(uint256 id){require(token.code.length>0 && amount>0,"INPUT");uint256 beforeBal=IERC20Y(token).balanceOf(address(this));require(IERC20Y(token).transferFrom(msg.sender,address(this),amount),"TRANSFER");require(IERC20Y(token).balanceOf(address(this))-beforeBal==amount,"FEE_TOKEN");id=nextId++;orders[id]=Order(msg.sender,token,amount,true);emit OrderOpened(id,msg.sender,token,amount);}
    function cancel(uint256 id) external nonReentrant {Order storage o=orders[id];require(o.active && o.owner==msg.sender,"ORDER");o.active=false;require(IERC20Y(o.token).transfer(o.owner,o.amount),"TRANSFER");emit OrderCancelled(id);}
}
contract YodexSwapAdapter {
    // Intentionally NO swap execution: must integrate audited router + oracle safeguards.
    address public immutable admin;
    mapping(address=>bool) public allowedRouter;
    event RouterUpdated(address indexed router,bool allowed);
    constructor(){admin=msg.sender;}
    function setRouter(address router,bool allowed) external {require(msg.sender==admin,"ADMIN");require(router.code.length>0,"ROUTER");allowedRouter[router]=allowed;emit RouterUpdated(router,allowed);}
}
