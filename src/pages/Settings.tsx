import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Key, Save, CheckCircle2, SlidersHorizontal, Palette } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const ACCENT_THEMES = [
  { id: "platinum", name: "Platinum", hint: "Silver black-luxury", dot: "linear-gradient(135deg, #c6c7cf, #71738a)" },
  { id: "emerald", name: "Emerald", hint: "Rich green", dot: "linear-gradient(135deg, #34d399, #059669)" },
  { id: "sapphire", name: "Sapphire", hint: "Deep blue", dot: "linear-gradient(135deg, #60a5fa, #2563eb)" },
  { id: "ruby", name: "Ruby", hint: "Bold crimson", dot: "linear-gradient(135deg, #fb7185, #e11d48)" },
  { id: "amethyst", name: "Amethyst", hint: "Royal violet", dot: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
];

export function Settings() {
  const { geminiApiKey, setGeminiApiKey, groqApiKey, setGroqApiKey, promptInstructions, setPromptInstructions, accentTheme, setAccentTheme } = useStore();
  
  const [geminiInput, setGeminiInput] = useState(geminiApiKey);
  const [groqInput, setGroqInput] = useState(groqApiKey);
  const [instructionsInput, setInstructionsInput] = useState(promptInstructions);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setGeminiApiKey(geminiInput);
    setGroqApiKey(groqInput);
    setPromptInstructions(instructionsInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your API keys and application preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="p-2 bg-platinum-500/10 text-platinum-500 rounded-lg">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Configuration</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add your own API keys to bypass limits.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gemini API Key</label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={geminiInput}
              onChange={(e) => setGeminiInput(e.target.value)}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Used for generating images (Logos, Icons, Infographics, T-Shirts). Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-platinum-500 hover:underline">Google AI Studio</a>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Groq API Key</label>
            <Input
              type="password"
              placeholder="gsk_..."
              value={groqInput}
              onChange={(e) => setGroqInput(e.target.value)}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Used for fast text processing and prompt enhancement. Get your key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-platinum-500 hover:underline">Groq Console</a>.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="p-2 bg-platinum-500/10 text-platinum-400 rounded-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Prompt Instructions</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Applied to every prompt generated in Prompts mode.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom instructions</label>
          <textarea
            rows={5}
            value={instructionsInput}
            onChange={(e) => setInstructionsInput(e.target.value)}
            placeholder={"e.g.\n- Always add: --ar 1:1 --v 6 --style raw\n- Avoid text and words inside the image\n- Photorealistic, studio lighting"}
            className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-platinum-500"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Write once, reuse everywhere — style rules, aspect-ratio flags, things to always include or avoid.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="p-2 bg-platinum-500/10 text-platinum-400 rounded-lg">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Theme Color</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Recolor the entire website instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ACCENT_THEMES.map((t) => {
            const active = accentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setAccentTheme(t.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  active
                    ? "border-zinc-900 dark:border-platinum-200 shadow-md scale-[1.02]"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <span
                  className="block w-10 h-10 rounded-full mb-3 shadow-inner"
                  style={{ background: t.dot }}
                />
                <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-50">{t.name}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t.hint}</span>
                {active && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Applies immediately across buttons, highlights, progress bars and headings — saved automatically.
        </p>
      </motion.div>
    </div>
  );
}
