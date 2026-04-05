"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarOption = ({ href, title }: { href: string; title: string }) => {
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";

  return (
    <Link
      href={href}
      className={`border p-2 rounded-md ${isActive ? "bg-gray-300 font-bold border-black" : "border-gray-400"}`}
    >
      <p className="truncate">{title}</p>
    </Link>
  );
};

export default SidebarOption;
