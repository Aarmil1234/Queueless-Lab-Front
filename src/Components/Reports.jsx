import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function Reports() {
  const [view, setView] = useState("list"); // list | add
  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const [formData, setFormData] = useState({
    patientName: "",
    gender: "Male",
    dateOfBirth: "",
    age: "",
    referredByDoctor: "",
    doctorContactNo: "",
    address: "",
    mobileNumber: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH REPORTS =================
  const fetchReports = async () => {
    try {
      const res = await apiRequest("get", "/api/report");
      setReports(res?.data?.Data || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  // ================= FETCH TESTS =================
  const fetchTests = async () => {
    try {
      const res = await apiRequest("get", "/api/test");
      setTests(res?.data?.Data || []);
    } catch (err) {
      console.error("Failed to fetch tests", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= SWITCH TO ADD VIEW =================
  const handleAddView = async () => {
    await fetchTests();
    setView("add");
  };

  // ================= FORM HANDLERS =================
  const toggleTest = (key) => {
    setSelectedTests((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      gender: "Male",
      dateOfBirth: "",
      age: "",
      referredByDoctor: "",
      doctorContactNo: "",
      address: "",
      mobileNumber: ""
    });
    setSelectedTests([]);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };


  // ================= SUBMIT PATIENT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTests.length === 0) {
      setMessage("Please select at least one test");
      setMessageType("error");
      return;
    }

    const payload = {
      ...formData,
      age: Number(formData.age),
      tests: selectedTests
    };

    try {
      setLoading(true);
      await apiRequest("post", "/api/patient", payload);

      setMessage("Patient added successfully!");
      setMessageType("success");

      resetForm();
      setView("list");
      fetchReports();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add patient");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* ================= REPORTS LIST VIEW ================= */}
        {view === "list" && (
          <>
            <div className="reports-header">
              <h2>Reports</h2>
              <button className="btn-report btn-primary" onClick={handleAddView}>
                <Plus size={18} /> Add Patient
              </button>
            </div>

            <div className="reports-table-card">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Patient</th>
                    <th>Mobile</th>
                    <th>Test</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    reports.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.caseId}</td>
                        <td>{r.patientName}</td>
                        <td>{r.mobileNumber}</td>
                        <td>{r.testName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= ADD PATIENT VIEW ================= */}
        {view === "add" && (
          <>
            <div className="reports-header">
              <h2>Add Patient</h2>
              <button
                className="btn-report btn-secondary"
                onClick={() => setView("list")}
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            {message && (
              <div style={{
                marginBottom: "15px",
                padding: "12px",
                borderRadius: "10px",
                background: messageType === "success" ? "#10b981" : "#ef4444",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                {messageType === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {message}
              </div>
            )}

            <form className="reports-form-card" onSubmit={handleSubmit}>
              <div className="reports-form-grid">
                <label>Patient Name</label>
                <input name="patientName" value={formData.patientName} onChange={handleChange} required />

                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    setFormData({
                      ...formData,
                      dateOfBirth: dob,
                      age: calculateAge(dob)
                    });
                  }}
                  required
                />


                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                />


                <label>Referred By Doctor</label>
                <input name="referredByDoctor" value={formData.referredByDoctor} onChange={handleChange} />

                <label>Doctor Contact No</label>
                <input name="doctorContactNo" value={formData.doctorContactNo} onChange={handleChange} />

                <label>Mobile Number</label>
                <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />

                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} />
              </div>

              <h3 style={{ marginTop: "25px" }}>Select Tests</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "12px"
              }}>
                {tests.map((test) => (
                  <label key={test.key} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.key)}
                      onChange={() => toggleTest(test.key)}
                    />
                    {test.name}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="btn-report btn-success"
                disabled={loading}
                style={{ marginTop: "20px" }}
              >
                {loading ? "Saving..." : "Add Patient"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
