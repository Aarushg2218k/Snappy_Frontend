import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap"; // Import necessary Bootstrap components
import axios from "axios"; // For making API requests
import { sendFriendRequestRoute } from "../utils/APIRoutes"; // Import the API route
import Swal from "sweetalert2"; // Import SweetAlert2

export default function FriendRequestModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null); // State to store current user's email

  useEffect(() => {
    // Get the current user's data from localStorage (or another method, depending on how you store it)
    const currentUser = JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    if (currentUser) {
      setCurrentUserEmail(currentUser.email); // Set current user's email
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state while the request is being sent

    if (!email) {
      setError("Please enter an email address.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(sendFriendRequestRoute, {
        senderId: currentUserEmail,
        receiverId: email,
      });

      console.log("Backend response:", data); // Log the response from the backend

      if (data.status) {
        setSuccess(true);
        setError(null); // Clear any previous error

        // Show SweetAlert success message
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Friend request sent successfully!",
        }).then(() => {
          window.location.reload(); // Reload the page after user closes the alert
        });

        // Clear the email input field
        setEmail("");

        // Close the modal automatically
        onClose();
      } else {
        setError(data.msg || "Failed to send friend request.");
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.msg || "Failed to send friend request.",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false); // Set loading state to false after request completion
    }
  };

  return (
    <Modal
      show={open}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header
        closeButton
        className="bg-primary text-white border-0 shadow-sm"
      >
        <Modal.Title className="fw-bold">Send Friend Request</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light px-4 py-4">
        <Form
          onSubmit={handleSubmit}
          className="p-3 bg-white rounded-4 shadow-sm"
        >
          <Form.Group controlId="formBasicEmail" className="mb-4">
            <Form.Label className="fw-semibold text-muted">
              Recipient's Email Address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-3 border-0 shadow-sm py-2"
            />
          </Form.Group>

          <div className="d-grid">
            <Button
              variant="primary"
              type="submit"
              className="fw-semibold rounded-3 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
