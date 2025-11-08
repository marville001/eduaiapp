import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditTargetType } from '../audit/entities/audit-log.entity';
import { AiModelConfigurationRepository } from './ai-model-configuration.repository';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { AiModelConfiguration, AiProvider } from './entities/ai-model-configuration.entity';

@Injectable()
export class AiModelConfigurationService {
  constructor(
    private readonly aiModelRepository: AiModelConfigurationRepository,
    private readonly auditService: AuditService,
  ) { }

  async getAllModels(): Promise<AiModelConfiguration[]> {
    return this.aiModelRepository.findAllModels();
  }

  async getActiveModels(): Promise<AiModelConfiguration[]> {
    return this.aiModelRepository.findActiveModels();
  }

  async getModelById(id: number): Promise<AiModelConfiguration> {
    const model = await this.aiModelRepository.findById(id);
    if (!model) {
      throw new NotFoundException('AI model not found');
    }
    return model;
  }

  async getDefaultModel(): Promise<AiModelConfiguration | null> {
    return this.aiModelRepository.findDefaultModel();
  }

  async createModel(
    data: CreateAiModelDto,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<AiModelConfiguration> {
    // Validate custom provider requirements
    if (data.provider === AiProvider.CUSTOM && !data.apiEndpoint) {
      throw new BadRequestException('API endpoint is required for custom providers');
    }

    // If this is set as default, ensure no other default exists
    if (data.isDefault) {
      const existingDefault = await this.aiModelRepository.findDefaultModel();
      if (existingDefault) {
        throw new ConflictException('A default AI model already exists. Please remove the default status from the existing model first.');
      }
    }

    // If no models exist and this is the first one, make it default
    const modelCount = await this.aiModelRepository.countActiveModels();
    if (modelCount === 0) {
      data.isDefault = true;
    }

    const model = await this.aiModelRepository.createWithEncryptedKey(data);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_CREATED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: model.id.toString(),
      details: `AI model created: ${model.displayName} (${model.provider})`,
      ipAddress,
      metadata: {
        modelId: model.id,
        provider: model.provider,
        isDefault: model.isDefault,
        hasApiKey: !!data.apiKey
      },
    });

