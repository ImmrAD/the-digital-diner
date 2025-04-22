import { useCart } from '../components/CartContext';
import { placeOrder } from '../components/CartContext';
import { useUser } from '../components/UserContext';

export default function Cart(){
    const { user } = useUser();
    const { cart, dispatch, totalPrice } = useCart();
    
    // Function to format currency
    const formatCurrency = (amount) => {
        // Check if amount is a valid number before formatting
        if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
            return '₹0.00';
        }
        // Ensure amount is treated as a number by explicitly parsing it
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numericAmount);
    };
    
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
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
                                    <div className="flex items-center">
                                        <button 
                                            className="bg-gray-200 px-2 py-1 rounded-l"
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    dispatch({
                                                        type: "UPDATE_QUANTITY",
                                                        payload: {
                                                            menuItemId: item.menuItemId,
                                                            quantity: item.quantity - 1
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            -
                                        </button>
                                        <span className="px-3">{item.quantity}</span>
                                        <button 
                                            className="bg-gray-200 px-2 py-1 rounded-r"
                                            onClick={() => {
                                                dispatch({
                                                    type: "UPDATE_QUANTITY",
                                                    payload: {
                                                        menuItemId: item.menuItemId,
                                                        quantity: item.quantity + 1
                                                    }
                                                });
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">Total: {formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold">Cart Total</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPrice)}</p>
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