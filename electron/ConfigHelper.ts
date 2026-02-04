// ConfigHelper.ts
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { EventEmitter } from "events";
import { OpenAI } from "openai";

interface Config {
  apiKey: string;
  apiProvider: "openai" | "gemini" | "anthropic" | "openrouter" | "ollama";
  extractionModel: string;
  solutionModel: string;
  debuggingModel: string;
  language: string;
  opacity: number;
  ollamaBaseUrl?: string; // Optional, defaults to localhost
}

export class ConfigHelper extends EventEmitter {
  private configPath: string;
  private defaultConfig: Config = {
    apiKey: "",
    apiProvider: "gemini",
    extractionModel: "gemini-2.0-flash",
    solutionModel: "gemini-2.0-flash",
    debuggingModel: "gemini-2.0-flash",
    language: "python",
    opacity: 1.0,
    ollamaBaseUrl: "http://localhost:11434/v1",
  };

  constructor() {
    super();
    try {
      this.configPath = path.join(app.getPath("userData"), "config.json");
      console.log("Config path:", this.configPath);
    } catch (err) {
      console.warn("Could not access user data path, using fallback");
      this.configPath = path.join(process.cwd(), "config.json");
    }

    this.ensureConfigExists();
  }

  private ensureConfigExists(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.saveConfig(this.defaultConfig);
      }
    } catch (err) {
      console.error("Error ensuring config exists:", err);
    }
  }

  private sanitizeModelSelection(model: string, provider: string): string {
    if (provider === "openai") {
      const allowedModels = ["gpt-4o", "gpt-4o-mini", "o1-mini", "o3-mini"];
      if (!allowedModels.includes(model)) return "gpt-4o";
      return model;
    } else if (provider === "gemini") {
      const allowedModels = [
        "gemini-1.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-thinking-exp-01-21",
      ];
      if (!allowedModels.includes(model)) return "gemini-2.0-flash";
      return model;
    } else if (provider === "anthropic") {
      const allowedModels = [
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
      ];
      if (!allowedModels.includes(model)) return "claude-3-7-sonnet-20250219";
      return model;
    } else if (provider === "openrouter" || provider === "ollama") {
      // Allow any string for OpenRouter and Ollama as models change frequently
      return model;
    }
    return model;
  }

  public loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf8");
        const config = JSON.parse(configData);

        // Ensure apiProvider is valid
        const validProviders = [
          "openai",
          "gemini",
          "anthropic",
          "openrouter",
          "ollama",
        ];
        if (!validProviders.includes(config.apiProvider)) {
          config.apiProvider = "gemini";
        }

        // Sanitize models
        if (config.extractionModel)
          config.extractionModel = this.sanitizeModelSelection(
            config.extractionModel,
            config.apiProvider,
          );
        if (config.solutionModel)
          config.solutionModel = this.sanitizeModelSelection(
            config.solutionModel,
            config.apiProvider,
          );
        if (config.debuggingModel)
          config.debuggingModel = this.sanitizeModelSelection(
            config.debuggingModel,
            config.apiProvider,
          );

        return { ...this.defaultConfig, ...config };
      }

      this.saveConfig(this.defaultConfig);
      return this.defaultConfig;
    } catch (err) {
      console.error("Error loading config:", err);
      return this.defaultConfig;
    }
  }

  public saveConfig(config: Config): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir))
        fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (err) {
      console.error("Error saving config:", err);
    }
  }

  public updateConfig(updates: Partial<Config>): Config {
    try {
      const currentConfig = this.loadConfig();
      let provider = updates.apiProvider || currentConfig.apiProvider;

      // Auto-detect provider
      if (updates.apiKey && !updates.apiProvider) {
        const key = updates.apiKey.trim();
        if (key.startsWith("sk-ant-")) provider = "anthropic";
        else if (key.startsWith("sk-or-")) provider = "openrouter";
        else if (key.startsWith("sk-")) provider = "openai";
        else provider = "gemini";

        updates.apiProvider = provider;
      }

      // Reset models if provider changes
      if (
        updates.apiProvider &&
        updates.apiProvider !== currentConfig.apiProvider
      ) {
        if (updates.apiProvider === "openai") {
          updates.extractionModel = "gpt-4o";
          updates.solutionModel = "gpt-4o";
          updates.debuggingModel = "gpt-4o";
        } else if (updates.apiProvider === "anthropic") {
          updates.extractionModel = "claude-3-7-sonnet-20250219";
          updates.solutionModel = "claude-3-7-sonnet-20250219";
          updates.debuggingModel = "claude-3-7-sonnet-20250219";
        } else if (updates.apiProvider === "gemini") {
          updates.extractionModel = "gemini-2.0-flash";
          updates.solutionModel = "gemini-2.0-flash";
          updates.debuggingModel = "gemini-2.0-flash";
        } else if (updates.apiProvider === "openrouter") {
          updates.extractionModel = "google/gemini-2.0-flash-001";
          updates.solutionModel = "google/gemini-2.0-flash-001";
          updates.debuggingModel = "google/gemini-2.0-flash-001";
        } else if (updates.apiProvider === "ollama") {
          updates.extractionModel = "llama3.2-vision";
          updates.solutionModel = "deepseek-r1";
          updates.debuggingModel = "deepseek-r1";
        }
      }

      // Sanitize updates
      if (updates.extractionModel)
        updates.extractionModel = this.sanitizeModelSelection(
          updates.extractionModel,
          provider,
        );
      if (updates.solutionModel)
        updates.solutionModel = this.sanitizeModelSelection(
          updates.solutionModel,
          provider,
        );
      if (updates.debuggingModel)
        updates.debuggingModel = this.sanitizeModelSelection(
          updates.debuggingModel,
          provider,
        );

      const newConfig = { ...currentConfig, ...updates };
      this.saveConfig(newConfig);

      if (
        updates.apiKey !== undefined ||
        updates.apiProvider !== undefined ||
        updates.extractionModel !== undefined ||
        updates.solutionModel !== undefined ||
        updates.debuggingModel !== undefined ||
        updates.language !== undefined ||
        updates.ollamaBaseUrl !== undefined
      ) {
        this.emit("config-updated", newConfig);
      }

      return newConfig;
    } catch (error) {
      console.error("Error updating config:", error);
      return this.defaultConfig;
    }
  }

  public hasApiKey(): boolean {
    const config = this.loadConfig();
    if (config.apiProvider === "ollama") return true;
    return !!config.apiKey && config.apiKey.trim().length > 0;
  }

  public isValidApiKeyFormat(apiKey: string, provider?: string): boolean {
    if (!provider) return true; // Loose check if unknown

    if (provider === "openai")
      return /^sk-[a-zA-Z0-9]{32,}$/.test(apiKey.trim());
    if (provider === "gemini") return apiKey.trim().length >= 10;
    if (provider === "anthropic")
      return /^sk-ant-[a-zA-Z0-9]{32,}$/.test(apiKey.trim());
    if (provider === "openrouter") return apiKey.trim().startsWith("sk-or-");
    if (provider === "ollama") return true;

    return false;
  }

  public getOpacity(): number {
    return this.loadConfig().opacity || 1.0;
  }

  public setOpacity(opacity: number): void {
    const validOpacity = Math.min(1.0, Math.max(0.1, opacity));
    this.updateConfig({ opacity: validOpacity });
  }

  public getLanguage(): string {
    return this.loadConfig().language || "python";
  }

  public setLanguage(language: string): void {
    this.updateConfig({ language });
  }

  public async testApiKey(
    apiKey: string,
    provider?: string,
  ): Promise<{ valid: boolean; error?: string }> {
    if (!provider) {
      // Simple auto-detect attempt for testing
      if (apiKey.startsWith("sk-ant-")) provider = "anthropic";
      else if (apiKey.startsWith("sk-or-")) provider = "openrouter";
      else if (apiKey.startsWith("sk-")) provider = "openai";
      else provider = "gemini";
    }

    if (provider === "openai") return this.testOpenAIKey(apiKey);
    if (provider === "gemini") return this.testGeminiKey(apiKey);
    if (provider === "anthropic") return this.testAnthropicKey(apiKey);
    if (provider === "openrouter") return this.testOpenRouterKey(apiKey);
    if (provider === "ollama") return this.testOllamaConnection();

    return { valid: false, error: "Unknown API provider" };
  }

  private async testOpenAIKey(
    apiKey: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const openai = new OpenAI({ apiKey });
      await openai.models.list();
      return { valid: true };
    } catch (error: any) {
      console.error("OpenAI API key test failed:", error);
      let errorMessage = "Unknown error validating OpenAI API key";
      if (error.status === 401) errorMessage = "Invalid API key.";
      else if (error.status === 429) errorMessage = "Rate limit exceeded.";
      else if (error.message) errorMessage = `Error: ${error.message}`;
      return { valid: false, error: errorMessage };
    }
  }

  private async testGeminiKey(
    apiKey: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic check
      if (apiKey && apiKey.trim().length >= 20) return { valid: true };
      return { valid: false, error: "Invalid Gemini API key format." };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  private async testAnthropicKey(
    apiKey: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic check
      if (apiKey && /^sk-ant-[a-zA-Z0-9]{32,}$/.test(apiKey.trim()))
        return { valid: true };
      return { valid: false, error: "Invalid Anthropic API key format." };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  private async testOpenRouterKey(
    apiKey: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const openai = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
      await openai.models.list();
      return { valid: true };
    } catch (error: any) {
      console.error("OpenRouter key test failed:", error);
      return {
        valid: false,
        error: error.message || "Failed to connect to OpenRouter",
      };
    }
  }

  private async testOllamaConnection(): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const config = this.loadConfig();
      const baseUrl = config.ollamaBaseUrl || "http://localhost:11434/v1";
      const openai = new OpenAI({
        apiKey: "ollama",
        baseURL: baseUrl,
      });
      await openai.models.list();
      return { valid: true };
    } catch (error: any) {
      console.error("Ollama connection failed:", error);
      return {
        valid: false,
        error: "Could not connect to Ollama. Ensure it's running.",
      };
    }
  }
}

export const configHelper = new ConfigHelper();
