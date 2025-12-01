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
      
      // Check if user is an admin (by email pattern)
      // You can customize this logic based on your admin email pattern
      const isAdmin = email.toLowerCase().includes("admin") || 
                      email.toLowerCase().endsWith("@admin.com") ||
                      email.toLowerCase().endsWith("@sixs.com");
      
      // Redirect admin users to admin dashboard, others to regular dashboard
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      setErrorMsg(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-center p-8 relative"
      style={{
        backgroundImage: `url('/final ui.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Login Form Container with Glass Effect */}
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/40 relative z-10">
          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-white font-bold mb-1 block">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-white font-bold mb-1 block">Password</label>
              <input
                type="password"
                className="w-full mt-1 p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2 bg-red-900/50 rounded-lg border border-red-700">
                <p className="text-white text-sm font-bold">{errorMsg}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:bg-black/60 disabled:cursor-not-allowed border border-gray-800"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

        
        </div>
    </div>
  );
}
