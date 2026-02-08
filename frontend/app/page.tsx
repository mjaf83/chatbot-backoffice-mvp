import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Chatbot RAG <span className="text-blue-600">Pro</span></h1>
        <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
          Admin Dashboard &rarr;
        </Link>
      </div>

      <ChatInterface />

      <footer className="mt-8 text-center text-xs text-gray-400">
        Powered by Llama 3.1 & Nomic Embeddings
      </footer>
    </main>
  );
}
