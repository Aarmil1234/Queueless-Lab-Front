import React, { useState } from "react";
import { apiRequest } from "../reusable";
import "../Scss/Urine.scss";

const urineTemplate = [
  {
    type: "Physical examination",
    icon: "🔬",
    rows: [
      { observation: "Quantity", unit: "ml", placeholder: "e.g., 50-100" },
      { observation: "Colour", placeholder: "e.g., Pale yellow" },
      { observation: "Transparency", placeholder: "e.g., Clear" },
      { observation: "Specific gravity", placeholder: "e.g., 1.010-1.025" },
      { observation: "PH", placeholder: "e.g., 5.0-8.0" },
      { observation: "Leukocytes", placeholder: "e.g., Negative" },
      { observation: "Blood", placeholder: "e.g., Negative" }
    ]
  },
  {
    type: "Chemical examination",
    icon: "⚗️",
    rows: [
      { observation: "Protein/Albumin", placeholder: "e.g., Negative" },
      { observation: "Sugar/Glucose", placeholder: "e.g., Negative" },
      { observation: "Ketone bodies", placeholder: "e.g., Negative" },
      { observation: "Bilirubin", placeholder: "e.g., Negative" },
      { observation: "Urobilinogen", placeholder: "e.g., Normal" },
      { observation: "Leucocyte esterase", placeholder: "e.g., Negative" },
      { observation: "Nitrite", placeholder: "e.g., Negative" }
    ]
  },
  {
    type: "Microscopic examination",
    icon: "🔍",
    rows: [
      { observation: "R.B.C", unit: "/HPF", placeholder: "e.g., 0-2" },
      { observation: "Pus cells", unit: "/HPF", placeholder: "e.g., 0-5" },
      { observation: "Epithelial cells", unit: "/HPF", placeholder: "e.g., Few" },
      { observation: "Casts", placeholder: "e.g., Nil" },
      { observation: "Crystals", placeholder: "e.g., Nil" },
      { observation: "Bacteria", placeholder: "e.g., Nil" },
      { observation: "Others", placeholder: "e.g., Nil" }
    ]
  }
];

export default function AddUrineReport() {
  const [referenceData, setReferenceData] = useState({});
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientId: "",
    age: "",
    gender: "",
    referredBy: "",
    testDate: new Date().toISOString().split('T')[0]
  });
  const [activeSection, setActiveSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setReferenceData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePatientInfoChange = (key, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        testName: "Urine",
        patientInfo,
        report: referenceData
      };

      console.log("URINE REPORT PAYLOAD:", payload);

      await apiRequest("post", "/api/report/urine", payload);

      alert("Urine report saved successfully!");
      
      // Reset form
      setReferenceData({});
      setPatientInfo({
        patientName: "",
        patientId: "",
        age: "",
        gender: "",
        referredBy: "",
        testDate: new Date().toISOString().split('T')[0]
      });

    } catch (err) {
      console.error(err);
      alert("Failed to save report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    const totalFields = urineTemplate.reduce((sum, section) => sum + section.rows.length, 0);
    const filledFields = Object.keys(referenceData).filter(key => referenceData[key]?.trim()).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-container">
        
        {/* Header Section */}
        <div className="report-header-section">
          <div className="report-title-wrapper">
            <div className="report-icon">🧪</div>
            <div>
              <h1 className="report-main-title">Urine Routine Examination</h1>
              <p className="report-subtitle">Complete urine analysis report form</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="progress-wrapper">
            <div className="progress-info">
              <span className="progress-label">Form Completion</span>
              <span className="progress-percentage">{getProgress()}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="patient-info-card">
          <h3 className="section-title">
            <span className="title-icon">👤</span>
            Patient Information
          </h3>
          
          <div className="patient-info-grid">
            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter patient name"
                value={patientInfo.patientName}
                onChange={(e) => handlePatientInfoChange("patientName", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Patient ID *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter patient ID"
                value={patientInfo.patientId}
                onChange={(e) => handlePatientInfoChange("patientId", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter age"
                value={patientInfo.age}
                onChange={(e) => handlePatientInfoChange("age", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-control"
                value={patientInfo.gender}
                onChange={(e) => handlePatientInfoChange("gender", e.target.value)}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Referred By</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter doctor name"
                value={patientInfo.referredBy}
                onChange={(e) => handlePatientInfoChange("referredBy", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Test Date *</label>
              <input
                type="date"
                className="form-control"
                value={patientInfo.testDate}
                onChange={(e) => handlePatientInfoChange("testDate", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="section-tabs">
          {urineTemplate.map((section, idx) => (
            <button
              key={idx}
              className={`tab-button ${activeSection === idx ? 'active' : ''}`}
              onClick={() => setActiveSection(idx)}
            >
              <span className="tab-icon">{section.icon}</span>
              <span className="tab-text">{section.type}</span>
            </button>
          ))}
        </div>

        {/* Test Results Sections */}
        {urineTemplate.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className={`test-section-card ${activeSection === sectionIdx ? 'active' : 'hidden'}`}
          >
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h3 className="section-title-main">{section.type}</h3>
            </div>

            <div className="test-results-grid">
              {section.rows.map((row, rowIdx) => (
                <div key={rowIdx} className="test-item">
                  <div className="test-item-header">
                    <label className="test-label">{row.observation}</label>
                    {row.unit && <span className="test-unit">{row.unit}</span>}
                  </div>
                  <input
                    type="text"
                    className="test-input"
                    placeholder={row.placeholder || "Enter value"}
                    value={referenceData[row.observation] || ""}
                    onChange={(e) => handleChange(row.observation, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button
            className="btn-nav btn-prev"
            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
            disabled={activeSection === 0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Previous
          </button>

          {activeSection < urineTemplate.length - 1 ? (
            <button
              className="btn-nav btn-next"
              onClick={() => setActiveSection(prev => Math.min(urineTemplate.length - 1, prev + 1))}
            >
              Next
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ) : (
            <button
              className="btn-nav btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}