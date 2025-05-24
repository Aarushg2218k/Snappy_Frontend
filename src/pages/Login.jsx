import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const stored = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (stored) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password } = credentials;
    if (!email || !password) {
      toast.error("Email and password are required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { email, password } = credentials;
      const { data } = await axios.post(loginRoute, { email, password });

      console.log(data);
      if (!data.status) {
        toast.error(data.msg || "Login failed.", toastOptions);
        return;
      }
      localStorage.setItem(
        process.env.REACT_APP_LOCALHOST_KEY,
        JSON.stringify(data.user)
      );
      localStorage.setItem("token", data.token);
      if (data.user.role === "user") {
        navigate("/");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to login. Please try again later.", toastOptions);
    }
  };

  return (
    <>
      <div
        className="container-fluid d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#131324" }}
      >
        <div
          className="p-5 rounded"
          style={{
            backgroundColor: "#00000076",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" height="60" className="mb-2" />
            <h2 className="text-white text-uppercase">Snappy</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control text-white"
                placeholder="Email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#4e0eff",
                }}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className="form-control text-white"
                placeholder="Password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#4e0eff",
                }}
                required
              />
            </div>
            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn fw-bold text-uppercase"
                style={{ backgroundColor: "#4e0eff", color: "white" }}
              >
                Log In
              </button>
            </div>
            <div className="text-center text-white">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="fw-bold"
                style={{ color: "#4e0eff" }}
              >
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
