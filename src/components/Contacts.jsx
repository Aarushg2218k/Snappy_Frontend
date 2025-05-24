import React, { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import Logo from "../assets/logo.svg";
import Logout from "./Logout";
import axios from "axios";
import {
  logoutRoute,
  acceptFriendRequestRoute,
  declineFriendRequestRoute,
  getPendingRequestsRoute,
} from "../utils/APIRoutes";
import { Navigate } from "react-router-dom";
import FriendRequestModal from "./FriendRequestModal";
import IncomingRequestModal from "./IncomingRequestModal";

export default function Contacts({ contacts, changeChat, pendingRequests, socket }) {
  const [currentUserName, setCurrentUserName] = useState();
  const [currentUserImage, setCurrentUserImage] = useState();
  const [currentSelected, setCurrentSelected] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomingRequestModalOpen, setIsIncomingRequestModalOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // New state for online users as a Set of userIds
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const fetchCurrentUser = () => {
      const raw = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!raw) return;
      const { username, avatarImage } = JSON.parse(raw);
      setCurrentUserName(username);
      setCurrentUserImage(avatarImage);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const raw = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
        if (!raw) return;

        const { _id } = JSON.parse(raw);
        const { data } = await axios.get(`${getPendingRequestsRoute}/${_id}/pending-requests`);
        setIncomingRequests(data);
      } catch (error) {
        console.error("Failed to fetch incoming friend requests", error);
      }
    };

    fetchRequests();
  }, []);

// Listen for online/offline updates from socket
useEffect(() => {
  if (!socket) return;

  const handleUserOnline = (userId) => {
    setOnlineUsers((prev) => new Set(prev).add(userId));
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(userId);
      return updated;
    });
  };

  const handleInitialOnlineUsers = (userIds) => {
    setOnlineUsers(new Set(userIds));
  };

  socket.on("user-online", handleUserOnline);
  socket.on("user-offline", handleUserOffline);
  socket.on("online-users", handleInitialOnlineUsers);

  // Request online user list after connection
  socket.emit("get-online-users");

  return () => {
    socket.off("user-online", handleUserOnline);
    socket.off("user-offline", handleUserOffline);
    socket.off("online-users", handleInitialOnlineUsers);
  };
}, [socket]);


  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  const handleLogout = async () => {
    try {
      await axios.get(logoutRoute);
      localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
      Navigate("/login");
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openIncomingRequestModal = () => setIsIncomingRequestModalOpen(true);
  const closeIncomingRequestModal = () => setIsIncomingRequestModalOpen(false);

  // Accept Friend Request Handler
  const handleAcceptRequest = async (request) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const receiverId = currentUser._id;
      const senderId = request;

      await axios.post(acceptFriendRequestRoute, {
        senderId,
        receiverId,
      });

      setIncomingRequests((prev) => prev.filter((req) => req._id !== request._id));
    } catch (error) {
      console.error("Error accepting friend request", error);
      alert("Failed to accept the request.");
    }
  };

  // Reject Friend Request Handler
  const handleRejectRequest = async (request) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const receiverId = currentUser._id;
      const senderId = request;

      await axios.post(declineFriendRequestRoute, { receiverId, senderId });
      setIncomingRequests((prev) => prev.filter((req) => req._id !== request));
    } catch (error) {
      console.error("Error rejecting friend request", error);
      alert("Failed to reject the request.");
    }
  };

  if (!currentUserName || !currentUserImage) {
    return null;
  }

  return (
    <div className="d-flex flex-column" style={{ height: "100vh", backgroundColor: "#080420" }}>
      <div className="d-flex justify-content-center align-items-center py-2">
        <Image src={Logo} alt="logo" height="30" />
        <h3 className="text-white ms-2 text-uppercase">snappy</h3>
      </div>

      <div className="d-flex flex-column align-items-center overflow-auto flex-grow-1">
        <p className="text-white">Friend List</p>
        {contacts.map((contact, index) => {
          const isOnline = onlineUsers.has(contact._id);
          return (
            <div
              key={contact._id}
              className={`d-flex align-items-center gap-3 p-2 w-75 mb-2 rounded-2 cursor-pointer ${
                index === currentSelected ? "bg-primary" : "bg-white"
              }`}
              onClick={() => changeCurrentChat(index, contact)}
            >
              <div className="position-relative d-inline-block">
                <Image
                  src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                  alt={`${contact.username} avatar`}
                  roundedCircle
                  height="50"
                />
                <span
                  className={`position-absolute bottom-0 start-0 translate-middle p-1 border border-light rounded-circle ${
                    isOnline ? "bg-success" : "bg-danger"
                  }`}
                  style={{ width: "14px", height: "14px" }}
                ></span>
              </div>

              <div className="text-blue">
                <h3>{contact.username}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-center mb-1 bg-dark py-2">
        <div className="d-flex gap-3">
          <Image
            src={`data:image/svg+xml;base64,${currentUserImage}`}
            alt="Your avatar"
            roundedCircle
            height="60"
          />
          <span className="text-white">
            <h2>{currentUserName}</h2>
          </span>
          <span className="d-flex flex-column align-items-center p-3">
            <Logout onLogout={handleLogout} />
          </span>
        </div>
      </div>

      <div className="d-flex justify-content-around my-2">
        <button className="btn btn-info w-45 ms-3" onClick={openModal}>
          Send Friend Request
        </button>
        <button className="btn btn-info w-45 mx-3" onClick={openIncomingRequestModal}>
          Show Pending Requests
        </button>
      </div>

      <FriendRequestModal open={isModalOpen} onClose={closeModal} />

      <IncomingRequestModal
        open={isIncomingRequestModalOpen}
        onClose={closeIncomingRequestModal}
        requests={incomingRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
}
