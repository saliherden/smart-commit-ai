import * as vscode from "vscode";

import {getGitDiff} from "./git";
import {generateCommitMessage} from "./ai";
import {SecretStorageService} from "./secretStorage";

export async function activate(context: vscode.ExtensionContext) {
    const secretStorage = SecretStorageService.getInstance(context);

    const generateCommand = vscode.commands.registerCommand(
        "aiCommit.generate",
        async () => {
            try {
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Generating commit message...",
                        cancellable: false,
                    },
                    async () => {
                        const diff = await getGitDiff();
                        if (!diff.trim()) {
                            throw new Error("No changes detected");
                        }

                        const message = await generateCommitMessage(
                            diff,
                            secretStorage,
                        );

                        const gitExtension =
                            vscode.extensions.getExtension(
                                "vscode.git",
                            )?.exports;
                        const git = gitExtension?.getAPI(1);

                        if (!git) {
                            throw new Error("Git extension not available");
                        }

                        const repo = git.repositories[0];
                        if (!repo) {
                            throw new Error("No git repository found");
                        }

                        repo.inputBox.value = message;

                        vscode.window.showInformationMessage(
                            "Commit message inserted.",
                        );
                    },
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                vscode.window.showErrorMessage(errorMessage);
            }
        },
    );

    const setApiKeyCommand = vscode.commands.registerCommand(
        "aiCommit.setApiKey",
        async () => {
            try {
                const apiKey = await vscode.window.showInputBox({
                    prompt: "Enter your API key",
                    password: true,
                    placeHolder: "sk-...",
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return "API key cannot be empty";
                        }
                        return null;
                    },
                });

                if (apiKey) {
                    try {
                        await secretStorage.storeApiKey(apiKey);
                        vscode.window.showInformationMessage(
                            "API key saved successfully",
                        );
                    } catch (validationError) {
                        vscode.window.showErrorMessage(
                            validationError instanceof Error
                                ? validationError.message
                                : "Invalid API key format",
                        );
                    }
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                vscode.window.showErrorMessage(errorMessage);
            }
        },
    );

    const clearApiKeyCommand = vscode.commands.registerCommand(
        "aiCommit.clearApiKey",
        async () => {
            try {
                const confirmation = await vscode.window.showWarningMessage(
                    "Are you sure you want to clear your API key?",
                    "Yes",
                    "No",
                );

                if (confirmation === "Yes") {
                    await secretStorage.deleteApiKey();
                    vscode.window.showInformationMessage(
                        "API key cleared successfully",
                    );
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                vscode.window.showErrorMessage(errorMessage);
            }
        },
    );

    context.subscriptions.push(
        generateCommand,
        setApiKeyCommand,
        clearApiKeyCommand,
    );
}

export function deactivate() {}
