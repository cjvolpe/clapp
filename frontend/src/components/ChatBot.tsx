import {useEffect, useRef, useState} from "react";
import {BACKEND_URL, type ChatMessage} from "../lib/types.ts";
import "../pages/styles/chatbot.css";

const INTRO: ChatMessage = {
    role: "assistant",
    content: "Hi! I'm Clappy. Ask me about climbing or how to use Clapp."
};

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const send = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const nextMessages: ChatMessage[] = [...messages, {role: "user", content: trimmed}];
        setMessages(nextMessages);
        setInput("");
        setSending(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({messages: nextMessages}),
            });
            const data = await response.json();
            if (data.success) {
                setMessages([...nextMessages, {role: "assistant", content: data.data.reply}]);
            } else {
                const msg = data.message || data.error || "Chatbot is unavailable.";
                setError(msg);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error");
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className={`chatbot ${open ? "open" : ""}`}>
            {open && (
                <div className={"chatbot-panel"}>
                    <div className={"chatbot-header"}>
                        <span>Clappy</span>
                        <button
                            type="button"
                            aria-label="Close chat"
                            className={"chatbot-close"}
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <div className={"chatbot-messages"} ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`chatbot-message ${m.role}`}>
                                {m.content}
                            </div>
                        ))}
                        {sending && (
                            <div className={"chatbot-message assistant chatbot-typing"}>…</div>
                        )}
                        {error && (
                            <div className={"chatbot-error"}>{error}</div>
                        )}
                    </div>
                    <div className={"chatbot-input-row"}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask a climbing question…"
                            disabled={sending}
                        />
                        <button
                            type="button"
                            className={"chatbot-send"}
                            onClick={send}
                            disabled={sending || !input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
            <button
                type="button"
                aria-label={open ? "Close chat" : "Open chat"}
                className={"chatbot-toggle"}
                onClick={() => setOpen(v => !v)}
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                )}
            </button>
        </div>
    );
}
