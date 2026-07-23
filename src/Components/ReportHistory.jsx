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

  const handlePrint = () => {
    const content = document.getElementById("report-print-area");
    if (!content) return;

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(`
      <html>
        <head>
          <title>Lab Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownload = () => {
    const element = document.getElementById("report-print-area");
    if (!element) return;

    const opt = {
      margin: 0.3,
      filename: `${selectedTest.testName}_report.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= FETCH SUBMITTED PATIENTS LIST =================
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
        labId: p.labId,               // <-- needed to call /api/report
        name: p.patientName,
        mobile: p.mobileNumber,
        referredByDoctor: p.referredByDoctor,
        testNames: p.tests || [],
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

  // ================= FETCH FULL REPORT HISTORY FOR ONE PATIENT =================
  // GET /api/report?labId=... returns ALL report docs for that lab.
  // We filter to just this patient's docs, then flatten every submitted
  // test inside testReport into individual rows.
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
}finally {
      setTestsLoading(false);
    }
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
              >
                Print Report
              </button>

              <button
                className="btn-report btn-primary"
                onClick={handleDownload}
              >
                Download PDF
              </button>
            </div>
          </div>

          <div id="report-print-area">
            <div className="report-preview" style={{ padding: "20px" }}>

              <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
                Green Cross Genetics Lab
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

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #000", padding: "8px" }}>Parameter</th>
                    <th style={{ border: "1px solid #000", padding: "8px" }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedTest.reportData).map(([key, value]) => (
                    <tr key={key}>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{key}</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{String(value)}</td>
                    </tr>
                  ))}
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
                filteredPatients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.mobile}</td>
                    <td>{p.referredByDoctor}</td>
                    <td>{p.testNames.length}</td>
                    <td>
                      <button
                        className="btn-small btn-success"
                        onClick={() => openPatientTests(p)}
                      >
                        View Tests
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
};

export default ReportHistory;