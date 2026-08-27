import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";

const Navbar = ({ collapsed }) => {
  const [hospitalId, setHospitalId] = useState(null);
  const [data, setData] = useState([]);
  useEffect(() => {
    const hospitalCookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("hospitalId="))
      ?.split("=")[1];

    setHospitalId(hospitalCookie);
  }, [])

  useEffect(() => {
    hospitalId != null &&
      fetchDoctors();
  }, [hospitalId]);

  const fetchDoctors = async () => {
    try {
      // setLoading(true);
      const res = await apiRequest("POST", "admin/gethospitals", { hospitalId: hospitalId }, false);
      setData(res.data?.hospitals || []);
      console.log("res.data?.hospitals", res.data?.hospitals);

    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <nav className={`navbar ${collapsed ? "collapsed" : ""}`} >
      <div>{data?.[0]?.ownerName || 'Medicare'}</div>
    </nav>
  );
};

export default Navbar;
