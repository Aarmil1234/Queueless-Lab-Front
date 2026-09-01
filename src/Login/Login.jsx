import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../Scss/Style.scss";
import { apiRequest, setSession } from "../reusable";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile.trim()) {
      setError("Mobile number is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await apiRequest(
        "post",
        "/api/auth/login",
        {
          labMobileNumber: mobile.trim(),
          password: password,
        }
      );

      console.log("LOGIN RESPONSE:", res?.data);

      const payload = res?.data?.data?.data;

      const token = payload?.token;
      const user = payload?.user;

      if (token) {
        // Store session (localStorage + 24h expiry, shared across tabs)
        setSession({ token, user });

        // Keep the gate cookie in step with the 24h session
        const expires = new Date();

        expires.setDate(
          expires.getDate() + 1
        );

        document.cookie =
          `hospitalId=${user?.id || ""}; expires=${expires.toUTCString()}; path=/`;

        // Redirect
        navigate("/");
      } else {
        setError("Invalid Credentials");
      }

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err?.response?.data ||
          err?.message
      );

      await Swal.fire({
        icon: "warning",
        title: "Login Failed",
        text:
          err?.response?.data?.message ||
          "Invalid Credentials",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

    } finally {
      setIsLoading(false);
    }
  };


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {

    // ===================================================
    // STEP 1 - MOBILE NUMBER
    // ===================================================

    const {
      value: forgotMobile,
    } = await Swal.fire({

      title: "Forgot Password?",

      text:
        "Enter your registered lab mobile number.",

      input: "tel",

      inputPlaceholder:
        "Enter mobile number",

      inputValue: mobile,

      showCancelButton: true,

      confirmButtonText:
        "Send OTP",

      cancelButtonText:
        "Cancel",

      inputAttributes: {
        maxlength: 10,
        minlength: 10,
        inputmode: "numeric",
        autocomplete: "tel",
      },

      inputValidator: (value) => {

        if (!value) {
          return "Mobile number is required";
        }

        const cleanNumber =
          value.trim();

        if (
          !/^[0-9]{10}$/.test(
            cleanNumber
          )
        ) {
          return (
            "Please enter a valid 10 digit mobile number"
          );
        }

        return null;
      },
    });


    // User cancelled
    if (!forgotMobile) {
      return;
    }


    const mobileNumber =
      forgotMobile.trim();


    try {

      // =================================================
      // STEP 2 - SEND OTP
      // =================================================

      Swal.fire({
        title: "Sending OTP...",

        text:
          "Please wait while we send the OTP.",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {
          Swal.showLoading();
        },
      });


      const otpResponse =
        await apiRequest(
          "post",
          "/api/auth/forget-password",
          {
            labMobileNumber:
              mobileNumber,
          }
        );


      console.log(
        "FORGOT PASSWORD RESPONSE:",
        otpResponse?.data
      );


      Swal.close();


      // =================================================
      // STEP 3 - OTP LOOP
      // =================================================
      //
      // If reset-password says OTP is invalid,
      // this loop will show the OTP screen again.
      //
      // =================================================

      let resetSuccessful = false;

      while (!resetSuccessful) {

        // -----------------------------------------------
        // ASK OTP
        // -----------------------------------------------

        const {
          value: otp,
        } = await Swal.fire({

          title: "Verify OTP",

          text:
            `Enter the OTP sent to ${mobileNumber}`,

          input: "text",

          inputPlaceholder:
            "Enter 6 digit OTP",

          showCancelButton: true,

          confirmButtonText:
            "Verify OTP",

          cancelButtonText:
            "Cancel",

          inputAttributes: {
            maxlength: 6,
            minlength: 6,
            inputmode: "numeric",
            autocomplete:
              "one-time-code",
          },

          inputValidator: (value) => {

            if (!value) {
              return "OTP is required";
            }

            if (
              !/^[0-9]{6}$/.test(
                value.trim()
              )
            ) {
              return (
                "Please enter a valid 6 digit OTP"
              );
            }

            return null;
          },
        });


        // User cancelled
        if (!otp) {
          return;
        }


        const enteredOtp =
          otp.trim();


        // -----------------------------------------------
        // STEP 4 - NEW PASSWORD
        // -----------------------------------------------

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
                  margin-bottom:5px;
                  font-weight:600;
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
                  margin-top:12px;
                  margin-bottom:5px;
                  font-weight:600;
                "
              >
                Confirm Password
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
            "Reset Password",

          cancelButtonText:
            "Back to OTP",

          preConfirm: () => {

            const newPassword =
              document.getElementById(
                "new-password"
              )?.value || "";

            const confirmPassword =
              document.getElementById(
                "confirm-password"
              )?.value || "";


            // New password required
            if (!newPassword) {

              Swal.showValidationMessage(
                "New password is required"
              );

              return false;
            }


            // Password length
            if (
              newPassword.length < 6
            ) {

              Swal.showValidationMessage(
                "Password must be at least 6 characters"
              );

              return false;
            }


            // Confirm password required
            if (!confirmPassword) {

              Swal.showValidationMessage(
                "Please confirm your password"
              );

              return false;
            }


            // Password mismatch
            if (
              newPassword !==
              confirmPassword
            ) {

              Swal.showValidationMessage(
                "Passwords do not match"
              );

              return false;
            }


            return {
              newPassword,
            };
          },
        });


        // -----------------------------------------------
        // User clicked "Back to OTP"
        // -----------------------------------------------

        if (!passwordData) {
          continue;
        }


        // -----------------------------------------------
        // STEP 5 - RESET PASSWORD
        // -----------------------------------------------

        Swal.fire({
          title:
            "Resetting Password...",

          text:
            "Please wait.",

          allowOutsideClick: false,

          allowEscapeKey: false,

          didOpen: () => {
            Swal.showLoading();
          },
        });


        try {

          const resetResponse =
            await apiRequest(
              "post",
              "/api/auth/reset-password",
              {
                labMobileNumber:
                  mobileNumber,

                otp:
                  enteredOtp,

                newPassword:
                  passwordData.newPassword,
              }
            );


          console.log(
            "RESET PASSWORD RESPONSE:",
            resetResponse?.data
          );


          Swal.close();


          // ---------------------------------------------
          // SUCCESS
          // ---------------------------------------------

          resetSuccessful = true;


          await Swal.fire({

            icon: "success",

            title:
              "Password Reset Successfully",

            text:
              resetResponse?.data?.message ||
              resetResponse?.data?.data?.message ||
              "Your password has been changed successfully.",

            confirmButtonText:
              "Go to Login",

            allowOutsideClick: false,

            allowEscapeKey: false,
          });


          // Put mobile number back
          // into login form

          setMobile(
            mobileNumber
          );

          setPassword("");

          setError("");


        } catch (resetError) {

          Swal.close();


          console.error(
            "RESET PASSWORD ERROR:",
            resetError?.response?.data ||
              resetError?.message
          );


          // ---------------------------------------------
          // INVALID OTP
          // ---------------------------------------------

          await Swal.fire({

            icon: "error",

            title: "Invalid OTP",

            text:
              resetError?.response?.data?.message ||
              resetError?.response?.data?.data?.message ||
              "The OTP you entered is incorrect. Please enter the correct OTP.",

            confirmButtonText:
              "Enter OTP Again",

            allowOutsideClick: false,

            allowEscapeKey: false,
          });


          /*
           * resetSuccessful is still false.
           *
           * Therefore the while loop starts again
           * and shows the OTP screen.
           */
        }
      }

    } catch (err) {

      console.error(
        "FORGOT PASSWORD ERROR:",
        err?.response?.data ||
          err?.message
      );


      Swal.close();


      // =================================================
      // OTP REQUEST ERROR
      // =================================================

      await Swal.fire({

        icon: "error",

        title:
          "Unable to Send OTP",

        text:
          err?.response?.data?.message ||
          err?.response?.data?.data?.message ||
          "Unable to process your request. Please try again.",

        confirmButtonText:
          "OK",

        allowOutsideClick: false,

        allowEscapeKey: false,
      });
    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="login-wrapper">

      <div className="registration-container">

        <div className="form-card auth-container">

          {/* ============================================
              HEADER
          ============================================ */}

          <div
            className="form-header py-3 p-2 text-center"
          >

            <h1 className="brand-title">
              Queueless
            </h1>

            <h2>
              Lab Login
            </h2>

          </div>


          {/* ============================================
              FORM BODY
          ============================================ */}

          <div className="form-body">

            <form onSubmit={handleSubmit}>

              {/* ========================================
                  MOBILE NUMBER
              ======================================== */}

              <div className="form-group">

                <label>
                  Lab Mobile Number
                </label>

                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setMobile(value);
                  }}
                  className="form-control border-dark"
                  placeholder="Enter registered mobile number"
                  maxLength={10}
                  required
                />

              </div>


              {/* ========================================
                  PASSWORD
              ======================================== */}

              <div className="form-group">

                <label>
                  Password
                </label>

                <div style={{ position: "relative" }}>

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="form-control border-dark"
                    placeholder="Enter Password"
                    style={{ paddingRight: "42px" }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>

                </div>

              </div>


              {/* ========================================
                  ERROR
              ======================================== */}

              {error && (
                <p
                  className="text-danger text-center mt-2"
                >
                  {error}
                </p>
              )}


              {/* ========================================
                  LOGIN BUTTON
              ======================================== */}

              <div className="text-center mt-3">

                <button
                  type="submit"
                  className="btn-custom btn-primary"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Verifying..."
                    : "Login"}
                </button>

              </div>


              {/* ========================================
                  FORGOT PASSWORD
              ======================================== */}

              <div
                className="text-center mt-3"
              >

                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#0d6efd",
                    cursor: "pointer",
                    padding: "5px",
                    fontSize: "14px",
                    textDecoration:
                      "underline",
                  }}
                >
                  Forgot Password?
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;