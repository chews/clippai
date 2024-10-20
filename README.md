# Clipp-AI: Your AI-Powered Defi wizard.

![Clipp-AI Logo](https://via.placeholder.com/150x150.png?text=Clipp-AI)

Clipp-AI is a Chrome extension that brings the nostalgia of Clippy from Microsoft Office into the modern age, powered by the advanced language model Claude AI.

## Features

- 🤖 AI-powered assistance using Claude AI
- 🔗 Domain-specific prompts
- 👀 Unobtrusive yet always ready to help
- 🎨 Retro-inspired Clippy interface

## Prizes

## How It Works

Clipp-AI operates by parsing URLs from a JSON file hosted on GitHub. When you navigate to a website, the extension checks if there's a special token `|claudeai|` in the JSON that matches the current domain. If present, Clipp-AI strips the token and sends the remaining text as a prompt to Claude AI.

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the cloned repository folder

## Configuration

The extension uses a JSON file to determine which domains to activate on and what prompts to send. The format is as follows:

```json
{
  "app.uniswap.com": "|claudeai|How can I swap ethereum for USDC",
  "opensea.com": "|claudeai|I have base eth, how to I buy this NFT?"
}
```

## Usage

Once installed, Clipp-AI will appear on supported websites. Click on Clippy to interact with the AI assistant.


## Acknowledgments
- ETHGlobal for being great humans
- Inspired by Microsoft's Clippy
- Powered by Claude AI from Anthropic
- Built with love by @chews

---
Happy coding, and enjoy your new AI-powered crypto assistant! 📎✨
