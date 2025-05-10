import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="max-w-md mx-auto">
      <div className="card overflow-hidden fade-in">
        <div className="bg-primary-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-primary-100">Sign in to continue to AuraRead</p>
        </div>
        
        <div className="px-6 py-8">
          <LoginForm />
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;