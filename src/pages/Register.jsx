import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Register() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = inputs;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters.", toastOptions);
      return false;
    }
    if (!email.match(emailRegex)) {
      toast.error("Please enter a valid email address.", toastOptions);
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.", toastOptions);
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { username, email, password } = inputs;
      const { data } = await axios.post(registerRoute, {
        username,
        email,
        password,
      });
      if (!data.status) {
        toast.error(data.msg || "Registration failed.", toastOptions);
        return;
      }
      localStorage.setItem(
        process.env.REACT_APP_LOCALHOST_KEY,
        JSON.stringify(data.user)
      );
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Unable to register. Please try again later.", toastOptions);
    }
  };

  return (
    <>
      <div className="container-fluid vh-100" style={{ backgroundColor: "#131324" }}>
        <div className="row h-96 justify-content-center">
          {/* Right side form */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div className="p-4 rounded w-100" style={{ maxWidth: "450px", backgroundColor: "#00000076" }}>
              {/* Logo */}
              <span className="text-center mb-2">
                <img src={Logo} alt="logo" height="60" />
              </span>

              {/* Create Account Heading */}
              <h2 className="text-white mb-2 text-center">Create Account</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label text-white">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control text-white"
                    placeholder="Enter your username"
                    value={inputs.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    style={{ backgroundColor: "transparent", borderColor: "#4e0eff" }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-white">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control text-white"
                    placeholder="Enter your email"
                    value={inputs.email}
                    onChange={handleChange}
                    required
                    style={{ backgroundColor: "transparent", borderColor: "#4e0eff" }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-white">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control text-white"
                    placeholder="Enter your password"
                    value={inputs.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    style={{ backgroundColor: "transparent", borderColor: "#4e0eff" }}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label text-white">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control text-white"
                    placeholder="Confirm your password"
                    value={inputs.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    style={{ backgroundColor: "transparent", borderColor: "#4e0eff" }}
                  />
                </div>
                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn fw-bold text-uppercase"
                    style={{ backgroundColor: "#4e0eff", color: "white" }}
                  >
                    Create Account
                  </button>
                </div>
                <div className="text-center text-white">
                  Already have an account?{" "}
                  <Link to="/login" className="fw-bold" style={{ color: "#4e0eff" }}>
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
