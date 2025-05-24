import React from 'react';
import { Modal, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import Swal from 'sweetalert2'; // Import SweetAlert2

const IncomingRequestModal = ({ open, onClose, requests, onAccept, onReject }) => {
  // This function will handle acceptance of friend requests
  const handleAccept = async (request) => {
    try {
      const res = await onAccept(request.senderId); 
  
      Swal.fire({
        icon: 'success',
        title: 'Friend request accepted!',
        text: `You are now friends with ${request.username}.`,
      }).then(() => {
        window.location.reload(); // Reload the page after user closes the alert
      });
  
      onClose()
    } catch (error) {
      console.error('Error accepting request', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to accept friend request. Please try again later.',
      });
    }
  };
  

  // This function will handle rejection of friend requests
  const handleReject = async (request) => {
    try {
      await onReject(request.senderId);  // Call the onReject function passed as a prop
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Friend request rejected',
        text: `You have rejected the request from ${request.username}.`,
      }).then(() => {
        window.location.reload(); // Reload the page after user closes the alert
      });
      // Close the modal after rejection
      onClose();
    } catch (error) {
      console.error('Error rejecting request', error);
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to reject friend request. Please try again later.',
      });
    }
  };

  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Incoming Friend Requests</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {requests.length === 0 ? (
          <p>No pending friend requests at the moment.</p>
        ) : (
          <ListGroup>
            {requests.map((request) => (
              <ListGroupItem key={request._id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{request.username}</strong>
                  <div style={{ fontSize: '0.9em', color: 'gray' }}>{request.email}</div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="success" size="sm" onClick={() => handleAccept(request)}>
                    Accept
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(request)}>
                    Reject
                  </Button>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncomingRequestModal;
