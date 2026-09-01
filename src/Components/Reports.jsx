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
  const [viewTestData, setViewTestData] = useState([]);

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

  // Now sourced from /api/testreport instead of /api/parameter.
  // Example item shape:
  // { _id, code, labId, testName, category, isActive, delete, createdAt, updatedAt }
  const fetchTests = async () => {
    try {
      const res = await apiRequest("get", "/api/testreport");
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

  // Turns the nested parameter/subCategory tree returned by
  // /api/testreport/:id/parameters into one row per sub parameter
  // (or one row per parameter when it has no sub parameters), and
  // attaches the matching reference range for the patient's age/gender.
  const buildParameterRows = async (rawParameters, patient) => {
    const flatRows = [];

    (rawParameters || []).forEach((param) => {
      if (Array.isArray(param.subCategories) && param.subCategories.length > 0) {
        param.subCategories.forEach((sub) => {
          flatRows.push({
            parameterId: param._id,
            parameterName: param.name,
            subParameterId: sub._id,
            subParameterName: sub.name,
            unit: sub.unit,
          });
        });
      } else {
        flatRows.push({
          parameterId: param._id,
          parameterName: param.name,
          subParameterId: null,
          subParameterName: null,
          unit: param.unit,
        });
      }
    });

    const patientGender = (patient?.gender || "").trim().toUpperCase();
    const patientAge = Number(patient?.age);
    const patientAgeType = (patient?.ageType || "year").trim().toLowerCase();

    return Promise.all(
      flatRows.map(async (row) => {
        if (!row.subParameterId) {
          return { ...row, referenceRange: null };
        }

        try {
          const rangeRes = await apiRequest(
            "get",
            `/api/parameter/defaultParameter/${row.parameterId}/subcategory/${row.subParameterId}`
          );

          let rangeList = [];
          if (Array.isArray(rangeRes?.data)) rangeList = rangeRes.data;
          else if (Array.isArray(rangeRes?.data?.data)) rangeList = rangeRes.data.data;
          else if (Array.isArray(rangeRes?.data?.data?.data)) rangeList = rangeRes.data.data.data;

          const match = rangeList.find((r) => {
            const genderMatches =
              !r.gender || r.gender === "ANY" || r.gender.toUpperCase() === patientGender;
            const ageTypeMatches =
              !r.ageType || r.ageType.toLowerCase() === patientAgeType;
            const ageMatches =
              patientAge >= (r.ageFrom ?? -Infinity) &&
              (r.ageTo == null || patientAge <= r.ageTo);
            return genderMatches && ageTypeMatches && ageMatches;
          });

          return {
            ...row,
            referenceRange: match
              ? { minValue: match.minValue, maxValue: match.maxValue }
              : null,
          };
        } catch (rangeError) {
          if (rangeError?.response?.status !== 404) {
            console.error("Failed to load range for", row, rangeError);
          }
          return { ...row, referenceRange: null };
        }
      })
    );
  };

  const openPatientTests = async (patient) => {
    try {
      setLoadingPatientId(patient.caseId);
      setSelectedPatient(patient);

      // 1. Get patient's pending tests
      const res = await apiRequest(
        "get",
        `/api/report/getTestsList/${patient._id}/pending`
      );

      const testsList = res?.data?.data?.testsList || [];

      if (testsList.length === 0) {
        alert("No pending tests for this patient.");
        return;
      }

      // 2. Get all Test Reports
      const testReportRes = await apiRequest(
        "get",
        "/api/testreport"
      );

      const testReports = testReportRes?.data?.data || [];

      // 3. For every patient's test,
      // find the actual testReport using test name
      const testWiseData = await Promise.all(
        testsList.map(async (patientTest) => {

          // Patient API seems to use `name`
          const patientTestName =
            patientTest.name ||
            patientTest.testName ||
            "";

          // Find matching Test Report
          const matchedTestReport = testReports.find(
            (testReport) =>
              testReport.testName?.trim().toLowerCase() ===
              patientTestName.trim().toLowerCase()
          );

          if (!matchedTestReport) {
            console.warn(
              "No Test Report found for:",
              patientTestName
            );

            return {
              testId: null,
              testName: patientTestName || "-",
              parameters: [],
            };
          }

          // This is the IMPORTANT ID
          const testReportId = matchedTestReport._id;

          console.log(
            "CALLING PARAMETER API:",
            `/api/testreport/${testReportId}/parameters`
          );

          try {
            // 4. Get parameters using actual Test Report ID
            const parameterRes = await apiRequest(
              "get",
              `/api/testreport/${testReportId}/parameters`
            );

            const testData = parameterRes?.data?.data;

            const parameterRows = await buildParameterRows(
              testData?.parameters,
              patient
            );

            return {
              testId: testData?._id || testReportId,

              testName:
                testData?.testName ||
                matchedTestReport.testName ||
                patientTestName ||
                "-",

              parameters: parameterRows,
            };

          } catch (parameterError) {
            console.error(
              `Failed to load parameters for ${patientTestName}`,
              parameterError
            );

            return {
              testId: testReportId,
              testName:
                matchedTestReport.testName ||
                patientTestName ||
                "-",
              parameters: [],
            };
          }
        })
      );

      setViewTestData(testWiseData);
      setScreen("viewTests");

    } catch (err) {
      console.error("Unable to load tests:", err);
      alert("Unable to load test details.");
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
    if (loading) return;
    try {
      setLoading(true);

      const allParameterRows = viewTestData.flatMap((test) =>
        (test.parameters || []).map((item) => ({
          ...item,
          testId: test.testId,
        }))
      );

      const reportId = selectedPatient?.reportIds?.[0];

      const payload = {
        reportId,
        tests: allParameterRows
          .filter(
            (item) =>
              (item.subParameterName || item.parameterName) &&
              item.result !== undefined &&
              item.result !== ""
          )
          .map((item) => {
            const key = (
              item.subParameterName || item.parameterName
            ).toLowerCase();

            return {
              testId: item.testId,
              testResult: {
                [key]: String(item.result),
                unit: item.unit,
                isCritical: false,
                referenceRange: {
                  min: item.referenceRange?.minValue,
                  max: item.referenceRange?.maxValue,
                },
                remarks: "Normal",
                previousValues: [],
                collectedAt: new Date().toISOString(),
                verifiedBy: null,
              },
            };
          }),
      };

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
  const toggleTest = (testReportId) => {
    setSelectedTests((prev) =>
      prev.includes(testReportId)
        ? prev.filter((id) => id !== testReportId)
        : [...prev, testReportId]
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

    if (loading) return;

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

        testReports: selectedTests
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
                  <th>Referred By</th>
                  <th>Mobile Number</th>
                  <th>Test Count</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {listLoading ? (
                  <tr>
                    <td colSpan="7">Loading...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="7">No pending cases</td>
                  </tr>
                ) : (
                  reports.map((r, idx) => (

                    <tr key={r._id || r.caseId || idx}>

                      <td>{r.patientName || "-"}</td>
                      <td>{r.gender || "-"}</td>
                      <td>{r.age ?? "-"} {r.ageType || ""}</td>
                      <td>{r.referredByDoctor || "-"}</td>
                      <td>{r.mobileNumber || "-"}</td>
                      <td>{r.tests?.length ?? r.testReports?.length ?? 0}</td>

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
                    const result = calculateAge(dob) || { age: "", ageType: "year" };

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
                  <label key={test._id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test._id)}
                      onChange={() => toggleTest(test._id)}
                    />
                    {test.testName}
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
        {screen === "viewTests" && selectedPatient && (
          <>

            <div className="reports-header">
              <div>
                <h2>
                  {selectedPatient.patientName}{" "}
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      color: "#1d3557",
                      fontSize: "1.1rem",
                    }}
                  >
                    ({selectedPatient.caseId})
                  </span>
                </h2>

                <p style={{ margin: 0, color: "#6b7280" }}>
                  Test Details
                </p>
              </div>

              <button
                className="btn-report btn-secondary"
                onClick={() => setScreen("list")}
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            <div style={{ marginTop: "20px" }}>
              {viewTestData.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                  }}
                >
                  No test details found.
                </div>
              ) : (
                viewTestData.map((test, testIndex) => (
                  <div
                    key={test.testId || testIndex}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {/* TEST NAME */}
                    <div
                      style={{
                        padding: "14px 18px",
                        background: "#f3f4f6",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <strong style={{ fontSize: "18px" }}>
                        {test.testName}
                      </strong>
                    </div>

                    <div style={{ padding: "15px 18px" }}>
                      {test.parameters?.length === 0 ? (
                        <span style={{ color: "#6b7280" }}>
                          No parameters found for this test.
                        </span>
                      ) : (
                        <>

                          {(() => {
                            const grouped = {};

                            test.parameters.forEach((item) => {
                              
                              const mainParameter =
                                item.parameterName || "Other";

                              if (!grouped[mainParameter]) {
                                grouped[mainParameter] = [];
                              }

                              grouped[mainParameter].push(item);
                            });

                            return Object.entries(grouped).map(
                              ([mainParameter, subParameters]) => (
                                <div
                                  key={mainParameter}
                                  style={{
                                    marginBottom: "20px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* MAIN PARAMETER */}
                                  <div
                                    style={{
                                      padding: "12px 16px",
                                      background: "#f8fafc",
                                      borderBottom:
                                        "1px solid #e5e7eb",
                                      fontWeight: "600",
                                      fontSize: "16px",
                                      color: "#1f2937",
                                    }}
                                  >
                                    {mainParameter}
                                  </div>

                                  {/* SUB PARAMETER TABLE */}
                                  <div
                                    style={{
                                      overflowX: "auto",
                                    }}
                                  >
                                    <table
                                      className="reports-table"
                                      style={{
                                        margin: 0,
                                        width: "100%",
                                      }}
                                    >
                                      <thead>
                                        <tr>
                                          <th>Sub Parameter</th>
                                          <th>Enter Record</th>
                                          <th>Unit</th>
                                          <th>Age</th>
                                          <th className="text-center">
                                            Reference Range
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {subParameters.map(
                                          (item, subIndex) => {
                                            const subParameter =
                                              item.subParameterName || "-";

                                            return (
                                              <tr
                                                key={
                                                  item.subParameterId ||
                                                  item.parameterId ||
                                                  subIndex
                                                }
                                              >
                                                {/* SUB PARAMETER */}
                                                <td>
                                                  {subParameter}
                                                </td>

                                                {/* ENTER RECORD */}
                                                <td>
                                                  <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter record"
                                                    value={
                                                      item.result || ""
                                                    }
                                                    onChange={(e) => {
                                                      const value =
                                                        e.target.value;

                                                      setViewTestData(
                                                        (prev) =>
                                                          prev.map(
                                                            (t) => {
                                                              if (
                                                                t.testId !==
                                                                test.testId
                                                              ) {
                                                                return t;
                                                              }

                                                              return {
                                                                ...t,
                                                                parameters:
                                                                  t.parameters.map(
                                                                    (p) =>
                                                                      p ===
                                                                        item
                                                                        ? {
                                                                          ...p,
                                                                          result:
                                                                            value,
                                                                        }
                                                                        : p
                                                                  ),
                                                              };
                                                            }
                                                          )
                                                      );
                                                    }}
                                                  />
                                                </td>

                                                {/* UNIT */}
                                                <td>
                                                  {item.unit || "-"}
                                                </td>

                                                {/* AGE */}
                                                <td>
                                                  {item.age ||
                                                    `${selectedPatient.age || "-"} ${selectedPatient.ageType || ""
                                                    }`}
                                                </td>

                                                {/* REFERENCE RANGE */}
                                                <td className="text-center">
                                                  {item.referenceRange ? (
                                                    <>
                                                      {item
                                                        .referenceRange
                                                        .minValue ??
                                                        "-"}{" "}
                                                      -{" "}
                                                      {item
                                                        .referenceRange
                                                        .maxValue ??
                                                        "-"}
                                                    </>
                                                  ) : (
                                                    "N/A"
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SUBMIT */}
            {viewTestData.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  className="btn-report btn-success"
                  onClick={handleSubmitReport}
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Report"}
                </button>
              </div>
            )}
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
                  <th>Test Name</th>
                  <th>Parameter</th>
                  <th>Sub Parameter</th>
                  <th>Enter Result</th>
                  <th>Unit</th>
                  <th>Age</th>
                  <th>Min-Max Value</th>
                </tr>
              </thead>

              <tbody>
                {parameters
                  .filter(Boolean)
                  .map((item, index) => {
                    const parameterLabel = item.parentParameter
                      ? item.parentParameter
                      : item.parameterName || item.name || "-";

                    const subParameterLabel = item.parentParameter
                      ? item.parameterName || item.name || "-"
                      : "-";
                      

                    return (
                      <tr key={item._id || index}>

                        <td>
                          <strong>{item.testName}</strong>
                        </td>

                        <td>{parameterLabel}</td>

                        <td>{subParameterLabel}</td>

                        <td>
                          <input
                            value={item.result || ""}
                            className="form-control border border-dark"
                            style={{ width: "290px" }}
                            onChange={(e) => handleResultChange(index, e.target.value)}
                          />
                        </td>

                        <td>{item.parentUnit || item.unit || "-"}</td>

                        <td>
                          {item.age ??
                            `${selectedPatient.age} ${selectedPatient.ageType}`}
                        </td>

                        <td>
                          {item.referenceRange
                            ? `${item.referenceRange.minValue} - ${item.referenceRange.maxValue}`
                            : "-"}
                        </td>

                      </tr>
                    );
                  })}
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