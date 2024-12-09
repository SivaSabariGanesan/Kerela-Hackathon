import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, Layer, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const OrderMap = ({ restaurantLocation, deliveryLocation, currentLocation }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      const accessToken = 'pk.eyJ1Ijoic2l2YXNnLTIwMDUiLCJhIjoiY200ZWc1MXN0MHc4ODJqczg5NWt1Z2l5eSJ9.KBvhsqRptjAgxoIPIgrpyw';
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${restaurantLocation.lng},${restaurantLocation.lat};${deliveryLocation.lng},${deliveryLocation.lat}?geometries=geojson&access_token=${accessToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setRouteData(data.routes[0].geometry);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [restaurantLocation, deliveryLocation]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
      <Map
        mapboxAccessToken="pk.eyJ1Ijoic2l2YXNnLTIwMDUiLCJhIjoiY200ZWc1MXN0MHc4ODJqczg5NWt1Z2l5eSJ9.KBvhsqRptjAgxoIPIgrpyw"
        initialViewState={{
          longitude: restaurantLocation.lng,
          latitude: restaurantLocation.lat,
          zoom: 12,
          pitch: 45
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {/* Restaurant Marker */}
        <Marker longitude={restaurantLocation.lng} latitude={restaurantLocation.lat}>
          <div className="bg-orange-500 p-3 rounded-full shadow-lg transform -translate-y-1/2 hover:scale-110 transition-transform">
            <img src="https://img.icons8.com/fluency/48/restaurant.png" alt="Restaurant" className="w-8 h-8" />
          </div>
        </Marker>

        {/* Delivery Location Marker */}
        <Marker longitude={deliveryLocation.lng} latitude={deliveryLocation.lat}>
          <div className="bg-green-500 p-3 rounded-full shadow-lg transform -translate-y-1/2 hover:scale-110 transition-transform">
            <img src="https://img.icons8.com/fluency/48/home.png" alt="Delivery" className="w-8 h-8" />
          </div>
        </Marker>

        {/* Current Location Marker */}
        <Marker longitude={currentLocation.lng} latitude={currentLocation.lat}>
          <div 
            className="bg-blue-500 p-3 rounded-full shadow-lg cursor-pointer transform -translate-y-1/2 hover:scale-110 transition-transform animate-pulse"
            onClick={() => setShowPopup(!showPopup)}
          >
            <img src="https://img.icons8.com/fluency/48/delivery.png" alt="Current" className="w-8 h-8" />
          </div>
        </Marker>

        {showPopup && (
          <Popup
            longitude={currentLocation.lng}
            latitude={currentLocation.lat}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            className="rounded-xl overflow-hidden"
          >
            <div className="p-4 bg-white shadow-lg rounded-lg">
              <p className="font-bold text-lg text-gray-800">John Doe</p>
              <p className="text-gray-600">Estimated arrival in 15 mins</p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Currently delivering</span>
              </div>
            </div>
          </Popup>
        )}

        {routeData && (
          <Source
            id="route"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: routeData
            }}
          >
            <Layer
              id="route"
              type="line"
              paint={{
                'line-color': '#60a5fa',
                'line-width': 4,
                'line-opacity': 0.8,
                'line-dasharray': [2, 1]
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default OrderMap;