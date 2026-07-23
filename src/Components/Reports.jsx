import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function Reports() {

  const [screen, setScreen] = useState("list");

  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const [listLoading, setListLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loadingPatientId, setLoadingPatientId] = useState(null);

  // Combined parameters across ALL pending tests for the selected patient
  const [parameters, setParameters] = useState([]);

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

  const fetchTests = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter");
      const list = res?.data?.data;
      setTests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= NAVIGATION =================

  const openAddPatient = async () => {
    await fetchTests();
    setScreen("add");
  };

  // Clicking "View Tests" now goes straight to one combined results table
  // built from every pending test the patient has.
  const openPatientTests = async (patient) => {
    try {
      setLoadingPatientId(patient.caseId);
      setSelectedPatient(patient);

      // 1. Get all pending tests for this patient
      const res = await apiRequest(
        "get",
        `/api/report/getTestsList/${patient._id}/pending`
      );

      const testsList = res?.data?.data?.testsList || [];

      if (testsList.length === 0) {
        alert("No pending tests for this patient.");
        setLoadingPatientId(null);
        return;
      }

      // 2. Fetch parameter definitions once, reuse for matching
      const allParamRes = await apiRequest("get", "/api/parameter");
      const allParameters = allParamRes?.data?.data || [];

      let combinedParameters = [];

      // 3. For each pending test, find its parameter definition and
      //    pull the detailed parameter fields, tagging each row with
      //    which test/report it belongs to so we can submit correctly.
      for (const test of testsList) {
        const matchedParameter = allParameters.find(
          (p) => p.code === test.name
        );

        if (!matchedParameter) {
          console.warn(`Parameter not found for ${test.name}`);
          continue;
        }

        const parameterRes = await apiRequest(
          "get",
          `/api/parameter/${matchedParameter._id}`
        );

        const parameterData = parameterRes?.data?.data;
        const paramArray = Array.isArray(parameterData)
          ? parameterData
          : parameterData
          ? [parameterData]
          : [];

        const withTestInfo = paramArray
          .filter(Boolean)
          .map((p) => ({
            ...p,
            reportId: test.reportId,
            testId: test.id,
            testName: test.name,
            result: "",
          }));

        combinedParameters = [...combinedParameters, ...withTestInfo];
      }

      if (combinedParameters.length === 0) {
        alert("No parameters found for pending tests.");
        setLoadingPatientId(null);
        return;
      }

      setParameters(combinedParameters);
      setScreen("addResult");

    } catch (err) {
      console.error(err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);
      }

      alert("Unable to load test parameters.");
    } finally {
      setLoadingPatientId(null);
    }
  };

  const handleResultChange = (index, value) => {
    setParameters((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              result: value,
            }
          : item
      )
    );
  };

 const handleSubmitReport = async () => {
  try {
    setLoading(true);

    const reportId = parameters[0].reportId;
    console.log(parameters);

    const payload = {
  reportId,
  tests: parameters
    .filter(item => item.parameterName || item.name || item.testName)
    .map(item => {
      const key = (
        item.parameterName ||
        item.name ||
        item.testName
      ).toLowerCase();

      return {
        testId: item.testId,
        testResult: {
          [key]: Number(item.result),
          unit: item.unit,
          isCritical: false,
          referenceRange: {
            min: item.referenceRange?.min,
            max: item.referenceRange?.max,
          },
          remarks: "Normal",
          previousValues: [],
          collectedAt: new Date().toISOString(),
          verifiedBy: null,
        },
      };
    }),
};

    console.log(payload);

    await apiRequest(
      "post",
      "/api/report/testWise",
      payload
    );

    alert("Report Submitted Successfully");

    fetchReports();

    setScreen("list");
  } catch (err) {
    console.log(err);
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
      const finalTests = [...selectedTests];
      const payload = {
        patientName: formData.patientName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age),
        ageType: formData.ageType,
        referredByDoctor: formData.referredByDoctor,
        doctorContactNo: formData.doctorContactNo,
        address: formData.address,
        mobileNumber: formData.mobileNumber,
        city: formData.city,

        tests: finalTests
      };

      await apiRequest("post", "/api/patient", payload);

      setMessage("Patient added successfully!");
      setMessageType("success");

      setScreen("list");

      fetchReports();

    } catch (err) {
      console.error("FULL ERROR:", err);

      setMessage(
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        "Failed to add patient"
      );

      setMessageType("error");
    } finally {

      setLoading(false);

      setTimeout(() => setMessage(""), 3000);

    }

  };

  return (

    <div className="reports-wrapper">
      <div className="reports-container">

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
                  <th>Date</th>
                  <th>Test Count</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {listLoading ? (
                  <tr>
                    <td colSpan="8">Loading...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="8">No pending cases</td>
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
                          disabled={loadingPatientId === r.caseId}
                        >
                          {loadingPatientId === r.caseId
                            ? "Loading..."
                            : "View Tests"}
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </>
        )}

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
                {Array.isArray(tests) && tests.map((test) => (
                  <label key={test.code} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.code)}
                      onChange={() => toggleTest(test.code)}
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

        {screen === "addResult" && selectedPatient && (
          <>
            <div className="reports-header">
              <h2>{selectedPatient.patientName} ({selectedPatient.caseId})</h2>

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
                  <th>Parameter Name</th>
                  <th>Enter Result</th>
                  <th>Unit</th>
                  <th>Age</th>
                  <th>Min-Max Value</th>
                </tr>
              </thead>

              <tbody>
                {parameters
                  .filter(Boolean)
                  .map((item, index) => (
                    <tr key={item._id || index}>

                      <td>
                        {item.parameterName || item.name} ({item.testName})
                      </td>

                      <td>
                        <input
                          value={item.result || ""}
                          className="form-control border border-dark"
                          style={{ width: "290px" }}
                          onChange={(e) => handleResultChange(index, e.target.value)}
                        />
                      </td>

                      <td>{item.unit || "-"}</td>

                      <td>
                        {item.age ??
                          `${selectedPatient.age} ${selectedPatient.ageType}`}
                      </td>

                      <td>
                        {item.referenceRange
                          ? `${item.referenceRange.min} - ${item.referenceRange.max}`
                          : "-"}
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                className="btn-report btn-success"
                onClick={handleSubmitReport}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>

  );

}