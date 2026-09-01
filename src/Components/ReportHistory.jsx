import React, { useMemo, useState, useEffect } from "react";
import { apiRequest } from "../reusable";
import html2pdf from "html2pdf.js";

const ReportHistory = () => {

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [busyAction, setBusyAction] = useState(null); // "print" | "download" | null
  const busy = busyAction !== null;

  useEffect(() => {
    const name = localStorage.getItem("hospitalName");

    setHospitalName(name || "My Lab");
  }, []);

  const handlePrint = async () => {
    if (busy) return;
    setBusyAction("print");
    try {
      const response = await apiRequest(
        "get",
        `/api/report/getSingleReport/${selectedTest.reportId}`
      );

      const pdfUrl = response?.data?.data?.data?.pdfUrl;

      if (!pdfUrl) {
        throw new Error("PDF URL not found in response");
      }

      const pdfResponse = await fetch(pdfUrl);
      const blob = await pdfResponse.blob();

      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");

      if (!printWindow) {
        URL.revokeObjectURL(url);
        alert("Please allow pop-ups for this site to print the report.");
        return;
      }

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        printWindow.onafterprint = () => {
          URL.revokeObjectURL(url);
          printWindow.close();
        };
      };
    } catch (err) {
      console.error(err);
      alert("Unable to print report.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusyAction("download");
    try {
      const response = await apiRequest(
        "get",
        `/api/report/getSingleReport/${selectedTest.reportId}`
      );

      const pdfUrl = response?.data?.data?.data?.pdfUrl;

      if (!pdfUrl) {
        throw new Error("PDF URL not found in response");
      }

      const pdfResponse = await fetch(pdfUrl);
      const blob = await pdfResponse.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedTest.testName}_report.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    } finally {
      setBusyAction(null);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await apiRequest("get", "/api/patient/submittedReportPatient");

      const data =
        res?.data?.data ||
        res?.data ||
        [];

      const list = Array.isArray(data) ? data : [];

      const mapped = list.map((p) => ({
        _id: p._id,
        caseId: p.caseId,
        labId: p.labId,
        name: p.patientName,
        mobile: p.mobileNumber,
        referredByDoctor: p.referredByDoctor,
        testNames: p.tests || [],
        submittedTests: p.submittedTests || [],
        reportIds: p.reportIds || [],
        createdAt: p.createdAt,
      }));

      setPatients(mapped);

    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const openPatientTests = async (patient) => {
    try {
      setTestsLoading(true);
      setSelectedPatient(patient);

      if (!patient.labId) {
        alert("Missing lab id for this patient — cannot fetch reports.");
        setTestsLoading(false);
        return;
      }

      console.log("Lab ID:", patient.labId);


      const res = await apiRequest(
        "get",
        "/api/report"
      );

      const allReports =
        res?.data?.data ||
        res?.data ||
        [];

      const list = Array.isArray(allReports) ? allReports : [];

      const patientReports = list.filter(
        (r) =>
          r.patientId === patient._id ||
          patient.reportIds?.includes(r._id)
      );

      let rows = [];

      patientReports.forEach((report) => {
        (report.testReport || [])
          .filter((t) => t.isReportSubmitted)
          .forEach((t) => {
            rows.push({
              reportId: report._id,
              testId: t._id,
              testName: t.testName,
              reportData: t.testResult || {},
              createdAt: t.updatedAt || t.createdAt || report.createdAt,
              remarks: t.testResult?.remarks || "-",
              isCritical: t.testResult?.isCritical || false,
            });
          });
      });

      setSelectedPatient((prev) => ({
        ...prev,
        tests: rows,
      }));

    } catch (err) {
      console.log("Status:", err.response?.status);

      console.log("Full Response:", err.response?.data);

      console.log(
        "Backend Error:",
        JSON.stringify(err.response?.data, null, 2)
      );

      console.log(
        "Backend Data:",
        JSON.stringify(err.response?.data?.data, null, 2)
      );
    } finally {
      setTestsLoading(false);
    }
  };

  const thStyle = {
    border: "1px solid #000",
    padding: "10px",
    background: "#f3f5ff",
    textAlign: "center",
    fontWeight: "600",
  };

  const tdStyle = {
    border: "1px solid #000",
    padding: "10px",
    textAlign: "center",
  };

  const filteredPatients = useMemo(() => {
    if (!search) return patients;

    const q = search.toLowerCase();

    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.mobile?.includes(q)
    );
  }, [search, patients]);

  if (selectedTest) {
    return (
      <div className="reports-wrapper">
        <div className="reports-container">

          <div className="reports-header">
            <h2>{selectedPatient.name}</h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-report btn-secondary"
                onClick={() => setSelectedTest(null)}
              >
                Back
              </button>

              <button
                className="btn-report btn-success"
                onClick={handlePrint}
                disabled={busy}
                style={busy ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                {busyAction === "print" ? "Working…" : "Print Report"}
              </button>

              <button
                className="btn-report btn-primary"
                onClick={handleDownload}
                disabled={busy}
                style={busy ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                {busyAction === "download" ? "Working…" : "Download PDF"}
              </button>
            </div>
          </div>

          <div id="report-print-area">
            <div className="report-preview" style={{ padding: "20px" }}>

              <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
                {hospitalName}
              </h2>
              <p style={{ textAlign: "center", marginTop: 0 }}>
                Comprehensive Diagnostic Report
              </p>

              <hr />

              <p><b>Patient:</b> {selectedTest.patientName}</p>
              <p><b>Mobile:</b> {selectedTest.mobile}</p>
              <p><b>Test:</b> {selectedTest.testName}</p>
              <p><b>Date:</b> {new Date(selectedTest.createdAt).toLocaleDateString()}</p>

              <hr />

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "20px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      colSpan="4"
                      style={{
                        background: "linear-gradient(90deg,#4F8EF7,#7A4CCB)",
                        color: "#fff",
                        padding: "12px",
                        fontSize: "18px",
                        textAlign: "center",
                      }}
                    >
                      {selectedTest.testName} Report
                    </th>
                  </tr>

                  <tr>
                    <th style={thStyle} className="table-header">Parameter</th>
                    <th style={thStyle} className="table-header" >Result</th>
                    <th style={thStyle} className="table-header">Unit</th>
                    <th style={thStyle} className="table-header">Reference Range</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(selectedTest.reportData)
                    .filter(
                      ([key]) =>
                        ![
                          "unit",
                          "referenceRange",
                          "remarks",
                          "isCritical",
                          "previousValues",
                          "collectedAt",
                          "verifiedBy",
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <tr key={key}>
                        <td style={tdStyle}>
                          {key.replace(/_/g, " ").toUpperCase()}
                        </td>

                        <td style={tdStyle}>{String(value)}</td>

                        <td style={tdStyle}>
                          {selectedTest.reportData.unit || "-"}
                        </td>

                        <td style={tdStyle}>
                          {(() => {
                            const range = selectedTest.reportData.referenceRange;

                            if (!range || (typeof range === "object" && Object.keys(range).length === 0)) {
                              return "-";
                            }

                            if (typeof range === "string" || typeof range === "number") {
                              return String(range);
                            }

                            if (typeof range === "object") {
                              const low = range.low ?? range.min ?? range.lower ?? range.minValue;
                              const high = range.high ?? range.max ?? range.upper ?? range.maxValue;

                              if (low !== undefined && high !== undefined) {
                                return `${low} - ${high}`;
                              }

                              return JSON.stringify(range); // safety net, shouldn't hit this now
                            }

                            return "-";

                          })()}
                        </td>
                      </tr>
                    ))}

                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        padding: "12px",
                        fontWeight: 600,
                        textAlign: "center",
                        color: selectedTest.reportData.isCritical
                          ? "#dc3545"
                          : "#28a745",
                      }}
                    >
                      Status :
                      {selectedTest.reportData.isCritical
                        ? " Critical"
                        : " Normal"}
                    </td>
                  </tr>

                  {selectedTest.reportData.remarks && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: "12px",
                          fontWeight: 500,
                        }}
                      >
                        Remarks : {selectedTest.reportData.remarks}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          </div>

        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="reports-wrapper">
        <div className="reports-container">

          <div className="reports-header">
            <h2>{selectedPatient.name}</h2>

            <button
              className="btn-report btn-primary"
              onClick={() => setSelectedPatient(null)}
            >
              Back to Patients
            </button>
          </div>

          {testsLoading ? (
            <div className="reports-form-card">Loading reports...</div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Date</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(selectedPatient.tests || []).length === 0 ? (
                  <tr>
                    <td colSpan="5">No submitted results found</td>
                  </tr>
                ) : (
                  selectedPatient.tests.map((t, idx) => (
                    <tr key={t.testId || idx}>
                      <td>{t.testName}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}</td>
                      <td>{t.remarks}</td>
                      <td>
                        {t.isCritical ? (
                          <span style={{ color: "red", fontWeight: 600 }}>Critical</span>
                        ) : (
                          <span style={{ color: "green", fontWeight: 600 }}>Normal</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-small btn-info"
                          onClick={() =>
                            setSelectedTest({
                              ...t,
                              patientName: selectedPatient.name,
                              mobile: selectedPatient.mobile
                            })
                          }
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        <div className="reports-header">
          <h2>Patient Report History</h2>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search patient by name / mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control border border-dark"
            />
          </div>
        </div>

        {loading ? (
          <div className="reports-form-card">Loading reports...</div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Report Date</th>
                <th>Referred By</th>
                <th>Total Tests</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5">No submitted reports</td>
                </tr>
              ) : (
                filteredPatients.map((p) => {

                  return (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.mobile}</td>
                      <td>
                        {new Date(p.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td>{p.referredByDoctor}</td>
                      <td>{p.submittedTests?.length || p.testNames.length || 0}</td>
                      <td>
                        <button
                          className="btn-small btn-success"
                          onClick={() => openPatientTests(p)}
                        >
                          View Tests
                        </button>
                      </td>
                    </tr>
                  )
                }
                )
              )}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default ReportHistory;