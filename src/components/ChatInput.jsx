import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, socket, currentChat, storedUser }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef();
  const typingTimeoutRef = useRef(null);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emojiObject) => {
    setMsg((prev) => prev + emojiObject.emoji);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg);
      setMsg("");
      setShowEmojiPicker(false);
      emitStopTyping(); // stop typing once sent
    }
  };

  const emitTyping = () => {
    if (!socket || !socket.current || !currentChat || !storedUser) return;
    socket.current.emit("typing", {
      to: currentChat._id,
      from: storedUser._id,
    });

    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 1500);
  };

  const emitStopTyping = () => {
    if (!socket || !socket.current || !currentChat || !storedUser) return;
    socket.current.emit("stop-typing", {
      to: currentChat._id,
      from: storedUser._id,
    });
  };

  const handleInputChange = (e) => {
    setMsg(e.target.value);
    emitTyping();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        emojiRef.current &&
        !emojiRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="d-flex justify-content-between align-items-center p-3 position-relative">
      {/* Emoji Button Container */}
      <div className="d-flex align-items-center gap-3">
        <div className="position-relative" ref={emojiRef}>
          <BsEmojiSmileFill
            onClick={toggleEmojiPicker}
            className="text-warning fs-3"
            style={{ cursor: "pointer" }}
          />
          {showEmojiPicker && (
            <div className="position-absolute top-100 start-0 z-index-10">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Form */}
      <form className="d-flex align-items-center w-100" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message here"
          value={msg}
          onChange={handleInputChange}
          className="form-control text-blue border-0 p-3 ms-3 rounded-pill fs-5"
          style={{ width: "90%" }}
        />
        <button
          type="submit"
          className="btn btn-primary ms-3 rounded-pill p-3"
          aria-label="Send message"
        >
          <IoMdSend className="text-blue fs-2" />
        </button>
      </form>
    </div>
  );
}
