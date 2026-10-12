import { Outlet, Link, useLocation } from "react-router-dom";
import { useStore } from "@/src/store/useStore";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Shapes, 
  BarChart, 
  History, 
  Moon, 
  Sun,
  Shirt,
  Settings,
  LayoutGrid,
  Sticker,
  PersonStanding,
  Type,
  BadgePercent
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Logo Generator", href: "/logo", icon: ImageIcon },
  { name: "Icon Pack", href: "/icon", icon: Shapes },
  { name: "Infographics", href: "/infographic", icon: BarChart },
  { name: "T-Shirt Design", href: "/tshirt", icon: Shirt },
  { name: "Seamless Patterns", href: "/pattern", icon: LayoutGrid },
  { name: "Stickers", href: "/sticker", icon: Sticker },
  { name: "Silhouettes", href: "/silhouette", icon: PersonStanding },
  { name: "Typography Studio", href: "/typography", icon: Type },
  { name: "Sale & Discount", href: "/sale", icon: BadgePercent },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout() {
  const { theme, toggleTheme } = useStore();
  const location = useLocation();

  return (
    <div className={cn("min-h-screen flex", theme === "dark" ? "dark bg-onyx-950 text-zinc-50" : "bg-platinum-50 text-zinc-900")}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-onyx-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
          <span className="font-display text-xl font-bold bg-gradient-to-r from-platinum-100 via-platinum-300 to-platinum-500 bg-clip-text text-transparent">
            Sweet Design Studio
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-platinum-200 text-zinc-950 dark:bg-platinum-200/15 dark:text-platinum-100 font-semibold" 
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 p-8">
          <Outlet />
        </div>
        
        <footer className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          <p>All Rights Reserved by Md Sonet Mia (01797953059)</p>
        </footer>
      </main>
    </div>
  );
}
