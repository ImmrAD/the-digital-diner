import { useEffect, useState } from 'react';
import { getMenuItems, getMenuItemsByCategory } from '../services/api';
import { useCart } from './CartContext';

export default function MenuItems() {
  const { dispatch } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await getMenuItems();
        // Initialize each menu item with its own quantity and selectedSize state
        const itemsWithState = data.map(item => ({
          ...item,
          quantity: 1,
          selectedSize: 'medium'
        }));
        setMenuItems(itemsWithState);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = (item) => {
    // Construct the item payload for the cart context
    const cartItem = {
      menuItemId: item._id,
      name: item.name,
      price: item.prices[item.selectedSize], // Use item-specific selected size
      quantity: item.quantity, // Use item-specific quantity
      special_instructions: '' // Default empty special instructions
    };
    dispatch({ type: "ADD_TO_CART", payload: cartItem });
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...menuItems];
    updatedItems[index].quantity = newQuantity;
    setMenuItems(updatedItems);
  };

  const handleSizeChange = (index, newSize) => {
    const updatedItems = [...menuItems];
    updatedItems[index].selectedSize = newSize;
    setMenuItems(updatedItems);
  };

  if (loading) return <div className="text-center py-8 text-xl">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500 text-xl">Error: {error}</div>;

  // Group items by category
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Menu</h1>
      
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter(item => item.category === category)
              .map((item, index) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">{item.ingredients.join(', ')}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <select 
                      value={item.selectedSize} 
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option value="small">Small (₹{item.prices.small})</option>
                      <option value="medium">Medium (₹{item.prices.medium})</option>
                      <option value="large">Large (₹{item.prices.large})</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      className="border rounded p-1 w-16"
                    />
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}