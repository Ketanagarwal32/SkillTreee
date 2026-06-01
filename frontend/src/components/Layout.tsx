import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="w-screen h-screen flex bg-[#f5f1e8] overflow-hidden">

      <Sidebar />

      <Outlet />

    </div>
  );
}