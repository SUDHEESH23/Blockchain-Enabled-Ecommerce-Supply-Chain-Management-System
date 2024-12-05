// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChain is AccessControl {
    struct Product {
        uint256 id;
        string name;
        uint256 price;
        uint256 stock;
        address owner;
        string location;
        string status;
        uint256 createdAt;
        uint256 transferredAt;
        uint256 deliveredAt;
        string[] history;
        bool isDelivered;
        address finalCustomer;  // Tracks the final customer
    }

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(uint256 => Product) public products;
    uint256 public productCount = 0;

    event ProductCreated(uint256 id, string name, uint256 price, uint256 stock, address owner, uint256 timestamp);
    event ProductPurchased(uint256 id, address buyer, uint256 timestamp, uint256 quantity);
    event ProductTransferred(uint256 id, address newOwner, uint256 timestamp);
    event ProductDelivered(uint256 id, uint256 timestamp);
    event LocationUpdated(uint256 id, string newLocation, uint256 timestamp);
    event StatusUpdated(uint256 id, string newStatus, uint256 timestamp);
    event ProductPriceUpdated(uint256 id, uint256 newPrice, uint256 timestamp);
    event ProductStockUpdated(uint256 id, uint256 newStock, uint256 timestamp);
    event ProductRemoved(uint256 id, uint256 timestamp);

    constructor() {
        // Grant the deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, 0x2fc6C8609C61C3C3B15f892A0FBCA3a60546fA15);
        _grantRole(ADMIN_ROLE, 0x2fc6C8609C61C3C3B15f892A0FBCA3a60546fA15);
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
    function addProduct(string memory _name, uint256 _price, uint256 _stock) public onlyAdmin {
        require(_price > 0, "Price must be greater than zero");
        require(_stock > 0, "Stock must be greater than zero");
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            price: _price,
            stock: _stock,
            owner: msg.sender,
            location: "Initial Location",
            status: "Manufactured",
            createdAt: block.timestamp,
            transferredAt: 0,
            deliveredAt: 0,
            history: new string[](0) ,  
            isDelivered: false,
            finalCustomer: address(0)  // Initially, no final customer
        });
        products[productCount].history.push("Product created");
        emit ProductCreated(productCount, _name, _price, _stock, msg.sender, block.timestamp);
    }

    // Purchase Product (Any user can purchase)
    function purchaseProduct(uint256 _productId, uint256 _quantity) public payable {
        Product storage product = products[_productId];
        require(product.stock >= _quantity, "Not enough stock");
        require(msg.value >= product.price * _quantity, "Insufficient payment");
        require(!product.isDelivered, "Product already delivered");

        // Check if the product already has a finalCustomer
        require(product.finalCustomer == address(0), "Product already purchased");

        // Create a new product instance for each unit purchased
        for (uint256 i = 0; i < _quantity; i++) {
            productCount++;
            products[productCount] = Product({
                id: productCount,
                name: product.name,
                price: product.price,
                stock: 1,  // Purchased product will have stock 1 for the buyer
                owner: product.owner,
                location: product.location,
                status: "Purchased",
                createdAt: block.timestamp,
                transferredAt: block.timestamp,
                deliveredAt: 0,
                history: new string[](0),
                isDelivered: false,
                finalCustomer: msg.sender
            });
            // Add history for each purchase
            product.history.push(
                string(abi.encodePacked(
                    "Purchased by ", 
                    toString(msg.sender),
                    " (Quantity: ", 
                    uint2str(_quantity), 
                    ") at ", 
                    uint2str(block.timestamp)
                ))
            );

            emit ProductPurchased(productCount, msg.sender, block.timestamp, _quantity);
        }

        // Update the stock of the original product
        product.stock -= _quantity;
        product.history.push("Product purchased");

        // Refund excess payment if any
        if (msg.value > product.price * _quantity) {
            payable(msg.sender).transfer(msg.value - product.price * _quantity);
        }
    }

    // Transfer Product (Only the owner of the product)
    function transferProduct(uint256 _productId, address _newOwner) public {
        Product storage product = products[_productId];
        
        // Ensure the caller is either the admin or the current owner of the product
        require(hasRole(ADMIN_ROLE, msg.sender) || product.owner == msg.sender, "Caller is neither the admin nor the product owner");
        
        // Ensure the product is not already delivered
        require(!product.isDelivered, "Product already delivered");
        
        // Transfer ownership to the new owner
        product.owner = _newOwner;
        product.transferredAt = block.timestamp;
        product.history.push(
            string(abi.encodePacked(
                "Transferred to ", 
                toString(_newOwner), 
                " at ", 
                uint2str(block.timestamp)
            ))
        );
        
        // Emit event for the ownership transfer
        emit ProductTransferred(_productId, _newOwner, block.timestamp);
    }

    // Mark as Delivered (Only the final customer can mark as delivered)
    function markDelivered(uint256 _productId) public onlyOwner(_productId) {
        Product storage product = products[_productId];
        require(product.finalCustomer == msg.sender, "Only the final customer can mark as delivered");

        product.isDelivered = true;
        product.deliveredAt = block.timestamp;
        product.status = "Delivered";
        product.history.push(
            string(abi.encodePacked(
                "Delivered to customer ", 
                toString(msg.sender), 
                " at ", 
                uint2str(block.timestamp)
            ))
        );

        emit ProductDelivered(_productId, block.timestamp);
    }

    // Update Location (Only the owner of the product)
    function updateLocation(uint256 _productId, string memory _newLocation) public onlyOwner(_productId) {
        Product storage product = products[_productId];
        product.location = _newLocation;
        product.history.push(
            string(abi.encodePacked(
                "Location updated to ", 
                _newLocation, 
                " at ", 
                uint2str(block.timestamp)
            ))
        );

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
        product.history.push(
            string(abi.encodePacked(
                "Status updated to ", 
                _newStatus, 
                " at ", 
                uint2str(block.timestamp)
            ))
        );

        emit StatusUpdated(_productId, _newStatus, block.timestamp);
    }

    // Update Product Price (Admin only)
    function updateProductPrice(uint256 _productId, uint256 _newPrice) public onlyAdmin {
        Product storage product = products[_productId];
        require(_newPrice > 0, "Price must be greater than zero");
        product.price = _newPrice;
        product.history.push("Price updated");
        emit ProductPriceUpdated(_productId, _newPrice, block.timestamp);
    }

    // Update Product Stock (Admin only)
    function updateProductStock(uint256 _productId, uint256 _newStock) public onlyAdmin {
        Product storage product = products[_productId];
        require(_newStock >= 0, "Stock must be greater than or equal to zero");
        product.stock = _newStock;
        product.history.push("Stock updated");
        emit ProductStockUpdated(_productId, _newStock, block.timestamp);
    }

    // Remove Product (Admin only)
    function removeProduct(uint256 _productId) public onlyAdmin {
        delete products[_productId];
        emit ProductRemoved(_productId, block.timestamp);
    }

    // View Product History (Customer or Admin can view)
    function getHistory(uint256 _productId) public view returns (string[] memory) {
        Product storage product = products[_productId];
        uint256 historyLength = product.history.length;
        string[] memory detailedHistory = new string[](historyLength);

        for (uint256 i = 0; i < historyLength; i++) {
            // Combine event description with timestamp
            detailedHistory[i] = string(
                abi.encodePacked(
                    product.history[i],
                    " (Timestamp: ",
                    uint2str(product.createdAt + i), // Adjust timestamp dynamically
                    ")"
                )
            );
        }
        return detailedHistory;
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
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
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function toString(address _addr) internal pure returns (string memory) {
    return string(abi.encodePacked("0x", uint2str(uint256(uint160(_addr)))));
    }

    // View Product Details (Public function)
    function getProductBasicDetails(uint256 _productId) public view returns (
    uint256 id,
    string memory name,
    uint256 price,
    uint256 stock,
    address owner,
    string memory location,
    string memory status
) {
    Product memory product = products[_productId];
    return (
        product.id,
        product.name,
        product.price,
        product.stock,
        product.owner,
        product.location,
        product.status
    );
}

// View Product Delivery Details (Public function)
function getProductDeliveryDetails(uint256 _productId) public view returns (
    uint256 transferredAt,
    uint256 deliveredAt,
    bool isDelivered,
    address finalCustomer
) {
    Product memory product = products[_productId];
    return (
        product.transferredAt,
        product.deliveredAt,
        product.isDelivered,
        product.finalCustomer
    );
}

    // Fallback function to accept Ether
    receive() external payable {}
}
