import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface AttributeHistory {
  id: string;
  delta: number;
  createdAt: string;
}

interface Attribute {
  id: string;
  name: string;
  value: number;
  history: AttributeHistory[];
  createdAt: string;
}

interface PrimaryAttribute {
  name: string;
  value: number;
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
        const response = await axios.get(`${API_URL}/attributes`, {
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
          Begin journaling. Patterns will surface over time.
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
            Strongest pattern right now —{" "}
            <span className="text-[#2f281f] font-medium">{primaryAttribute.name}</span>
          </p>
        )}
      </div>

      {/* ATTRIBUTE LIST */}
      <div className="max-w-[700px] space-y-4">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            onClick={() => setSelected(selected?.id === attr.id ? null : attr)}
            className={`
              cursor-pointer rounded-3xl px-8 py-7 transition-all duration-300
              bg-[#efe7d8] border border-transparent hover:border-[#d4c9b5]
              ${selected?.id === attr.id ? "border-[#a89880]" : ""}
            `}
          >
            <div className="flex items-center justify-between">

              {/* NAME + TEMPORAL FRAMING */}
              <div>
                <h3 className="heading-font text-2xl text-[#2f281f]">
                  {attr.name}
                </h3>
                <p className="text-sm text-[#a89880] mt-1">
                  observed across recent sessions
                </p>
              </div>

              {/* VALUE */}
              <span className="heading-font text-4xl text-[#2f281f]">
                {attr.value}
              </span>

            </div>

            {/* EXPANDED HISTORY */}
            {selected?.id === attr.id && attr.history.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-[#d4c9b5] pt-5">
                <p className="text-xs text-[#a89880] uppercase tracking-widest mb-3">
                  Recent shifts
                </p>
                {attr.history.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <p className="text-sm text-[#6c5f4d]">
                      {new Date(h.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
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