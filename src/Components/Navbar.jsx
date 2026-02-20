import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../reusable";
import swal from "sweetalert";
import { Menu, X, LogOut, User } from "lucide-react";

const Navbar = ({ collapsed, toggleSidebar }) => {
  const [hospitalId, setHospitalId] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const hospitalCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hospitalId="))
      ?.split("=")[1];

    setHospitalId(hospitalCookie);
  }, []);

  useEffect(() => {
    if (hospitalId) fetchHospital();
  }, [hospitalId]);

  const fetchHospital = async () => {
    try {
      const res = await apiRequest("POST", "admin/gethospitals", { hospitalId }, false);
      setData(res.data?.hospitals || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  const handleLogout = () => {
    swal({
      title: "Are you sure?",
      text: "You will be logged out of this session.",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        document.cookie = "hospitalId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/login");
      }
    });
  };

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: collapsed ? '80px' : '280px',
    right: 0,
    height: '80px',
    background: 'white',
    borderBottom: '2px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    transition: 'all 0.3s ease',
    zIndex: 999,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  };

  const toggleBtnStyle = {
    width: '42px',
    height: '42px',
    border: 'none',
    background: '#f3f4f6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.3s ease'
  };

  const logoutBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  };

  return (
    <nav style={navbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0,
            lineHeight: '1.2'
          }}>Welcome Back</h2>
          <span style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            fontWeight: '400'
          }}>Manage your healthcare facility</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>{data?.[0]?.ownerName || "Administrator"}</span>
            <span style={{
              fontSize: '0.8rem',
              color: '#6b7280'
            }}>Lab Admin</span>
          </div>
        </div>
        
        <button 
          style={logoutBtnStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
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