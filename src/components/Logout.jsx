import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";
import { toast } from "react-toastify"; // Assuming you are using toast for notifications

export default function Logout() {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      
      if (!userData || !userData._id) {
        throw new Error("User not found");
      }

      // Make logout request
      const { data } = await axios.get(`${logoutRoute}/${userData._id}`);

      // Check if logout is successful
      if (data.status) {
        localStorage.clear(); // Clear localStorage
        navigate("/login"); // Navigate to login page
        toast.success("Logout successful!"); // Success message
      } else {
        console.error("Logout failed:", data.msg);
        toast.error("Logout failed. Please try again."); // Show error message using toast
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred. Please try again."); // Error message using toast
    }
  };

  return (
    <button
      className="btn btn-danger d-flex justify-content-center align-items-center p-2 rounded"
      onClick={handleClick}
    >
      <BiPowerOff className="text-light" style={{ fontSize: "1.3rem" }} />
    </button>
  );
}
