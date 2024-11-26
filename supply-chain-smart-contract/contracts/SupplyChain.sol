// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChain is AccessControl {
    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address owner;
        string location;
        string status;
        uint256 createdAt;
        uint256 transferredAt;
        uint256 deliveredAt;
        string[] history;
        bool isDelivered;
    }

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(uint256 => Product) public products;
    uint256 public productCount = 0;

    event ProductCreated(uint256 id, string name, uint256 price, address owner, uint256 timestamp);
    event ProductTransferred(uint256 id, address newOwner, uint256 timestamp);
    event ProductDelivered(uint256 id, uint256 timestamp);
    event LocationUpdated(uint256 id, string newLocation, uint256 timestamp);
    event StatusUpdated(uint256 id, string newStatus, uint256 timestamp);

    constructor() {
        // Grant the deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Modifier to restrict function to only admins
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Restricted to admins");
        _;
    }

    // Modifier to restrict function to only owners
    modifier onlyOwner(uint256 productId) {
        require(products[productId].owner == msg.sender, "Restricted to product owner");
        _;
    }

    // Add Product (Admin only)
    function addProduct(string memory _name, uint256 _price) public onlyAdmin {
        require(_price > 0, "Price must be greater than zero");
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            price: _price,
            owner: msg.sender,
            location: "Initial Location",
            status: "Manufactured",
            createdAt: block.timestamp,
            transferredAt: 0,
            deliveredAt: 0,
            history: new string[](0),
            isDelivered: false
        });
        products[productCount].history.push(string(abi.encodePacked("Product created at: ", uint2str(block.timestamp))));
        emit ProductCreated(productCount, _name, _price, msg.sender, block.timestamp);
    }

    // Transfer Product (Only the owner of the product)
    function transferProduct(uint256 _productId, address _newOwner) public onlyOwner(_productId) {
        Product storage product = products[_productId];
        require(!product.isDelivered, "Product already delivered");
        product.owner = _newOwner;
        product.transferredAt = block.timestamp;
        product.history.push(string(abi.encodePacked("Ownership transferred to: ", toAsciiString(_newOwner), " at: ", uint2str(block.timestamp))));
        emit ProductTransferred(_productId, _newOwner, block.timestamp);
    }

    // Mark as Delivered (Only the owner of the product)
    function markDelivered(uint256 _productId) public onlyOwner(_productId) {
        Product storage product = products[_productId];
        product.isDelivered = true;
        product.deliveredAt = block.timestamp;
        product.status = "Delivered";
        product.history.push(string(abi.encodePacked("Product delivered at: ", uint2str(block.timestamp))));
        emit ProductDelivered(_productId, block.timestamp);
    }

    // Update Location (Only the owner of the product)
    function updateLocation(uint256 _productId, string memory _newLocation) public onlyOwner(_productId) {
        Product storage product = products[_productId];
        product.location = _newLocation;
        product.history.push(string(abi.encodePacked("Location updated to: ", _newLocation, " at: ", uint2str(block.timestamp))));
        emit LocationUpdated(_productId, _newLocation, block.timestamp);
    }

    // Update Status (Admin or owner only)
    function updateStatus(uint256 _productId, string memory _newStatus) public {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || products[_productId].owner == msg.sender,
            "Unauthorized to update status"
        );
        Product storage product = products[_productId];
        product.status = _newStatus;
        product.history.push(string(abi.encodePacked("Status updated to: ", _newStatus, " at: ", uint2str(block.timestamp))));
        emit StatusUpdated(_productId, _newStatus, block.timestamp);
    }

    // View Product History
    function getHistory(uint256 _productId) public view returns (string[] memory) {
        return products[_productId].history;
    }

    // Utility: Convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Utility: Convert address to string
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(abi.encodePacked("0x", string(s)));
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
