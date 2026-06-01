import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface LatestReflection {
  reflectionParagraph: string | null;
  emotionalTheme: string;
  createdAt: string;
}

export default function Reflect() {
  const [reflection, setReflection] = useState<LatestReflection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReflection = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/reflections/latest`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setReflection(response.data.data);
      } catch (error) {
        console.error("Failed to fetch reflection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReflection();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f1e8]">
        <p className="text-lg text-[#8f816f] italic">
          The observer gathers its thoughts...
        </p>
      </div>
    );
  }

  if (!reflection || !reflection.reflectionParagraph) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#f5f1e8]">
        <h2 className="heading-font text-3xl text-[#2f281f] mb-4">
          Nothing yet.
        </h2>

        <p className="text-base text-[#8f816f] max-w-md leading-relaxed">
          The observer is waiting. Write your first journal entry and it will
          speak.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#f5f1e8] flex items-center justify-center px-10 py-10">

      <div className="max-w-[640px] w-full">

        {/* LABEL */}
        <p className="text-[10px] text-[#a89880] uppercase tracking-[0.25em] mb-6">
          The observer's reflection
        </p>

        {/* MAIN REFLECTION */}
        <p className="heading-font text-[1.35rem] leading-[2.1] text-[#2f281f] whitespace-pre-line">
          {reflection.reflectionParagraph}
        </p>

        {/* FOOTER */}
        <div className="mt-10 flex items-center gap-4">

          <div className="h-[1px] flex-1 bg-[#d4c9b5]" />

          <div className="text-center">
            <p className="text-xs text-[#a89880] italic">
              {reflection.emotionalTheme}
            </p>

            <p className="text-[10px] text-[#c4b8a5] mt-1">
              {formatDate(reflection.createdAt)}
            </p>
          </div>

          <div className="h-[1px] flex-1 bg-[#d4c9b5]" />

        </div>

      </div>

    </div>
  );
}

