import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import Setting from "./Components/Setting";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './Scss/Style.scss';
import "bootstrap/dist/css/bootstrap.min.css";
import Appointments from "./Components/Appointment";
import ClientList from "./Components/ClientLIst";
import QueuelessRegistrationForm from "./Login/RegistrationForm";
import Another from "./Another";
import AddDoctor from "./Components/AddDoctor";
import Login from "./Login/Login";
// import ApiCall from "./ApiCall/ApiCall";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <div className="admin-panel">
        <Sidebar collapsed={collapsed} />
        <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
          <Navbar collapsed={collapsed} />
          <Routes>
            {/* <Route path="/" element={< ApiCall/>} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointment" element={<Appointments />} />
            <Route path="/patients" element={<ClientList />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/doctors" element={<AddDoctor />} />
            <Route path="/Registration" element={<QueuelessRegistrationForm />} />
            <Route path="/login" element={<Login />} />
          </Routes>

        </div>
      </div>
    </Router>
  );
};

export default App;
