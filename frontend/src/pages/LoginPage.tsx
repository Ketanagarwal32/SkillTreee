import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:5000/auth/login",
        {
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
      localStorage.setItem( "username", response.data.data?.user?.username || response.data.user?.username );

      navigate("/dashboard");

    } catch (err: any) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-6">

      <div className="w-full max-w-[640px] bg-[#efe7d8] border border-[#d7cab6] rounded-[2.5rem] px-14 py-16">

        {/* TITLE */}

        <h1 className="text-[5rem] text-center text-[#2f281f] leading-none">
          SkillTree
        </h1>

        <p className="text-center text-[#6c5f4d] text-[1.4rem] mt-8 mb-14">
          Return to your inner temple.
        </p>

        {/* FORM */}

        <div className="space-y-8">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-[1.5rem] px-7 py-6 bg-[#f8f4ec] border border-[#d8ccb8] outline-none text-[1.3rem] text-[#2f281f]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-[1.5rem] px-7 py-6 bg-[#f8f4ec] border border-[#d8ccb8] outline-none text-[1.3rem] text-[#2f281f]"
          />

          {error && (

            <p className="text-red-500 text-[1rem]">
              {error}
            </p>

          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#2f281f] hover:bg-[#1f1a14] transition text-white py-6 rounded-[1.5rem] text-[1.3rem]"
          >
            {loading
              ? "Entering..."
              : "Enter"}
          </button>

          {/* REGISTER */}

          <div className="text-center pt-2">

            <p className="text-[#6c5f4d] text-[1rem]">

              New here?{" "}

              <Link
                to="/register"
                className="text-[#2f281f] underline hover:opacity-70"
              >
                Begin your journey
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>

  );
}
