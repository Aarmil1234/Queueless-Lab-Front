import React from "react";
import "./UnknownPage.css"; // ✅ We'll move your styles here

const UnknownPage = () => {
  return (
    <div className="unknown-page-body">
      <div className="container">
        <div className="content">
          <div className="icon-wrapper">
            <svg
              className="medical-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M16 11H13V8C13 7.45 12.55 7 12 7C11.45 7 11 7.45 11 8V11H8C7.45 11 7 11.45 7 12C7 12.55 7.45 13 8 13H11V16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16V13H16C16.55 13 17 12.55 17 12C17 11.45 16.55 11 16 11Z"
                fill="#667eea"
              />
            </svg>
          </div>

          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-message">
            Looks like this page took an unexpected detour. Don’t worry, we’ll
            help you get back on track to streamline your healthcare management.
          </p>

        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Queueless. Revolutionizing Healthcare Management.</p>
      </footer>
    </div>
  );
};

export default UnknownPage;
