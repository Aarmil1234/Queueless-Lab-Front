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
  const [weeklyData, setWeeklyData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#3b82f6",
    "#ef4444",
  ];

  /* ------------------ SAFE DATA EXTRACTOR ------------------ */
  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  /* ------------------ TOTAL PATIENTS ------------------ */
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

  /* ------------------ TEST-WISE ------------------ */
  const fetchTestWisePatients = async () => {
    try {
      setLoadingTests(true);

      const res = await apiRequest("get", "/api/dashboard/testWisePatient");

      console.log("TEST RAW:", res);

      const apiData = extractArray(res);

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

  /* ------------------ DOCTOR-WISE ------------------ */
  const fetchDoctorWisePatients = async () => {
    try {
      setLoadingDoctors(true);

      const res = await apiRequest("get", "/api/dashboard/doctorWisePatient");

      const apiData = extractArray(res);
      setDoctorList(apiData);

    } catch (err) {
      console.error("Doctor fetch error:", err);
      setDoctorList([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  /* ------------------ WEEKLY ------------------ */
  const fetchWeeklyReports = async () => {
    try {
      setLoadingWeekly(true);

      const res = await apiRequest("get", "/api/dashboard/weeklyReportData");
      const apiData = res?.data || res;

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

  /* ------------------ CITY-WISE ------------------ */
  const fetchCityWiseReports = async () => {
    try {
      setLoadingCity(true);

      const res = await apiRequest("get", "/api/dashboard/cityWiseReportData");

      const apiData = extractArray(res);

      const formatted = apiData.map(item => ({
        city: item.cityName || item.city || "-",
        reports: Number(item.reportCount || item.totalReports || 0)
      }));

      setCityData(formatted);

    } catch (err) {
      console.error("City-wise fetch error:", err);
      setCityData([]);
    } finally {
      setLoadingCity(false);
    }
  };

  useEffect(() => {
    fetchTotalPatients();
    fetchTestWisePatients();
    fetchDoctorWisePatients();
    fetchWeeklyReports();
    fetchCityWiseReports();
  }, []);

  /* ------------------ UI ------------------ */

  return (
    <div style={{ padding: "30px", margin: "60px 0 0 280px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

          {/* TOTAL */}
          <div style={{ background: "white", padding: 24, borderRadius: 12 , width: "430px", margin: "5px 0" , boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
            <h3>Total Patients</h3>
            <p style={{ fontSize: 36, fontWeight: 700 }}>{totalPatients}</p>
          </div>
      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))",
          gap: 20,
        }}
      >


        {/* CITY */}
        <div style={{ background: "white", padding: 20, borderRadius: 12 , boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
          <h3>City-wise Reports</h3>
          <div style={{ height: 260 }}>
            {loadingCity ? (
              <p>Loading...</p>
            ) : cityData.length === 0 ? (
              <p>No city data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TEST PIE */}
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
          <h3>Test-wise Patient Distribution</h3>
          <div style={{ height: 260 }}>
            {loadingTests ? (
              <p>Loading...</p>
            ) : testData.length === 0 ? (
              <p>No test data available</p>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* DOCTOR TABLE */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginTop: 24 }}>
        <h3>Reference Doctors</h3>

        {loadingDoctors ? (
          <p>Loading...</p>
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

      {/* WEEKLY */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginTop: 24 , boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}>
        <h3>Weekly Reports</h3>
        <div style={{ height: 260 }}>
          {loadingWeekly ? (
            <p>Loading...</p>
          ) : weeklyData.length === 0 ? (
            <p>No weekly data</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;