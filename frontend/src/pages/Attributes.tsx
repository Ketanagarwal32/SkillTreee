import { useEffect, useState } from "react";
import axios from "axios";

interface AttributeHistory {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
}

interface Attribute {
  id: string;
  name: string;
  points: number;
  status: "ACTIVE" | "STAGNANT";
  history: AttributeHistory[];
  createdAt: string;
}

interface PrimaryAttribute {
  name: string;
  points: number;
}

export default function Attributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [primaryAttribute, setPrimaryAttribute] = useState<PrimaryAttribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Attribute | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/attributes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttributes(response.data.data.attributes);
        setPrimaryAttribute(response.data.data.primaryAttribute);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-2xl text-[#8f816f]">
        <p className="italic">The system reads your patterns...</p>
      </div>
    );
  }

  if (attributes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
        <h2 className="heading-font text-5xl text-[#2f281f] mb-6">No attributes yet.</h2>
        <p className="text-xl text-[#8f816f] max-w-md leading-relaxed">
          Begin journaling. The system will quietly discover what defines you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto px-24 py-16 bg-[#f5f1e8]">

      {/* HEADER */}
      <div className="mb-16">
        <h1 className="heading-font text-6xl text-[#2f281f] mb-4">Attributes</h1>
        {primaryAttribute && (
          <p className="text-xl text-[#8f816f]">
            Your strongest pattern right now —{" "}
            <span className="text-[#2f281f] font-medium">{primaryAttribute.name}</span>
          </p>
        )}
      </div>

      {/* ATTRIBUTE GRID */}
      <div className="grid grid-cols-2 gap-6 max-w-[1000px]">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            onClick={() => setSelected(selected?.id === attr.id ? null : attr)}
            className={`
              cursor-pointer rounded-3xl px-8 py-7 transition-all duration-300
              ${attr.status === "STAGNANT"
                ? "bg-[#ede8de] opacity-60 border border-[#d4c9b5]"
                : "bg-[#efe7d8] border border-transparent hover:border-[#d4c9b5]"
              }
              ${selected?.id === attr.id ? "border-[#a89880]" : ""}
            `}
          >
            {/* NAME + STATUS */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="heading-font text-2xl text-[#2f281f] leading-tight max-w-[70%]">
                {attr.name}
              </h3>
              {attr.status === "STAGNANT" && (
                <span className="text-xs text-[#a89880] italic mt-1">dormant</span>
              )}
            </div>

            {/* POINTS */}
            <div className="flex items-end gap-2 mb-5">
              <span className="heading-font text-5xl text-[#2f281f]">{attr.points}</span>
              <span className="text-[#8f816f] text-sm mb-2">points</span>
            </div>

            {/* SUBTLE POINT BAR */}
            <div className="w-full h-[2px] bg-[#d4c9b5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8f816f] rounded-full transition-all duration-700"
                style={{ width: `${Math.min((attr.points / 100) * 100, 100)}%` }}
              />
            </div>

            {/* EXPANDED HISTORY */}
            {selected?.id === attr.id && attr.history.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-[#d4c9b5] pt-5">
                <p className="text-xs text-[#a89880] uppercase tracking-widest mb-3">Recent shifts</p>
                {attr.history.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <p className="text-sm text-[#6c5f4d] italic leading-relaxed max-w-[80%]">
                      {h.reason}
                    </p>
                    <span className={`text-sm font-medium ml-4 ${h.delta >= 0 ? "text-[#7a8c6e]" : "text-[#a0706a]"}`}>
                      {h.delta >= 0 ? `+${h.delta}` : h.delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}