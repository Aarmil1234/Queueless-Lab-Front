import React, { useState } from "react";
import { Settings as SettingsIcon, Plus, Save } from "lucide-react";
import "../Scss/Reports.scss";

const reportOptions = [
  "Blood Group",
  "MP",
  "ESR",
  "CBC",
  "Urea",
  "Creatinine",
  "Uric Acid",
  "Bilirubin",
  "SGPT",
  "SGOT",
  "Alkaline Phosphatase",
  "Protein",
  "Amylase",
  "Lipase",
  "Gamma GT",
  "VDRL",
  "Urine Report",
];

const urineRows = [
  { type: "Physical examination", observation: "Quantity", unit: "ml" },
  { type: "", observation: "Colour", unit: "" },
  { type: "", observation: "Transparency", unit: "" },
  { type: "", observation: "Specific gravity", unit: "" },
  { type: "", observation: "PH", unit: "" },
  { type: "", observation: "Leukocytes", unit: "" },
  { type: "", observation: "Blood", unit: "" },
  { type: "Chemical examination", observation: "Protein/Albumin", unit: "" },
  { type: "", observation: "Sugar/Glucose", unit: "" },
  { type: "", observation: "Ketone bodies", unit: "" },
  { type: "", observation: "Bilirubin", unit: "" },
  { type: "", observation: "Urobilinogen", unit: "" },
  { type: "", observation: "Leucocyte esterase", unit: "" },
  { type: "", observation: "Nitrite", unit: "" },
  { type: "Microscopic examination", observation: "R.B.C", unit: "/HPF" },
  { type: "", observation: "Pus cells", unit: "/HPF" },
  { type: "", observation: "Epithelial cells", unit: "/HPF" },
  { type: "", observation: "Casts", unit: "" },
  { type: "", observation: "Crystals", unit: "" },
  { type: "", observation: "Bacteria", unit: "" },
  { type: "", observation: "Others", unit: "" },
];

