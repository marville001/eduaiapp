import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permission, RequirePermissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Ip, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PermissionAction, PermissionResource } from '../permissions/entities/permission.entity';
import { UsersService } from '../users/users.service';
import { AiModelConfigurationService } from './ai-model-configuration.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { UpdateStripeSettingsDto } from './dto/update-stripe-settings.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SettingsService } from './settings.service';
import { StripeSettingsService } from './stripe-settings.service';
import { SubscriptionPackageService } from './subscription-package.service';

@ApiTags('Settings')
@Controller('settings')
@ApiSecurity('bearer')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly aiModelService: AiModelConfigurationService,
    private readonly stripeSettingsService: StripeSettingsService,
    private readonly subscriptionPackageService: SubscriptionPackageService,
    private readonly usersService: UsersService,
  ) { }

  // System Settings Endpoints
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'System settings retrieved successfully' })
  async getSettings() {
    return await this.settingsService.getSettings();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Update system settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'System settings updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateSettings(
    @Body() updateDto: UpdateSystemSettingsDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.settingsService.updateSettings(
      updateDto,
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  // AI Model Configuration Endpoints
  @Get('ai-models')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get all AI model configurations' })
  @ApiResponse({ status: 200, description: 'AI models retrieved successfully' })
  async getAiModels() {
    return await this.aiModelService.getAllModels();
  }

  @Get('ai-models/active')
  @Public()
  @ApiOperation({ summary: 'Get active AI model configurations' })
  @ApiResponse({ status: 200, description: 'Active AI models retrieved successfully' })
  async getActiveAiModels() {
    return await this.aiModelService.getActiveModels();
  }

  @Get('ai-models/default')
  @Public()
  @ApiOperation({ summary: 'Get default AI model configuration' })
  @ApiResponse({ status: 200, description: 'Default AI model retrieved successfully' })
  async getDefaultAiModel() {
    return await this.aiModelService.getDefaultModel();
  }

  @Get('ai-models/:id')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get AI model configuration by ID' })
  @ApiResponse({ status: 200, description: 'AI model retrieved successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  async getAiModelById(@Param('id', ParseIntPipe) id: number) {
    return await this.aiModelService.getModelById(id);
  }

  @Post('ai-models')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.CREATE))
  @ApiOperation({ summary: 'Create new AI model configuration' })
  @ApiResponse({ status: 201, description: 'AI model created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createAiModel(
    @Body() createDto: CreateAiModelDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.aiModelService.createModel(createDto, user.sub, admin.fullName, ipAddress);
  }

  @Patch('ai-models/:id')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Update AI model configuration' })
  @ApiResponse({ status: 200, description: 'AI model updated successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateAiModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAiModelDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.aiModelService.updateModel(id, updateDto, user.sub, admin.fullName, ipAddress);
  }

  @Delete('ai-models/:id')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.DELETE))
  @ApiOperation({ summary: 'Delete AI model configuration' })
  @ApiResponse({ status: 200, description: 'AI model deleted successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deleteAiModel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    await this.aiModelService.deleteModel(id, user.sub, admin.fullName, ipAddress);
    return { success: true, message: 'AI model deleted successfully' };
  }

  @Post('ai-models/:id/set-default')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Set default AI model' })
  @ApiResponse({ status: 200, description: 'Default AI model updated successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async setDefaultAiModel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    await this.aiModelService.setDefaultModel(id, user.sub, admin.fullName, ipAddress);
    return { success: true, message: 'Default AI model updated successfully' };
  }

  @Post('ai-models/:id/toggle-status')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle AI model active status' })
  @ApiResponse({ status: 200, description: 'AI model status updated successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async toggleAiModelStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    const updatedModel = await this.aiModelService.toggleModelStatus(id, user.sub, admin.fullName, ipAddress);
    return { success: true, data: updatedModel, message: 'AI model status updated successfully' };
  }

  @Post('ai-models/:id/test-connection')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.READ))
  @ApiOperation({ summary: 'Test AI model connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async testAiModelConnection(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    const isConnected = await this.aiModelService.testModelConnection(id, user.sub, admin.fullName, ipAddress);
    return {
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed'
    };
  }

  @Get('ai-models/:id/api-key')
  @RequirePermissions(Permission(PermissionResource.AI_MODELS, PermissionAction.VIEW_SENSITIVE))
  @ApiOperation({ summary: 'Get decrypted API key (requires special permission)' })
  @ApiResponse({ status: 200, description: 'API key retrieved successfully' })
  @ApiResponse({ status: 404, description: 'AI model not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getAiModelApiKey(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const apiKey = await this.aiModelService.getDecryptedApiKey(id);
    return { apiKey };
  }

  // ===============================================
  // Stripe Settings Endpoints
  // ===============================================

  @Get('stripe')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get Stripe settings' })
  @ApiResponse({ status: 200, description: 'Stripe settings retrieved successfully' })
  async getStripeSettings() {
    return await this.stripeSettingsService.getSettingsMasked();
  }

  @Patch('stripe')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Update Stripe settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Stripe settings updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateStripeSettings(
    @Body() updateDto: UpdateStripeSettingsDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.stripeSettingsService.updateSettings(
      updateDto,
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  @Post('stripe/test-connection')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Test Stripe connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async testStripeConnection(
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    try {
      const isConnected = await this.stripeSettingsService.testConnection(
        user.sub,
        admin.fullName,
        ipAddress,
      );
      return {
        success: isConnected,
        message: isConnected ? 'Stripe connection successful' : 'Stripe connection failed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Stripe connection failed',
      };
    }
  }

  @Post('stripe/toggle-enabled')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle Stripe enabled status' })
  @ApiResponse({ status: 200, description: 'Stripe status toggled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async toggleStripeEnabled(
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.stripeSettingsService.toggleEnabled(
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  @Post('stripe/toggle-subscriptions')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle subscription allowance' })
  @ApiResponse({ status: 200, description: 'Subscription status toggled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async toggleSubscriptions(
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.stripeSettingsService.toggleSubscriptions(
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  @Get('stripe/secret-key')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.VIEW_SENSITIVE))
  @ApiOperation({ summary: 'Get decrypted Stripe secret key (requires special permission)' })
  @ApiResponse({ status: 200, description: 'Secret key retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStripeSecretKey() {
    const secretKey = await this.stripeSettingsService.getDecryptedSecretKey();
    return { secretKey };
  }

  @Get('stripe/webhook-secret')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.VIEW_SENSITIVE))
  @ApiOperation({ summary: 'Get decrypted Stripe webhook secret (requires special permission)' })
  @ApiResponse({ status: 200, description: 'Webhook secret retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStripeWebhookSecret() {
    const webhookSecret = await this.stripeSettingsService.getDecryptedWebhookSecret();
    return { webhookSecret };
  }

  // ===============================================
  // Subscription Package Endpoints
  // ===============================================

  @Get('packages')
  @Public()
  @ApiOperation({ summary: 'Get all visible subscription packages' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  async getVisiblePackages() {
    return await this.subscriptionPackageService.getVisiblePackages();
  }

  @Get('packages/all')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get all subscription packages (Admin only)' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getAllPackages() {
    return await this.subscriptionPackageService.getAllPackages();
  }

  @Get('packages/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured subscription packages' })
  @ApiResponse({ status: 200, description: 'Featured packages retrieved successfully' })
  async getFeaturedPackages() {
    return await this.subscriptionPackageService.getFeaturedPackages();
  }

  @Get('packages/stats')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get package statistics' })
  @ApiResponse({ status: 200, description: 'Package statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getPackageStats() {
    return await this.subscriptionPackageService.getPackageStats();
  }

  @Get('packages/:id')
  // @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.READ))
  @ApiOperation({ summary: 'Get subscription package by ID' })
  @ApiResponse({ status: 200, description: 'Package retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getPackageById(@Param('id', ParseIntPipe) id: number) {
    return await this.subscriptionPackageService.getPackageById(id);
  }

  @Post('packages')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.CREATE))
  @ApiOperation({ summary: 'Create new subscription package' })
  @ApiResponse({ status: 201, description: 'Package created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createPackage(
    @Body() createDto: CreateSubscriptionPackageDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.subscriptionPackageService.createPackage(
      createDto,
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  @Patch('packages/:id')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Update subscription package' })
  @ApiResponse({ status: 200, description: 'Package updated successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updatePackage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubscriptionPackageDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    return await this.subscriptionPackageService.updatePackage(
      id,
      updateDto,
      user.sub,
      admin.fullName,
      ipAddress,
    );
  }

  @Delete('packages/:id')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.DELETE))
  @ApiOperation({ summary: 'Delete subscription package' })
  @ApiResponse({ status: 200, description: 'Package deleted successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deletePackage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    await this.subscriptionPackageService.deletePackage(id, user.sub, admin.fullName, ipAddress);
    return { success: true, message: 'Package deleted successfully' };
  }

  @Post('packages/:id/toggle-visibility')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle package visibility' })
  @ApiResponse({ status: 200, description: 'Package visibility toggled successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async togglePackageVisibility(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    const updated = await this.subscriptionPackageService.toggleVisibility(
      id,
      user.sub,
      admin.fullName,
      ipAddress,
    );
    return {
      success: true,
      data: updated,
      message: `Package ${updated.isVisible ? 'visible' : 'hidden'} successfully`,
    };
  }

  @Post('packages/:id/toggle-active')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle package active status' })
  @ApiResponse({ status: 200, description: 'Package status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async togglePackageActive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    const updated = await this.subscriptionPackageService.toggleActive(
      id,
      user.sub,
      admin.fullName,
      ipAddress,
    );
    return {
      success: true,
      data: updated,
      message: `Package ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  @Post('packages/:id/toggle-featured')
  @RequirePermissions(Permission(PermissionResource.SETTINGS, PermissionAction.UPDATE))
  @ApiOperation({ summary: 'Toggle package featured status' })
  @ApiResponse({ status: 200, description: 'Package featured status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async togglePackageFeatured(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Ip() ipAddress: string,
  ) {
    const admin = await this.usersService.findOne(user.sub);
    const updated = await this.subscriptionPackageService.toggleFeatured(
      id,
      user.sub,
      admin.fullName,
      ipAddress,
    );
    return {
      success: true,
      data: updated,
      message: `Package ${updated.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    };
  }
}
