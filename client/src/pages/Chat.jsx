import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import translations from "../translations";

function Chat() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");

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
      setMessageContent("");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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

                    <span>{friend.username}</span>
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
                      messages.map((message) => (
                        <div key={message._id} className="chat-message">
                          <strong>{message.sender.username}: </strong>
                          <span>{message.content}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="chat-form">
                    <input
                      type="text"
                      placeholder={t.writeMessage}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
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