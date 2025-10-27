"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Users,
  BarChart2,
  CheckCircle,
  LogOut,
  Search,
  ListOrdered,
  BadgeInfo,
} from "lucide-react";
import { logoutUser, getUserRole } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      const r = await getUserRole();
      setRole(r);
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  const baseLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/cars", label: "My Cars", icon: <Car size={18} /> },
    { href: "/dashboard/cars/new", label: "Add New", icon: <PlusCircle size={18} /> },
  ];

  const adminLinks =
    role === "admin" || role === "superadmin"
      ? [
          { href: "/dashboard/admin/cars", label: "Approve Cars", icon: <CheckCircle size={18} /> },
          { href: "/dashboard/admin/users", label: "Users", icon: <Users size={18} /> },
        ]
      : [];

  const superLinks =
    role === "superadmin"
      ? [
          { href: "/dashboard/superadmin/stats", label: "Analytics", icon: <BarChart2 size={18} /> },
          { href: "/dashboard/superadmin/schema-builder", label: "Schema Builder", icon: <ListOrdered size={18} /> },
          { href: "/dashboard/superadmin/schema-order", label: "Section Order", icon: <ListOrdered size={18} /> },
          { href: "/dashboard/superadmin/site-settings", label: "Info Company", icon: <BadgeInfo size={18} /> },
        ]
      : [];

  const links = [...baseLinks, ...adminLinks, ...superLinks];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">CarMarket</h2>
        {role && <p className="text-sm text-gray-500 mt-1 capitalize">Role: {role}</p>}
      </div>

      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent outline-none text-sm w-full text-gray-700"
          />
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
