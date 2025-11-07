# Admin Settings Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the comprehensive admin settings system for the AI Education Platform. Follow this guide in the specified order to ensure proper integration with the existing codebase.

## Prerequisites
- Existing NestJS backend with TypeORM
- Next.js frontend with React Query
- Current permission system in place
- Existing audit logging system

## Implementation Steps

### Phase 1: Database Foundation

#### Step 1.1: Create Database Migration
Create a new migration file for the AI model configurations table and extend the system settings table.

**File:** `api/src/database/migrations/[timestamp]-AddAiModelConfigurationAndExtendSettings.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class AddAiModelConfigurationAndExtendSettings[timestamp] implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create AI Model Configurations table
    await queryRunner.createTable(
      new Table({
        name: 'ai_model_configurations',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isUnique: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'model_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'api_endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'api_key_encrypted',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'max_tokens',
            type: 'integer',
            default: 4000,
          },
          {
            name: 'temperature',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0.7,
          },
          {
            name: 'top_p',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 1.0,
          },
          {
            name: 'frequency_penalty',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'presence_penalty',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create unique constraint for default model
    await queryRunner.createIndex(
      'ai_model_configurations',
      new Index('idx_unique_default_model', ['is_default'], {
        where: 'is_default = true AND deleted_at IS NULL',
        isUnique: true,
      }),
    );

    // Extend system_settings table
    await queryRunner.query(`
      ALTER TABLE system_settings 
      ADD COLUMN IF NOT EXISTS app_logo VARCHAR(500),
      ADD COLUMN IF NOT EXISTS app_favicon VARCHAR(500),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS contact_address TEXT,
      ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(200),
      ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(200),
      ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(200),
      ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(200),
      ADD COLUMN IF NOT EXISTS max_file_upload_size INTEGER DEFAULT 10,
      ADD COLUMN IF NOT EXISTS allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
      ADD COLUMN IF NOT EXISTS default_ai_model_id INTEGER REFERENCES ai_model_configurations(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE system_settings DROP COLUMN IF EXISTS default_ai_model_id
    `);

    // Remove added columns
    await queryRunner.query(`
      ALTER TABLE system_settings 
      DROP COLUMN IF EXISTS app_logo,
      DROP COLUMN IF EXISTS app_favicon,
      DROP COLUMN IF EXISTS contact_phone,
      DROP COLUMN IF EXISTS contact_address,
      DROP COLUMN IF EXISTS social_facebook,
      DROP COLUMN IF EXISTS social_twitter,
      DROP COLUMN IF EXISTS social_linkedin,
      DROP COLUMN IF EXISTS social_instagram,
      DROP COLUMN IF EXISTS max_file_upload_size,
      DROP COLUMN IF EXISTS allowed_file_types
    `);

    // Drop AI model configurations table
    await queryRunner.dropTable('ai_model_configurations');
  }
}
```

#### Step 1.2: Update Audit Log Enums
Add new audit actions for AI model operations.

**File:** `api/src/modules/audit/entities/audit-log.entity.ts`

```typescript
// Add to existing AuditAction enum
export enum AuditAction {
  // ... existing actions
  AI_MODEL_CREATED = 'AI_MODEL_CREATED',
  AI_MODEL_UPDATED = 'AI_MODEL_UPDATED',
  AI_MODEL_DELETED = 'AI_MODEL_DELETED',
  AI_MODEL_DEFAULT_SET = 'AI_MODEL_DEFAULT_SET',
  AI_MODEL_API_KEY_VIEWED = 'AI_MODEL_API_KEY_VIEWED',
  AI_MODEL_CONNECTION_TESTED = 'AI_MODEL_CONNECTION_TESTED',
}

// Add to existing AuditTargetType enum
export enum AuditTargetType {
  // ... existing types
  AI_MODEL = 'AI_MODEL',
}
```

### Phase 2: Backend Implementation

#### Step 2.1: Create Encryption Service
Create a service to handle API key encryption and decryption.

**File:** `api/src/common/services/encryption.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private readonly configService: ConfigService) {}

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return crypto.scryptSync(key, 'salt', this.keyLength);
  }

  async encrypt(text: string): Promise<string> {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('ai-model-api-key'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv, tag, and encrypted data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  async decrypt(encryptedData: string): Promise<string> {
    const key = this.getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('ai-model-api-key'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### Step 2.2: Create AI Model Configuration Entity
**File:** `api/src/modules/settings/entities/ai-model-configuration.entity.ts`

```typescript
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
  @PrimaryGeneratedColumn('uuid', { name: 'entity_id' })
  entityId: string;

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
}
```

#### Step 2.3: Create DTOs
**File:** `api/src/modules/settings/dto/create-ai-model.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, IsOptional, IsUrl, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { AiProvider } from '../entities/ai-model-configuration.entity';

