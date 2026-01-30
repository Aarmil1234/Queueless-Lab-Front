import React, { useLayoutEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import Reports from "./Components/Reports";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ReportsProvider } from "./context/ReportContext.jsx";
import "./Scss/Style.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import UnknownPage from "./UnknownPage.jsx";
import ReportHistory from "./Components/ReportHistory.jsx";
import Login from "./Login/Login.jsx";
import Settings from "./Components/Settings.jsx";

import AddParameterPage from "./Components/AddParamtwo.jsx";
import AddParameterRange from "./Components/AddRange.jsx";

const AppRoutes = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ✅ Hide Navbar + Sidebar for login, admin-login, or any 404 route
  const hideSidebarAndNavbar =
    location.pathname === "/login" ||
    location.pathname === "/admin-login" ||
    location.pathname === "/404";

  useLayoutEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});
    setHospitalId(cookies.hospitalId || null);
    setRole(cookies.role || null);
    setLoading(false);
  }, [location.pathname]);

  if (loading) return null;

  const isAdmin = role === "admin";

  return (
    <div className="admin-panel">
      {/* ✅ Show Sidebar only if not hidden */}
      {!hideSidebarAndNavbar &&
        (
          <Sidebar collapsed={collapsed} />
        )}

      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        {!hideSidebarAndNavbar && <Navbar collapsed={collapsed} />}
        <ReportsProvider>
        <Routes>
          <Route
            path="/"
            element={
              hospitalId || isAdmin ? <Dashboard /> : <Navigate to="/login" />
            }
          />
          <Route path="/reports" element={<Reports />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<ReportHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/addparam" element={<AddParameterPage />} />
          <Route path="/addrange" element={<AddParameterRange />} />

          {/* ✅ Redirect all unknown routes to /404 */}
          <Route path="/404" element={<UnknownPage />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
        </ReportsProvider>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
