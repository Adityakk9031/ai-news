"use client";
import { useEffect, useState } from "react";

type Source = {
  id: number;
  name: string;
  url: string;
  type: string;
  active: boolean;
};



export default function AdminPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", url: "", type: "rss" });

  async function loadSources() {
    setLoading(true);
    const res = await fetch(`/api/sources`);
    setSources(await res.json());
    setLoading(false);
  }

  async function addSource(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setNewSource({ name: "", url: "", type: "rss" });
      loadSources();
    } catch (err: any) {
      alert(`Error adding source: ${err.message}`);
    }
  }

  async function ingest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ingest`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      alert("Ingestion complete");
    } catch (err: any) {
      alert(`Error running ingest: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-4">
          <button
            onClick={ingest}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Running Ingest..." : "Manual Refresh (All Sources)"}
          </button>
          <a href="/" className="text-blue-600 hover:underline">Back to Feed</a>
        </div>
      </div>

      <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Add New Source</h2>
        <form onSubmit={addSource} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            placeholder="Name (e.g. OpenAI Blog)"
            value={newSource.name}
            onChange={e => setNewSource({...newSource, name: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="RSS/API URL"
            value={newSource.url}
            onChange={e => setNewSource({...newSource, url: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <select
            value={newSource.type}
            onChange={e => setNewSource({...newSource, type: e.target.value})}
            className="border p-2 rounded"
          >
            <option value="rss">RSS</option>
            <option value="api">API</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Add Source
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Active Sources</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">URL</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-slate-500 truncate max-w-xs">{s.url}</td>
                  <td className="py-3 uppercase text-xs font-bold text-slate-400">{s.type}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
