import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function Reports() {

  // screens: list → tests → add → addResult
  const [screen, setScreen] = useState("list");

  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const [listLoading, setListLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [resultData, setResultData] = useState({
    result: "",
    remark: ""
  });

  const [formData, setFormData] = useState({
    patientName: "",
    gender: "Male",
    dateOfBirth: "",
    age: "",
    ageType: "year",
    referredByDoctor: "",
    doctorContactNo: "",
    address: "",
    mobileNumber: ""
  });

  const calculateAge = (dob) => {
  if (!dob) return { age: "", ageType: "year" };

  const birthDate = new Date(dob);
  const today = new Date();

  const diffTime = today - birthDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return { age: diffDays, ageType: "days" };
  }

  const diffMonths =
    today.getMonth() -
    birthDate.getMonth() +
    12 * (today.getFullYear() - birthDate.getFullYear());

  if (diffMonths < 12) {
    return { age: diffMonths, ageType: "month" };
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }

  return { age: years, ageType: "year" };
};


  // ================= FETCH PENDING CASES =================
  const fetchReports = async () => {
    try {
      setListLoading(true);
      const res = await apiRequest("get", "/api/patient/pendingReportPatient");

      const data =
        res?.data?.Data ||
        res?.data?.data ||
        res?.data ||
        [];

      setReports(data);
    } catch (err) {
      console.error("Failed to fetch pending patients", err);
    } finally {
      setListLoading(false);
    }
  };

  // ================= FETCH TEST MASTER =================
  const fetchTests = async () => {
    try {
      const res = await apiRequest("get", "/api/test");
      setTests(res?.data?.Data || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch tests", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= OPEN PATIENT TEST LIST =================
  const openPatientTests = (patient) => {
    setSelectedPatient(patient);
    setScreen("tests");
  };

  // ================= OPEN ADD PATIENT =================
  const openAddPatient = async () => {
    await fetchTests();
    setScreen("add");
  };

  // ================= OPEN ADD RESULT =================
  const openAddResult = (test) => {
    setSelectedTest(test);
    setScreen("addResult");
  };

  // ================= SAVE RESULT =================
  const handleSaveResult = async () => {
    try {
      setLoading(true);

      const payload = {
        caseId: selectedPatient.caseId,
        testKey: selectedTest.key,
        result: resultData.result,
        remark: resultData.remark
      };

      await apiRequest("post", "/api/report/addResult", payload);

      setResultData({ result: "", remark: "" });
      setScreen("tests");
    } catch (err) {
      console.error("Failed to save result", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD PATIENT =================
  const toggleTest = (key) => {
    setSelectedTests((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTests.length === 0) {
      setMessage("Please select at least one test");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        age: Number(formData.age),
        tests: selectedTests
      };

      await apiRequest("post", "/api/patient", payload);

      setMessage("Patient added successfully!");
      setMessageType("success");

      setScreen("list");
      fetchReports();
    } catch (err) {
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

        {/* ================= SCREEN 1: LIST ================= */}
        {screen === "list" && (
          <>
            <div className="reports-header">
              <h2>Reports</h2>

              <button className="btn-report btn-primary" onClick={openAddPatient}>
                <Plus size={18} /> Add Patient
              </button>
            </div>

            <table className="reports-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Patient Name</th>
                  <th>Test Count</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {listLoading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No pending cases
                    </td>
                  </tr>
                ) : (
                  reports.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.caseId}</td>
                      <td>{r.patientName}</td>
                      <td>{r.tests?.length || 0}</td>
                      <td>
                        <button
                          className="btn-report btn-primary"
                          onClick={() => openPatientTests(r)}
                        >
                          Add Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ================= SCREEN 2: TEST LIST ================= */}
        {screen === "tests" && selectedPatient && (
          <>
            <div className="reports-header">
              <h2>{selectedPatient.patientName} - Tests</h2>

              <button className="btn-report btn-secondary" onClick={() => setScreen("list")}>
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            <table className="reports-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Status</th>
                  <th>Add Result</th>
                </tr>
              </thead>

              <tbody>
                {selectedPatient.tests?.map((test, idx) => {
                  const testName =
                    typeof test === "string"
                      ? test
                      : test?.name || test?.testName || "-";

                  return (
                    <tr key={idx}>
                      <td>{testName}</td>
                      <td>{test?.isCompleted ? "Completed" : "Pending"}</td>
                      <td>
                        {!test?.isCompleted && (
                          <button
                            className="btn-report btn-success"
                            onClick={() => openAddResult(test)}
                          >
                            Add Result
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* ================= SCREEN 3: ADD PATIENT ================= */}
         {screen === "add" && (
          <>
            <div className="reports-header">
              <h2>Add Patient</h2>
              <button
                className="btn-report btn-secondary"
                onClick={() => setScreen("list")}
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
                    const result = calculateAge(dob);

                    setFormData({
                      ...formData,
                      dateOfBirth: dob,
                      age: result.age,
                      ageType: result.ageType
                    });
                  }}

                  required
                />


                <label>Age</label>
                <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className="form-control"
                  name="age"
                  value={formData.age}
                  readOnly
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                />
                <input
                  type="text"
                  className="form-control"
                  name="ageType"
                  value={formData.ageType}
                  readOnly
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                />
                </div>



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

        {/* ================= SCREEN 4: ADD RESULT ================= */}
        {screen === "addResult" && selectedTest && (
          <>
            <div className="reports-header">
              <h2>
                Add Result - {
                  typeof selectedTest === "string"
                    ? selectedTest
                    : selectedTest?.name || selectedTest?.testName || "-"
                }
              </h2>

              <button className="btn-report btn-secondary" onClick={() => setScreen("tests")}>
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            <textarea
              placeholder="Enter Result"
              onChange={(e) => setResultData({ ...resultData, result: e.target.value })}
            />

            <textarea
              placeholder="Remark"
              onChange={(e) => setResultData({ ...resultData, remark: e.target.value })}
            />

            <button className="btn-report btn-primary" onClick={handleSaveResult}>
              Save Result
            </button>
          </>
        )}

      </div>
    </div>
  );
}
