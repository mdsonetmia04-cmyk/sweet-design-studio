import { Link } from "react-router-dom";
import { Image as ImageIcon, Shapes, BarChart, ArrowRight, Shirt, LayoutGrid, Sticker, PersonStanding } from "lucide-react";
import { motion } from "motion/react";

const tools = [
  {
    name: "AI Logo Generator",
    description: "Generate modern, minimal, luxury, or tech logos for your brand.",
    icon: ImageIcon,
    href: "/logo",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    name: "Vector Icon Pack",
    description: "Create 20-50 matching icons based on keywords. Export as SVG/PNG.",
    icon: Shapes,
    href: "/icon",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    name: "AI Infographics",
    description: "Generate modern infographic layouts with charts and icons.",
    icon: BarChart,
    href: "/infographic",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    name: "T-Shirt Design",
    description: "Generate custom T-Shirt designs. Modern, creative, and ready to print.",
    icon: Shirt,
    href: "/tshirt",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    name: "Seamless Patterns",
    description: "Tileable patterns for backgrounds, textiles and stock uploads.",
    icon: LayoutGrid,
    href: "/pattern",
    color: "bg-teal-500/10 text-teal-500",
  },
  {
    name: "Sticker Generator",
    description: "Die-cut stickers in bulk with Adobe Stock metadata.",
    icon: Sticker,
    href: "/sticker",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    name: "Silhouette Generator",
    description: "Bold silhouettes with poses — ready for stock and merch.",
    icon: PersonStanding,
    href: "/silhouette",
    color: "bg-zinc-500/10 text-zinc-500",
  },
];

export function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Sweet Design Studio
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Choose a tool below to start generating high-quality design assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={tool.href}
              className="group block p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                {tool.name}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                {tool.description}
              </p>
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
