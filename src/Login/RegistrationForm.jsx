import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Card,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Search,
  Users,
  User,
  GraduationCap,
  Stethoscope,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiRequest } from "../reusable";

const HospitalManagement = () => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [doctorCounts, setDoctorCounts] = useState({});
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("list");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    hospitalName: "",
    ownerName: "",
    socialMediaLinks: "",
    email: "",
    phone: "",
    hospitalAddress: "",
    city: "",
    pincode: "",
    categories: "",
    specialization: "",
    otherSpecialization: "",
    loginEmail: "",
    password: "",
  });

  // ---------------- FETCH DATA ---------------- //
  useEffect(() => {
    fetchHospitalsAndDoctors();
  }, []);

  const fetchHospitalsAndDoctors = async () => {
    try {
      setLoading(true);
      const hospitalRes = await apiRequest("POST", "admin/gethospitals", {});
      const hospitalList =
        hospitalRes.data?.hospitals || hospitalRes.data?.data?.hospitals || [];

      const doctorRes = await apiRequest("POST", "admin/getdoctors", {});
      const doctors =
        doctorRes.data?.doctors || doctorRes.data?.data?.doctors || [];

      const counts = doctors.reduce((acc, doc) => {
        const hospitalId = doc.hospitalId?._id || doc.hospitalId;
        if (hospitalId) {
          acc[hospitalId] = (acc[hospitalId] || 0) + 1;
        }
        return acc;
      }, {});

      setDoctorCounts(counts);
      setHospitals(hospitalList);
      setFilteredHospitals(hospitalList);
    } catch (err) {
      console.error("Error fetching hospitals/doctors:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SEARCH ---------------- //
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value === "") {
      setFilteredHospitals(hospitals);
    } else {
      const filtered = hospitals.filter((h) =>
        Object.values(h).join(" ").toLowerCase().includes(value)
      );
      setFilteredHospitals(filtered);
    }
  };

  // ---------------- FORM HANDLERS ---------------- //
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "specialization" && value !== "Other"
        ? { otherSpecialization: "" }
        : {}),
    }));
  };

  const handleNext = () => setCurrentStep(2);
  const handlePrev = () => setCurrentStep(1);

  // ---------------- SUBMIT HANDLER ---------------- //
  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.hospitalName,
        ownerName: formData.ownerName,
        socialMediaLinks: formData.socialMediaLinks || null,
        email: formData.email,
        mobileNumber: formData.phone,
        address: formData.hospitalAddress,
        city: formData.city,
        pincode: formData.pincode,
        categories: formData.categories,
        specialization:
          formData.specialization === "Other"
            ? formData.otherSpecialization
            : formData.specialization,
        profile: null,
        loginField: formData.loginEmail,
        password: formData.password,
      };

      if (view === "edit" && selectedHospital) {
        payload._id = selectedHospital._id;
        await apiRequest("POST", "admin/updatehospital", payload);
        alert("✅ Hospital updated successfully!");
      } else {
        await apiRequest("POST", "admin/addhospital", payload);
        alert("✅ Hospital added successfully!");
      }

      setView("list");
      setSelectedHospital(null);
      fetchHospitalsAndDoctors();
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert(error.message || "❌ Operation failed. Please check your inputs.");
    }
  };

  // ---------------- VIEW HANDLERS ---------------- //
  const handleViewDetails = async (hospital) => {
    setSelectedHospital(hospital);
    setView("details");

    try {
      const res = await apiRequest("POST", "admin/getdoctors", {
        hospitalId: hospital._id,
      });
      const docs = res.data?.doctors || res.data?.data?.doctors || [];
      setHospitalDoctors(docs);
    } catch (err) {
      console.error("Error fetching hospital doctors:", err.message);
    }
  };

  const handleEdit = () => {
    if (!selectedHospital) return;
    setFormData({
      hospitalName: selectedHospital.name || "",
      ownerName: selectedHospital.ownerName || "",
      socialMediaLinks: selectedHospital.socialMediaLinks || "",
      email: selectedHospital.email || "",
      phone: selectedHospital.mobileNumber || "",
      hospitalAddress: selectedHospital.address || "",
      city: selectedHospital.city || "",
      pincode: selectedHospital.pincode || "",
      categories: selectedHospital.categories || "",
      specialization: selectedHospital.specialization || "",
      otherSpecialization: "",
      loginEmail: selectedHospital.loginField || "",
      password: "",
    });
    setCurrentStep(1);
    setView("edit");
  };

  const goBackToList = () => {
    setSelectedHospital(null);
    setView("list");
  };

  // ---------------- RENDER ---------------- //
  return (
    <div
      style={{
        margin: "60px 0px 0px 280px",
        background: "rgb(248, 249, 250)",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#000" }}>
          {view === "list" && "Hospitals"}
          {view === "add" && "Add Hospital"}
          {view === "details" && "Hospital Details"}
          {view === "edit" && "Edit Hospital"}
        </h1>

        {view !== "list" ? (
          <Button variant="secondary" onClick={goBackToList}>
            <ArrowLeft size={18} /> &nbsp; Back
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setView("add")}>
            <Plus size={18} /> &nbsp; Add Hospital
          </Button>
        )}
      </div>

      {/* ---------- LIST VIEW ---------- */}
      {view === "list" && (
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <Search size={18} color="#6b7280" style={{ marginRight: "10px" }} />
            <Form.Control
              type="text"
              placeholder="Search by name, city, owner, or specialization..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                maxWidth: "400px",
                borderRadius: "25px",
                padding: "10px 15px",
              }}
            />
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <Table striped bordered hover responsive>
                <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Specialization</th>
                    <th>Owner</th>
                    <th>Doctors</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.length > 0 ? (
                    filteredHospitals.map((hosp) => (
                      <tr key={hosp._id}>
                        <td>{hosp.name}</td>
                        <td>{hosp.city}</td>
                        <td>{hosp.specialization || "—"}</td>
                        <td>{hosp.ownerName || "—"}</td>
                        <td>
                          <Users size={16} color="#4f46e5" />{" "}
                          {doctorCounts[hosp._id] || 0}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(hosp)}
                          >
                            <Eye size={16} /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                        No hospitals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ---------- ADD / EDIT FORM ---------- */}
      {(view === "add" || view === "edit") && (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Step Indicator */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span
                style={{
                  background: currentStep === 1 ? "#007bff" : "#ccc",
                  color: "white",
                  borderRadius: "50%",
                  padding: "6px 12px",
                }}
              >
                1
              </span>{" "}
              →{" "}
              <span
                style={{
                  background: currentStep === 2 ? "#007bff" : "#ccc",
                  color: "white",
                  borderRadius: "50%",
                  padding: "6px 12px",
                }}
              >
                2
              </span>
            </div>
          </div>

          {currentStep === 1 && (
            <>
              <h4 className="mb-4">Hospital Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital Name</Form.Label>
                    <Form.Control
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Owner Name</Form.Label>
                    <Form.Control
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="hospitalAddress"
                      value={formData.hospitalAddress}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="categories"
                      value={formData.categories}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="General">General</option>
                      <option value="Specialty">Specialty</option>
                      <option value="Clinic">Clinic</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={handleNext}>
                  Next <ChevronRight size={18} />
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h4 className="mb-4">Account Setup</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Login Email</Form.Label>
                    <Form.Control
                      name="loginEmail"
                      value={formData.loginEmail}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={handlePrev}>
                  <ChevronLeft size={18} /> Back
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                  <CheckCircle size={18} /> Save
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- DETAILS VIEW ---------- */}
      {view === "details" && selectedHospital && (
        <div>
          <Card style={{ padding: "30px", borderRadius: "20px", marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>🏥 {selectedHospital.name}</h3>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleEdit}
                  style={{ marginRight: "10px" }}
                >
                  <Pencil size={16} /> Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={goBackToList}>
                  <ArrowLeft size={16} /> Back
                </Button>
              </div>
            </div>

            <Row>
              <Col md={6}>
                <p><strong>Owner:</strong> {selectedHospital.ownerName || "—"}</p>
                <p><strong>Email:</strong> {selectedHospital.email || "—"}</p>
                <p><strong>Phone:</strong> {selectedHospital.mobileNumber || "—"}</p>
              </Col>
              <Col md={6}>
                <p><strong>City:</strong> {selectedHospital.city || "—"}</p>
                <p><strong>Specialization:</strong> {selectedHospital.specialization || "—"}</p>
                <p><strong>Doctor Count:</strong> {hospitalDoctors.length}</p>
              </Col>
            </Row>
          </Card>

          <h4 style={{ marginBottom: "15px" }}>👨‍⚕️ Doctors in this Hospital</h4>
          {hospitalDoctors.length === 0 ? (
            <p>No doctors found for this hospital.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {hospitalDoctors.map((doc) => (
                <Card
                  key={doc._id}
                  style={{
                    padding: "20px",
                    borderRadius: "15px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    background: "white",
                  }}
                >
                  <h5>
                    <User size={18} /> {doc.name}
                  </h5>
                  <p>
                                        <GraduationCap size={16} /> {doc.degreeId?.degree || doc.degreeId || "—"}
                  </p>
                  <p>
                    <Stethoscope size={16} />{" "}
                    {doc.specializationId?.specialization || doc.specializationId || "—"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;

