import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Logo } from "./Logo";
import { Menu, X, LogOut, ChevronDown, User } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: string;
  roleColor?: string;
}

export function DashboardLayout({ children, navItems, role, roleColor = "bg-brand-600" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 flex-shrink-0">
          <Logo />
          <button className="lg:hidden p-1 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-slate-100 flex-shrink-0">
          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-lg text-white ${roleColor}`}>
            {role}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <NavLinks />
        </div>

        <div className="border-t border-slate-200 p-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.firstName || "User"}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
