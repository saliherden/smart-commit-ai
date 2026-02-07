export class ValidationService {
    private static readonly MAX_DIFF_LENGTH = 50000;
    private static readonly MAX_API_KEY_LENGTH = 500;
    private static readonly MAX_COMMIT_MESSAGE_LENGTH = 200;

    public static validateApiKey(apiKey: string): void {
        if (!apiKey) {
            throw new Error("API key is required");
        }

        if (typeof apiKey !== "string") {
            throw new Error("API key must be a string");
        }

        if (apiKey.trim().length === 0) {
            throw new Error("API key cannot be empty");
        }

        if (apiKey.length > this.MAX_API_KEY_LENGTH) {
            throw new Error("API key is too long");
        }

        const validPatterns = [
            /^[a-zA-Z0-9_-]{20,}$/, // Generic API keys
            /^sk-[a-zA-Z0-9_-]{20,}$/, // OpenAI-style keys
            /^gsk_[a-zA-Z0-9_-]{20,}$/, // Groq-style keys
        ];

        const isValidPattern = validPatterns.some((pattern) =>
            pattern.test(apiKey.trim()),
        );
        if (!isValidPattern) {
            console.warn("API key format may be invalid");
        }
    }

    public static validateGitDiff(diff: string): void {
        if (!diff) {
            throw new Error("Git diff is required");
        }

        if (typeof diff !== "string") {
            throw new Error("Git diff must be a string");
        }

        if (diff.length > this.MAX_DIFF_LENGTH) {
            throw new Error("Git diff is too large for processing");
        }

        // Check for potentially malicious content
        const dangerousPatterns = [
            /eval\s*\(/i,
            /exec\s*\(/i,
            /system\s*\(/i,
            /<script/i,
            /javascript:/i,
            /data:text\/html/i,
        ];

        const hasDangerousContent = dangerousPatterns.some((pattern) =>
            pattern.test(diff),
        );
        if (hasDangerousContent) {
            throw new Error("Git diff contains potentially dangerous content");
        }
    }

    public static validateCommitMessage(message: string): void {
        if (!message) {
            throw new Error("Commit message is required");
        }

        if (typeof message !== "string") {
            throw new Error("Commit message must be a string");
        }

        if (message.trim().length === 0) {
            throw new Error("Commit message cannot be empty");
        }

        if (message.length > this.MAX_COMMIT_MESSAGE_LENGTH) {
            throw new Error("Commit message is too long");
        }

        // Check for conventional commit format
        const conventionalCommitPattern =
            /^(feat|fix|chore|refactor|docs|test|perf|ci|build|style|revert)(\(.+\))?: .+/;
        if (!conventionalCommitPattern.test(message.trim())) {
            console.warn(
                "Commit message does not follow conventional commit format",
            );
        }
    }

    public static sanitizeInput(input: string): string {
        if (typeof input !== "string") {
            throw new Error("Input must be a string");
        }

        return input
            .trim()
            .replace(/[\x00-\x1F\x7F]/g, "")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            .substring(0, 10000);
    }

    public static sanitizeCommitMessage(message: string): string {
        if (typeof message !== "string") {
            throw new Error("Message must be a string");
        }

        return message
            .trim()
            .replace(/[\"\'\`\\]/g, "")
            .replace(/[\r\n]/g, " ")
            .substring(0, this.MAX_COMMIT_MESSAGE_LENGTH);
    }

    public static validateConfig(config: {
        apiUrl?: string;
        model?: string;
        temperature?: number;
    }): void {
        if (config.apiUrl) {
            this.validateApiUrl(config.apiUrl);
        }

        if (config.model) {
            this.validateModel(config.model);
        }

        if (config.temperature !== undefined) {
            this.validateTemperature(config.temperature);
        }
    }

    private static validateApiUrl(url: string): void {
        try {
            const parsedUrl = new URL(url);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("API URL must use HTTP or HTTPS protocol");
            }
        } catch (error) {
            throw new Error("Invalid API URL format");
        }
    }

    private static validateModel(model: string): void {
        if (!model || model.trim().length === 0) {
            throw new Error("Model name cannot be empty");
        }

        if (model.length > 100) {
            throw new Error("Model name is too long");
        }
    }

    private static validateTemperature(temperature: number): void {
        if (typeof temperature !== "number" || isNaN(temperature)) {
            throw new Error("Temperature must be a valid number");
        }

        if (temperature < 0 || temperature > 2) {
            throw new Error("Temperature must be between 0 and 2");
        }
    }
}
