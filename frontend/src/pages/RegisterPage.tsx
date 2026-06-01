import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function RegisterPage() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleRegister = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          username,
          email,
          password,
        }
      );

      console.log(response.data);

      const token =
        response.data.data?.token ||
        response.data.token;

      localStorage.setItem(
        "token",
        token
      );

      const user =
        response.data.data?.user ||
        response.data.user;

      localStorage.setItem(
        "username",
        user.username
      );

      navigate("/dashboard");

    } catch (err: any) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Registration failed."
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-6">

      <div className="w-full max-w-[500px] bg-[#efe7d8] border border-[#d7cab6] rounded-[2rem] px-10 py-12">

        <h1 className="text-5xl text-center text-[#2f281f] mb-4">
          SkillTree
        </h1>

        <p className="text-center text-[#6c5f4d] mb-10">
          Begin your journey inward.
        </p>

        <div className="space-y-6">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full rounded-xl px-5 py-4 bg-[#f8f4ec] border border-[#d8ccb8] outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl px-5 py-4 bg-[#f8f4ec] border border-[#d8ccb8] outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl px-5 py-4 bg-[#f8f4ec] border border-[#d8ccb8] outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#2f281f] text-white py-4 rounded-xl"
          >
            {loading
              ? "Beginning..."
              : "Begin"}
          </button>

        </div>

      </div>

    </div>

  );
}