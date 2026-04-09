import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../../../Style/Chatbot.css";

function formatTime(d) {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const welcomeMessage = {
  id: crypto.randomUUID(),
  role: "assistant",
  text: "Hi! I am RAZ, your shopping assistant. I can help with orders, shipping updates, and product questions.",
  createdAt: new Date(),
};

export default function ChatWidget({ botName = "RAZ Assistant" }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);

  const listRef = useRef(null);
  const textareaRef = useRef(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isTyping,
    [input, isTyping],
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, open, isTyping]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = `${Math.min(120, ta.scrollHeight)}px`;
  }, [input]);

  async function sendMessage(userMessage) {
    const userMsgObj = {
      id: crypto.randomUUID(),
      role: "user",
      text: userMessage,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const text = typeof data === "string" ? data : data?.response || data?.message || "I am here to help.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    sendMessage(input);
  }

  function onKeyDownTextarea(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!canSend) return;
      sendMessage(input);
    }
  }

  const trackOrder = async () => {
    if (!trackingId.trim()) return;
    try {
      const id = trackingId.trim().toLowerCase();
      setTrackingId("");
      setShowTrackInput(false);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          text: `Track order: ${id.toUpperCase()}`,
          createdAt: new Date(),
        },
      ]);

      const res = await axios.get(
        `http://localhost:3000/orders/getUserOrdersforChatbot/${id}`,
      );
      const orders = res.data;

      if (!orders || orders.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: "No orders found for that ID. Please check the ID and try again.",
            createdAt: new Date(),
          },
        ]);
        return;
      }

      const trackingInfo = orders
        .map((order) => {
          const items = order.cart?.map((item) => item.name).join(", ") || "No items";
          return `Order #${order._id.slice(-6).toUpperCase()}\nStatus: ${order.Status}\nDate: ${order.date}\nTotal: Rs. ${order.Total}\nItems: ${items}`;
        })
        .join("\n\n");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Here are your recent orders:\n\n${trackingInfo}`,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error tracking order:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, I could not fetch your orders right now. Please try again in a moment.",
          createdAt: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="cw-root">
      <div className={`cw-panel-wrap ${open ? "cw-panel-wrap-open" : ""}`}>
        <section id="chat-panel" role="dialog" aria-label={`${botName} chat`} className="cw-panel">
          <header className="cw-header">
            <div className="cw-header-left">
              <div className="cw-avatar-wrap">
                <span className="cw-avatar">R</span>
                <span className="cw-online-dot" />
              </div>
              <div>
                <h3>{botName}</h3>
                <p>Online now</p>
              </div>
            </div>

            <button type="button" onClick={() => setOpen(false)} className="cw-close-btn" aria-label="Close chat">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </header>

          <div className="cw-tool-row">
            {!showTrackInput ? (
              <button type="button" className="cw-track-chip" onClick={() => setShowTrackInput(true)}>
                Track an order
              </button>
            ) : (
              <div className="cw-track-box">
                <p>Enter 6-character order ID</p>
                <div className="cw-track-controls">
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && trackOrder()}
                    placeholder="e.g. A3B2C1"
                    maxLength={6}
                    autoFocus
                  />
                  <button type="button" onClick={trackOrder} disabled={!trackingId.trim()} className="cw-track-submit">
                    Track
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTrackInput(false);
                      setTrackingId("");
                    }}
                    className="cw-track-cancel"
                    aria-label="Cancel tracking"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={listRef} className="cw-messages">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <article key={message.id} className={`cw-msg-row ${isUser ? "cw-msg-row-user" : ""}`}>
                  {!isUser && <span className="cw-msg-avatar">R</span>}
                  <div className="cw-msg-content">
                    <div className={`cw-bubble ${isUser ? "cw-bubble-user" : "cw-bubble-assistant"}`}>
                      {message.text}
                    </div>
                    <time className={`cw-msg-time ${isUser ? "cw-msg-time-user" : ""}`}>
                      {formatTime(message.createdAt)}
                    </time>
                  </div>
                </article>
              );
            })}

            {isTyping && (
              <article className="cw-msg-row">
                <span className="cw-msg-avatar">R</span>
                <div className="cw-msg-content">
                  <div className="cw-bubble cw-bubble-assistant cw-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}
          </div>

          <form onSubmit={onSubmit} className="cw-composer">
            <div className="cw-composer-inner">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDownTextarea}
                placeholder="Type your message"
                maxLength={1200}
              />

              <button type="submit" disabled={!canSend} className="cw-send-btn" aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="cw-footnote">Powered by RAZ AI</p>
          </form>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="chat-panel"
        className="cw-fab"
        title={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}