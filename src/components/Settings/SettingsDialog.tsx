import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Settings, Server, Cpu } from "lucide-react";
import { useToast } from "../../contexts/toast";

type APIProvider = "openai" | "gemini" | "anthropic" | "openrouter" | "ollama";

type AIModel = {
  id: string;
  name: string;
  description: string;
};

type ModelCategory = {
  key: "extractionModel" | "solutionModel" | "debuggingModel";
  title: string;
  description: string;
  openaiModels: AIModel[];
  geminiModels: AIModel[];
  anthropicModels: AIModel[];
};

// Define available models for each category
const modelCategories: ModelCategory[] = [
  {
    key: "extractionModel",
    title: "Problem Extraction",
    description:
      "Model used to analyze screenshots and extract problem details",
    openaiModels: [
      { id: "gpt-4o", name: "gpt-4o", description: "Best overall performance" },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "Faster, cost-effective",
      },
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Best overall performance",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Faster, cost-effective",
      },
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "Best overall performance",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance",
      },
    ],
  },
  {
    key: "solutionModel",
    title: "Solution Generation",
    description: "Model used to generate coding solutions",
    openaiModels: [
      {
        id: "gpt-4o",
        name: "gpt-4o",
        description: "Strong overall performance",
      },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "Faster, cost-effective",
      },
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Strong overall performance",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Faster, cost-effective",
      },
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "Best available",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance",
      },
    ],
  },
  {
    key: "debuggingModel",
    title: "Debugging",
    description: "Model used to debug and improve solutions",
    openaiModels: [
      { id: "gpt-4o", name: "gpt-4o", description: "Best for analyzing code" },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "Faster, cost-effective",
      },
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Best for analyzing code",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Faster, cost-effective",
      },
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "Best for analyzing code",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance",
      },
    ],
  },
];

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({
  open: externalOpen,
  onOpenChange,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(externalOpen || false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState<APIProvider>("openai");
  const [extractionModel, setExtractionModel] = useState("gpt-4o");
  const [solutionModel, setSolutionModel] = useState("gpt-4o");
  const [debuggingModel, setDebuggingModel] = useState("gpt-4o");
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(
    "http://localhost:11434/v1",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange && newOpen !== externalOpen) {
      onOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      interface Config {
        apiKey?: string;
        apiProvider?: APIProvider;
        extractionModel?: string;
        solutionModel?: string;
        debuggingModel?: string;
        ollamaBaseUrl?: string;
      }

      window.electronAPI
        .getConfig()
        .then((config: Config) => {
          setApiKey(config.apiKey || "");
          setApiProvider(config.apiProvider || "openai");
          setExtractionModel(config.extractionModel || "gpt-4o");
          setSolutionModel(config.solutionModel || "gpt-4o");
          setDebuggingModel(config.debuggingModel || "gpt-4o");
          if (config.ollamaBaseUrl) setOllamaBaseUrl(config.ollamaBaseUrl);
        })
        .catch((error: unknown) => {
          console.error("Failed to load config:", error);
          showToast("Error", "Failed to load settings", "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, showToast]);

  const handleProviderChange = (provider: APIProvider) => {
    setApiProvider(provider);

    if (provider === "openai") {
      setExtractionModel("gpt-4o");
      setSolutionModel("gpt-4o");
      setDebuggingModel("gpt-4o");
    } else if (provider === "gemini") {
      setExtractionModel("gemini-1.5-pro");
      setSolutionModel("gemini-1.5-pro");
      setDebuggingModel("gemini-1.5-pro");
    } else if (provider === "anthropic") {
      setExtractionModel("claude-3-7-sonnet-20250219");
      setSolutionModel("claude-3-7-sonnet-20250219");
      setDebuggingModel("claude-3-7-sonnet-20250219");
    } else if (provider === "openrouter") {
      setExtractionModel("google/gemini-2.0-flash-001");
      setSolutionModel("google/gemini-2.0-flash-001");
      setDebuggingModel("google/gemini-2.0-flash-001");
    } else if (provider === "ollama") {
      setExtractionModel("llama3.2-vision");
      setSolutionModel("deepseek-r1");
      setDebuggingModel("deepseek-r1");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.updateConfig({
        apiKey,
        apiProvider,
        extractionModel,
        solutionModel,
        debuggingModel,
        ollamaBaseUrl,
      });

      if (result) {
        showToast("Success", "Settings saved successfully", "success");
        handleOpenChange(false);

        // Force reload app to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return "";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const openExternalLink = (url: string) => {
    window.electronAPI.openLink(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-black border border-white/10 text-white settings-dialog"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(450px, 90vw)",
          height: "auto",
          minHeight: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          zIndex: 9999,
          margin: 0,
          padding: "20px",
          opacity: 0.98,
        }}
      >
        <DialogHeader>
          <DialogTitle>Intervue Coder Settings</DialogTitle>
          <DialogDescription className="text-white/70">
            Configure your AI provider and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Provider Selection Row 1 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              API Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => handleProviderChange("openai")}
                className={`p-2 rounded-lg cursor-pointer text-center border ${apiProvider === "openai" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="text-xs font-bold">OpenAI</div>
              </div>
              <div
                onClick={() => handleProviderChange("gemini")}
                className={`p-2 rounded-lg cursor-pointer text-center border ${apiProvider === "gemini" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="text-xs font-bold">Gemini</div>
              </div>
              <div
                onClick={() => handleProviderChange("anthropic")}
                className={`p-2 rounded-lg cursor-pointer text-center border ${apiProvider === "anthropic" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="text-xs font-bold">Anthropic</div>
              </div>
              <div
                onClick={() => handleProviderChange("openrouter")}
                className={`p-2 rounded-lg cursor-pointer text-center border ${apiProvider === "openrouter" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="text-xs font-bold">OpenRouter</div>
              </div>
              <div
                onClick={() => handleProviderChange("ollama")}
                className={`p-2 rounded-lg cursor-pointer text-center border ${apiProvider === "ollama" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="text-xs font-bold">Ollama</div>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            {apiProvider === "ollama" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Ollama Base URL
                </label>
                <Input
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="http://localhost:11434/v1"
                />
                <p className="text-xs text-white/50">
                  Ensure Ollama is running (`ollama serve`).
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={
                    apiProvider === "openrouter" ? "sk-or-..." : "API Key"
                  }
                />
                {apiKey && (
                  <p className="text-xs text-white/50">
                    Current: {maskApiKey(apiKey)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-4 pt-2">
            <label className="text-sm font-medium text-white block border-b border-white/10 pb-1">
              Model Selection
            </label>

            {["extractionModel", "solutionModel", "debuggingModel"].map(
              (key) => {
                const currentVal =
                  key === "extractionModel"
                    ? extractionModel
                    : key === "solutionModel"
                      ? solutionModel
                      : debuggingModel;
                const setVal =
                  key === "extractionModel"
                    ? setExtractionModel
                    : key === "solutionModel"
                      ? setSolutionModel
                      : setDebuggingModel;
                const label =
                  key === "extractionModel"
                    ? "Extraction / Vision"
                    : key === "solutionModel"
                      ? "Solution"
                      : "Debugging";
                const isCustom =
                  apiProvider === "openrouter" || apiProvider === "ollama";

                return (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-white/70">{label}</label>
                    {isCustom ? (
                      <Input
                        value={currentVal}
                        onChange={(e) => setVal(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-8 text-xs"
                        placeholder={
                          apiProvider === "ollama"
                            ? "e.g. llama3.2-vision"
                            : "e.g. google/gemini-2.0-flash-001"
                        }
                      />
                    ) : (
                      <div className="space-y-1">
                        {(apiProvider === "openai"
                          ? modelCategories.find((c) => c.key === key)
                              ?.openaiModels
                          : apiProvider === "gemini"
                            ? modelCategories.find((c) => c.key === key)
                                ?.geminiModels
                            : modelCategories.find((c) => c.key === key)
                                ?.anthropicModels
                        )?.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setVal(m.id)}
                            className={`px-3 py-2 rounded border cursor-pointer flex justify-between items-center ${currentVal === m.id ? "bg-white/20 border-white/30" : "bg-black/20 border-white/5 hover:bg-white/5"}`}
                          >
                            <span className="text-xs font-medium">
                              {m.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-white text-black hover:bg-white/90"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
