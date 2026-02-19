import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiRequest } from "../reusable";

const Dashboard = () => {

  const [totalPatients, setTotalPatients] = useState(0);
  const [testData, setTestData] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [weeklyData, setWeeklyData] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  /* ------------------ STATIC CITY DATA (for now) ------------------ */

  const cityData = [
    { city: "Ahmedabad", reports: 420 },
    { city: "Surat", reports: 310 },
    { city: "Vadodara", reports: 210 },
    { city: "Rajkot", reports: 308 },
  ];

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#3b82f6",
    "#ef4444",
  ];

  /* ------------------ API CALLS ------------------ */

  // TOTAL PATIENTS
 const fetchTotalPatients = async () => {
  try {
    const res = await apiRequest("get", "/api/dashboard/totalPatientCount");

    const total =
      res?.data?.data?.totalPatients ??
      res?.data?.totalPatients ??
      res?.totalPatients ??
      0;

    setTotalPatients(Number(total));

  } catch (err) {
    console.error("Total patients fetch error:", err);
    setTotalPatients(0);
  }
};


  // WEEKLY REPORTS (DYNAMIC)
  const fetchWeeklyReports = async () => {
    try {
      setLoadingWeekly(true);

      const res = await apiRequest("get", "/api/dashboard/weeklyReportData");
      console.log("WEEKLY FULL RESPONSE:", res);

      // 🔥 important mapping based on your backend response
      const apiData = res?.data;

      if (!apiData) {
        setWeeklyData([]);
        return;
      }

      const formatted = [
        { day: "Mon", reports: Number(apiData.monday || 0) },
        { day: "Tue", reports: Number(apiData.tuesday || 0) },
        { day: "Wed", reports: Number(apiData.wednesday || 0) },
        { day: "Thu", reports: Number(apiData.thursday || 0) },
        { day: "Fri", reports: Number(apiData.friday || 0) },
        { day: "Sat", reports: Number(apiData.saturday || 0) },
        { day: "Sun", reports: Number(apiData.sunday || 0) },
      ];

      setWeeklyData(formatted);

    } catch (err) {
      console.error("Weekly fetch error:", err);
      setWeeklyData([]);
    } finally {
      setLoadingWeekly(false);
    }
  };

  // TEST-WISE PATIENTS
  const fetchTestWisePatients = async () => {
    try {
      setLoadingTests(true);

      const res = await apiRequest("get", "/api/dashboard/testWisePatient");
      console.log("FULL TEST API:", res);

      const apiData = res?.data?.data?.totalPatients;

      if (!Array.isArray(apiData)) {
        setTestData([]);
        return;
      }

      const formatted = apiData.map(item => ({
        name: item.testName,
        value: Number(item.patientCount)
      }));

      setTestData(formatted);

    } catch (err) {
      console.error("Test-wise fetch error:", err);
      setTestData([]);
    } finally {
      setLoadingTests(false);
    }
  };

  // DOCTOR-WISE PATIENTS
  const fetchDoctorWisePatients = async () => {
    try {
      setLoadingDoctors(true);

      const res = await apiRequest("get", "/api/dashboard/doctorWisePatient");
      console.log("DOCTOR LIST:", res);

      setDoctorList(res?.data || []);

    } catch (err) {
      console.error("Doctor fetch error:", err);
      setDoctorList([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchTotalPatients();
    fetchTestWisePatients();
    fetchDoctorWisePatients();
    fetchWeeklyReports();
  }, []);

  /* ------------------ UI ------------------ */

  return (
    <div
      style={{
        padding: "30px",
        margin: "60px 0 0 280px",
        background: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Dashboard</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Lab Analytics Overview
        </p>
      </div>

      {/* GRAPHS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 20,
        }}
      >
        {/* TOTAL PATIENTS CARD */}
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 12,
            height: "150px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}
        >
          <h3 style={{ margin: 0, color: "#6b7280" }}>Total Patients</h3>
          <p style={{ fontSize: 36, fontWeight: 700, margin: "10px 0 0" }}>
            {totalPatients}
          </p>
        </div>

        {/* CITY GRAPH */}
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
          <h3>City-wise Reports</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
          <h3>Test-wise Patient Distribution</h3>

          {loadingTests ? (
            <p>Loading test data...</p>
          ) : testData.length === 0 ? (
            <p>No test data available</p>
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {testData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* DOCTOR TABLE */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginTop: 24 }}>
        <h3>Reference Doctors</h3>

        {loadingDoctors ? (
          <p>Loading doctors...</p>
        ) : doctorList.length === 0 ? (
          <p>No doctor data available</p>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Contact</th>
                <th>Total Patients</th>
              </tr>
            </thead>
            <tbody>
              {doctorList.map((doc, index) => (
                <tr key={index}>
                  <td>{doc.doctorName}</td>
                  <td>{doc.doctorContact}</td>
                  <td style={{ fontWeight: "700", color: "#6366f1" }}>
                    {doc.patientCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* WEEKLY GRAPH */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginTop: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
        }}
      >
        <h3>Weekly Reports</h3>

        {loadingWeekly ? (
          <p>Loading weekly reports...</p>
        ) : !weeklyData || weeklyData.length === 0 ? (
          <p>No weekly data available</p>
        ) : (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
