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
    <div className="min-h-screen flex justify-center items-center p-8 bg-white">

        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <p className="text-gray-500 text-sm mb-6">Welcome back! Please sign in to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-600 text-sm">{errorMsg}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg disabled:bg-blue-300"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-sm text-gray-600 mt-6 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
    </div>
  );
}
