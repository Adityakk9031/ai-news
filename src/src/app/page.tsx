"use client";
import { useEffect, useState } from "react";

type NewsItem = {
  id: number;
  source: string;
  title: string;
  summary?: string;
  url: string;
  published_at?: string;
  is_duplicate: boolean;
};



export default function Page() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/news${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (e: any) {
      alert(`Error loading news: ${e.message}`);
    }
    setLoading(false);
  }

  async function favorite(id: number) {
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      alert("Saved to Favorites");
    } catch (e: any) {
      alert(`Error saving favorite: ${e.message}`);
    }
  }

  async function ingest() {
    setLoading(true);
    try {
      await fetch(`/api/ingest`, { method: "POST" });
      await load();
    } catch (e) {
      console.error(e);
      alert("Ingestion failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI News Feed</h1>
        <div className="flex gap-4">
          <button
            onClick={ingest}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Feed"}
          </button>
          <a href="/favorites" className="bg-amber-100 text-amber-700 px-4 py-2 rounded hover:bg-amber-200">Favorites</a>
          <a href="/admin" className="bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200">Admin</a>
        </div>
      </div>
      <form 
        className="mt-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); load(); }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); load(); } }}
          placeholder="Search..."
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); load(); }}
          disabled={loading}
          className="rounded border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:opacity-50"
        >
          Search
        </button>
      </form>
      {loading && <p className="mt-4 text-slate-600">Loading...</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-t border-slate-200">
                <td className="p-2">{n.source}</td>
                <td className="p-2">
                  <a href={n.url} target="_blank" rel="noreferrer" className="text-blue-700">
                    {n.title}
                  </a>
                  {n.is_duplicate && (
                    <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                      duplicate
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {n.published_at ? new Date(n.published_at).toLocaleString() : "-"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => favorite(n.id)}
                    className="rounded bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                  >
                    Favorite
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