    return model;
  }

  async updateModel(
    id: number,
    data: UpdateAiModelDto,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<AiModelConfiguration> {
    const existingModel = await this.getModelById(id);

    // Validate custom provider requirements
    if (data.provider === AiProvider.CUSTOM && !data.apiEndpoint && !existingModel.apiEndpoint) {
      throw new BadRequestException('API endpoint is required for custom providers');
    }

    // Handle default model logic
    if (data.isDefault === true) {
      const currentDefault = await this.aiModelRepository.findDefaultModel();
      if (currentDefault && currentDefault.id !== id) {
        throw new ConflictException('A default AI model already exists. Please remove the default status from the existing model first.');
      }
    }

    // Prevent removing default status if this is the only active model
    if (data.isDefault === false && existingModel.isDefault) {
      const activeCount = await this.aiModelRepository.countActiveModels();
      if (activeCount === 1) {
        throw new BadRequestException('Cannot remove default status from the only active AI model');
      }
    }

    const updatedModel = await this.aiModelRepository.updateWithEncryptedKey(id, data);

    if (!updatedModel) {
      throw new NotFoundException('Failed to update AI model');
    }

    const changedFields = Object.keys(data).filter(key => data[key] !== undefined);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_UPDATED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: updatedModel.id.toString(),
      details: `AI model updated: ${updatedModel.displayName}`,
      ipAddress,
      metadata: {
        modelId: updatedModel.id,
        updatedFields: changedFields,
        hasApiKeyUpdate: 'apiKey' in data
      },
    });

    return updatedModel;
  }

  async deleteModel(
    id: number,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<void> {
    const model = await this.getModelById(id);

    if (model.isDefault) {
      throw new BadRequestException('Cannot delete the default AI model. Please set another model as default first.');
    }

    await this.aiModelRepository.deleteModel(id);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_DELETED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: id.toString(),
      details: `AI model deleted: ${model.displayName} (${model.provider})`,
      ipAddress,
      metadata: {
        modelId: id,
        provider: model.provider,
        displayName: model.displayName
      },
    });
  }

  async setDefaultModel(
    id: number,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<void> {
    const model = await this.getModelById(id);

    if (!model.isActive) {
      throw new BadRequestException('Cannot set an inactive model as default');
    }

    console.log({ id });

    await this.aiModelRepository.setDefaultModel(id);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_DEFAULT_SET,
      targetType: AuditTargetType.AI_MODEL,
      targetId: id.toString(),
      details: `Default AI model set: ${model.displayName}`,
      ipAddress,
      metadata: { modelId: id, displayName: model.displayName },
    });
  }

  async toggleModelStatus(
    id: number,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<AiModelConfiguration> {
    const model = await this.getModelById(id);

    if (model.isDefault && model.isActive) {
      throw new BadRequestException('Cannot deactivate the default AI model. Please set another model as default first.');
    }

    const updatedModel = await this.aiModelRepository.toggleModelStatus(id);

    if (!updatedModel) {
      throw new NotFoundException('Failed to update model status');
    }

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_UPDATED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: id.toString(),
      details: `AI model ${updatedModel.isActive ? 'activated' : 'deactivated'}: ${updatedModel.displayName}`,
      ipAddress,
      metadata: {
        modelId: id,
        isActive: updatedModel.isActive,
        displayName: updatedModel.displayName
      },
    });

    return updatedModel;
  }

  async testModelConnection(
    id: number,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<boolean> {
    const model = await this.getModelById(id);

    if (!model.hasApiKey()) {
      throw new BadRequestException('API key not configured for this model');
    }

    const apiKey = await this.aiModelRepository.getDecryptedApiKey(id);
    if (!apiKey) {
      throw new BadRequestException('Failed to retrieve API key');
    }

    // Test connection based on provider
    const isConnected = await this.testProviderConnection(model, apiKey);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_CONNECTION_TESTED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: id.toString(),
      details: `AI model connection test ${isConnected ? 'successful' : 'failed'}: ${model.displayName}`,
      ipAddress,
      metadata: {
        modelId: id,
        provider: model.provider,
        connectionSuccess: isConnected
      },
    });

    return isConnected;
  }

  async getDecryptedApiKey(id: number): Promise<string | null> {
    const model = await this.getModelById(id);
    if (!model.hasApiKey()) {
      throw new BadRequestException('API key not configured for this model');
    }

    const apiKey = await this.aiModelRepository.getDecryptedApiKey(id);

    return apiKey;
  }

  async getModelsByProvider(provider: AiProvider): Promise<AiModelConfiguration[]> {
    return this.aiModelRepository.findByProvider(provider);
  }

  private async testProviderConnection(
    model: AiModelConfiguration,
    apiKey: string,
  ): Promise<boolean> {
    try {
      switch (model.provider) {
        case AiProvider.OPENAI:
          return await this.testOpenAIConnection(apiKey);
        case AiProvider.ANTHROPIC:
          return await this.testAnthropicConnection(apiKey);
        case AiProvider.GOOGLE:
          return await this.testGoogleAIConnection(apiKey);
        case AiProvider.CUSTOM:
          return await this.testCustomConnection(model.apiEndpoint!, apiKey);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Connection test failed for ${model.provider}:`, error.message);
      return false;
    }
  }

  private async testOpenAIConnection(apiKey: string): Promise<boolean> {
    // Implement OpenAI API test call
    // This is a placeholder - implement actual API call
    return true;
  }

  private async testAnthropicConnection(apiKey: string): Promise<boolean> {
    // Implement Anthropic API test call
    // This is a placeholder - implement actual API call
    return true;
  }

  private async testGoogleAIConnection(apiKey: string): Promise<boolean> {
    // Implement Google AI API test call
    // This is a placeholder - implement actual API call
    return true;
  }

  private async testCustomConnection(endpoint: string, apiKey: string): Promise<boolean> {
    // Implement custom endpoint test call
    // This is a placeholder - implement actual API call
    return true;
  }
}