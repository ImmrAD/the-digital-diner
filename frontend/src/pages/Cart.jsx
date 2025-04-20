import { useCart } from '../components/CartContext';

export default function Cart(){
    const { cart } = useCart();
    
    return(
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
            {cart.length === 0 ? (
                <p className="text-center">Your cart is empty</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {cart.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold">{item.name}</h3>
                            <p className="text-gray-600">${item.prices.medium}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}