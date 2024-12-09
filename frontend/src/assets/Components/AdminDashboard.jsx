import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20 // Adjust as needed
  });

  useEffect(() => {
    fetchOrders(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders`, {
        withCredentials: true,
        params: {
          page,
          limit: pagination.pageSize
        }
      });

      // Check if response structure matches expected format
      const ordersData = response.data.orders || response.data;
      const totalCount = response.data.total || ordersData.length;

      setOrders(ordersData);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(totalCount / pagination.pageSize)
      }));
      setLoading(false);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Validate inputs
      if (!orderId || !newStatus) {
        setError('Invalid order ID or status');
        return;
      }

      console.log('Attempting to update order:', {
        orderId,
        newStatus
      });

      // Ensure the correct endpoint and payload
      const response = await axios.patch(`/api/orders/${orderId}/status`, { 
        status: newStatus 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle successful response
      console.log('Order status updated successfully:', response.data);
      
      // Clear any previous errors
      setError(null);

      // Optionally, refresh order list or update UI
      // fetchOrders();
    } catch (error) {
      // Comprehensive error handling
      console.error('Error updating order status:', error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server Error: ${error.response.data.message || 'Failed to update order status'}`);
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response received from server');
        console.error('Request made but no response:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error setting up the request');
        console.error('Error setting up request:', error.message);
      }
    }
  };


  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => order.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-gray-300 p-2"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{filteredOrders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredOrders.filter(order => order.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Delivered Orders</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredOrders.filter(order => order.status === 'Delivered').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Cancelled Orders</h3>
          <p className="text-2xl font-bold text-red-600">
            {filteredOrders.filter(order => order.status === 'Cancelled').length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {order.user?.avatar && (
                      <img
                        className="h-10 w-10 rounded-full mr-3"
                        src={order.user.avatar}
                        alt=""
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.name} (x{item.quantity})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View Details
                  </button>
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Customer Information</h3>
                <p>{selectedOrder.user?.name}</p>
                <p>{selectedOrder.user?.email}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Shipping Address</h3>
                <p>{selectedOrder.address?.street}</p>
                <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
                <p>{selectedOrder.address?.zip}</p>
                <p>{selectedOrder.address?.country}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Order Items</h3>
                <div className="mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium">Total</h3>
                <p className="text-xl font-semibold">${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}