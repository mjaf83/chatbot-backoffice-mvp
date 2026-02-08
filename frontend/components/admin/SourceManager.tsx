"use client";

import { useState } from "react";
import { Database, Plus, Save } from "lucide-react";
import { createManualEntry, createSqlSource } from "@/lib/api";

export default function SourceManager() {
    const [activeTab, setActiveTab] = useState<"manual" | "sql">("manual");

    // Manual State
    const [manualTitle, setManualTitle] = useState("");
    const [manualContent, setManualContent] = useState("");
    const [manualCategory, setManualCategory] = useState("general");

    // SQL State
    const [sqlName, setSqlName] = useState("");
    const [connectionString, setConnectionString] = useState("");
    const [sqlQuery, setSqlQuery] = useState("");
    const [sqlCategory, setSqlCategory] = useState("general");

    const handleManualSubmit = async () => {
        try {
            await createManualEntry(manualTitle, manualContent, manualCategory);
            alert("Entrada manual creada con éxito");
            setManualTitle("");
            setManualContent("");
        } catch (e) {
            alert("Error al crear entrada manual");
        }
    };

    const handleSqlSubmit = async () => {
        try {
            await createSqlSource(sqlName, connectionString, sqlQuery, sqlCategory);
            alert("Fuente SQL creada e ingestada con éxito");
        } catch (e) {
            alert("Error al conectar fuente SQL");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("manual")}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "manual" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                >
                    Entrada Manual
                </button>
                <button
                    onClick={() => setActiveTab("sql")}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "sql" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                >
                    Conexión SQL
                </button>
            </div>

            <div className="p-6">
                {activeTab === "manual" ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                            <input value={manualTitle} onChange={e => setManualTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Política de Vacaciones" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                            <select value={manualCategory} onChange={e => setManualCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                                <option value="general">General</option>
                                <option value="hr">HR</option>
                                <option value="tech">Tech</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Contenido</label>
                            <textarea value={manualContent} onChange={e => setManualContent(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm h-32" placeholder="El contenido del conocimiento..." />
                        </div>
                        <button onClick={handleManualSubmit} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900">Guardar Conocimiento</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 mb-4">
                            Conecta a una base de datos externa (Postgres, MySQL) y ejecuta una vista para extraer conocimiento.
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de la Fuente</label>
                            <input value={sqlName} onChange={e => setSqlName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Base de Clientes CRM" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Connection String (SQLAlchemy)</label>
                            <input value={connectionString} onChange={e => setConnectionString(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="postgresql://user:pass@host/db" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Consulta SQL / Vista</label>
                            <textarea value={sqlQuery} onChange={e => setSqlQuery(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-mono h-24" placeholder="SELECT * FROM public_knowledge_view" />
                        </div>
                        <button onClick={handleSqlSubmit} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900">Ingestar Datos SQL</button>
                    </div>
                )}
            </div>
        </div>
    );
}
