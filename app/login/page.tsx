"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      className="min-h-screen flex relative overflow-hidden animate-gradient"
      style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      {/* Glass morphism overlay for entire page */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none"></div>

      {/* Floating glass orbs - positioned for entire page */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-40 left-20 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

      {/* Left Panel - Promotional Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 z-10"
      >
        {/* Abstract geometric lines overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
            <path
              d="M 100 0 Q 150 100 120 200 T 140 400 Q 160 500 100 600 T 120 800"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 200 0 Q 250 150 220 300 T 240 500 Q 260 600 200 700 T 220 800"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="mb-8">
            <Image
              src="/CenterSportsScience_logo.jpg"
              alt="Centre for Sports Science Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Start<br />
            Data Capture! 👋
          </h1>
          <p className="text-white text-lg lg:text-xl leading-relaxed max-w-md opacity-95">
             Digitize your data collection. Move beyond spreadsheets with a streamlined web interface designed for rapid assessment entry, real-time data validation, and instant cloud syncing.
          </p>
        </div>

        {/* Copyright */}
        <div className="relative z-10 text-white text-sm opacity-80">
          © {new Date().getFullYear()} Centre for Sports Science. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden z-10"
      >

        {/* Main Login Container with Glass Morphism */}
        <div className="relative z-10 w-full max-w-md">
          {/* Glass Card */}
          <div 
            className="backdrop-blur-xl bg-white/20 rounded-2xl p-8 shadow-2xl border border-white/30"
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }}
          >
            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Login to 
            </h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 drop-shadow-lg">
              Start Capturing Data!
            </h3>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2 drop-shadow-md">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all shadow-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2 drop-shadow-md">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all shadow-lg"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg">
                  <p className="text-white text-sm font-medium drop-shadow-md">{errorMsg}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/30 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
              >
                {loading ? "Signing in..." : "Login Now"}
              </button>
            </form>

            {/* Forget Password Link */}
            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-white/90 hover:text-white transition-colors text-sm drop-shadow-md"
              >
                Forget password?{" "}
                <span className="underline font-medium">Click here</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
