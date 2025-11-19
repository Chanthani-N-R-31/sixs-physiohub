import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhysioHub",
  description: "Physiotherapy management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
