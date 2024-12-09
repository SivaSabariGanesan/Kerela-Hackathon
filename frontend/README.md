import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [error, setError] = useState(null);

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

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      {/* Rest of your component */}
    </div>
  );
};

export default AdminDashboard;