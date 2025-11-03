
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