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
  const messagesEndRef = useRef(null);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUnreadCounts(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

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

  const fetchConversation = async (friend) => {
    try {
      setSelectedFriend(friend);

      const token = localStorage.getItem("token");

      const response = await api.get(`/messages/${friend._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(response.data);

      await api.put(
        `/messages/read/${friend._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCounts((prevCounts) => ({
        ...prevCounts,
        [friend._id]: 0,
      }));
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages([...messages, response.data]);
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
    socket.on("receiveMessage", async (newMessage) => {
      if (selectedFriend && newMessage.sender._id === selectedFriend._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
          const token = localStorage.getItem("token");

          await api.put(
            `/messages/read/${selectedFriend._id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUnreadCounts((prevCounts) => ({
            ...prevCounts,
            [selectedFriend._id]: 0,
          }));
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
                          currentUser &&
                          message.sender._id === currentUser._id;

                        return (
                          <div
                            key={message._id}
                            className={`chat-message ${
                              isMyMessage ? "my-message" : "friend-message"
                            }`}
                          >
                            <span>{message.content}</span>
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
      </main>
    </div>
  );
}

export default Chat;