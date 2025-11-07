import { AbstractEntity } from '@/database/abstract.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom',
}

@Entity('ai_model_configurations')
@Index(['id'], { unique: true })
export class AiModelConfiguration extends AbstractEntity<AiModelConfiguration> {
  @PrimaryGeneratedColumn('uuid', { name: 'model_id' })
  modelId: string;

  @Column({ type: 'enum', enum: AiProvider })
  provider: AiProvider;

  @Column({ name: 'model_name', type: 'varchar', length: 100 })
  modelName: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'api_endpoint', type: 'varchar', length: 500, nullable: true })
  apiEndpoint?: string;

  @Column({ name: 'api_key_encrypted', type: 'text', nullable: true })
  apiKeyEncrypted?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'max_tokens', type: 'integer', default: 4000 })
  maxTokens: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature: number;

  @Column({ name: 'top_p', type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  topP: number;

  @Column({ name: 'frequency_penalty', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  frequencyPenalty: number;

  @Column({ name: 'presence_penalty', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  presencePenalty: number;

  // Helper method to get provider display name
  getProviderDisplayName(): string {
    switch (this.provider) {
      case AiProvider.OPENAI:
        return 'OpenAI';
      case AiProvider.ANTHROPIC:
        return 'Anthropic';
      case AiProvider.GOOGLE:
        return 'Google AI';
      case AiProvider.CUSTOM:
        return 'Custom Provider';
      default:
        return this.provider;
    }
  }

  // Helper method to check if API key is configured
  hasApiKey(): boolean {
    return !!this.apiKeyEncrypted;
  }

  // Helper method to get masked API key for display
  getMaskedApiKey(): string {
    if (!this.apiKeyEncrypted) return 'Not configured';
    return '••••••••••••••••';
  }
}