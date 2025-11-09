import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiX } from "react-icons/fi";

const bubbleCommon =
  "max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-wrap";
const botBubble = `${bubbleCommon} bg-[#23272e] text-white`;
const userBubble = `${bubbleCommon} bg-red-600 text-white ml-auto`;

// ⬇️ *** ADDED: Contact details from your HelpPage.jsx ***
const CONTACT_DETAILS = `
Here are our contact details. Please reach out if you need assistance!

📞 **Phone:**
+91 9824530881

✉️ **Email:**
mech2door123@gmail.com

📍 **Address:**
Indore, Madhya Pradesh
`.trim();
// --- End of new constant ---

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me about your bookings or anything else. You can also type 'help' or 'contact' for support details." },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // ⬇️ *** ADDED: Local check for 'help' or 'contact' ***
    const lowerCaseText = text.toLowerCase();
    if (lowerCaseText === "help" || lowerCaseText === "contact") {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: CONTACT_DETAILS }
      ]);
      return; // <-- Important: Stops the API call from running
    }
    // --- End of new check ---

    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const email = stored?.email || "";

    try {
      const res = await fetch("http://localhost:5000/api/chat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat error");

      if (data.type === "APP_DATA") {
        const pretty =
          Array.isArray(data.data)
            ? data.data.map((b, i) =>
                `#${i + 1} ${b.mechanicName} • ${b.date} ${b.time} • ${b.location} • ${b.price ?? ""}`
              ).join("\n")
            : Object.entries(data.data)
                .map(([k, v]) => `${k}: ${v ?? ""}`)
                .join("\n");
        setMessages(prev => [
          ...prev,
          { role: "bot", text: `${data.reply}\n\n${pretty || ""}`.trim() },
        ]);
      } else {
        setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: `Sorry, something went wrong: ${err.message}` },
      ]);
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-4 shadow-lg"
        aria-label="Open chat"
      >
        {open ? <FiX/> : <FiMessageSquare/>}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-20 right-5 z-50 w-[92vw] max-w-[360px] h-[60vh] bg-[#1b1f27] border border-[#343841] rounded-xl shadow-xl overflow-hidden transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-[#343841] text-white font-semibold">
            Assistant
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex" : "flex"}>
                <div className={m.role === "user" ? userBubble : botBubble}>
                  {/* ⬇️ Use dangerouslySetInnerHTML to render line breaks and bold text */}
                  <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t border-[#343841] flex gap-2">
            <input
              className="flex-1 bg-[#23272e] text-white px-3 py-2 rounded outline-none"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 rounded"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}