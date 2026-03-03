import { useContext, useEffect, useMemo, useRef, useState } from "react";
import CartContext from "../../Context/CartContext";
import axios from "axios";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(d) {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function ChatWidget({
  botName = "RAZ Assistant",
  panelWidth = "sm:w-[400px] w-[calc(100vw-2rem)]",
  panelHeight = "sm:h-[560px] h-[70vh] max-h-[680px]",
  positionClass = "bottom-6 right-6",
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const { user } = useContext(CartContext);
  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Hi! 👋 I'm RAZ, your shopping assistant. I can help with orders, shipping, and product questions.",
      createdAt: new Date(),
    },
  ]);

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
    ta.style.height = Math.min(120, ta.scrollHeight) + "px";
  }, [input]);

  async function sendMessage(userMessage) {
    const userMsgObj = {
      id: Date.now(),
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

      const aiMsgObj = {
        id: Date.now() + 1,
        role: "ai",
        text: data,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
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
      const res = await axios.get(
        `http://localhost:3000/orders/getUserOrdersforChatbot/${id}`,
      );
      const orders = res.data;

      if (!orders || orders.length === 0) {
        const aiMsgObj = {
          id: Date.now() + 2,
          role: "ai",
          text: "You don't have any orders yet. Start shopping to place your first order!",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsgObj]);
        return;
      }

      const trackingInfo = orders
        .map((order) => {
          const items = order.cart.map((item) => item.name).join(", ");
          return `📦 Order #${order._id.slice(-6).toUpperCase()}\n   Status: ${order.Status}\n   Date: ${order.date}\n   Total: ₹${order.Total}\n   Items: ${items}`;
        })
        .join("\n\n");

      const aiMsgObj = {
        id: Date.now() + 2,
        role: "ai",
        text: `Here are your recent orders:\n\n${trackingInfo}`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error("Error tracking order:", err);
      const aiMsgObj = {
        id: Date.now() + 2,
        role: "ai",
        text: "Sorry, I couldn't fetch your orders. Please try again later.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    }
  };

  return (
    <div className={cn("fixed z-50 pointer-events-none", positionClass)}>
      <div className="flex flex-col items-end gap-3">
        {/* Chat Panel */}
        <div
          id="chat-panel"
          role="dialog"
          aria-label={`${botName} chat`}
          className={cn(
            "origin-bottom-right transition-all duration-300 ease-out",
            open
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none",
          )}
        >
          <div
            className={cn(
              "bg-white rounded-2xl overflow-hidden flex flex-col",
              panelWidth,
              panelHeight,
            )}
            style={{
              boxShadow:
                "0 25px 60px -12px rgba(147, 51, 234, 0.25), 0 0 0 1px rgba(147, 51, 234, 0.08)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                    }}
                  >
                    R
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
                    style={{ background: "#22c55e" }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-white text-[15px]">
                    {botName}
                  </div>
                  <div
                    className="text-[11px] font-medium"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    ● Online — typically replies instantly
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                aria-label="Close chat"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
              style={{
                background: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
              }}
            >
              {messages.map((m) => {
                const isUser = m.role === "user";

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-2",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {/* Bot avatar */}
                    {!isUser && (
                      <div
                        className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-1"
                        style={{
                          background:
                            "linear-gradient(135deg, #9333ea, #c026d3)",
                          color: "#fff",
                        }}
                      >
                        R
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div
                        className="text-[13.5px] leading-relaxed px-4 py-2.5"
                        style={
                          isUser
                            ? {
                                background:
                                  "linear-gradient(135deg, #7c3aed, #9333ea)",
                                color: "#fff",
                                borderRadius: "18px 18px 4px 18px",
                                boxShadow: "0 2px 8px rgba(147, 51, 234, 0.25)",
                              }
                            : {
                                background: "#fff",
                                color: "#1f2937",
                                borderRadius: "18px 18px 18px 4px",
                                border: "1px solid #e9d5ff",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                              }
                        }
                      >
                        {m.text}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-[10px] font-medium px-1",
                          isUser
                            ? "text-right text-gray-400"
                            : "text-left text-gray-400",
                        )}
                      >
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div
                    className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-1"
                    style={{
                      background: "linear-gradient(135deg, #9333ea, #c026d3)",
                      color: "#fff",
                    }}
                  >
                    R
                  </div>
                  <div
                    className="px-4 py-3 flex items-center gap-1.5"
                    style={{
                      background: "#fff",
                      borderRadius: "18px 18px 18px 4px",
                      border: "1px solid #e9d5ff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Track Order Section */}
            <div className="mt-4">
              {!showTrackInput ? (
                <button
                  onClick={() => setShowTrackInput(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(147, 51, 234, 0.25)",
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Track an Order
                </button>
              ) : (
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    background: "#fff",
                    border: "1px solid #e9d5ff",
                    boxShadow: "0 2px 8px rgba(147, 51, 234, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-purple-700">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Enter your 6-character Order ID
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) =>
                        setTrackingId(e.target.value.slice(0, 6))
                      }
                      onKeyDown={(e) => e.key === "Enter" && trackOrder()}
                      placeholder="e.g. A3B2C1"
                      maxLength={6}
                      className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                      autoFocus
                    />
                    <button
                      onClick={trackOrder}
                      disabled={!trackingId.trim()}
                      className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
                      style={{
                        background: trackingId.trim()
                          ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                          : "#f3e8ff",
                        color: trackingId.trim() ? "#fff" : "#c4b5fd",
                        cursor: trackingId.trim() ? "pointer" : "not-allowed",
                        boxShadow: trackingId.trim()
                          ? "0 2px 6px rgba(147,51,234,0.3)"
                          : "none",
                      }}
                    >
                      Track
                    </button>
                    <button
                      onClick={() => {
                        setShowTrackInput(false);
                        setTrackingId("");
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Cancel"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
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
            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="px-4 py-3"
              style={{ borderTop: "1px solid #f3e8ff", background: "#fefcff" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl"
                style={{
                  border: "1.5px solid #e9d5ff",
                  background: "#fff",
                  padding: "4px 4px 4px 14px",
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDownTextarea}
                  placeholder="Type your message…"
                  className="flex-1 resize-none bg-transparent text-[13.5px] text-gray-800 placeholder:text-gray-400 focus:outline-none py-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    maxHeight: "120px",
                  }}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="shrink-0 rounded-lg p-2.5 transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: canSend
                      ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                      : "#f3e8ff",
                    color: canSend ? "#fff" : "#c4b5fd",
                    cursor: canSend ? "pointer" : "not-allowed",
                    boxShadow: canSend
                      ? "0 2px 8px rgba(147,51,234,0.3)"
                      : "none",
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] font-medium text-gray-300">
                  Powered by RAZ AI
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Floating button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="chat-panel"
          className="h-14 w-14 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none pointer-events-auto"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)",
            boxShadow:
              "0 8px 24px rgba(147, 51, 234, 0.4), 0 0 0 4px rgba(147, 51, 234, 0.1)",
          }}
          title={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <svg
              className="h-6 w-6 transition-transform duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
