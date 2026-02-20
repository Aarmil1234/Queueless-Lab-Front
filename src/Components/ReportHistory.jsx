import React, { useMemo, useState, useEffect } from "react";
import { apiRequest } from "../reusable";
import html2pdf from "html2pdf.js";

const ReportHistory = () => {

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTestsForPrint, setSelectedTestsForPrint] = useState([]);

 
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

          .reports-table {
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s ease;
  border-collapse: separate;
  border-spacing: 0;

  thead {
    tr {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      th {
        padding: 18px 16px;
        text-align: left;
        font-weight: 700;
        font-size: 0.88rem;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;

        &:first-child {
          border-top-left-radius: 20px;
        }

        &:last-child {
          border-top-right-radius: 20px;
        }
      }
    }
  }

  tbody {
    tr {
      transition: all 0.3s ease;
      background: white;
      border-bottom: 1px solid #e5e7eb;

      &:hover {
        background: #f9fafb;
        transform: scale(1.002);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      &:last-child {
        td {
          border-bottom: none;

          &:first-child {
            border-bottom-left-radius: 20px;
          }

          &:last-child {
            border-bottom-right-radius: 20px;
          }
        }
      }

      td {
        padding: 18px 16px;
        color: #374151;
        font-size: 0.9rem;

        &:first-child {
          font-weight: 700;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }

        &:nth-child(2) {
          font-weight: 600;
          color: #1f2937;
        }

        &:nth-child(6) {
          font-size: 0.85rem;
          color: #6b7280;
        }
      }
    }
  }
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

const toggleSelectTest = (index) => {
  setSelectedTestsForPrint((prev) =>
    prev.includes(index)
      ? prev.filter((i) => i !== index)
      : [...prev, index]
  );
};

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await apiRequest("get", "/api/report");
      const data = res?.data || [];

      const grouped = {};

      data.forEach((item) => {
        const p = item.patientDetails;

        if (!grouped[p.patientId]) {
          grouped[p.patientId] = {
            patientId: p.patientId,
            name: p.patientName,
            mobile: p.mobileNumber,
            referredBy: p.referredBy,
            tests: []
          };
        }

        Object.keys(item.testReport).forEach((testName) => {
          grouped[p.patientId].tests.push({
            testName,
            reportData: item.testReport[testName],
            createdAt: item.createdAt
          });
        });
      });

      setPatients(Object.values(grouped));

    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
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
            <h2>{selectedTest.testName} Report</h2>

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

          {/* PRINT AREA */}
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
            <h2>{selectedPatient.name} – Tests</h2>

            <button
              className="btn-report btn-primary"
              onClick={() => setSelectedPatient(null)}
            >
              Back to Patients
            </button>
          </div>

          <table className="reports-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedPatient.tests.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.testName}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
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
              ))}
            </tbody>
          </table>

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
              {filteredPatients.map((p) => (
                <tr key={p.patientId}>
                  <td>{p.name}</td>
                  <td>{p.mobile}</td>
                  <td>{p.referredBy}</td>
                  <td>{p.tests.length}</td>
                  <td>
                    <button
                      className="btn-small btn-success"
                      onClick={() => setSelectedPatient(p)}
                    >
                      View Tests
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default ReportHistory;
