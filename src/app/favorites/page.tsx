"use client";
import { useEffect, useState } from "react";

type FavItem = {
  id: number;
  news_item_id: number;
  source: string;
  title: string;
  summary?: string;
  url: string;
  published_at?: string;
};



export default function FavoritesPage() {
  const [items, setItems] = useState<FavItem[]>([]);

  async function load() {
    const res = await fetch(`/api/favorites`);
    setItems(await res.json());
  }

  async function broadcast(id: number, platform: string) {
    try {
      const res = await fetch(`/api/broadcast/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.aiContent) {
        alert(`Broadcasted to ${platform}!\n\nAI Suggested Content:\n${data.aiContent}`);
      } else {
        alert(`Broadcasted to ${platform}`);
      }
    } catch (e: any) {
        alert(`Broadcast failed: ${e.message}`);
    }
  }

  async function generateNewsletter() {
    try {
      const res = await fetch(`/api/newsletter`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      alert(`AI Generated Newsletter Preview:\n\n${data.content}`);
    } catch (e: any) {
      alert(`Error generating newsletter: ${e.message}`);
    }
  }

  async function remove(newsId: number) {
    await fetch(`/api/favorites/${newsId}`, { method: "DELETE" });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Favorites</h1>
        <div className="flex gap-4">
          <button
            onClick={generateNewsletter}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Generate AI Newsletter
          </button>
          <a href="/" className="text-blue-600 hover:underline">Back to Feed</a>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Title</th>
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
                </td>
                <td className="p-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => broadcast(n.id, "email")}
                    className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => broadcast(n.id, "linkedin")}
                    className="rounded bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700"
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => broadcast(n.id, "whatsapp")}
                    className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => broadcast(n.id, "blog")}
                    className="rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
                  >
                    Blog
                  </button>
                  <button
                    onClick={() => remove(n.news_item_id)}
                    className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                  >
                    Remove
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
