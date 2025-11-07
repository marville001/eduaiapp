# Admin Settings System Architecture

## Overview
This document outlines the architecture for the comprehensive admin settings system for the AI Education Platform, with a primary focus on AI model configuration and maximum security for sensitive data like API keys.

## System Requirements

### Functional Requirements
1. **AI Model Configuration**
   - Support for multiple AI providers (OpenAI, Anthropic, Google)
   - Custom model endpoint configuration
   - API key management with encryption
   - Default model selection
   - Model-specific parameters (temperature, max tokens, etc.)

2. **Application Settings**
   - Platform branding (name, logo, favicon)
   - Contact information and social media links
   - File upload limits and allowed types
   - Notification preferences
   - User registration settings

3. **Security & Permissions**
   - Role-based access control for settings
   - Separate permissions for viewing/editing sensitive data
   - API key masking in UI
   - Audit logging for all settings changes

### Non-Functional Requirements
- High security for sensitive data
- Scalable architecture following existing patterns
- Comprehensive validation and error handling
- Responsive and intuitive UI

## Database Schema

### AI Model Configuration Table
```sql
CREATE TABLE ai_model_configurations (
    id SERIAL PRIMARY KEY,
    entity_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Model Information
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google', 'custom'
    model_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Configuration
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT, -- Encrypted API key
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Model Parameters
    max_tokens INTEGER DEFAULT 4000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    top_p DECIMAL(3,2) DEFAULT 1.0,
    frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
    presence_penalty DECIMAL(3,2) DEFAULT 0.0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT unique_default_model UNIQUE (is_default) WHERE is_default = TRUE AND deleted_at IS NULL
);
```

### Extended System Settings Table
```sql
-- Add new columns to existing system_settings table
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS app_logo VARCHAR(500);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS app_favicon VARCHAR(500);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS contact_address TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(200);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(200);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(200);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(200);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS max_file_upload_size INTEGER DEFAULT 10; -- MB
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'];
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS default_ai_model_id INTEGER REFERENCES ai_model_configurations(id);
```

## Backend Architecture

### Entity Layer

#### AI Model Configuration Entity
```typescript
@Entity('ai_model_configurations')
export class AiModelConfiguration extends AbstractEntity<AiModelConfiguration> {
  @PrimaryGeneratedColumn('uuid', { name: 'entity_id' })
  entityId: string;

  @Column({ type: 'varchar', length: 50 })
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

  // Model Parameters
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

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom'
}
```

#### Extended System Settings Entity
```typescript
// Extend existing SystemSetting entity
@Column({ name: 'app_logo', type: 'varchar', length: 500, nullable: true })
appLogo?: string;

@Column({ name: 'app_favicon', type: 'varchar', length: 500, nullable: true })
appFavicon?: string;

@Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
contactPhone?: string;

@Column({ name: 'contact_address', type: 'text', nullable: true })
contactAddress?: string;

@Column({ name: 'social_facebook', type: 'varchar', length: 200, nullable: true })
socialFacebook?: string;

@Column({ name: 'social_twitter', type: 'varchar', length: 200, nullable: true })
socialTwitter?: string;

@Column({ name: 'social_linkedin', type: 'varchar', length: 200, nullable: true })
socialLinkedin?: string;

@Column({ name: 'social_instagram', type: 'varchar', length: 200, nullable: true })
socialInstagram?: string;

@Column({ name: 'max_file_upload_size', type: 'integer', default: 10 })
maxFileUploadSize: number;

@Column({ name: 'allowed_file_types', type: 'simple-array', nullable: true })
allowedFileTypes?: string[];

@Column({ name: 'default_ai_model_id', type: 'integer', nullable: true })
defaultAiModelId?: number;

@ManyToOne(() => AiModelConfiguration)
@JoinColumn({ name: 'default_ai_model_id' })
defaultAiModel?: AiModelConfiguration;
```

### Repository Layer

#### AI Model Configuration Repository
```typescript
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
      order: { isDefault: 'DESC', displayName: 'ASC' }
    });
  }

  async findDefaultModel(): Promise<AiModelConfiguration | null> {
    return this.repository.findOne({
      where: { isDefault: true, isActive: true }
    });
  }

  async setDefaultModel(id: number): Promise<void> {
    await this.repository.transaction(async manager => {
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

    return this.create({
      ...data,
      apiKeyEncrypted: encryptedKey,
    });
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

### Service Layer

#### AI Model Configuration Service
```typescript
@Injectable()
export class AiModelConfigurationService {
  constructor(
    private readonly aiModelRepository: AiModelConfigurationRepository,
    private readonly auditService: AuditService,
  ) {}

