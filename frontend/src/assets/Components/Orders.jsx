import React, { useState } from 'react';
import { ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';

const OrderDashboardPeek = ({ order, onViewFullOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
      <div 
        className="flex items-center justify-between p-4 bg-blue-600 text-white cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-6 h-6" />
          <span className="font-semibold">Your Order</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{totalItems} items</span>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {order.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span className="text-gray-800">{item.name}</span>
              <span className="text-gray-600">x{item.quantity}</span>
            </div>
          ))}
          <div className="mt-4 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={onViewFullOrder}
        className="w-full py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
      >
        View Full Order
      </button>
    </div>
  );
};

export default OrderDashboardPeek;

