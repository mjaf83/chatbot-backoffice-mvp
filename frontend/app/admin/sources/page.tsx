"use client";

import { useEffect, useState } from "react";
import { getSources, Source } from "@/lib/api";
import { FileText, Database, PenTool, Loader2 } from "lucide-react";

export default function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSources()
            .then(setSources)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "FILE": return <FileText className="w-5 h-5 text-blue-500" />;
            case "SQL_VIEW": return <Database className="w-5 h-5 text-purple-500" />;
            default: return <PenTool className="w-5 h-5 text-green-500" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Fuentes de Conocimiento Registradas</h2>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-800 font-medium">
                            <tr>
                                <th className="p-3 rounded-tl-lg">Tipo</th>
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Categoría</th>
                                <th className="p-3 rounded-tr-lg">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sources.map((source) => (
                                <tr key={source.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-3 flex items-center gap-2">
                                        {getIcon(source.source_type)}
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{source.source_type}</span>
                                    </td>
                                    <td className="p-3 font-medium text-slate-700">{source.name}</td>
                                    <td className="p-3">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                                            {source.category}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-400">
                                        {new Date(source.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {sources.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">
                                        No hay fuentes registradas aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
