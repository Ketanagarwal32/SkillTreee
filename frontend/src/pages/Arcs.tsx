import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface Memory {
  id: string;
  summary: string;
  createdAt: string;
}

interface Arc {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  memories: Memory[];
}

export default function Arcs() {
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(`${API_URL}/arcs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setArcs(res.data.data))
      .catch((err) => console.error("Failed to fetch arcs:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-2xl text-[#8f816f] italic">The archive opens...</p>
      </div>
    );
  }

  if (arcs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
        <h2 className="heading-font text-5xl text-[#2f281f] mb-6">No arc has formed yet.</h2>
        <p className="text-xl text-[#8f816f] max-w-md leading-relaxed">
          Arcs emerge from accumulated memory. Keep returning.
        </p>
      </div>
    );
  }

  const activeArc = arcs.find((a) => a.isActive);
  const pastArcs = arcs.filter((a) => !a.isActive);

  return (
    <div className="flex-1 h-screen overflow-y-auto px-24 py-16 bg-[#f5f1e8]">

      {/* HEADER */}
      <div className="mb-16">
        <h1 className="heading-font text-6xl text-[#2f281f]">Arcs</h1>
      </div>

      {/* ACTIVE ARC */}
      {activeArc && (
        <div className="mb-20 max-w-[700px]">
          <p className="text-xs text-[#a89880] uppercase tracking-widest mb-4">
            Current arc
          </p>
          <h2 className="heading-font text-5xl text-[#2f281f] mb-6">
            {activeArc.title}
          </h2>
          {activeArc.description && (
            <p className="text-xl text-[#6c5f4d] leading-[1.9] mb-4">
              {activeArc.description}
            </p>
          )}
          <p className="text-sm text-[#a89880]">
            {formatDate(activeArc.startDate)}
            {activeArc.endDate ? ` — ${formatDate(activeArc.endDate)}` : " — present"}
          </p>
        </div>
      )}

      {/* PAST ARCS */}
      {pastArcs.length > 0 && (
        <div className="max-w-[700px]">
          <p className="text-xs text-[#a89880] uppercase tracking-widest mb-8">
            Past arcs
          </p>
          <div className="space-y-4">
            {pastArcs.map((arc) => (
              <div key={arc.id} className="rounded-3xl bg-[#efe7d8] border border-transparent hover:border-[#d4c9b5] transition-all duration-300">

                {/* ARC HEADER */}
                <div
                  onClick={() => setExpanded(expanded === arc.id ? null : arc.id)}
                  className="cursor-pointer px-8 py-7"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="heading-font text-2xl text-[#2f281f]">
                        {arc.title}
                      </h3>
                      <p className="text-sm text-[#a89880] mt-1">
                        {formatDate(arc.startDate)}
                        {arc.endDate ? ` — ${formatDate(arc.endDate)}` : ""}
                      </p>
                    </div>
                    <span className="text-sm text-[#a89880]">
                      {expanded === arc.id ? "close" : `${arc.memories?.length ?? 0} memories`}
                    </span>
                  </div>

                  {arc.description && expanded !== arc.id && (
                    <p className="text-sm text-[#6c5f4d] mt-3 leading-relaxed">
                      {arc.description}
                    </p>
                  )}
                </div>

                {/* EXPANDED MEMORIES */}
                {expanded === arc.id && arc.memories?.length > 0 && (
                  <div className="px-8 pb-7 space-y-6 border-t border-[#d4c9b5] pt-6">
                    {arc.memories.map((memory) => (
                      <div key={memory.id}>
                        <p className="text-xs text-[#a89880] uppercase tracking-widest mb-2">
                          {new Date(memory.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-base text-[#2f281f] leading-[1.9]">
                          {memory.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}