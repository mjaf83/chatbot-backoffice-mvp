"use client";

import { useState } from "react";
import { sendMessage, ChatMessage } from "@/lib/api";
import { Send, Bot, User, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<string[]>([]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setSources([]);

        try {
            // Pass history excluding the latest user message we just added locally for display, 
            // but usually endpoint expects full history. For now sending empty history as per schema default.
            const data = await sendMessage(userMsg.content, messages);

            const botMsg: ChatMessage = { role: "assistant", content: data.response };
            setMessages((prev) => [...prev, botMsg]);
            setSources(data.sources);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Lo siento, hubo un error al procesar tu solicitud." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-400" />
                <h2 className="font-semibold text-lg">Asistente Corporativo</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>¿En qué puedo ayudarte hoy?</p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                )}
                            >
                                {msg.role === "assistant" ? (
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-xs text-gray-400">Analizando base de conocimientos...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Sources Footer */}
            {sources.length > 0 && (
                <div className="px-6 py-2 bg-slate-50 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2 overflow-x-auto">
                    <span className="font-semibold shrink-0">Fuentes:</span>
                    {sources.map((s, i) => (
                        <span key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                            <FileText className="w-3 h-3" /> Source #{s}
                        </span>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-black placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
