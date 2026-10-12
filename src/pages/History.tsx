import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Download, Trash2, Image as ImageIcon, Shapes, BarChart, Shirt, LayoutGrid, Sticker, PersonStanding } from "lucide-react";
import { motion } from "motion/react";
import { saveAs } from "file-saver";

const typeIcons: Record<string, any> = {
  logo: ImageIcon,
  icon: Shapes,
  infographic: BarChart,
  tshirt: Shirt,
  pattern: LayoutGrid,
  sticker: Sticker,
  silhouette: PersonStanding,
};

export function History() {
  const { history, clearHistory } = useStore();

  const handleDownload = (url: string, type: string, id: string) => {
    saveAs(url, `sweet_design_${type}_${id}.png`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Generation History
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View and download your previously generated designs.
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 className="w-4 h-4 mr-2" /> Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <ImageIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">No history yet</p>
          <p className="text-zinc-500 dark:text-zinc-400">Start generating designs to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item, i) => {
            const Icon = typeIcons[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-950">
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => handleDownload(item.imageUrl, item.type, item.id)}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                      <Icon className="w-3 h-3" /> {item.type}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2" title={item.prompt}>
                    {item.prompt}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
