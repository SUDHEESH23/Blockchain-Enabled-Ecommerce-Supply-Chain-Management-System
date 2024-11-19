// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Product {
        uint id;
        string name;
        uint price;
        address owner;
        bool isDelivered;
    }

    mapping(uint => Product) public products; 
    uint public productCount = 0;

    event ProductCreated(uint id, string name, uint price, address owner);
    event ProductTransferred(uint id, address newOwner);


    function addProduct(string memory _name, uint _price) public {
        require(_price > 0, "Price must be greater than zero");
        productCount++;
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        emit ProductCreated(productCount, _name, _price, msg.sender);
    }


    function transferProduct(uint _productId, address _newOwner) public {
        Product storage product = products[_productId];
        require(msg.sender == product.owner, "Only the owner can transfer the product");
        require(!product.isDelivered, "Product already delivered");
        product.owner = _newOwner;
        emit ProductTransferred(_productId, _newOwner);
    }


    function markDelivered(uint _productId) public {
        Product storage product = products[_productId];
        require(msg.sender == product.owner, "Only the owner can mark it as delivered");
        product.isDelivered = true;
    }
}
