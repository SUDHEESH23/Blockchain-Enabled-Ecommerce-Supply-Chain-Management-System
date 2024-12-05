import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const ProductList = () => {
  const { account, contract } = useWeb3();
  const [products, setProducts] = useState([]);
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [updatedStock, setUpdatedStock] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingField, setEditingField] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [contract]);

  const fetchProducts = async () => {
    try {
      const productDetails = [];
      const productCount = await contract.methods.productCount().call();
  
      for (let i = 1; i <= productCount; i++) {
        // Fetch basic details
        const product = await contract.methods.getProductBasicDetails(i).call();
        const DeliveryDetails = await contract.methods.getProductDeliveryDetails(i).call();

        if (DeliveryDetails.finalCustomer == "0x0000000000000000000000000000000000000000") {
          // Fetch delivery details
          const formattedProduct = {
            id: product.id.toString(),
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            location: product.location,
            owner: product.owner,
            status: product.status,
            finalCustomer: DeliveryDetails.finalCustomer
          };
          productDetails.push(formattedProduct);
        }
      }
      setProducts(productDetails);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleUpdateProduct = async (productId, field, value) => {
    if (!value) return alert(`Please enter a valid ${field}`);
    
    const updateFunction = field === "price" ? contract.methods.updateProductPrice : contract.methods.updateProductStock;

    try {
      await updateFunction(productId, value).send({ from: account });
      fetchProducts();
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      setShowModal(false);
    } catch (error) {
      console.error(`Error updating product ${field}:`, error);
      alert(`Error updating product ${field}!`);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await contract.methods.removeProduct(productId).send({ from: account });
      fetchProducts();
      alert("Product removed successfully!");
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Error removing product!");
    }
  };

  const handleActionSelect = (action, product) => {
    switch (action) {
      case "updatePrice":
        setEditingProduct(product.id);
        setEditingField("price");
        setUpdatedPrice(product.price);
        setShowModal(true);
        break;
      case "updateStock":
        setEditingProduct(product.id);
        setEditingField("stock");
        setUpdatedStock(product.stock);
        setShowModal(true);
        break;
      case "removeProduct":
        handleRemoveProduct(product.id);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Product List</h2>
      <table className="min-w-full table-auto border-collapse mx-auto text-center">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="bg-white">
              <td className="p-2 border">{product.name}</td>
              <td className="p-2 border">{product.price}</td>
              <td className="p-2 border">{product.stock}</td>
              <td className="p-2 border">{product.location}</td>
              <td className="p-2 border">{product.owner}</td>
              <td className="p-2 border">{product.status}</td>
              <td className="p-2 border">
                <select
                  className="p-2 border rounded-md"
                  onChange={(e) => handleActionSelect(e.target.value, product)}
                  defaultValue=""
                >
                  <option value="" disabled>Select Action</option>
                  <option value="updatePrice">Update Price</option>
                  <option value="updateStock">Update Stock</option>
                  <option value="removeProduct">Remove Product</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for updating price or stock */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">{`Update ${editingField.charAt(0).toUpperCase() + editingField.slice(1)}`}</h3>
            <input
              type="text"
              value={editingField === "price" ? updatedPrice : updatedStock}
              onChange={(e) =>
                editingField === "price" ? setUpdatedPrice(e.target.value) : setUpdatedStock(e.target.value)
              }
              className="p-2 border border-gray-300 rounded-md mb-4 w-full"
              placeholder={`Enter ${editingField}`}
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-md w-full"
              onClick={() => handleUpdateProduct(editingProduct, editingField, editingField === "price" ? updatedPrice : updatedStock)}
            >
              Save Changes
            </button>
            <button
              className="bg-gray-500 text-white p-2 rounded-md w-full mt-4"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
