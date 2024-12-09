import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, DollarSign, CreditCard } from 'lucide-react';

axios.defaults.withCredentials = true;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    onlinePaymentMethod: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const cartItems = location.state?.cartItems || 
                      JSON.parse(localStorage.getItem('cartItems')) || 
                      [];
    setOrder(cartItems);
  }, [location.state]);

  // Calculate order totals
  const subtotal = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Handle input changes for address and payment
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (['street', 'city', 'state', 'zip', 'country'].includes(name)) {
      setAddress(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setPaymentDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Place order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: order.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        address,
        paymentMethod,
        paymentDetails: {
          ...(paymentMethod === 'Cash on Delivery' ? { phoneNumber: paymentDetails.phoneNumber } : 
              paymentMethod === 'Online Payment' ? { method: paymentDetails.onlinePaymentMethod } : {})
        },
        subtotal,
        shipping,
        tax,
        total,
        status: 'Pending'
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderPayload
      );

      setOrderId(response.data._id);
      setIsOrderPlaced(true);

      localStorage.removeItem('cartItems');

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order status handler
  const handleTrackOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderTrackingId}`
      );

      if (response.data) {
        setOrderStatus(response.data.status);
      } else {
        setError('Order not found');
        setOrderStatus(null);
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
      setError('Failed to fetch order status. Please try again.');
      setOrderStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {isOrderPlaced ? (
            <div className="text-center py-16">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-8">Your order ID is: {orderId}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Track Your Order
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Order Summary Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Your Items</h3>
                <div className="space-y-4 mb-6">
                  {order.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Checkout Details</h3>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {/* Shipping Address Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={address.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={address.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={address.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={address.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ZIP"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={address.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Country"
                      required
                    />
                  </div>
                  {/* Payment Method Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a payment method</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Online Payment">Online Payment</option>
                    </select>
                  </div>
                  {/* Payment Details */}
                  {paymentMethod === 'Cash on Delivery' && (
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={paymentDetails.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                  )}
                  {paymentMethod === 'Online Payment' && (
                    <div>
                      <label htmlFor="onlinePaymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Online Payment Method</label>
                      <input
                        type="text"
                        id="onlinePaymentMethod"
                        name="onlinePaymentMethod"
                        value={paymentDetails.onlinePaymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Credit Card"
                        required
                      />
                    </div>
                  )}
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Order Tracking Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Track Your Order</h3>
            <div className="flex mb-4">
              <input
                type="text"
                value={orderTrackingId}
                onChange={(e) => setOrderTrackingId(e.target.value)}
                placeholder="Enter Order ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleTrackOrder}
                disabled={isLoading}
                className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {isLoading ? 'Tracking...' : 'Track'}
              </button>
            </div>
            {orderStatus && (
              <div className="mt-4 text-lg font-semibold">
                Status: {orderStatus}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;