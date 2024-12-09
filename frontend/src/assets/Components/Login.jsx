import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from 'react-icons/fa';
import { GiShoppingBag } from 'react-icons/gi';
import axios from 'axios';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      const decodedUser = JSON.parse(window.atob(base64));

      const userResponse = await axios.post('http://localhost:5000/api/auth/google', {
        name: decodedUser.name,
        email: decodedUser.email,
        picture: decodedUser.picture
      }, { withCredentials: true });

      setUser(userResponse.data);
      navigate("/dashboard"); // Ensure navigation after setting the user
    } catch (error) {
      console.error("Login Failed", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Google Login Failed", error);
    alert("Google login failed");
  };

  const handleAdminLogin = () => {
    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      picture: "https://via.placeholder.com/150"
    };
    setUser(adminUser);
    navigate("/admin-dashboard"); // Navigate to dashboard after admin login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <GiShoppingBag className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Fresh Picks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Discover fresh, quality ingredients
          </p>
        </div>

        <div className="space-y-6">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            useOneTap
            render={({ onClick }) => (
              <button
                onClick={onClick}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <FaGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </button>
            )}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue as
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              const guestUser = {
                name: "Guest User",
                email: "guest@example.com",
                picture: "https://via.placeholder.com/150"
              };
              setUser(guestUser);
              navigate("/dashboard");
            }}
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Guest Login
          </button>

          {/* Admin Login Button */}
          <button 
            onClick={handleAdminLogin}
            className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            Admin Login
          </button>
        </div>

        <div className="text-center">
          <p className="mt-2 text-xs text-gray-600">
            By signing in, you agree to our{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
