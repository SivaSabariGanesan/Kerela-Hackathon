import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, ShoppingBag, XCircle } from 'lucide-react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const orderStatuses = {
    'Pending': { 
      icon: <Package className="w-6 h-6 text-yellow-500" />,
      description: 'Your order is being processed',
      color: 'bg-yellow-50 border-yellow-200'
    },
    'Shipped': { 
      icon: <Truck className="w-6 h-6 text-blue-500" />,
      description: 'Your order is on its way',
      color: 'bg-blue-50 border-blue-200'
    },
    'Delivered': { 
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      description: 'Order has been delivered',
      color: 'bg-green-50 border-green-200'
    },
    'Cancelled': { 
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      description: 'Order has been cancelled',
      color: 'bg-red-50 border-red-200'
    }
  };

  const locations = {
    restaurant: { lat: 40.712776, lng: -74.005974 },
    delivery: { lat: 40.730610, lng: -73.935242 },
    current: { lat: 40.721321, lng: -73.970542 }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    const fetchRoute = async () => {
      // Only fetch route if order is not cancelled and exists
      if (order && order.status !== 'Cancelled') {
        const accessToken = 'pk.eyJ1Ijoic2l2YXNnLTIwMDUiLCJhIjoiY200ZWc1MXN0MHc4ODJqczg5NWt1Z2l5eSJ9.KBvhsqRptjAgxoIPIgrpyw';
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${locations.restaurant.lng},${locations.restaurant.lat};${locations.delivery.lng},${locations.delivery.lat}?geometries=geojson&access_token=${accessToken}`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            setRouteData(data.routes[0].geometry);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      }
    };

    fetchRoute();
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/my-orders')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Order #{orderId}</h1>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date().toLocaleDateString()}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${orderStatuses[order.status]?.color || 'bg-gray-50 border-gray-200'}`}>
                {orderStatuses[order.status]?.icon || <Package className="w-6 h-6 text-gray-500" />}
                <span className="text-sm font-medium">
                  {orderStatuses[order.status]?.description || 'Unknown Status'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
              </div>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map - Only show for non-cancelled orders */}
              {order.status !== 'Cancelled' && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900">Delivery Tracking</h2>
                  </div>
                  <div className="h-[400px] rounded-xl overflow-hidden border border-gray-100">
                    <Map
                      mapboxAccessToken='pk.eyJ1Ijoic2l2YXNnLTIwMDUiLCJhIjoiY200ZWc1MXN0MHc4ODJqczg5NWt1Z2l5eSJ9.KBvhsqRptjAgxoIPIgrpyw'
                      initialViewState={{
                        longitude: locations.restaurant.lng,
                        latitude: locations.restaurant.lat,
                        zoom: 12
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/light-v11"
                    >
                      <Marker longitude={locations.restaurant.lng} latitude={locations.restaurant.lat}>
                        <div className="bg-orange-500 p-2 rounded-full shadow-sm">
                          <img src="https://img.icons8.com/fluency/48/restaurant.png" alt="Restaurant" className="w-5 h-5" />
                        </div>
                      </Marker>
                      <Marker longitude={locations.delivery.lng} latitude={locations.delivery.lat}>
                        <div className="bg-green-500 p-2 rounded-full shadow-sm">
                          <img src="https://img.icons8.com/fluency/48/home.png" alt="Delivery" className="w-5 h-5" />
                        </div>
                      </Marker>
                      <Marker longitude={locations.current.lng} latitude={locations.current.lat}>
                        <div
                          className="bg-blue-500 p-2 rounded-full shadow-sm cursor-pointer hover:scale-110 transition-transform animate-pulse"
                          onClick={() => setShowPopup(!showPopup)}
                        >
                          <img src="https://img.icons8.com/fluency/48/delivery-truck.png" alt="Current" className="w-5 h-5" />
                        </div>
                      </Marker>
                      {showPopup && (
                        <Popup
                          longitude={locations.current.lng}
                          latitude={locations.current.lat}
                          closeButton={true}
                          onClose={() => setShowPopup(false)}
                        >
                          <div className="p-2">
                            <p className="text-sm font-medium">Current Location</p>
                            <p className="text-xs text-gray-500">Your order is here</p>
                          </div>
                        </Popup>
                      )}
                      {routeData && (
                        <Source type="geojson" data={{ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: routeData }] }}>
                          <Layer
                            id="route-layer"
                            type="line"
                            paint={{
                              'line-color': '#3b82f6',
                              'line-width': 3
                            }}
                          />
                        </Source>
                      )}
                    </Map>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Sidebar */}
            <div className="lg:border-l lg:pl-6">
              {/* Shipping Details */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">Shipping Details</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{order.address?.street || 'Not Provided'}</p>
                  <p className="text-sm text-gray-500">
                    {order.address?.city || 'N/A'}, {order.address?.state || ''} {order.address?.zip || ''}
                  </p>
                  <p className="text-sm text-gray-500">{order.address?.country || 'Not Provided'}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Payment Method:</span> {order.paymentMethod || 'Not Provided'}
                  </p>
                  {order.paymentMethod === 'Online' && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Mobile:</span> {order.mobilePayment || 'Not Provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">${order.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">${order.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-medium text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;