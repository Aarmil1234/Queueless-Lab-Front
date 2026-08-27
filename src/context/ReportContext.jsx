import React, { createContext, useState, useEffect } from "react";

export const ReportsContext = createContext();

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const savedReports = sessionStorage.getItem("reportsData");
    if (savedReports) setReports(JSON.parse(savedReports));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("reportsData", JSON.stringify(reports));
  }, [reports]);

  return (
    <ReportsContext.Provider value={{ reports, setReports }}>
      {children}
    </ReportsContext.Provider>
  );
};