  async getAllModels(): Promise<AiModelConfiguration[]> {
    return this.aiModelRepository.findActiveModels();
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
    const model = await this.aiModelRepository.createWithEncryptedKey(data);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_CREATED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: model.id.toString(),
      details: `AI model created: ${model.displayName} (${model.provider})`,
      ipAddress,
      metadata: { modelId: model.id, provider: model.provider },
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
    const model = await this.aiModelRepository.updateWithEncryptedKey(id, data);
    
    if (!model) {
      throw new NotFoundException('AI model not found');
    }

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_UPDATED,
      targetType: AuditTargetType.AI_MODEL,
      targetId: model.id.toString(),
      details: `AI model updated: ${model.displayName}`,
      ipAddress,
      metadata: { modelId: model.id, updatedFields: Object.keys(data) },
    });

    return model;
  }

  async setDefaultModel(
    id: number,
    adminId: number,
    adminName: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.aiModelRepository.setDefaultModel(id);

    await this.auditService.createLog({
      performedBy: adminId,
      performerName: adminName,
      action: AuditAction.AI_MODEL_DEFAULT_SET,
      targetType: AuditTargetType.AI_MODEL,
      targetId: id.toString(),
      details: `Default AI model set`,
      ipAddress,
      metadata: { modelId: id },
    });
  }

  async testModelConnection(id: number): Promise<boolean> {
    const model = await this.aiModelRepository.findById(id);
    if (!model) throw new NotFoundException('AI model not found');

    const apiKey = await this.aiModelRepository.getDecryptedApiKey(id);
    if (!apiKey) throw new BadRequestException('API key not configured');

    // Implement connection testing logic based on provider
    return this.testProviderConnection(model, apiKey);
  }

  private async testProviderConnection(
    model: AiModelConfiguration,
    apiKey: string,
  ): Promise<boolean> {
    // Implementation for testing different AI provider connections
    // This would include actual API calls to test connectivity
    return true; // Placeholder
  }
}
```

### Controller Layer

#### Enhanced Settings Controller
```typescript
@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly aiModelService: AiModelConfigurationService,
    private readonly usersService: UsersService,
  ) {}

  // AI Model Configuration Endpoints
  @Get('ai-models')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get all AI model configurations' })
  async getAiModels() {
    return this.aiModelService.getAllModels();
  }

  @Post('ai-models')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.CREATE))
  @ApiOperation({ summary: 'Create new AI model configuration' })
  async createAiModel(
    @Body() createDto: CreateAiModelDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return this.aiModelService.createModel(createDto, user.sub, admin.fullName, ipAddress);
  }

  @Patch('ai-models/:id')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Update AI model configuration' })
  async updateAiModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAiModelDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return this.aiModelService.updateModel(id, updateDto, user.sub, admin.fullName, ipAddress);
  }

  @Post('ai-models/:id/set-default')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Set default AI model' })
  async setDefaultAiModel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    await this.aiModelService.setDefaultModel(id, user.sub, admin.fullName, ipAddress);
    return { success: true, message: 'Default AI model updated' };
  }

  @Post('ai-models/:id/test-connection')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.READ))
  @ApiOperation({ summary: 'Test AI model connection' })
  async testAiModelConnection(@Param('id', ParseIntPipe) id: number) {
    const isConnected = await this.aiModelService.testModelConnection(id);
    return { success: isConnected, message: isConnected ? 'Connection successful' : 'Connection failed' };
  }

  @Get('ai-models/:id/api-key')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.VIEW_SENSITIVE))
  @ApiOperation({ summary: 'Get decrypted API key (requires special permission)' })
  async getAiModelApiKey(@Param('id', ParseIntPipe) id: number) {
    const apiKey = await this.aiModelService.getDecryptedApiKey(id);
    return { apiKey };
  }

  // Existing settings endpoints remain the same...
}
```

## Frontend Architecture

### Type Definitions
```typescript
// AI Model Types
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

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom'
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

// Extended System Settings
export interface ExtendedSystemSetting extends SystemSetting {
  appLogo?: string;
  appFavicon?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  maxFileUploadSize: number;
  allowedFileTypes?: string[];
  defaultAiModelId?: number;
  defaultAiModel?: AiModelConfiguration;
}
```

### UI Component Structure
```
/admin/settings/
├── page.tsx (Main settings page with tabs)
├── components/
│   ├── settings-tabs.tsx
│   ├── ai-models/
│   │   ├── ai-models-tab.tsx
│   │   ├── ai-model-form.tsx
│   │   ├── ai-model-card.tsx
│   │   └── api-key-input.tsx (masked input)
│   ├── general/
│   │   ├── general-settings-tab.tsx
│   │   ├── branding-form.tsx
│   │   └── contact-form.tsx
│   ├── security/
│   │   ├── security-settings-tab.tsx
│   │   └── permissions-form.tsx
│   └── upload/
│       ├── upload-settings-tab.tsx
│       └── file-limits-form.tsx
```

## Security Considerations

### API Key Encryption
- Use AES-256-GCM encryption for API keys
- Store encryption keys in environment variables
- Implement key rotation mechanism
- Never log decrypted API keys

### Permission System
- `SETTINGS:READ` - View general settings
- `SETTINGS:UPDATE` - Update general settings
- `AI_MODELS:CREATE` - Create AI model configurations
- `AI_MODELS:UPDATE` - Update AI model configurations
- `AI_MODELS:VIEW_SENSITIVE` - View decrypted API keys
- `AI_MODELS:DELETE` - Delete AI model configurations

### Audit Logging
- Log all settings changes with user, timestamp, and IP
- Include before/after values for sensitive operations
- Implement log retention policies
- Monitor for suspicious activities

## Implementation Phases

### Phase 1: Backend Foundation
1. Create database migrations
2. Implement entities and repositories
3. Create basic services and controllers
4. Add encryption service

### Phase 2: Security & Permissions
1. Implement permission system
2. Add API key encryption/decryption
3. Create audit logging
4. Add input validation

### Phase 3: Frontend Implementation
1. Create UI components
2. Implement API integration
3. Add form validation
4. Implement permission-based rendering

### Phase 4: Testing & Documentation
1. Unit and integration tests
2. Security testing
3. Performance testing
4. Documentation and deployment

## Success Metrics
- Secure storage and handling of API keys
- Intuitive admin interface for AI model management
- Comprehensive audit trail for all changes
- High performance with proper caching
- Scalable architecture for future enhancements