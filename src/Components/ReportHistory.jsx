import React, { useMemo, useState } from "react";

/* ---------------- STATIC DATA ---------------- */

const patientsData = [
  {
    caseId: "CASE001",
    name: "Rahul Sharma",
    mobile: "9876543210",
    reports: [
      {
        id: "R1",
        date: "2024-12-01",
        type: "Blood Test",
        content: "Hemoglobin normal. WBC slightly high.",
      },
      {
        id: "R2",
        date: "2025-01-10",
        type: "X-Ray",
        content: "Chest X-Ray normal.",
      },
    ],
  },
  {
    caseId: "CASE002",
    name: "Priya Patel",
    mobile: "9123456780",
    reports: [
      {
        id: "R3",
        date: "2025-01-05",
        type: "MRI Scan",
        content: "Minor disc bulge detected.",
      },
    ],
  },
];

/* ---------------- COMPONENT ---------------- */

const ReportHistory = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  /* ---------- Search Filter ---------- */
  const filteredPatients = useMemo(() => {
    if (!search) return patientsData;
    const q = search.toLowerCase();
    return patientsData.filter(
      (p) =>
        p.caseId.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.mobile.includes(q)
    );
  }, [search]);

  /* ---------- UI STATES ---------- */

  // 1️⃣ Single Report View
  if (selectedReport) {
    return (
      <div className="reports-wrapper">
        <div className="reports-container">
          <div className="reports-header">
            <h2>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Report Details
            </h2>
            <div className="btn-grp">
                 <button className="btn-report btn-primary" onClick={() => setSelectedReport(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Reports
            </button>
            </div>
          </div>

          <div className="report-preview">
            <h2>Green Cross Genetics Lab</h2>
            <p>Comprehensive Medical Report</p>
            <hr />
            
            <p><b>Date:</b> {selectedReport.date}</p>
            <p><b>Type:</b> {selectedReport.type}</p>
            
            <h4>Report Content</h4>
            <p>{selectedReport.content}</p>
          </div>

        </div>
      </div>
    );
  }

  // 2️⃣ Date-wise Report List
  if (selectedPatient) {
    return (
      <div className="reports-wrapper">
        <div className="reports-container">
          <div className="reports-header">
            <h2>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Reports – {selectedPatient.name}
            </h2>
            <div className="btn-grp">
                <button className="btn-report btn-primary" onClick={() => setSelectedPatient(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Patients
            </button>
            </div>
          </div>

          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Report Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedPatient.reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.type}</td>
                  <td>
                    <button
                      className="btn-small btn-info"
                      onClick={() => setSelectedReport(r)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
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

  // 3️⃣ Patient List
  return (
    <div className="reports-wrapper">
      <div className="reports-container">
        <div className="reports-header">
          <h2>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Report History
          </h2>
          <div className="search-bar d-flex flex-column">
             <label>Search Patient Records</label>
            <input
              type="text"
              placeholder="Search by Case ID / Name / Mobile"
              value={search}
              className="form-control border border-dark"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Patient Name</th>
              <th>Mobile Number</th>
              <th>Total Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p.caseId}>
                <td>{p.caseId}</td>
                <td>{p.name}</td>
                <td>{p.mobile}</td>
                <td>{p.reports.length}</td>
                <td>
                  <button
                    className="btn-small btn-success"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View Reports
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <div className="reports-form-card" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>No patients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;