import "./globals.css";

export const metadata = {
  title: "PhysioHub",
  description: "Physiotherapy Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
