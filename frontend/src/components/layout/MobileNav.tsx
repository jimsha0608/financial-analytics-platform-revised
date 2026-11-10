import { LayoutDashboard, Receipt, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/reports", label: "Reports", icon: Wallet },
  { to: "/profile", label: "Profile", icon: Settings },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
              isActive ? "text-brand-700" : "text-slate-500"
            }`
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
