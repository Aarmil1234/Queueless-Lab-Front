import React, { useState } from 'react';
import '../Scss/Style.scss';
import { apiRequest } from '../reusable';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

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
      const res = await apiRequest(
        'post',
        '/api/auth/login',
        { labMobileNumber: mobile.trim() }
      );

      console.log("LOGIN RESPONSE:", res.data);

      const payload = res?.data?.data?.data;

      const token = payload?.token;
      const user = payload?.user;

      if (token) {
        // ✅ store session
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        // ✅ optional cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `hospitalId=${user?.id}; expires=${expires.toUTCString()}; path=/`;

        // ✅ redirect
        navigate('/');
      } else {
        setError("Invalid mobile number");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err.message);

await Swal.fire({
        icon: "warning",
        title: "Login Failed",
        text: err.message
          ? "Invalid Mobile Number"
          : "Login Failed2",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="registration-container">
        <div className="form-card auth-container">

          <div className="form-header py-3 p-2 text-center">
            <h1 className="brand-title">Queueless</h1>
            <h2>Lab Login</h2>
          </div>

          <div className="form-body">
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Lab Mobile Number</label>
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
                <p className="text-danger text-center mt-2">
                  {error}
                </p>
              )}

              <div className="text-center mt-3">
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