"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState("general");
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setStatus("idle");

        try {
            await uploadFile(file, category);
            setStatus("success");
            setMessage(`Archivo "${file.name}" procesado correctamente.`);
            setFile(null);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("Error al subir el archivo. Inténtalo de nuevo.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Subir Documentos
            </h3>

            <div className="space-y-4">
                {/* Dropzone area */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/10">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.md"
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        {file ? (
                            <FileText className="w-10 h-10 text-blue-600 mb-2" />
                        ) : (
                            <Upload className="w-10 h-10 text-gray-300 mb-2" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                            {file ? file.name : "Haz clic para seleccionar PDF o Texto"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Soporta PDF, TXT, MD</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="general">General</option>
                        <option value="hr">Recursos Humanos</option>
                        <option value="sales">Ventas</option>
                        <option value="technical">Técnico</option>
                        <option value="legal">Legal</option>
                    </select>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                        </>
                    ) : (
                        "Subir e Ingestar"
                    )}
                </button>

                <AnimatePresence>
                    {status !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-lg flex items-center gap-2 text-sm ${status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                }`}
                        >
                            {status === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
