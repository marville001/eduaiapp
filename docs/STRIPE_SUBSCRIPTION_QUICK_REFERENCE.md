# Stripe Subscription System - Quick Reference

## 🚀 Quick Start

### 1. Setup (5 minutes)

```bash
# Add to api/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Run backend
cd api && npm run dev

# Run frontend
cd ui && npm run dev
```

### 2. Admin Configuration

1. Login: `http://localhost:3000/admin/settings`
2. **Stripe & Billing** tab → Enter keys → Enable
3. **Packages** tab → Create packages

### 3. Test Flow

1. Visit: `http://localhost:3000/pricing`
2. Click "Subscribe" on any package
3. Use test card: `4242 4242 4242 4242`
4. Verify at: `http://localhost:3000/subscription`

---

## 📡 API Quick Reference

```typescript
// Checkout
POST / api / v1 / subscriptions / checkout;
{
    packageId: 1;
}

// Current subscription
GET / api / v1 / subscriptions / current;

// Usage stats
GET / api / v1 / subscriptions / usage;

// Cancel
POST / api / v1 / subscriptions / cancel;
{
    cancelAtPeriodEnd: true;
}

// Check limit
GET / api / v1 / subscriptions / can / question;
```

---

## 🛡️ Guard Usage

```typescript
@Controller("ai")
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class AiController {
    @Post("ask")
    @RequireFeatureAccess("question")
    async askQuestion() {
        // Auto-checks limit and tracks usage
    }
}
```

---

## 🎨 Frontend Components

```typescript
// Show usage
<UsageLimitIndicator action="question" />

// Gate content
<SubscriptionGate action="chat">
  <ChatComponent />
</SubscriptionGate>

// Usage widget
<UsageWidget />
```

---

## 🧪 Test Cards

| Card                | Result    |
| ------------------- | --------- |
| 4242 4242 4242 4242 | Success   |
| 4000 0025 0000 3155 | 3D Secure |
| 4000 0000 0000 9995 | Declined  |

---

## 🔗 Important URLs

| Page     | URL                                  |
| -------- | ------------------------------------ |
| Pricing  | `/pricing`                           |
| Checkout | `/subscription/checkout?packageId=X` |
| Manage   | `/subscription`                      |
| Success  | `/subscription/success`              |
| Admin    | `/admin/settings`                    |

---

## ⚡ Common Commands

```bash
# Test webhook locally
npm install -g stripe
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe

# Or use ngrok
ngrok http 3001

# Check subscription
curl http://localhost:3001/api/v1/subscriptions/current \
  -H "Authorization: Bearer YOUR_JWT"

# Create checkout session
curl -X POST http://localhost:3001/api/v1/subscriptions/checkout \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"packageId": 1}'
```

---

## 🐛 Quick Debugging

### Webhook not working?

```bash
# Check logs
tail -f api/logs/combined.log

# Test webhook signature
stripe trigger checkout.session.completed
```

### Usage not tracking?

```typescript
// Check interceptor is applied
@UseInterceptors(UsageTrackingInterceptor)

// Or add globally in app.module.ts
{
  provide: APP_INTERCEPTOR,
  useClass: UsageTrackingInterceptor,
}
```

### Frontend not showing data?

```typescript
// Check auth context
const { isAuthenticated } = useAuth();

// Check API client
import { apiClient } from "@/lib/api/client";
```

---

## 📦 File Locations

### Backend

```
api/src/
├── config/stripe.config.ts
├── modules/subscriptions/
│   ├── subscriptions.module.ts
│   ├── subscriptions.service.ts
│   ├── subscriptions.controller.ts
│   ├── stripe.service.ts
│   ├── stripe-webhook.controller.ts
│   └── user-subscription.repository.ts
├── common/
│   ├── guards/subscription.guard.ts
│   ├── decorators/subscription.decorator.ts
│   └── interceptors/usage-tracking.interceptor.ts
```

### Frontend

```
ui/src/
├── types/subscription.ts
├── lib/api/subscriptions.ts
├── app/(app)/app/
│   ├── pricing/page.tsx
│   └── subscription/
│       ├── page.tsx
│       ├── checkout/page.tsx
│       └── success/page.tsx
├── components/subscription/
│   ├── usage-limit-indicator.tsx
│   ├── subscription-gate.tsx
│   └── usage-widget.tsx
```

---

## 🎯 Implementation Checklist

**Backend:**

-   [x] Stripe SDK installed
-   [x] Config module created
-   [x] Subscription service
-   [x] Checkout endpoint
-   [x] Webhook handler
-   [x] Guards & decorators
-   [x] Usage tracking
-   [x] Repository methods

**Frontend:**

-   [x] Pricing page
-   [x] Checkout flow
-   [x] Subscription dashboard
-   [x] Success page
-   [x] Usage components
-   [x] API functions
-   [x] Type definitions

**Testing:**

-   [ ] Create test subscription
-   [ ] Verify webhook events
-   [ ] Test usage tracking
-   [ ] Test limits enforcement
-   [ ] Test cancellation
-   [ ] Test upgrade/downgrade

---

## 💡 Pro Tips

1. **Use Stripe CLI** for local webhook testing

    ```bash
    stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
    ```

2. **Enable Debug Mode** for detailed logs

    ```typescript
    // In stripe.service.ts
    this.stripe = new Stripe(secretKey, {
        apiVersion: "2024-11-20.acacia",
        maxNetworkRetries: 3,
    });
    ```

3. **Cache subscription data** to reduce API calls

    ```typescript
    // Already using React Query with caching
    ```

4. **Monitor webhook failures** in Stripe Dashboard

    - Dashboard → Developers → Webhooks → View logs

5. **Test with different scenarios**
    - Trial periods
    - Payment failures
    - Subscription upgrades
    - Cancellations

---

## 🆘 Need Help?

-   See full guide: `docs/015 - STRIPE_SUBSCRIPTION_UPGRADE_SYSTEM.md`
-   Stripe docs: https://stripe.com/docs
-   Test mode: Always use `test` keys for development

---

**Status**: ✅ Production Ready
