import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface Memory {
  id: string;
  summary: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export default function Memory() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/memories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch memories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
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

  return (
    <div className="flex-1 h-screen overflow-y-auto px-24 py-16 bg-[#f5f1e8]">

      {/* HEADER */}
      <div className="mb-16">
        <h1 className="heading-font text-6xl text-[#2f281f] mb-4">Memory</h1>
        <p className="text-xl text-[#8f816f]">
          What the system remembers about you.
        </p>
      </div>

      {/* MEMORY LIST */}
      <div className="max-w-[800px] space-y-12">
        {memories.map((memory, index) => (
          <div key={memory.id} className="relative">

            {/* CONNECTOR LINE */}
            {index !== memories.length - 1 && (
              <div className="absolute left-0 top-8 w-[1px] h-[calc(100%+3rem)] bg-[#d4c9b5]" />
            )}

            <div className="flex gap-8">

              {/* DOT */}
              <div className="mt-2 w-3 h-3 rounded-full bg-[#a89880] shrink-0 relative z-10" />

              {/* CONTENT */}
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

    </div>
  );
}