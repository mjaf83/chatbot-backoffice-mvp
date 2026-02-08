"use client";

import UploadForm from "@/components/admin/UploadForm";
import SourceManager from "@/components/admin/SourceManager";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Sistema Activo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-6">
                    <UploadForm />
                </div>

                {/* Manual & SQL Section */}
                <div className="space-y-6">
                    <SourceManager />
                </div>
            </div>
        </div>
    );
}
