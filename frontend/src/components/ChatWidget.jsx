import { useState, useRef, useEffect } from "react";

//prompt for ai
const SYSTEM_PROMPT = `You are a friendly AI assistant for MediQueue, a smart healthcare clinic system. You help patients and visitors with:
- Clinic information (hours, location, contact)
- Available services and specializations
- Doctor schedules and availability
- Appointment booking guidance
- General health FAQs

Keep answers concise, warm, and helpful. If asked something outside clinic topics, politely redirect.

Clinic details:
- Name: MediQueue — Smart Healthcare Availability
- Tagline: "Skip the Wait, Get the Care"
- Hours: Mon–Fri 9AM–5PM | Sat-Sun Closed
- Services: Cardiology Diagnostic, Dental Cleaning & Exam, General Consultation, Pediatric Checkup, Standard Eye Assessment
- Appointments: can be booked online via the Register/Login page
- Location: Regalado Road, Quezon City
- Contact: smarthealthcare@gmail.com +639999046290
- Doctor: Dr. Sarah Johnson for General Medicine, Dr. Michael Chen forCardiology Dr. Emily Rodriguez for Pediatrics, Dr. David Smith for General Practice, Dr. James Wilson for General Practice`;

const QUICK_REPLIES = [
  "What are your hours?",
  "What services do you offer?",
  "How do I book an appointment?",
  "Where are you located?",
  "pogi ba si marky?",
];

function Avatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "#E1F5EE", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden"
    }}>
      <img src="/Ailogo.png" onError={(e) => { e.target.onerror = null; e.target.src = '/AiLogo.png'; }} alt="AI Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <Avatar />
      <div style={getBubbleStyle("bot")}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
          {[0, 200, 400].map((d) => (
            <span key={d} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#888", display: "inline-block",
              animation: "mq-blink 1.2s infinite",
              animationDelay: `${d}ms`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function getBubbleStyle(role) {
  return {
    maxWidth: "80%", padding: "9px 12px",
    borderRadius: role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
    fontSize: 13, lineHeight: 1.6,
    background: role === "user" ? "#0F6E56" : "#f0f4f2",
    color: role === "user" ? "#fff" : "#1a1a1a",
    border: role === "user" ? "none" : "0.5px solid #d4e4de",
    wordBreak: "break-word",
    whiteSpace: "pre-line",
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(() => localStorage.getItem("hideAiWidget") !== "true");
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hi! I'm the MediQueue assistant. I can help you with clinic info, services, schedules, and appointments. How can I help?" },
  ]);
  const [history, setHistory] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleStorage = () => setIsVisible(localStorage.getItem("hideAiWidget") !== "true");
    window.addEventListener("storage", handleStorage);
    window.addEventListener("aiWidgetToggled", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("aiWidgetToggled", handleStorage);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  if (!isVisible) return null;

  const send = async (text) => {
    const message = (text || inputVal).trim();
    if (!message || loading) return;
    setInputVal("");
    setShowQuick(false);

    const userMsg = { role: "user", content: message };
    const newHistory = [...history, userMsg];
    setMsgs((prev) => [...prev, userMsg]);
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response. Please try again.";

      const assistantMsg = { role: "assistant", content: reply };
      setMsgs((prev) => [...prev, assistantMsg]);
      setHistory((prev) => [...prev, assistantMsg]);
    } catch {
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: res?.status === 429
      ? "Too many messages! Please wait a moment before trying again."
      : "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes mq-blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @keyframes mq-slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .mq-panel { animation: mq-slideUp 0.2s ease; }
        .mq-input:focus { outline: none; border-color: #0F6E56 !important; box-shadow: none !important; }
        .mq-fab:hover { background: #085041 !important; transform: scale(1.06); }
        .mq-send:hover:not(:disabled) { background: #085041 !important; }
        .mq-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .mq-quick:hover { background: #0F6E56 !important; color: #fff !important; border-color: #0F6E56 !important; }
      `}</style>

      <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>

        {open && (
          <div className="mq-panel" style={{
            width: 340, background: "#fff",
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            border: "0.5px solid #d4e4de",
            display: "flex", flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ background: "#0F6E56", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#fff", margin: 0 }}>MediQueue Assistant</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>● Online — here to help</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", padding: 4, display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ padding: 12, overflowY: "auto", maxHeight: 320, minHeight: 200, display: "flex", flexDirection: "column", gap: 10, background: "#fafcfb" }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  {m.role === "assistant" && <Avatar />}
                  <div style={getBubbleStyle(m.role)}>{m.content}</div>
                </div>
              ))}

              {loading && <TypingIndicator />}

              {/* Quick replies */}
              {showQuick && !loading && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      className="mq-quick"
                      onClick={() => send(q)}
                      style={{
                        fontSize: 11, padding: "5px 10px",
                        borderRadius: 20, border: "0.5px solid #0F6E56",
                        background: "#fff", color: "#0F6E56",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 12px", display: "flex", gap: 8, alignItems: "center", borderTop: "0.5px solid #d4e4de", background: "#fff" }}>
              <input
                className="mq-input"
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about our clinic..."
                style={{
                  flex: 1, fontSize: 13, padding: "8px 12px",
                  borderRadius: 20, border: "0.5px solid #d4e4de",
                  background: "#f5f8f6", color: "#1a1a1a",
                }}
              />
              <button
                className="mq-send"
                onClick={() => send()}
                disabled={loading || !inputVal.trim()}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#0F6E56", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.2s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className="mq-fab"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open chat"}
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: open ? "#0F6E56" : "#E1F5EE", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,110,86,0.35)",
            transition: "transform 0.2s, background 0.2s",
            padding: open ? undefined : 0,
          }}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <img src="/Ailogo.png" onError={(e) => { e.target.onerror = null; e.target.src = '/AiLogo.png'; }} alt="AI Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </button>
      </div>
    </>
  );
}