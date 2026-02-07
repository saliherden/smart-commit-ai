import * as vscode from "vscode";
import fetch from "node-fetch";
import { SecretStorageService } from "./secretStorage";
import { ValidationService } from "./validation";

export async function generateCommitMessage(
    diff: string,
    secretStorage: SecretStorageService,
): Promise<string> {
    const config = vscode.workspace.getConfiguration("aiCommit");

    const apiUrl = config.get<string>("apiUrl")!;
    const apiKey = await secretStorage.getApiKey();
    const model = config.get<string>("model")!;
    const temperature = config.get<number>("temperature") ?? 0.2;

    ValidationService.validateGitDiff(diff);
    
    if (!apiKey) {
        throw new Error(
            "API key not set. Please use 'AI: Set API Key' command to configure your API key.",
        );
    }

    ValidationService.validateConfig({
        apiUrl,
        model,
        temperature,
    });

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "user",
                        content: `You are an expert software engineer. Analyze the following git diff and generate a **short, clear, conventional commit message** that summarizes the change. - Use conventional commit types (feat, fix, chore, refactor, docs, test, perf, ci). - Mention the main file, module, or feature affected if possible. - Keep the message under 72 characters if possible. - Do **not** include explanations, code snippets, or extra text. - If the diff includes multiple unrelated changes, pick the most important one. Git diff:\n\n ${diff}`,
                    },
                ],
                temperature,
            }),
        });

        const data = (await response.json()) as {
            choices: {message: {content: string}}[];
            error?: {message: string; type: string};
        };

        if (!response.ok) {
            if (data.error?.message) {
                throw new Error(`API Error: ${data.error.message}`);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }

        if (!data.choices || data.choices.length === 0) {
            throw new Error("No response generated from AI service");
        }

        const content = data.choices[0].message.content;
        if (!content || content.trim().length === 0) {
            throw new Error("Empty response received from AI service");
        }

        const sanitizedContent = ValidationService.sanitizeCommitMessage(content);
        ValidationService.validateCommitMessage(sanitizedContent);
        
        return sanitizedContent;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error: Unable to connect to AI service");
        }
        throw error;
    }
}
