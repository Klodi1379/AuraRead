import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <FaFileAlt className="h-7 w-7 text-primary-400" />
              <span className="ml-2 text-xl font-bold">AuraRead</span>
            </div>
            <p className="text-gray-300 max-w-xs">
              Your personal PDF reader that enhances your reading experience with audio, annotations, and smart features.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/documents" className="text-gray-300 hover:text-white transition-colors">
                  My Documents
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-300 hover:text-white transition-colors">
                  Upload
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>support@aurareader.com</li>
              <li>+1 (555) 123-4567</li>
              <li>1234 Reading Ave, Bookland, NY 10001</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {currentYear} AuraRead. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;