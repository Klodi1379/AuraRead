import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FaHome, FaFileAlt, FaUpload, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navigation = [
    { name: 'Home', href: '/', icon: FaHome, requiresAuth: false },
    { name: 'My Documents', href: '/documents', icon: FaFileAlt, requiresAuth: true },
    { name: 'Upload', href: '/upload', icon: FaUpload, requiresAuth: true },
  ];
  
  const filteredNavigation = navigation.filter(item => 
    !item.requiresAuth || (item.requiresAuth && isAuthenticated)
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center fade-in">
                <FaFileAlt className="h-7 w-7 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-primary-700">AuraRead</span>
              </div>
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User auth section */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user ? user.username : 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm px-3 py-1.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm px-3 py-1.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <FaTimes className="block h-5 w-5" aria-hidden="true" />
              ) : (
                <FaBars className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fade-in px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
          
          {/* Mobile auth buttons */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <FaUser className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user ? user.username : 'User'}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-4">
                <Link
                  to="/login"
                  className="text-base font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;