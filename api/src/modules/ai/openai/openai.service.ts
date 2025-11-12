import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AiModelConfigurationService } from '../../settings/ai-model-configuration.service';

@Injectable()
export class OpenAiService {
	private readonly logger = new Logger(OpenAiService.name);

	constructor(
		private readonly modelService: AiModelConfigurationService,
	) { }

	async getInstance(apiKey: string) {
		const openai = new OpenAI({
			apiKey: apiKey,
		});
		return openai;
	}

	async testApiKey(apiKey: string): Promise<boolean> {
		try {
			const openai = await this.getInstance(apiKey);
			// Make a simple request to verify the API key
			await openai.models.list();
			return true;
		} catch (error) {
			this.logger.error('Failed to validate OpenAI API key', error);
			return false;
		}
	}

	async chat(input: OpenAI.Responses.ResponseInput) {
		const model = await this.modelService.getDefaultModel();
		if (!model) {
			this.logger.error('Failed to find default AI model configuration');
			throw new Error('Failed to find default AI model configuration');
		}
		const apiKey = await this.modelService.getDecryptedApiKey(model.id);
		if (!apiKey) {
			this.logger.error('Failed to decrypt API key for default AI model');
			throw new Error('Failed to decrypt API key for default AI model');
		}

		const client = await this.getInstance(apiKey);

		return await client.responses.create({
			model: model.modelName,
			input,
		});
	}
}