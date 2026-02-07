import * as vscode from "vscode";

import {ValidationService} from "./validation";

export class SecretStorageService {
    private static instance: SecretStorageService;
    private readonly secretStorage: vscode.SecretStorage;

    private constructor(context: vscode.ExtensionContext) {
        this.secretStorage = context.secrets;
    }

    public static getInstance(
        context: vscode.ExtensionContext,
    ): SecretStorageService {
        if (!SecretStorageService.instance) {
            SecretStorageService.instance = new SecretStorageService(context);
        }
        return SecretStorageService.instance;
    }

    public async storeApiKey(apiKey: string): Promise<void> {
        ValidationService.validateApiKey(apiKey);
        const sanitizedKey = ValidationService.sanitizeInput(apiKey);
        await this.secretStorage.store("aiCommit.apiKey", sanitizedKey);
    }

    public async getApiKey(): Promise<string | undefined> {
        const key = await this.secretStorage.get("aiCommit.apiKey");
        return key ? ValidationService.sanitizeInput(key) : undefined;
    }

    public async deleteApiKey(): Promise<void> {
        await this.secretStorage.delete("aiCommit.apiKey");
    }

    public async hasApiKey(): Promise<boolean> {
        const key = await this.getApiKey();
        return key !== undefined && key.length > 0;
    }
}
