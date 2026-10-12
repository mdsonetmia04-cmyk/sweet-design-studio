import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Key, Save, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function Settings() {
  const { geminiApiKey, setGeminiApiKey, groqApiKey, setGroqApiKey, promptInstructions, setPromptInstructions } = useStore();
  
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
    </div>
  );
}
