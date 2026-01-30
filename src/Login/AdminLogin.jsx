import React, { useState } from "react";
import "../Scss/Style.scss";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (
        formData.email === "admin@gmail.com" &&
        formData.password === "Admin@123"
      ) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `role=admin; expires=${expires.toUTCString()}; path=/`;
        navigate("/admin-dashboard");
        window.location.reload();
      } else {
        alert("Invalid admin credentials");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-wrapper">
      <div className="registration-container">
        <div className="form-card auth-container">
          <div className="form-header py-3 p-2">
            <div className="d-flex justify-content-center text-center w-100">
              <h1 className="brand-title">Queueless</h1>
            </div>
            <h2>Admin Sign In</h2>
          </div>

          <div className="form-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
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
                <label htmlFor="password" className="form-label">Password</label>
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

              <div className="button-group center y">
                <button
                  type="submit"
                  className="btn-custom btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Sign In Securely"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
