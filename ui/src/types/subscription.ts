// Subscription types
export interface UserSubscription {
  id: number;
  userId: number;
  packageId?: number;
  package?: SubscriptionPackage;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  currency: string;
  amount?: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  endedAt?: string;
  cancelAtPeriodEnd: boolean;
  cancellationReason?: string;
  questionsUsed: number;
  chatsUsed: number;
  fileUploadsUsed: number;
  usageResetAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAUSED = 'paused',
}

export enum PaymentStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface SubscriptionPackage {
  id: number;
  name: string;
  description?: string;
  packageType: PackageType;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  intervalCount: number;
  stripeProductId?: string;
  stripePriceId?: string;
  features?: string[];
  maxQuestionsPerMonth?: number;
  maxChatsPerMonth?: number;
  maxFileUploads?: number;
  aiModelsAccess?: string[];
  prioritySupport: boolean;
  customBranding: boolean;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  trialPeriodDays: number;
  displayOrder: number;
  badgeText?: string;
  badgeColor?: string;
  buttonText: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum PackageType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum BillingInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface CreateCheckoutSessionDto {
  packageId: number;
  successUrl?: string;
  cancelUrl?: string;
  promotionCode?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
  package: SubscriptionPackage;
}

export interface CancelSubscriptionDto {
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
}

export interface UpdateSubscriptionDto {
  newPackageId: number;
  promotionCode?: string;
}

export interface UsageStatistics {
  hasSubscription: boolean;
  questionsUsed: number;
  chatsUsed: number;
  fileUploadsUsed: number;
  questionsLimit: number;
  chatsLimit: number;
  fileUploadsLimit: number;
  questionsRemaining: number | string;
  chatsRemaining: number | string;
  fileUploadsRemaining: number | string;
  usageResetAt?: string;
  currentPeriodEnd?: string;
}

export interface CanPerformActionResponse {
  canPerform: boolean;
  action: 'question' | 'chat' | 'upload';
}

// Legacy type for backward compatibility
export interface Subscription {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  fileUploadLimit: number;
  hasAiChat: boolean;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
}
