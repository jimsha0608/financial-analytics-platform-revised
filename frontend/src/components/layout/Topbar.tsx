import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <span className="text-lg font-semibold text-slate-900 md:hidden">
        Finance<span className="text-brand-600">Analytics</span>
      </span>
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-sm text-slate-600 sm:inline">
          {user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