export class CreateAiModelDto {
  @ApiProperty({ enum: AiProvider, description: 'AI provider type' })
  @IsEnum(AiProvider)
  provider: AiProvider;

  @ApiProperty({ description: 'Model name (e.g., gpt-4, claude-3-opus)' })
  @IsString()
  modelName: string;

  @ApiProperty({ description: 'Display name for the model' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: 'Model description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Custom API endpoint (for custom providers)' })
  @IsOptional()
  @IsUrl()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key for the model' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Maximum tokens', minimum: 1, maximum: 32000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(32000)
  @Type(() => Number)
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Temperature setting', minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Top P setting', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  topP?: number;

  @ApiPropertyOptional({ description: 'Frequency penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  @Type(() => Number)
  frequencyPenalty?: number;

  @ApiPropertyOptional({ description: 'Presence penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  @Type(() => Number)
  presencePenalty?: number;
}
```

**File:** `api/src/modules/settings/dto/update-ai-model.dto.ts`

```typescript
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateAiModelDto } from './create-ai-model.dto';

export class UpdateAiModelDto extends PartialType(CreateAiModelDto) {
  @ApiPropertyOptional({ description: 'Whether the model is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

### Phase 3: Repository and Service Implementation

#### Step 3.1: Create AI Model Repository
**File:** `api/src/modules/settings/ai-model-configuration.repository.ts`

```typescript
import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiModelConfiguration } from './entities/ai-model-configuration.entity';
import { EncryptionService } from '@/common/services/encryption.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';

@Injectable()
export class AiModelConfigurationRepository extends AbstractRepository<AiModelConfiguration> {
  constructor(
    @InjectRepository(AiModelConfiguration)
    repository: Repository<AiModelConfiguration>,
    private readonly encryptionService: EncryptionService,
  ) {
    super(repository);
  }

  async findActiveModels(): Promise<AiModelConfiguration[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { isDefault: 'DESC', displayName: 'ASC' },
    });
  }

  async findDefaultModel(): Promise<AiModelConfiguration | null> {
    return this.repository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  async setDefaultModel(id: number): Promise<void> {
    await this.repository.manager.transaction(async manager => {
      // Remove default from all models
      await manager.update(AiModelConfiguration, {}, { isDefault: false });
      // Set new default
      await manager.update(AiModelConfiguration, { id }, { isDefault: true });
    });
  }

  async createWithEncryptedKey(data: CreateAiModelDto): Promise<AiModelConfiguration> {
    const encryptedKey = data.apiKey 
      ? await this.encryptionService.encrypt(data.apiKey)
      : null;

    const modelData = {
      ...data,
      apiKeyEncrypted: encryptedKey,
    };
    delete modelData.apiKey;

    return this.create(modelData);
  }

  async updateWithEncryptedKey(id: number, data: UpdateAiModelDto): Promise<AiModelConfiguration | null> {
    const updateData = { ...data };
    
    if (data.apiKey) {
      updateData.apiKeyEncrypted = await this.encryptionService.encrypt(data.apiKey);
      delete updateData.apiKey;
    }

    return this.update({ id }, updateData);
  }

  async getDecryptedApiKey(id: number): Promise<string | null> {
    const model = await this.findById(id);
    if (!model?.apiKeyEncrypted) return null;
    
    return this.encryptionService.decrypt(model.apiKeyEncrypted);
  }
}
```

### Phase 4: Frontend Implementation

#### Step 4.1: Create TypeScript Types
**File:** `ui/src/types/ai-models.ts`

```typescript
export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom',
}

export interface AiModelConfiguration {
  id: number;
  entityId: string;
  provider: AiProvider;
  modelName: string;
  displayName: string;
  description?: string;
  apiEndpoint?: string;
  isDefault: boolean;
  isActive: boolean;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiModelDto {
  provider: AiProvider;
  modelName: string;
  displayName: string;
  description?: string;
  apiEndpoint?: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface UpdateAiModelDto extends Partial<CreateAiModelDto> {
  isActive?: boolean;
}

// API Response types
export interface GetAiModelsResponse {
  success: boolean;
  message: string;
  data: AiModelConfiguration[];
}

export interface AiModelResponse {
  success: boolean;
  message: string;
  data: AiModelConfiguration;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export interface ApiKeyResponse {
  apiKey: string | null;
}
```

#### Step 4.2: Create API Client
**File:** `ui/src/lib/api/ai-models.api.ts`

```typescript
import type { 
  AiModelConfiguration, 
  CreateAiModelDto, 
  UpdateAiModelDto,
  GetAiModelsResponse,
  AiModelResponse,
  TestConnectionResponse,
  ApiKeyResponse
} from '@/types/ai-models';
import apiClient from '.';

// AI Models API
export const getAllAiModels = async (): Promise<AiModelConfiguration[]> => {
  const response = await apiClient.get<GetAiModelsResponse>('/settings/ai-models');
  return response.data.data;
};

export const createAiModel = async (data: CreateAiModelDto): Promise<AiModelConfiguration> => {
  const response = await apiClient.post<AiModelResponse>('/settings/ai-models', data);
  return response.data.data;
};

export const updateAiModel = async (id: number, data: UpdateAiModelDto): Promise<AiModelConfiguration> => {
  const response = await apiClient.patch<AiModelResponse>(`/settings/ai-models/${id}`, data);
  return response.data.data;
};

export const deleteAiModel = async (id: number): Promise<void> => {
  await apiClient.delete(`/settings/ai-models/${id}`);
};

export const setDefaultAiModel = async (id: number): Promise<void> => {
  await apiClient.post(`/settings/ai-models/${id}/set-default`);
};

export const testAiModelConnection = async (id: number): Promise<boolean> => {
  const response = await apiClient.post<TestConnectionResponse>(`/settings/ai-models/${id}/test-connection`);
  return response.data.success;
};

export const getAiModelApiKey = async (id: number): Promise<string | null> => {
  const response = await apiClient.get<ApiKeyResponse>(`/settings/ai-models/${id}/api-key`);
  return response.data.apiKey;
};

const aiModelsApi = {
  getAllAiModels,
  createAiModel,
  updateAiModel,
  deleteAiModel,
  setDefaultAiModel,
  testAiModelConnection,
  getAiModelApiKey,
};

export default aiModelsApi;
```

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Encryption key for API keys (generate a strong random key)
ENCRYPTION_KEY=your-super-secure-encryption-key-here

# AI Provider API Keys (for testing)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-key
```

## Security Considerations

1. **API Key Storage**: Never store API keys in plain text. Always use encryption.
2. **Permission Checks**: Implement proper permission checks for all sensitive operations.
3. **Audit Logging**: Log all changes to AI model configurations.
4. **Input Validation**: Validate all inputs on both frontend and backend.
5. **Rate Limiting**: Implement rate limiting for API key testing endpoints.

## Testing Strategy

1. **Unit Tests**: Test all services, repositories, and utilities.
2. **Integration Tests**: Test API endpoints with different permission levels.
3. **Security Tests**: Test encryption/decryption and permission boundaries.
4. **UI Tests**: Test form validation and user interactions.

## Deployment Checklist

- [ ] Database migration executed
- [ ] Environment variables configured
- [ ] Encryption service tested
- [ ] Permission system updated
- [ ] Audit logging verified
- [ ] Frontend components tested
- [ ] API endpoints secured
- [ ] Documentation updated

## Next Steps

After implementing this system, consider:

1. **AI Model Integration**: Connect the configured models to the actual AI chat system.
2. **Model Performance Monitoring**: Track usage and performance of different models.
3. **Cost Management**: Implement usage tracking and cost controls.
4. **Model Versioning**: Support for different versions of the same model.
5. **Backup and Recovery**: Implement backup strategies for configurations.