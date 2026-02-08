const API_URL = "http://localhost:8000/api";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatResponse {
    response: string;
    sources: string[];
}

export interface Source {
    id: number;
    name: string;
    source_type: string;
    category: string;
    created_at: string;
}

export async function getSources() {
    const res = await fetch(`${API_URL}/sources`);
    if (!res.ok) throw new Error("Failed to fetch sources");
    return res.json() as Promise<Source[]>;
}

export async function sendMessage(message: string, history: ChatMessage[]) {
    const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
        throw new Error("Failed to send message");
    }

    return res.json() as Promise<ChatResponse>;
}

export async function uploadFile(file: File, category: string = "general") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const res = await fetch(`${API_URL}/ingest/file`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Failed to upload file");
    }

    return res.json();
}

export async function createManualEntry(title: string, content: string, category: string) {
    const res = await fetch(`${API_URL}/ingest/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
    });
    if (!res.ok) throw new Error("Failed to create entry");
    return res.json();
}

export async function createSqlSource(name: string, connectionString: string, query: string, category: string) {
    const res = await fetch(`${API_URL}/ingest/sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, connection_string: connectionString, query, category }),
    });
    if (!res.ok) throw new Error("Failed to create SQL source");
    return res.json();
}
