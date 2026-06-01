import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Message {
  type: "user" | "ai";
  text: string;
}

export default function TempleCenter() {

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: "user", text: input };

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/reflections",
        { text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage: Message = {
        type: "ai",
        text: response.data.data.ai.reflection,
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);

    } catch (error) {
      console.log(error);
      setMessages((prev) => [...prev, userMessage]);
    }

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex-1 h-screen px-24 py-12 flex flex-col overflow-hidden bg-[#f5f1e8]">

      {/* GREETING */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center mt-16">
          <h1 className="heading-font text-[6rem] leading-none text-[#2f281f]">
            Hello {localStorage.getItem("username")}
          </h1>
          <p className="mt-10 text-4xl text-[#6d604d] leading-relaxed max-w-[900px]">
            What made you look for yourself today?
          </p>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto pr-4 mt-10 min-h-0">
        <div className="w-full max-w-[1150px] mx-auto space-y-10 pb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[42%] px-5 py-4 rounded-[2rem] text-[1.1rem] leading-[1.9] whitespace-pre-wrap ${
                  msg.type === "user"
                    ? "bg-[#e5dccd] text-[#2f281f]"
                    : "bg-[#f1ebdf] text-[#6c5f4d] italic"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="shrink-0 pt-4 pb-8 flex justify-center">
        <div className="w-[900px] border border-[#d7cab6] rounded-[2rem] px-8 py-5 bg-[#efe7d8] flex items-end gap-4">
          <textarea
            ref={textareaRef}
            placeholder="Write what's on your mind..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="w-full bg-transparent text-[1.5rem] text-[#2f281f] placeholder:text-[#8f816f] outline-none border-none resize-none overflow-y-auto leading-relaxed max-h-[200px]"
          />
          <button
            onClick={handleSend}
            className="text-[#5f5444] text-[1.4rem] hover:text-[#2f281f] transition shrink-0 mb-1"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}