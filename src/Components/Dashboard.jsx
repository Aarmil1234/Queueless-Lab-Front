import React from "react";
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

const Dashboard = () => {
  /* ------------------ STATIC DATA ------------------ */

  const totalReports = 1248;

  const cityData = [
    { city: "Ahmedabad", reports: 420 },
    { city: "Surat", reports: 310 },
    { city: "Vadodara", reports: 210 },
    { city: "Rajkot", reports: 308 },
  ];

  // ✅ Test-wise report data
  const testData = [
    { name: "CBC", value: 320 },
    { name: "S. Creatinine", value: 210 },
    { name: "RBS", value: 180 },
    { name: "Urine Analysis", value: 150 },
    { name: "LFT", value: 230 },
    { name: "RFT", value: 158 },
  ];

  const weeklyData = [
    { day: "Mon", reports: 120 },
    { day: "Tue", reports: 180 },
    { day: "Wed", reports: 150 },
    { day: "Thu", reports: 200 },
    { day: "Fri", reports: 170 },
    { day: "Sat", reports: 220 },
    { day: "Sun", reports: 160 },
  ];

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#3b82f6",
    "#ef4444",
  ];

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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Dashboard</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Overview of Reports (Static)
        </p>
      </div>

      {/* Total Reports */}
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <h3 style={{ margin: 0, color: "#6b7280" }}>Total Reports</h3>
        <p style={{ fontSize: 36, fontWeight: 700, margin: "10px 0 0" }}>
          {totalReports}
        </p>
      </div>

      {/* Graphs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
          gap: 20,
        }}
      >
        {/* City Graph */}
        <div style={{ background: "white", padding: 20, borderRadius: 12 }}>
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

        {/* ✅ Test-wise Pie Chart */}
        <div style={{ background: "white", padding: 20, borderRadius: 12 }}>
          <h3>Test-wise Patient Distribution</h3>
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
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Graph */}
        <div
          style={{
            gridColumn: "1 / -1",
            background: "white",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3>Weekly Reports</h3>
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
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
