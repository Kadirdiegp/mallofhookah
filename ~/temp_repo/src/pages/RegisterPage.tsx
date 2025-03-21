import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear password error when user types in password fields
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register with Supabase Auth
      const { user } = await signUp(formData.email, formData.password);
      
      if (user) {
        // If email confirmation is enabled in Supabase, show a message
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please check your email to confirm your account.' 
          } 
        });
      } else {
        // If email confirmation is not required, user is signed in automatically
        navigate('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      // No need to navigate - the OAuth flow will redirect
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google login. Please try again.';
      setError(errorMessage);
      console.error('Google login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-3 border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="••••••••"
            />
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-gray-700 text-sm">
              I accept the{' '}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5c1.617 0 3.082.573 4.241 1.5l3.176-3.13A11.495 11.495 0 0 0 12 0C7.392 0 3.474 2.632 1.367 6.5l3.733 2.898C6.175 6.528 8.858 5 12 5z" fill="#EA4335" />
                <path d="M23.610 12.166c0-.815-.073-1.6-.21-2.352H12v4.448h6.521a5.605 5.605 0 0 1-2.419 3.676l3.695 2.868A11.496 11.496 0 0 0 24 12.166h-.39z" fill="#4285F4" />
                <path d="M5.011 14.402a6.889 6.889 0 0 1-.366-2.233c0-.776.132-1.526.366-2.233L1.276 6.5C.465 8.238 0 10.2 0 12.166c0 1.969.465 3.931 1.276 5.668l3.733-2.898c-.234-.707-.366-1.458-.366-2.233" fill="#FBBC05" />
                <path d="M12 18.33c3.14 0 5.778-1.04 7.7-2.83l-3.695-2.867a7.238 7.238 0 0 1-4.015 1.14c-3.143 0-5.824-2.118-6.774-4.978L1.366 11.64C2.615 15.514 6.36 18.33 12 18.33" fill="#34A853" />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
