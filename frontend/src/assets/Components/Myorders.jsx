import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'Processing':
      return <Package className="h-5 w-5 text-blue-500" />;
    case 'Shipped':
      return <Truck className="h-5 w-5 text-purple-500" />;
    case 'Delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const OrderProgressBar = ({ status }) => {
  const statusStages = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStageIndex = statusStages.indexOf(status);

  return (
    <div className="flex items-center gap-2">
      {statusStages.map((stage, index) => (
        <div key={stage} className="flex-1 flex items-center">
          <div
            className={`h-4 w-4 rounded-full ${index <= currentStageIndex ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          {index < statusStages.length - 1 && (
            <div
              className={`flex-1 h-1 ${index < currentStageIndex ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
  
      if (!response.ok) {
        // Log more details to understand what went wrong
        const errorData = await response.json();
        throw new Error(`Failed to cancel the order: ${errorData.message || 'Unknown error'}`);
      }
  
      // Update orders list
      const updatedOrders = orders.filter((order) => order._id !== orderId);
      setOrders(updatedOrders);
    } catch (err) {
      setError(`Error canceling order: ${err.message}`);
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const filteredOrders =
    filter === 'All' ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="flex justify-end mb-4">
        <select
          className="border rounded px-4 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Package className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-600">No Orders Found</h2>
          <p className="text-gray-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="font-semibold">
                      Order #{order._id?.slice(-6) || 'N/A'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <OrderProgressBar status={order.status} />
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Items</h3>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image || '/placeholder-image.jpg'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.name || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity || 0}
                                </p>
                              </div>
                            </div>
                            <p className="font-medium">
                              ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Add Cancel Order button */}
                  {order.status !== 'Cancelled' && (
                    <div className="flex justify-end">
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order._id);
                        }}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;