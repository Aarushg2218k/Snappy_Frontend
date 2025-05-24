import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { host, getFriendsRoute } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import styles

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const localData = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY
      );
      if (!localData) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(localData));
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host); // Establish socket connection
      socket.current.emit("add-user", currentUser._id);
  
      // 🔥 ADD THIS
      socket.current.emit("get-online-users");
    }
  
    return () => {
      if (socket.current) {
        socket.current.disconnect(); // Clean up socket connection on unmount
      }
    };
  }, [currentUser]);
  

  // Fetch friends and pending requests
  useEffect(() => {
    const fetchFriendsAndPendingRequests = async () => {
      try {
        if (currentUser?.isAvatarImageSet) {
          const { data: friendsData } = await axios.get(
            `${getFriendsRoute}/${currentUser._id}`
          );
          if (friendsData.status) {
            setContacts(friendsData.friends || []);
          } else {
            console.error("Failed to fetch friends:", friendsData.msg);
            setContacts([]);
          }
        } else if (currentUser) {
          navigate("/setAvatar");
        }
      } catch (err) {
        console.error("Error fetching friends and pending requests:", err);
        setContacts([]);
        setPendingRequests([]);
      }
    };

    if (currentUser) {
      fetchFriendsAndPendingRequests();
    }
  }, [currentUser, navigate]);

  // Handle incoming notifications and messages
  useEffect(() => {
    if (socket.current) {
      socket.current.on("notify-user", ({ from, message }) => {
        // Display notification with toast
        toast.info(`📨 New message from ${from}: ${message}`, {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      });

      socket.current.on("msg-recieve", (newMessage) => {
        // Handle new messages
        setCurrentChat((prevChat) => ({
          ...prevChat,
          messages: [...prevChat.messages, newMessage],
        }));
      });

      return () => {
        socket.current.off("notify-user"); // Clean up socket listeners
        socket.current.off("msg-recieve");
      };
    }
  }, []);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <div className="container-fluid h-100 w-100">
        <div className="row h-100">
          {/* Left Sidebar */}
          <div className="col-md-3 d-flex flex-column justify-content-between p-0">
            <Contacts
              contacts={contacts}
              pendingRequests={pendingRequests}
              changeChat={handleChatChange}
              socket={socket.current} // pass socket instance here
            />
          </div>

          {/* Right Content */}
          <div className="col-md-9 p-0">
            {currentChat === undefined ? (
              <Welcome currentUser={currentUser} />
            ) : (
              <ChatContainer currentChat={currentChat} socket={socket} />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #131324;
`;
