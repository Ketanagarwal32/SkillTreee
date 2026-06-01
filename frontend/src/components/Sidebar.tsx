import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const navigate = useNavigate();
  const [primaryAttribute, setPrimaryAttribute] = useState<string | null>(null);
  const [activeArc, setActiveArc] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch primary attribute
    axios.get("http://localhost:5000/attributes", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const primary = res.data.data.primaryAttribute;
      if (primary) setPrimaryAttribute(primary.name);
    }).catch(() => {});

    // Fetch active arc
    axios.get("http://localhost:5000/arcs", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const arcs = res.data.data;
      const active = Array.isArray(arcs) ? arcs.find((a: any) => a.isActive) : null;
      if (active) setActiveArc(active.title);
    }).catch(() => {});
  }, []);

  return (
    <div className="w-[320px] h-full bg-[#ddd4c5] border-r border-[#c9bda9] flex flex-col justify-between">

      <div>

        {/* TOP */}
        <div className="px-10 pt-10">
          <h1 className="heading-font text-[4.5rem] leading-none text-[#2f281f]">
            SkillTree
          </h1>
          <p className="mt-3 text-sm tracking-[0.35em] uppercase text-[#7e715d]">
            Inner Evolution
          </p>
        </div>

        {/* PROFILE */}
        <div className="mt-5 px-8">
          <div className="bg-[#efe7d8] rounded-[2rem] p-6 border border-[#ddd0bd]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#b7ab8d]" />
              <div>
                <h2 className="heading-font text-4xl leading-none text-[#2f281f]">
                  {localStorage.getItem("username")}
                </h2>
                <p className="mt-2 text-[#756957] text-sm">
                  {activeArc ? `in ${activeArc}` : "no active arc"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DOMINANT ATTRIBUTE */}
        <div className="mt-5 px-10">
          <div className="border-y border-[#c7baa7] py-4">
            <p className="text-[#2f281f] text-lg">
              {primaryAttribute ?? "—"}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-5 px-10 space-y-4">
          <Link to="/dashboard" className="block text-left text-2xl heading-font text-[#2f281f]">
            Homepage
          </Link>
          <Link to="/reflect" className="block text-left text-2xl heading-font text-[#7d715f] hover:text-[#2f281f] transition">
            Reflect
          </Link>
          <Link to="/memory" className="block text-left text-2xl heading-font text-[#7d715f] hover:text-[#2f281f] transition">
            Memory
          </Link>
          <Link to="/attributes" className="block text-left text-2xl heading-font text-[#7d715f] hover:text-[#2f281f] transition">
            Attributes
          </Link>
        </div>

      </div>

      {/* FOOTER */}
      <div className="px-5 pb-5">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("chat_messages");
            navigate("/");
          }}
          className="text-xs text-[#9a8d7a] hover:text-[#7a6d5b] transition mb-4 cursor-pointer"
        >
          Leave the temple
        </button>
        <p className="text-[#7a6d5b] italic leading-relaxed">
          "The temple remains silent.
          <br />
          Yet the mind continues to echo."
        </p>
      </div>

    </div>
  );
}