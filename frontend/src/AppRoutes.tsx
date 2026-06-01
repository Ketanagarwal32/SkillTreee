import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Reflect from "./pages/Reflect";
import Memory from "./pages/Memory";
import Attributes from "./pages/Attributes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reflect" element={<Reflect />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/attributes" element={<Attributes />} />
      </Route>
    </Routes>
  );
}