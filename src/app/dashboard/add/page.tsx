"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since add functionality is handled via tabs
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

