import {execSync} from "child_process";
import * as vscode from "vscode";

interface GitRepository {
    path: string;
    name: string;
    root: boolean;
}

async function findGitRepositories(): Promise<GitRepository[]> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new Error("No workspace folder found");
    }

    const repositories: GitRepository[] = [];

    for (const folder of folders) {
        const folderPath = folder.uri.fsPath;
        
        try {
            // Check if this folder is a git repository
            execSync("git rev-parse --git-dir", {
                cwd: folderPath,
                stdio: "ignore",
            });

            repositories.push({
                path: folderPath,
                name: folder.name,
                root: true,
            });

            // Also check for nested git repositories
            try {
                const gitDirs = execSync("find . -type d -name .git", {
                    cwd: folderPath,
                    encoding: "utf8",
                }).trim().split("\n").filter(Boolean);

                for (const gitDir of gitDirs) {
                    if (gitDir !== "./.git") {
                        const nestedRepoPath = gitDir.replace("/.git", "");
                        const relativePath = nestedRepoPath.replace("./", "");
                        repositories.push({
                            path: `${folderPath}/${relativePath}`,
                            name: `${folder.name}/${relativePath}`,
                            root: false,
                        });
                    }
                }
            } catch (error) {
                // No nested repositories, continue
            }
        } catch (error) {
            // This folder is not a git repository
            continue;
        }
    }

    if (repositories.length === 0) {
        throw new Error("No git repository found in workspace");
    }

    return repositories;
}

async function selectRepository(repositories: GitRepository[]): Promise<GitRepository> {
    if (repositories.length === 1) {
        return repositories[0];
    }

    const items = repositories.map(repo => ({
        label: repo.name,
        description: repo.root ? "workspace root" : "nested repository",
        detail: repo.path,
        repository: repo,
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a git repository to analyze",
        title: "Multiple Git Repositories Found",
    });

    if (!selected) {
        throw new Error("Repository selection cancelled");
    }

    return selected.repository;
}

function validateGitRepository(repoPath: string): void {
    try {
        execSync("git status --porcelain", {
            cwd: repoPath,
            stdio: "ignore",
        });
    } catch (error) {
        throw new Error(`Git repository at ${repoPath} is not accessible`);
    }
}

function sanitizeGitDiff(diff: string): string {
    const lines = diff.split("\n");
    const sanitizedLines: string[] = [];
    
    for (const line of lines) {
        // Remove potential secrets from added lines
        if (line.startsWith("+")) {
            let sanitizedLine = line;
            
            sanitizedLine = sanitizedLine.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[EMAIL]");
            sanitizedLine = sanitizedLine.replace(/(password|token|key|secret)\s*[:=]\s*["']?[a-zA-Z0-9+\/]{20,}["']?/gi, "$1: [REDACTED]");
            sanitizedLine = sanitizedLine.replace(/(sk-[a-zA-Z0-9]{20,})/g, "[API_KEY]");
            
            sanitizedLines.push(sanitizedLine);
        } else {
            sanitizedLines.push(line);
        }
    }
    
    return sanitizedLines.join("\n");
}

function formatGitDiff(rawDiff: string): string {
    if (!rawDiff.trim()) {
        throw new Error("No changes detected");
    }

    const diffLines = rawDiff.split("\n");
    const summary: string[] = [];
    let currentFile = "";
    let fileLines: string[] = [];
    let changeCount = 0;

    for (const line of diffLines) {
        if (line.startsWith("diff --git")) {
            if (fileLines.length) {
                summary.push(
                    `Changes in ${currentFile}:\n${fileLines.join("\n")}`,
                );
            }

            const parts = line.split(" b/");
            currentFile = parts[1] || "unknown file";
            fileLines = [];
            changeCount = 0;
        } else if (fileLines.length < 20 && changeCount < 100) {
            fileLines.push(line);
            if (line.startsWith("+") || line.startsWith("-")) {
                changeCount++;
            }
        }
    }

    if (fileLines.length) {
        summary.push(`Changes in ${currentFile}:\n${fileLines.join("\n")}`);
    }

    return summary.join("\n\n");
}

export async function getGitDiff(): Promise<string> {
    try {
        const repositories = await findGitRepositories();
        const selectedRepo = await selectRepository(repositories);
        
        validateGitRepository(selectedRepo.path);

        const rawDiff = execSync("git diff", {
            cwd: selectedRepo.path,
            encoding: "utf8",
        });

        const sanitizedDiff = sanitizeGitDiff(rawDiff);
        return formatGitDiff(sanitizedDiff);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get git diff");
    }
}
