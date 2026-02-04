# Intervue Coder

> **Made by Suryanshu Nabheet**

> ## The Ultimate Interview Assistant
>
> Intervue Coder is a premium, powerful, and invisible desktop application designed to be your ultimate companion for technical interviews. Built with precision and privacy in mind, it provides real-time AI assistance, solution generation, and debugging capabilities right at your fingertips.

## Features

- **100% Invisible Mode**: An undetectable window that bypasses screen sharing detection (Zoom, Discord, etc.).
- **Multi-LLM Support**: Integrated with OpenAI, Anthropic (Claude), Gemini, OpenRouter, and Ollama (Local LLMs).
- **Smart Vision**: Instantly extracts problem details from screenshots using advanced Vision models.
- **Instant Solutions**: Generates optimized code solutions with detailed time & space complexity analysis.
- **Live Debugging**: Analyze errors and refine your code in real-time.
- **Privacy First**: Your data stays local. API keys are stored securely on your machine.
- **Custom Experience**: Fully adjustable window opacity, position, and zoom.

## Prerequisites

- Node.js (v16 or higher)
- API Key (OpenAI, Anthropic, Gemini, or OpenRouter) OR a local Ollama setup.
- Screen Recording Permission (macOS)

## Quick Start

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/Suryanshu-Nabheet/Intervue_Coder.git
    cd Intervue_Coder
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run the Application**
    - **Mac/Linux:**
      ```bash
      chmod +x stealth-run.sh
      ./stealth-run.sh
      ```
    - **Windows:**
      ```bash
      stealth-run.bat
      ```

    > **Note:** The window starts in **invisible mode**. Press `Ctrl+B` (or `Cmd+B` on Mac) to toggle visibility.

4.  **Configure AI**
    - Open Settings.
    - Choose your provider: OpenAI, Gemini, Anthropic, OpenRouter, or Ollama.
    - Enter your API Key or Local URL.
    - Start Coding!

## Global Controls

| Action                | Shortcut              |
| :-------------------- | :-------------------- |
| **Toggle Visibility** | `Cmd/Ctrl + B`        |
| **Take Screenshot**   | `Cmd/Ctrl + H`        |
| **Process Problem**   | `Cmd/Ctrl + Enter`    |
| **Delete Screenshot** | `Cmd/Ctrl + L`        |
| **Reset/New Problem** | `Cmd/Ctrl + R`        |
| **Move Window**       | `Cmd/Ctrl + Arrows`   |
| **Adjust Opacity**    | `Cmd/Ctrl + [` or `]` |

## Building

To create a distributable application for your OS:

```bash
# macOS
npm run package-mac

# Windows
npm run package-win
```

## License

This project is licensed under the **MIT**.

Copyright © 2025 Suryanshu Nabheet.

## Contributing

Contributions are welcome! If you'd like to improve Intervue Coder, please fork the repository and submit a pull request.

---

**Intervue Coder** — Engineered for Excellence by Suryanshu Nabheet.
