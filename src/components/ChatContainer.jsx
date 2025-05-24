import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  sendMessageRoute,
  recieveMessageRoute,
  editMessageRoute,
  deleteMessageRoute,
} from "../utils/APIRoutes";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));

  const canModify = (timestamp) => {
    const sent = new Date(timestamp);
    const now = new Date();
    const diffMin = (now - sent) / (1000 * 60);
    return diffMin <= 10;
  };

  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const { data } = await axios.post(recieveMessageRoute, {
        from: storedUser._id,
        to: currentChat._id,
      });
      setMessages(data.status ? data.messages : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentChat]);

  const handleSendMsg = async (msgText) => {
    try {
      const { data } = await axios.post(sendMessageRoute, {
        from: storedUser._id,
        to: currentChat._id,
        message: msgText,
      });
  
      if (data.status && data.message) {
        // Emit AFTER getting full data with _id, createdAt, etc.
        socket.current.emit("send-msg", {
          to: currentChat._id,
          from: storedUser._id,
          msg: data.message.message,
        });
  
        setMessages((prev) => [...prev, data.message]); // ✅ Use message from server
      }
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  

  const handleEdit = async (msgObj) => {
    console.log(msgObj);
    const newText = prompt("Edit your message:", msgObj.message);
    if (!newText || newText === msgObj.message) return;

    try {
      await axios.put(editMessageRoute, {
        messageId: msgObj._id,
        message: newText,
        userId: storedUser._id,
        to: currentChat._id,
      });

      socket.current.emit("message-edited", {
        messageId: msgObj._id,
        newMessage: newText,
        to: currentChat._id,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgObj._id ? { ...m, message: newText } : m
        )
      );
    } catch (err) {
      console.error("Error editing message:", err);
      alert("Could not edit message. Try again.");
    }
  };

  const handleDelete = async (msgObj) => {
    console.log(msgObj);
    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(deleteMessageRoute, {
        data: {
          messageId: msgObj._id,
          userId: storedUser._id,
          to: currentChat._id,
        },
      });

      socket.current.emit("message-deleted", {
        messageId: msgObj._id,
        to: currentChat._id,
      });

      setMessages((prev) => prev.filter((m) => m._id !== msgObj._id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Could not delete message. Try again.");
    }
  };

  // Handle incoming socket events
  useEffect(() => {
    if (!socket.current) return;
    const socketInstance = socket.current;

    const onMsg = (msg) => {
      setMessages((prev) => [...prev, { ...msg, fromSelf: false }]);
    };

    const onEdit = ({ messageId, newMessage }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, message: newMessage } : m))
      );
    };

    const onDelete = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const onTyping = ({ from }) => {
      if (from === currentChat._id) setIsTyping(true);
    };

    const onStopTyping = ({ from }) => {
      if (from === currentChat._id) setIsTyping(false);
    };

    socketInstance.on("msg-recieve", onMsg);
    socketInstance.on("msg-edited", onEdit);
    socketInstance.on("msg-deleted", onDelete);
    socketInstance.on("typing", onTyping);
    socketInstance.on("stop-typing", onStopTyping);

    return () => {
      socketInstance.off("msg-recieve", onMsg);
      socketInstance.off("msg-edited", onEdit);
      socketInstance.off("msg-deleted", onDelete);
      socketInstance.off("typing", onTyping);
      socketInstance.off("stop-typing", onStopTyping);
    };
  }, [socket.current, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-white">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between bg-dark text-white px-3"
        style={{ height: 60, flexShrink: 0 }}
      >
        <div className="d-flex align-items-center">
          <img
            src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
            alt="avatar"
            className="rounded-circle"
            style={{ width: 40, height: 40, border: "2px solid #fff" }}
          />
          <h5 className="ms-3 mb-0">{currentChat.username}</h5>
        </div>
        <button className="btn btn-outline-light" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto bg-light bg-opacity-10 p-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`d-flex mb-2 ${m.fromSelf ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-3 ${
                m.fromSelf ? "bg-primary text-white" : "bg-white text-dark"
              }`}
              style={{ maxWidth: "70%", wordBreak: "break-word" }}
            >
              {m.message}
              {m.fromSelf && canModify(m.createdAt) && (
                <div className="mt-1 text-end">
                  <button
                    className="btn btn-sm btn-light me-1"
                    onClick={() => handleEdit(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(m)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 text-muted fst-italic small" style={{ minHeight: 20 }}>
          {currentChat.username} is typing...
        </div>
      )}

      {/* Chat Input */}
      <div className="border-top px-3 py-2" style={{ flexShrink: 0 }}>
        <ChatInput
          handleSendMsg={handleSendMsg}
          socket={socket}
          currentChat={currentChat}
          storedUser={storedUser}
        />
      </div>
    </div>
  );
}
