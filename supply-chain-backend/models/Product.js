const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String, required: true }, // Price stored as a string (in wei)
    owner: { type: String, required: true },
    isDelivered: { type: Boolean, default: false },
});

module.exports = mongoose.model("Product", ProductSchema);
