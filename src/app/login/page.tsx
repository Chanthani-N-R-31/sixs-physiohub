"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      setErrorMsg(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-center p-8 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Login Form Container */}
      <div className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">Login</h2>

          {/* Welcome message */}
          <p className="text-white/90 text-sm mb-6">Welcome back! Please sign in to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <div className="mb-1 p-2 bg-white/15 backdrop-blur-sm rounded-lg border border-white/25">
                <label className="text-sm text-black font-medium">Email</label>
              </div>
              <input
                type="email"
                className="w-full mt-1 p-3 bg-white/35 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/45"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 p-2 bg-white/15 backdrop-blur-sm rounded-lg border border-white/25">
                <label className="text-sm text-black font-medium">Password</label>
              </div>
              <input
                type="password"
                className="w-full mt-1 p-3 bg-white/35 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/45"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
                <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1a4d4d]/80 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-[#1a4d4d]/90 transition-all shadow-lg hover:shadow-xl disabled:bg-[#1a4d4d]/60 border border-[#1a4d4d]/50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
    </div>
  );
}
