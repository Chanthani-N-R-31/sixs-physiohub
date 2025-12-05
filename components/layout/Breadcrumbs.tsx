"use client";

import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname) return null;

  // Skip breadcrumbs for root pages
  if (pathname === "/dashboard" || pathname === "/admin") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Don't show breadcrumbs if only one segment
  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    
    return {
      href,
      label,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link
        href={pathname.startsWith("/admin") ? "/admin" : "/dashboard"}
        className="text-white/70 hover:text-white transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRightIcon className="w-4 h-4 text-white/50" />
          {crumb.isLast ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-white/70 hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

