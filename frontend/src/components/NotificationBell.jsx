import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Auto refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "transparent",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "44px",
            width: "320px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid #eee",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "15px" }}>
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0066cc",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{ padding: "24px", textAlign: "center", color: "#888" }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.is_read && handleMarkAsRead(n._id)}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    background: n.is_read ? "white" : "#f0f7ff",
                    cursor: n.is_read ? "default" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: n.is_read ? "normal" : "bold",
                        fontSize: "14px",
                      }}
                    >
                      {n.type === "booking" ? "🔔" : "📢"} {n.title}
                    </p>
                    {!n.is_read && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#0066cc",
                          borderRadius: "50%",
                          display: "inline-block",
                          flexShrink: 0,
                          marginTop: "4px",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      color: "#555",
                    }}
                  >
                    {n.message}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "11px",
                      color: "#aaa",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
