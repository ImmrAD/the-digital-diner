import { useCart } from '../components/CartContext';
import { placeOrder } from '../components/CartContext';
import { useUser } from '../components/UserContext';

export default function Cart(){
    const { user } = useUser();
    const { cart, dispatch } = useCart();
    
    const handlePlaceOrder = async () => {
        try {
            if (!user?.phone) {
                alert('Please log in to place an order');
                return;
            }
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            const result = await placeOrder(cart, user);
            if (result?.id) {
                dispatch({ type: "CLEAR_CART" });
                alert('Order placed successfully!');
            }
        } catch (err) {
            alert('Failed to place order: ' + err.message);
        }
    };
    
    return(
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
            {cart.length === 0 ? (
                <p className="text-center">Your cart is empty</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold">{item.name}</h3>
                                <p className="text-gray-600">${item.price || 'Price not available'} × {item.quantity}</p>
                                <p className="text-gray-600 mt-2">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
                        onClick={handlePlaceOrder}
                    >
                        Place Order
                    </button>
                </>
            )}
        </div>
    )
}