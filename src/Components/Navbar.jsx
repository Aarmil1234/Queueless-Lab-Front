import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { LogOut, User } from "lucide-react";

const Navbar = ({ collapsed }) => {
  const navigate = useNavigate();

  const [hospitalName, setHospitalName] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // ✅ Get data from sessionStorage
  useEffect(() => {
    const name = sessionStorage.getItem("hospitalName");
    const owner = sessionStorage.getItem("ownerName");

    setHospitalName(name || "My Lab");
    setOwnerName(owner || "Administrator");
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    swal({
      title: "Are you sure?",
      text: "You will be logged out of this session.",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        // 🔥 clear everything
        sessionStorage.clear();

        // remove cookie if still used
        document.cookie =
          "hospitalId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        navigate("/login");
      }
    });
  };

  // ✅ Styles
  const navbarStyle = {
    position: "fixed",
    top: 0,
    left: collapsed ? "80px" : "280px",
    right: 0,
    height: "80px",
    background: "white",
    borderBottom: "2px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    transition: "all 0.3s ease",
    zIndex: 999,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  };

  const logoutBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  };

  return (
    <nav style={navbarStyle}>
      {/* LEFT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
            }}
          >
            Welcome Back
          </h2>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 16px",
            background: "#f9fafb",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <User size={18} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* ✅ OWNER NAME */}
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              {ownerName}
            </span>

            <span
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              {hospitalName}
            </span>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          style={logoutBtnStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;