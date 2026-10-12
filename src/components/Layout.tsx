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
  PersonStanding
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
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout() {
  const { theme, toggleTheme } = useStore();
  const location = useLocation();

  return (
    <div className={cn("min-h-screen flex", theme === "dark" ? "dark bg-zinc-950 text-zinc-50" : "bg-zinc-50 text-zinc-900")}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
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
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
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