const Settings = () => {
  const [reportName, setReportName] = useState("");
  const [esrList, setEsrList] = useState([]);
  const [bloodGroupValue, setBloodGroupValue] = useState("");
  const [mpCategory, setMpCategory] = useState("Card Test");
  const [mpValue, setMpValue] = useState("");
  const [urineValues, setUrineValues] = useState({});

  const addEsrRow = () => {
    setEsrList([
      ...esrList,
      { ageFrom: "", ageTo: "", gender: "Male", refFrom: "", refTo: "", unit: "mm/hr (first hr)" },
    ]);
  };

  const handleEsrChange = (index, field, value) => {
    const updated = [...esrList];
    updated[index][field] = value;
    setEsrList(updated);
  };

  const handleUrineChange = (index, value) => {
    setUrineValues({ ...urineValues, [index]: value });
  };

  const handleSubmit = () => {
    alert(`Reference values submitted for ${reportName}`);
    console.log("Submitted Report:", reportName);
    if (reportName === "Blood Group") console.log("Value:", bloodGroupValue);
    if (reportName === "MP") console.log("Category:", mpCategory, "Value:", mpValue);
    if (reportName === "Urine Report") console.log("Urine Values:", urineValues);
    if (esrList.length > 0) console.log("ESR List:", esrList);
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <h2>
            <SettingsIcon size={28} />
            Report Settings
          </h2>
        </div>

        {/* Report Name Selection */}
        <div className="reports-form-card">
          <h3>Configure Report Reference Values</h3>

          <div className="reports-form-grid">
            <label>Select Report Type:</label>
            <select
              value={reportName}
              onChange={(e) => {
                setReportName(e.target.value);
                setEsrList([]);
                setBloodGroupValue("");
                setMpCategory("Card Test");
                setMpValue("");
                setUrineValues({});
              }}
            >
              <option value="">-- Select Report --</option>
              {reportOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          {reportName === "Blood Group" && (
            <div className="reports-form-grid" style={{ marginTop: "30px" }}>
              <label>Reference Value:</label>
              <input
                type="text"
                value={bloodGroupValue}
                onChange={(e) => setBloodGroupValue(e.target.value)}
                placeholder="Enter blood group reference"
              />
            </div>
          )}

          {/* MP */}
          {reportName === "MP" && (
            <div style={{ marginTop: "30px" }}>
              <div className="reports-form-grid">
                <label>Sub Category:</label>
                <select value={mpCategory} onChange={(e) => setMpCategory(e.target.value)}>
                  <option>Card Test</option>
                  <option>Microscopic Test</option>
                </select>

                <label>Reference Value:</label>
                <input
                  type="text"
                  value={mpValue}
                  onChange={(e) => setMpValue(e.target.value)}
                  placeholder="Enter MP reference value"
                />
              </div>
            </div>
          )}

          {/* ESR & Similar Reports */}
          {reportName &&
            reportName !== "Blood Group" &&
            reportName !== "MP" &&
            reportName !== "Urine Report" && (
              <div className="cbc-container" style={{ marginTop: "30px" }}>
                <h4>Reference Configuration</h4>

                {esrList.map((item, i) => (
                  <div key={i} className="reference-row">
                    <input
                      type="number"
                      placeholder="Age From"
                      value={item.ageFrom}
                      onChange={(e) => handleEsrChange(i, "ageFrom", e.target.value)}
                      className="ref-input"
                    />
                    <input
                      type="number"
                      placeholder="Age To"
                      value={item.ageTo}
                      onChange={(e) => handleEsrChange(i, "ageTo", e.target.value)}
                      className="ref-input"
                    />
                    <select
                      value={item.gender}
                      onChange={(e) => handleEsrChange(i, "gender", e.target.value)}
                      className="ref-input"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Both</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Ref From"
                      value={item.refFrom}
                      onChange={(e) => handleEsrChange(i, "refFrom", e.target.value)}
                      className="ref-input"
                    />
                    <input
                      type="number"
                      placeholder="Ref To"
                      value={item.refTo}
                      onChange={(e) => handleEsrChange(i, "refTo", e.target.value)}
                      className="ref-input"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => handleEsrChange(i, "unit", e.target.value)}
                      className="ref-input"
                    >
                      <option>mm/hr (first hr)</option>
                      <option>million cells / mcL</option>
                      <option>mg/dl</option>
                      <option>U/L</option>
                      <option>g/dL</option>
                      <option>%</option>
                      <option>cells/mL</option>
                    </select>
                  </div>
                ))}

                <button className="btn-report btn-info" onClick={addEsrRow} style={{ marginTop: "20px" }}>
                  <Plus size={18} /> Add Reference Range
                </button>
              </div>
            )}

          {/* Urine Report */}
          {reportName === "Urine Report" && (
            <div style={{ marginTop: "30px" }}>
              <h4 style={{ marginBottom: "20px", fontSize: "1.3rem", color: "#1f2937" }}>
                Urine Report Reference Table
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table className="report-preview" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Observation</th>
                      <th>Reference</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urineRows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: r.type ? "700" : "normal" }}>{r.type}</td>
                        <td>{r.observation}</td>
                        <td>
                          <input
                            type="text"
                            value={urineValues[i] || ""}
                            onChange={(e) => handleUrineChange(i, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "2px solid #e5e7eb",
                              borderRadius: "8px",
                              fontSize: "14px",
                            }}
                            placeholder="Enter reference"
                          />
                        </td>
                        <td>{r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {reportName && (
            <div className="reports-button-group">
              <button className="btn-report btn-success" onClick={handleSubmit}>
                <Save size={18} /> Submit Reference Values
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reference-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }

        .ref-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
          background: #f9fafb;
          color: #1f2937;
        }

        .ref-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .ref-input::placeholder {
          color: #9ca3af;
        }

        select.ref-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%236b7280' d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 35px;
        }

        @media (max-width: 768px) {
          .reference-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;