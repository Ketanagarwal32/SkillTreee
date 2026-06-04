import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

interface LatestReflection {
  content: string;
  createdAt: string;
}

interface CurrentSession {
  id: string;
}

export default function Reflect() {
  const [reflection, setReflection] = useState<LatestReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [silenced, setSilenced] = useState(false);

  useEffect(() => {
    const fetchReflection = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/reflection/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const reflections = response.data.data;
        setReflection(Array.isArray(reflections) ? reflections[0] ?? null : null);
        setSilenced(false);
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

  const requestReflection = async () => {
    try {
      setRequesting(true);
      const token = localStorage.getItem("token");

      const sessionResponse = await axios.get<{ data: CurrentSession }>(
        `${API_URL}/session/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sessionId = sessionResponse.data.data.id;

      const response = await axios.post(
        `${API_URL}/reflection/request`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.data;
      setSilenced(result.silenced === true);
      setReflection(
        result.silenced
          ? {
              content: "The observer has nothing further to add to this session.",
              createdAt: new Date().toISOString(),
            }
          : result.reflection
      );
    } catch (error) {
      console.error("Failed to request reflection:", error);
    } finally {
      setRequesting(false);
    }
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

  if (!reflection || !reflection.content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#f5f1e8]">
        <h2 className="heading-font text-3xl text-[#2f281f] mb-4">
          Nothing yet.
        </h2>

        <p className="text-base text-[#8f816f] max-w-md leading-relaxed">
          The observer is waiting. Write your session entries, then request a
          reflection when you are ready.
        </p>
        <button
          onClick={requestReflection}
          disabled={requesting}
          className="mt-8 rounded-lg border border-[#d7cab6] px-5 py-3 text-sm text-[#5f5444] hover:text-[#2f281f] disabled:opacity-60"
        >
          {requesting ? "Requesting..." : "Request reflection"}
        </button>
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
          {reflection.content}
        </p>

        {!silenced && (
          <button
            onClick={requestReflection}
            disabled={requesting}
            className="mt-8 rounded-lg border border-[#d7cab6] px-5 py-3 text-sm text-[#5f5444] hover:text-[#2f281f] disabled:opacity-60"
          >
            {requesting ? "Requesting..." : "Request new reflection"}
          </button>
        )}

        <div className="mt-10 flex items-center gap-4">

          <div className="h-[1px] flex-1 bg-[#d4c9b5]" />

          <div className="text-center">
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

