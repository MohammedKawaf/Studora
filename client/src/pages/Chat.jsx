import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import translations from "../translations";
import socket from "../services/socket";

function Chat() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const messagesEndRef = useRef(null);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUser(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/messages/unread", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUnreadCounts(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchConversation = async (friend) => {
    try {
      setSelectedFriend(friend);

      const token = localStorage.getItem("token");

      const response = await api.get(`/messages/${friend._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(response.data);

      await api.put(
        `/messages/read/${friend._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUnreadCounts((prevCounts) => ({
        ...prevCounts,
        [friend._id]: 0,
      }));

      window.dispatchEvent(new Event("unreadMessagesUpdated"));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedFriend || !messageContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/messages",
        {
          receiverId: selectedFriend._id,
          content: messageContent.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prevMessages) => [...prevMessages, response.data]);
      socket.emit("sendMessage", response.data);

      socket.emit("stopTyping", {
        senderId: currentUser._id,
        receiverId: selectedFriend._id,
      });

      setMessageContent("");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(`/messages/${messageToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageToDelete ? response.data : message
        )
      );

      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleStartEdit = (message) => {
    setEditingMessageId(message._id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/messages/${messageId}`,
        {
          content: editingContent.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId ? response.data : message
        )
      );

      setEditingMessageId(null);
      setEditingContent("");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const canEditMessage = (message) => {
    const createdAt = new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return Date.now() - createdAt <= fiveMinutes;
  };

  const handleTyping = (e) => {
    const value = e.target.value;

    setMessageContent(value);

    if (!selectedFriend || !currentUser) {
      return;
    }

    if (value.trim()) {
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedFriend._id,
        username: currentUser.username,
      });
    } else {
      socket.emit("stopTyping", {
        senderId: currentUser._id,
        receiverId: selectedFriend._id,
      });
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchCurrentUser();
    fetchUnreadMessages();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    socket.emit("userOnline", currentUser._id);

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit("userOffline", currentUser._id);
      socket.off("onlineUsers");
    };
  }, [currentUser]);

  useEffect(() => {
    socket.on("receiveMessage", async (newMessage) => {
      if (selectedFriend && newMessage.sender._id === selectedFriend._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
          const token = localStorage.getItem("token");

          await api.put(
            `/messages/read/${selectedFriend._id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setUnreadCounts((prevCounts) => ({
            ...prevCounts,
            [selectedFriend._id]: 0,
          }));

          window.dispatchEvent(new Event("unreadMessagesUpdated"));
        } catch (error) {
          console.log(error.response?.data || error.message);
        }
      } else {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [newMessage.sender._id]: (prevCounts[newMessage.sender._id] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedFriend]);

  useEffect(() => {
    socket.on("userTyping", (data) => {
      if (selectedFriend && data.senderId === selectedFriend._id) {
        setTypingUser(data.username);
      }
    });

    socket.on("userStoppedTyping", (data) => {
      if (selectedFriend && data.senderId === selectedFriend._id) {
        setTypingUser("");
      }
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>{t.chat}</h1>
          <p>{t.chatSubtitle}</p>
        </section>

        <section className="card">
          <h2>{t.directMessages}</h2>

          <div className="chat-layout">
            <div className="chat-sidebar">
              <h3>{t.yourFriends}</h3>

              {friends.length === 0 ? (
                <p>{t.noFriendsYet}</p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend._id}
                    className="chat-friend-button"
                    onClick={() => fetchConversation(friend)}
                  >
                    {friend.profileImage ? (
                      <img
                        src={`http://localhost:5000${friend.profileImage}`}
                        alt={friend.username}
                        className="chat-avatar"
                      />
                    ) : (
                      <span className="chat-avatar-letter">
                        {friend.username.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <span>
                      {onlineUsers.includes(friend._id) ? "🟢 " : "⚪ "}
                      {friend.username}

                      {unreadCounts[friend._id] > 0 && (
                        <span className="unread-badge">
                          {unreadCounts[friend._id]}
                        </span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="chat-window">
              {!selectedFriend ? (
                <p>{t.selectFriendToChat}</p>
              ) : (
                <>
                  <h3>{selectedFriend.username}</h3>

                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <p>{t.noMessagesYet}</p>
                    ) : (
                      messages.map((message) => {
                        const isMyMessage =
                          currentUser && message.sender._id === currentUser._id;

                        return (
                          <div
                            key={message._id}
                            className={`message-row ${
                              isMyMessage ? "my-row" : "friend-row"
                            }`}
                          >
                            <div
                              className={`chat-message ${
                                isMyMessage ? "my-message" : "friend-message"
                              }`}
                            >
                              {message.isDeleted ? (
                                <span className="deleted-message">
                                  {t.messageDeleted ||
                                    "Message has been deleted"}
                                </span>
                              ) : editingMessageId === message._id ? (
                                <div className="edit-message-box">
                                  <input
                                    type="text"
                                    value={editingContent}
                                    onChange={(e) =>
                                      setEditingContent(e.target.value)
                                    }
                                  />

                                  <div className="message-controls">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveEdit(message._id)
                                      }
                                    >
                                      {t.save}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                    >
                                      {t.cancel}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span>{message.content}</span>

                                  {message.isEdited && (
                                    <small className="edited-label">
                                      ({t.edited || "edited"})
                                    </small>
                                  )}
                                </>
                              )}
                            </div>

                            {isMyMessage &&
                              !message.isDeleted &&
                              editingMessageId !== message._id && (
                                <div className="message-controls">
                                  {canEditMessage(message) && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(message)}
                                    >
                                      ✏️
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMessageToDelete(message._id);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                          </div>
                        );
                      })
                    )}

                    <div ref={messagesEndRef}></div>
                  </div>

                  {typingUser && (
                    <p className="typing-indicator">
                      {typingUser} {t.isTyping || "is typing..."}
                    </p>
                  )}

                  <form onSubmit={handleSendMessage} className="chat-form">
                    <input
                      type="text"
                      placeholder={t.writeMessage}
                      value={messageContent}
                      onChange={handleTyping}
                    />

                    <button type="submit">{t.send}</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>🗑️ {t.deleteMessage}</h2>

              <p>{t.confirmDeleteMessage}</p>

              <div className="confirm-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMessageToDelete(null);
                  }}
                >
                  {t.cancel}
                </button>

                <button
                  className="danger-button"
                  onClick={handleDeleteMessage}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Chat;