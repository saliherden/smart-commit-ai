# 🤖 AI Commit Message Generator

A powerful VS Code extension that automatically generates conventional commit messages using AI by analyzing your git diffs. This extension integrates with multiple AI providers to create meaningful, standardized commit messages following conventional commit standards.

## ✨ Features

- 🧠 **AI-Powered Generation**: Analyze git diffs and generate intelligent commit messages
- 🔒 **Secure API Key Management**: Store API keys securely using VS Code's SecretStorage
- 🔧 **Multi-Provider Support**: Compatible with OpenAI, Groq, and other OpenAI-compatible APIs
- 📁 **Multi-Repository Support**: Works with multi-root workspaces and nested repositories
- ✅ **Input Validation**: Comprehensive validation and sanitization for all inputs
- 🎯 **Conventional Commits**: Follows conventional commit standards (feat, fix, docs, etc.)
- 🚀 **Smart Diff Processing**: Intelligent git diff analysis with security filtering

## 🚀 Quick Start

### Prerequisites

- **VS Code** version 1.80.0 or higher
- **Git** repository in your workspace
- **API Key** from supported AI provider

### Installation

1. **Install from VS Code Marketplace** (recommended)
    - Open VS Code
    - Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
    - Search for "AI Commit Message Generator"
    - Click **Install**

2. **Install Manually**

    ```bash
    # Clone the repository
    git clone https://github.com/saliherden/smart-commit-ai.git
    cd smart-commit-ai

    # Install dependencies
    npm install

    # Compile the extension
    npm run compile

    # Package the extension
    npm run package
    ```

## 🔧 Configuration

### 1. Set Up API Key

**Important**: API keys are now stored securely using VS Code's SecretStorage instead of settings.json for enhanced security.

1. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type and select: **"AI: Set API Key"**
3. Enter your API key when prompted

**Supported API Key Formats:**

- **Groq**: `gsk_your_api_key_here_...`
- **OpenAI**: `sk-proj_your_api_key_here_...`
- **Custom**: Any alphanumeric key 20+ characters

### 2. Configure AI Provider

#### Option A: Using VS Code Settings (Recommended)

1. Open **Settings** (`Ctrl+,` or `Cmd+,`)
2. Search for "AI Commit"
3. Configure the following settings:

```json
{
    "aiCommit.apiUrl": "https://api.groq.com/openai/v1/chat/completions",
    "aiCommit.model": "llama3-8b-8192",
    "aiCommit.temperature": 0.2
}
```

#### Option B: Using settings.json

```json
{
    "aiCommit.apiUrl": "https://api.groq.com/openai/v1/chat/completions",
    "aiCommit.model": "llama3-8b-8192",
    "aiCommit.temperature": 0.2
}
```

### 3. Supported AI Providers

#### 🟢 Groq (Recommended - Fast & Free)

```json
{
    "aiCommit.apiUrl": "https://api.groq.com/openai/v1/chat/completions",
    "aiCommit.model": "llama3-8b-8192"
}
```

**Available Models:**

- `llama3-8b-8192` (8B parameters, fast)
- `llama3-70b-8192` (70B parameters, capable)
- `mixtral-8x7b-32768` (47B parameters, balanced)
- `gemma-7b-it` (7B parameters, efficient)

#### 🟡 OpenAI (Paid)

```json
{
    "aiCommit.apiUrl": "https://api.openai.com/v1/chat/completions",
    "aiCommit.model": "gpt-4"
}
```

**Available Models:**

- `gpt-4` (Most capable)
- `gpt-3.5-turbo` (Fast, cost-effective)
- `gpt-4-turbo` (Latest, balanced)

#### 🔵 Custom Providers

Any OpenAI-compatible API endpoint is supported:

```json
{
    "aiCommit.apiUrl": "https://your-custom-api.com/v1/chat/completions",
    "aiCommit.model": "your-model-name"
}
```

## 📖 Usage

### Basic Usage

1. **Make changes** to your code
2. **Stage your changes** using git:
    ```bash
    git add .
    ```
3. **Generate commit message**:
    - Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
    - Type and select: **"AI: Generate Commit Message"**
    - Wait for the AI to analyze your changes
4. **Review and commit**: The generated message will appear in the Git input box

### Advanced Usage

#### Working with Multiple Repositories

If you have a multi-root workspace:

1. Run **"AI: Generate Commit Message"**
2. **Select repository** from the dropdown if multiple repositories are found
3. Extension will analyze the selected repository

#### Managing API Keys

```bash
# Set new API key
> AI: Set API Key

# Clear existing API key
> AI: Clear API Key
```

### Contributing

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

_Happy coding! 🚀_
