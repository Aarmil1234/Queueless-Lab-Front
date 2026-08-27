import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import Swal from "sweetalert2";
import {
  LogOut,
  User,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";
import { apiRequest } from "../reusable";

const Navbar = ({ collapsed }) => {
  const navigate = useNavigate();

  const [hospitalName, setHospitalName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // =====================================================
  // GET USER DATA
  // =====================================================

  useEffect(() => {
    const name =
      sessionStorage.getItem("hospitalName");

    const owner =
      sessionStorage.getItem("ownerName");

    setHospitalName(
      name || "My Lab"
    );

    setOwnerName(
      owner || "Administrator"
    );
  }, []);


  // =====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  // =====================================================
  // RESET / UPDATE PASSWORD
  // =====================================================

  const handleUpdatePassword = async () => {

    // Close dropdown
    setShowDropdown(false);


    // ===================================================
    // STEP 1 - ASK CURRENT PASSWORD
    // ===================================================

    const {
      value: currentPassword,
    } = await Swal.fire({

      title: "Change Password",

      input: "password",

      inputLabel:
        "Current Password",

      inputPlaceholder:
        "Enter current password",

      showCancelButton: true,

      confirmButtonText:
        "Continue",

      cancelButtonText:
        "Cancel",

      inputAttributes: {
        autocomplete:
          "current-password",
      },

      inputValidator: (value) => {

        if (!value) {
          return "Current password is required";
        }

        return null;
      },

    });


    // User cancelled
    if (!currentPassword) {
      return;
    }


    // ===================================================
    // STEP 2 - ASK NEW PASSWORD
    // ===================================================

    const {
      value: passwordData,
    } = await Swal.fire({

      title:
        "Create New Password",

      html: `
        <div style="text-align:left;">

          <label
            for="new-password"
            style="
              display:block;
              margin-bottom:6px;
              font-weight:600;
              color:#374151;
            "
          >
            New Password
          </label>

          <input
            id="new-password"
            type="password"
            class="swal2-input"
            placeholder="Enter new password"
            autocomplete="new-password"
          />

          <label
            for="confirm-password"
            style="
              display:block;
              margin-top:14px;
              margin-bottom:6px;
              font-weight:600;
              color:#374151;
            "
          >
            Confirm New Password
          </label>

          <input
            id="confirm-password"
            type="password"
            class="swal2-input"
            placeholder="Confirm new password"
            autocomplete="new-password"
          />

        </div>
      `,

      focusConfirm: false,

      showCancelButton: true,

      confirmButtonText:
        "Update Password",

      cancelButtonText:
        "Cancel",

      preConfirm: () => {

        const newPassword =
          document.getElementById(
            "new-password"
          )?.value || "";

        const confirmPassword =
          document.getElementById(
            "confirm-password"
          )?.value || "";


        // ---------------------------------------------
        // NEW PASSWORD REQUIRED
        // ---------------------------------------------

        if (!newPassword) {

          Swal.showValidationMessage(
            "New password is required"
          );

          return false;
        }


        // ---------------------------------------------
        // PASSWORD LENGTH
        // ---------------------------------------------

        if (newPassword.length < 6) {

          Swal.showValidationMessage(
            "Password must be at least 6 characters"
          );

          return false;
        }


        // ---------------------------------------------
        // CONFIRM PASSWORD
        // ---------------------------------------------

        if (!confirmPassword) {

          Swal.showValidationMessage(
            "Please confirm your new password"
          );

          return false;
        }


        // ---------------------------------------------
        // PASSWORD MATCH
        // ---------------------------------------------

        if (
          newPassword !==
          confirmPassword
        ) {

          Swal.showValidationMessage(
            "Passwords do not match"
          );

          return false;
        }


        // ---------------------------------------------
        // CURRENT & NEW PASSWORD SAME
        // ---------------------------------------------

        if (
          currentPassword ===
          newPassword
        ) {

          Swal.showValidationMessage(
            "New password must be different from current password"
          );

          return false;
        }


        return {
          newPassword,
        };
      },

    });


    // User cancelled
    if (!passwordData) {
      return;
    }


    // ===================================================
    // STEP 3 - UPDATE PASSWORD API
    // ===================================================

    try {

      Swal.fire({

        title:
          "Updating Password...",

        text:
          "Please wait.",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {
          Swal.showLoading();
        },

      });


      const response =
        await apiRequest(
          "post",
          "/api/auth/update-password",
          {
            currentPassword:
              currentPassword,

            newPassword:
              passwordData.newPassword,
          }
        );


      console.log(
        "UPDATE PASSWORD RESPONSE:",
        response?.data
      );


      // =================================================
      // SUCCESS
      // =================================================

      await Swal.fire({

        icon: "success",

        title:
          "Password Updated",

        text:
          response?.data?.message ||
          response?.data?.data?.message ||
          "Your password has been updated successfully.",

        confirmButtonText:
          "OK",

      });

    } catch (err) {

      console.error(
        "UPDATE PASSWORD ERROR:",
        err?.response?.data ||
          err?.message
      );


      // =================================================
      // ERROR
      // =================================================

      await Swal.fire({

        icon: "error",

        title:
          "Password Update Failed",

        text:
          err?.response?.data?.message ||
          err?.response?.data?.data?.message ||
          "Current password is incorrect or password could not be updated.",

        confirmButtonText:
          "OK",

      });

    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    setShowDropdown(false);

    swal({

      title:
        "Are you sure?",

      text:
        "You will be logged out of this session.",

      icon:
        "warning",

      buttons: [
        "Cancel",
        "Logout",
      ],

      dangerMode:
        true,

    }).then((willLogout) => {

      if (willLogout) {

        // Clear session
        sessionStorage.clear();

        // Remove cookie
        document.cookie =
          "hospitalId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect
        navigate("/login");
      }

    });
  };


  // =====================================================
  // STYLES
  // =====================================================

  const navbarStyle = {

    position: "fixed",

    top: 0,

    left:
      collapsed
        ? "80px"
        : "280px",

    right: 0,

    height: "80px",

    background: "white",

    borderBottom:
      "2px solid #f3f4f6",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    padding:
      "0 30px",

    transition:
      "all 0.3s ease",

    zIndex: 999,

    boxShadow:
      "0 2px 10px rgba(0, 0, 0, 0.05)",
  };


  const logoutBtnStyle = {

    display: "flex",

    alignItems: "center",

    gap: "8px",

    padding:
      "10px 20px",

    background:
      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",

    color: "white",

    border: "none",

    borderRadius: "10px",

    cursor: "pointer",

    fontWeight: "600",

    fontSize: "0.9rem",

    transition:
      "all 0.3s ease",

    boxShadow:
      "0 4px 12px rgba(239, 68, 68, 0.3)",
  };


  // =====================================================
  // JSX
  // =====================================================

  return (

    <nav style={navbarStyle}>

      {/* ================================================
          LEFT SIDE
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
        }}
      >

        <div>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
            }}
          >
            Welcome Back
          </h2>

        </div>

      </div>


      {/* ================================================
          RIGHT SIDE
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >

        {/* ==============================================
            USER DROPDOWN
        =============================================== */}

        <div
          ref={dropdownRef}
          style={{
            position: "relative",
          }}
        >

          {/* USER BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowDropdown(
                !showDropdown
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >

            {/* USER ICON */}

            <div
              style={{
                width: "40px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <User size={18} />
            </div>


            {/* USER INFO */}

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
              }}
            >

              <span
                style={{
                  fontSize:
                    "0.95rem",
                  fontWeight: "600",
                  color:
                    "#1f2937",
                }}
              >
                {ownerName}
              </span>

              <span
                style={{
                  fontSize:
                    "0.8rem",
                  color:
                    "#6b7280",
                }}
              >
                {hospitalName}
              </span>

            </div>


            {/* ARROW */}

            <ChevronDown
              size={17}
              style={{
                marginLeft:
                  "5px",
                transition:
                  "transform 0.2s ease",
                transform:
                  showDropdown
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
              }}
            />

          </button>


          {/* ============================================
              DROPDOWN
          ============================================= */}

          {showDropdown && (

            <div
              style={{
                position:
                  "absolute",
                top:
                  "calc(100% + 8px)",
                right: 0,
                width: "220px",
                background:
                  "white",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
                boxShadow:
                  "0 10px 30px rgba(0, 0, 0, 0.12)",
                padding:
                  "6px",
                zIndex: 2000,
              }}
            >

              {/* RESET PASSWORD */}

              <button
                type="button"
                onClick={
                  handleUpdatePassword
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px 12px",
                  background:
                    "transparent",
                  border: "none",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontSize:
                    "14px",
                  color:
                    "#374151",
                  textAlign:
                    "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                }}
              >

                <LockKeyhole
                  size={17}
                />

                <span>
                  Reset Password
                </span>

              </button>


              {/* DIVIDER */}

              <div
                style={{
                  height: "1px",
                  background:
                    "#e5e7eb",
                  margin:
                    "4px 0",
                }}
              />


              {/* SIGN OUT */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px 12px",
                  background:
                    "transparent",
                  border: "none",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontSize:
                    "14px",
                  color:
                    "#dc2626",
                  textAlign:
                    "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                }}
              >

                <LogOut
                  size={17}
                />

                <span>
                  Sign Out
                </span>

              </button>

            </div>

          )}

        </div>


        {/* ==============================================
            LOGOUT BUTTON
        =============================================== */}

        <button
          style={logoutBtnStyle}
          onClick={
            handleLogout
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
          }}
        >

          <LogOut size={18} />

          <span>
            Sign Out
          </span>

        </button>

      </div>

    </nav>
  );
};

export default Navbar;