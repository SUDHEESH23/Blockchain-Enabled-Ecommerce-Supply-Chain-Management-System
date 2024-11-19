const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Add a new product
router.post("/add", async (req, res) => {
    try {
        const { productId, name, price, owner } = req.body;
        const product = new Product({ productId, name, price, owner });
        await product.save();
        res.status(201).json({ message: "Product added", product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
