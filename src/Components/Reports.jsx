import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function Reports() {

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

  const [excelTests, setExcelTests] = useState({});
  const [resultData, setResultData] = useState({});

  const [formData, setFormData] = useState({
    patientName: "",
    gender: "Male",
    dateOfBirth: "",
    age: "",
    ageType: "year",
    referredByDoctor: "",
    doctorContactNo: "",
    address: "",
    mobileNumber: "",
    city: "",
  });

  // ================= AGE CALCULATOR =================
  const calculateAge = (dob) => {

    if (!dob) return;

    const birthDate = new Date(dob);
    const today = new Date();

    const diffTime = today.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return { age: diffDays, ageType: "days" };

    const months =
      (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());

    if (months < 12) return { age: months, ageType: "month" };

    let years = today.getFullYear() - birthDate.getFullYear();

    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
    ) years--;

    return { age: years, ageType: "year" };
  };

  // ================= FETCH PATIENT LIST =================
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

      console.error(err);

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

      console.error(err);

    }

  };

  // ================= FETCH EXCEL DATA =================
  const fetchExcelTests = async () => {

    try {

      const response = await fetch("/Reportss.xlsx");

      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet);

      const formatted = {};

      json.forEach((row) => {

        const report = row["Reports"];
        const sub = row["Sub categories"];
        const normal = row["Normal values"];
        const unit = row["Unit"];

        if (!report) return;

        if (!formatted[report]) formatted[report] = [];

        formatted[report].push({
          name: sub,
          normalValue: normal,
          unit: unit
        });

      });

      setExcelTests(formatted);

    } catch (err) {

      console.error("Excel read failed", err);

    }

  };

  useEffect(() => {
    fetchReports();
    fetchExcelTests();
  }, []);

  // ================= NAVIGATION =================
  const openPatientTests = (patient) => {
    setSelectedPatient(patient);
    setScreen("tests");
  };

  const openAddPatient = async () => {
    await fetchTests();
    setScreen("add");
  };

  const openAddResult = (test) => {
    setSelectedTest(test);
    setResultData({});
    setScreen("addResult");
  };

  // ================= SAVE RESULT =================
  const handleSaveResult = async () => {

    try {

      setLoading(true);

      const payload = {
        caseId: selectedPatient.caseId,
        testKey: selectedTest.key,
        result: resultData
      };

      await apiRequest("post", "/api/report/addResult", payload);

      setScreen("tests");

      fetchReports();

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  // ================= ADD PATIENT =================
  const toggleTest = (key) => {

    setSelectedTests((prev) =>
      prev.includes(key)
        ? prev.filter((t) => t !== key)
        : [...prev, key]
    );

  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

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

        {/* ================= PATIENT LIST ================= */}
        {screen === "list" && (

          <>
            <div className="reports-header">

              <h2>Reports</h2>

              <button
                className="btn-report btn-primary"
                onClick={openAddPatient}
              >
                <Plus size={18} /> Add Patient
              </button>

            </div>

            <table className="reports-table">

              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>City</th>
                  <th>Mobile Number</th>
                  <th>Test Count</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {listLoading ? (
                  <tr>
                    <td colSpan="3">Loading...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="3">No pending cases</td>
                  </tr>
                ) : (
                  reports.map((r, idx) => (

                    <tr key={idx}>

                      <td>{r.patientName}</td>
                      <td>{r.gender}</td>
                      <td>{r.age} {r.ageType}</td>
                      <td>{r.city}</td>
                      <td>{r.mobileNumber}</td>
                      <td>
  {new Date(r.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

                      <td>{r.tests?.length || 0}</td>

                      <td>
                        <button
                          className="btn-report btn-primary"
                          onClick={() => openPatientTests(r)}
                        >
                          View Tests
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </>
        )}

        {/* ================= TEST LIST ================= */}
        {screen === "tests" && selectedPatient && (

          <>
            <div className="reports-header">

              <h2>
                {selectedPatient.patientName} ({selectedPatient.caseId})
              </h2>

              <button
                className="btn-report btn-secondary"
                onClick={() => setScreen("list")}
              >
                <ArrowLeft size={18} /> Back
              </button>

            </div>

            <table className="reports-table">

              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Enter Result</th>
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
                      <td>{selectedPatient.age} {selectedPatient.ageType}</td>

                      <td>
                        {test?.isCompleted ? "Completed" : "Pending"}
                      </td>

                      <td>

                        {!test?.isCompleted && (

                          <button
                            className="btn-report btn-success"
                            onClick={() => openAddResult(test)}
                          >
                            Enter Result
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

                <label>City</label>
                <input name="city" value={formData.city} onChange={handleChange} required />
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

        {/* ================= ADD RESULT ================= */}
        {screen === "addResult" && selectedTest && (

          <>
            <div className="reports-header">

              <h2>Add Result - {selectedTest.name}</h2>

              <button
                className="btn-report btn-secondary"
                onClick={() => setScreen("tests")}
              >
                <ArrowLeft size={18} /> Back
              </button>

            </div>

            {(excelTests[selectedTest.name] || []).map((field, index) => (

              <div key={index} style={{ marginBottom: "15px" }}>

                <label>{field.name}</label>

                <input
                  type="text"
                  placeholder="Observed Value"
                  onChange={(e) =>
                    setResultData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))
                  }
                />

                {field.normalValue && (
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    Normal: {field.normalValue} {field.unit || ""}
                  </div>
                )}

              </div>

            ))}

            <button
              className="btn-report btn-primary"
              onClick={handleSaveResult}
            >
              Save Result
            </button>

          </>
        )}

      </div>
    </div>

  );

}