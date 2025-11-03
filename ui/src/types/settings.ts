// Settings Types

export interface SystemSetting {
  id: number;
  platformName: string;
  supportEmail: string;

  allowSignup: boolean;

  emailNotifications: boolean;
  smsNotifications: boolean;
  adminAlerts: boolean;

  requireVerification: boolean;

  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface GetSettingsResponse {
  success: boolean;
  message: string;
  data: SystemSetting;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  data: SystemSetting;
}
