import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

const mpesaConfig = {
  consumerKey: configService.get('MPESA_CONSUMER_KEY'),
  consumerSecret: configService.get('MPESA_CONSUMER_SECRET'),
  businessShortCode: configService.get('MPESA_BUSINESS_SHORT_CODE') || '174379',
  passkey: configService.get('MPESA_PASSKEY'),
  environment: configService.get('MPESA_ENVIRONMENT') || 'sandbox',
  baseUrl: configService.get('MPESA_ENVIRONMENT') === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke',
  callbackUrl: configService.get('MPESA_CALLBACK_URL'),
};

export default mpesaConfig