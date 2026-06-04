import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface Memory {
  id: string;
  summary: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  arcId: string | null;
}

interface Arc {
  id: string;
  title: string;
  isActive: boolean;
}

export default function Memory() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      axios.get(`${API_URL}/memories`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/arcs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([memoriesRes, arcsRes]) => {
        setMemories(memoriesRes.data.data);
        setArcs(arcsRes.data.data);
      })
      .catch((error) => console.error("Failed to fetch:", error))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-2xl text-[#8f816f] italic">The archive stirs...</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
        <h2 className="heading-font text-5xl text-[#2f281f] mb-6">No memories yet.</h2>
        <p className="text-xl text-[#8f816f] max-w-md leading-relaxed">
          Each journal session leaves a trace. Begin writing and the archive will grow.
        </p>
      </div>
    );
  }

  // separate assigned and unassigned memories
  const assignedMemories = memories.filter((m) => m.arcId !== null);
  const unassignedMemories = memories.filter((m) => m.arcId === null);

  // group assigned memories by arcId
  const memoriesByArc: Record<string, Memory[]> = {};
  for (const memory of assignedMemories) {
    if (!memoriesByArc[memory.arcId!]) {
      memoriesByArc[memory.arcId!] = [];
    }
    memoriesByArc[memory.arcId!].push(memory);
  }

  const renderMemoryList = (list: Memory[]) => (
    <div className="max-w-[800px] space-y-12">
      {list.map((memory, index) => (
        <div key={memory.id} className="relative">
          {index !== list.length - 1 && (
            <div className="absolute left-0 top-8 w-[1px] h-[calc(100%+3rem)] bg-[#d4c9b5]" />
          )}
          <div className="flex gap-8">
            <div className="mt-2 w-3 h-3 rounded-full bg-[#a89880] shrink-0 relative z-10" />
            <div className="flex-1 pb-4">
              <p className="text-xs text-[#a89880] uppercase tracking-widest mb-4">
                {formatDate(memory.createdAt)}
              </p>
              <p className="text-xl text-[#2f281f] leading-[1.9]">
                {memory.summary}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 h-screen overflow-y-auto px-24 py-16 bg-[#f5f1e8]">

      {/* HEADER */}
      <div className="mb-16">
        <h1 className="heading-font text-6xl text-[#2f281f]">Memory</h1>
      </div>

      {/* ARC GROUPED MEMORIES */}
      {arcs
        .filter((arc) => memoriesByArc[arc.id]?.length > 0)
        .map((arc) => (
          <div key={arc.id} className="mb-20">
            <div className="mb-10">
              <p className="text-xs text-[#a89880] uppercase tracking-widest mb-2">
                {arc.isActive ? "Current arc" : "Past arc"}
              </p>
              <h2 className="heading-font text-4xl text-[#2f281f]">
                {arc.title}
              </h2>
              <div className="mt-4 w-12 h-[1px] bg-[#c9bda9]" />
            </div>
            {renderMemoryList(memoriesByArc[arc.id])}
          </div>
        ))}

      {/* UNASSIGNED MEMORIES */}
      {unassignedMemories.length > 0 && (
        <div className="mb-20">
          {arcs.length > 0 && (
            <div className="mb-10">
              <p className="text-xs text-[#a89880] uppercase tracking-widest mb-2">
                Recent
              </p>
              <div className="mt-4 w-12 h-[1px] bg-[#c9bda9]" />
            </div>
          )}
          {renderMemoryList(unassignedMemories)}
        </div>
      )}

    </div>
  );
}