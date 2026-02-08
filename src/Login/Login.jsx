import React, { useState } from 'react';
import '../Scss/Style.scss';
import { apiRequest } from '../reusable';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile) {
      setError('Mobile number is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await apiRequest(
        'post',
        '/api/auth/login',
        { labMobileNumber: String(mobile).trim() },
        false
      );

      console.log("FULL LOGIN RESPONSE:", result);

      // detect success from nested response
      const success =
        result?.data?.success ||
        result?.data?.data?.success;

      if (success) {
        const token =
          result?.data?.data?.data?.token ||
          result?.data?.data?.token;

        const user =
          result?.data?.data?.data?.user ||
          result?.data?.data?.user;

        // store token & user
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // IMPORTANT: set hospitalId cookie (App.jsx depends on this)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        document.cookie = `hospitalId=${user.id}; expires=${expires.toUTCString()}; path=/`;

        // redirect to dashboard route "/"
        navigate('/');
        window.location.reload();
        return;
      }

      // show backend message
      const backendMessage =
        result?.data?.message ||
        result?.data?.data?.message ||
        "Mobile number not registered";

      setError(backendMessage);

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);

      const backendError =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to login. Try again.";

      setError(backendError);
    } finally {
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
            <h2>Lab Login</h2>
          </div>

          <div className="form-body">
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label">Lab Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="form-control border-dark"
                  placeholder="Enter registered mobile number"
                  required
                />
              </div>

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
                  {isLoading ? 'Verifying...' : 'Login'}
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
