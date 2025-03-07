import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Printer, BarChart2, LogOut, Menu, X, Settings, User } from 'lucide-react';
import { isAuthenticated, getToken, getShopId, logout } from '../../utils/auth';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const fetchShopDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/shop/${getShopId()}`, {
            headers: {
              'Authorization': `Bearer ${getToken()}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch shop details');
          }
          const shop = await response.json();
          setShop(shop);
        } catch (error) {
          toast.error('Failed to fetch shop details');
        }
      };

      fetchShopDetails();
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white transition-all duration-200"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition duration-200 ease-in-out lg:relative lg:flex z-40 w-72 bg-white border-r border-gray-200`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
                <Printer className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                PrintFlow
              </span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {shop?.name || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {shop?.email || 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Printer className="mr-3 h-5 w-5" />
              Print Jobs
            </NavLink>
            {/* <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Analytics
            </NavLink> */}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            {/* <button
              onClick={() => navigate('/dashboard/settings')}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 mb-2 transition-colors duration-150"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button> */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;