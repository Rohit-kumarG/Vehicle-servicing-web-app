import { useEffect, useRef, useState } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { chatService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function ChatPanel({ bookingId, garageName, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Setup polling for chat sync
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await chatService.getMessages(bookingId);
      if (res.data && res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load chat", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");

    try {
      const res = await chatService.sendMessage({
        booking_id: bookingId,
        content: textToSend,
      });
      if (res.data && res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chat-panel-overlay">
      <div className="chat-panel-card">
        <header className="chat-panel-header">
          <div className="chat-title-group">
            <MessageSquare size={18} className="chat-icon-accent" />
            <div>
              <h3>Chat with {user.role === "customer" ? garageName : "Customer"}</h3>
              <small>Booking Ref: #{bookingId.slice(-6).toUpperCase()}</small>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close Chat">
            <X size={18} />
          </button>
        </header>

        <div className="chat-messages-container">
          {loading && messages.length === 0 ? (
            <div className="chat-loader">Connecting secure chat...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <MessageSquare size={36} />
              <p>No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user._id;
              return (
                <div
                  key={msg._id}
                  className={`chat-message-bubble-row ${isMe ? "me" : "them"}`}
                >
                  <div className="chat-message-bubble">
                    <p className="chat-message-text">{msg.content}</p>
                    <span className="chat-message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            required
          />
          <button type="submit" className="chat-send-btn" aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
