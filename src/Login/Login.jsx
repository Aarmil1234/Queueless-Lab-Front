import React, { useState } from 'react';
import '../Scss/Style.scss';
import { apiRequest } from '../reusable';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const loginData = {
      loginField: formData.email,
      password: formData.password,
    };

    try {
      const result = await apiRequest(
        'post',
        'admin/hospitallogin',
        loginData,
        false
      );

      // ❌ Invalid credentials or failed response
      if (!result || result.status !== 200 || !result?.data?._id) {
        setError('Your credentials do not match');
        setIsLoading(false);
        return;
      }

      // ✅ Successful login
      const hospitalId = result.data._id;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      document.cookie = `hospitalId=${hospitalId}; expires=${expires.toUTCString()}; path=/`;

      navigate('/');
      window.location.reload();

    } catch (err) {
      console.error('Login error:', err);
      setError('Your credentials do not match');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="registration-container">
        <div className="form-card auth-container">

          <div className="form-header py-3 p-2">
            <div className="d-flex justify-content-center text-center w-100">
              <h1 className="brand-title">Queueless</h1>
            </div>
            <h2>Sign In</h2>
          </div>

          <div className="form-body">
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control border-dark"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control border-dark"
                  required
                />
              </div>

              {/* ❌ Error Message */}
              {error && (
                <p className="text-danger mt-2 text-center">
                  {error}
                </p>
              )}

              <div className="button-group center y mt-3">
                <button
                  type="submit"
                  className="btn-custom btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In Securely'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
