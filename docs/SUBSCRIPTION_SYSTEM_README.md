# 🎯 Stripe Subscription System

A **production-ready** Stripe subscription management system with usage tracking, subscription restrictions, and comprehensive user management.

---

## ⚡ Quick Start (3 Steps)

### 1. Install Stripe Package

```bash
cd api
npm install stripe
```

### 2. Configure Environment

```bash
# Add to api/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Setup Admin Panel

1. Login to admin: `http://localhost:3000/admin/settings`
2. **Stripe & Billing** → Enter keys → Enable
3. **Packages** → Create packages

**🎉 Done! Test at `/pricing`**

---

## 📚 Documentation

| Document                                                                    | Purpose                        |
| --------------------------------------------------------------------------- | ------------------------------ |
| [Complete Guide](docs/015%20-%20STRIPE_SUBSCRIPTION_UPGRADE_SYSTEM.md)      | Full implementation details    |
| [Quick Reference](STRIPE_SUBSCRIPTION_QUICK_REFERENCE.md)                   | Quick commands & API reference |
| [Implementation Summary](SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md)            | What was built                 |
| [Integration Example](api/src/modules/subscriptions/INTEGRATION_EXAMPLE.ts) | Code examples                  |

---

## ✨ Features

### User Features

-   ✅ Browse subscription packages
-   ✅ Subscribe with Stripe Checkout
-   ✅ View usage statistics
-   ✅ Cancel/reactivate subscriptions
-   ✅ Upgrade/downgrade plans
-   ✅ Access billing portal

### Admin Features

-   ✅ Configure Stripe settings
-   ✅ Create subscription packages
-   ✅ Set usage limits
-   ✅ Track subscriptions

### Developer Features

-   ✅ Guard-based access control
-   ✅ Automatic usage tracking
-   ✅ Webhook handling
-   ✅ Event emitters
-   ✅ Type-safe APIs

---

## 🛡️ Usage in Code

### Protect an Endpoint

```typescript
@Post('ask')
@RequireFeatureAccess('question')
@UseInterceptors(UsageTrackingInterceptor)
async askQuestion() {
  // Auto-checks limit, tracks usage
}
```

### Frontend Gate

```tsx
<SubscriptionGate action='question'>
    <QuestionForm />
</SubscriptionGate>
```

---

## 📡 API Endpoints

| Endpoint                         | Method |
| -------------------------------- | ------ |
| `/api/v1/subscriptions/checkout` | POST   |
| `/api/v1/subscriptions/current`  | GET    |
| `/api/v1/subscriptions/usage`    | GET    |
| `/api/v1/subscriptions/cancel`   | POST   |
| `/api/v1/webhooks/stripe`        | POST   |

[See full API reference →](docs/015%20-%20STRIPE_SUBSCRIPTION_UPGRADE_SYSTEM.md#-api-endpoints)

---

## 🎨 Frontend Routes

| Route                    | Description         |
| ------------------------ | ------------------- |
| `/pricing`               | View packages       |
| `/subscription/checkout` | Checkout flow       |
| `/subscription`          | Manage subscription |
| `/subscription/success`  | Success page        |

---

## 🧪 Test Cards

| Card Number         | Result      |
| ------------------- | ----------- |
| 4242 4242 4242 4242 | Success ✅  |
| 4000 0025 0000 3155 | 3D Secure   |
| 4000 0000 0000 9995 | Declined ❌ |

[More test cards →](https://stripe.com/docs/testing)

---

## 🔧 Files Created

### Backend (15 files)

```
api/src/
├── config/stripe.config.ts
├── modules/subscriptions/
│   ├── subscriptions.service.ts
│   ├── stripe.service.ts
│   ├── subscriptions.controller.ts
│   ├── stripe-webhook.controller.ts
│   └── ...
└── common/
    ├── guards/subscription.guard.ts
    └── decorators/subscription.decorator.ts
```

### Frontend (11 files)

```
ui/src/
├── app/(app)/app/
│   ├── pricing/page.tsx
│   └── subscription/
└── components/subscription/
    ├── usage-widget.tsx
    └── subscription-gate.tsx
```

---

## 🚀 Deployment

### Production Checklist

-   [ ] Replace test keys with live keys
-   [ ] Configure production webhook
-   [ ] Enable HTTPS
-   [ ] Test complete flow
-   [ ] Set up monitoring

### Webhook Setup

```bash
# URL: https://your-domain.com/api/v1/webhooks/stripe
# Events:
- checkout.session.completed
- customer.subscription.updated
- invoice.payment_succeeded
```

---

## 💡 Common Tasks

### Create Package

```typescript
// In admin panel: Packages → Create
{
  name: "Pro Plan",
  price: 29.99,
  billingInterval: "month",
  maxQuestionsPerMonth: 1000,
  features: ["Feature 1", "Feature 2"]
}
```

### Check User Limit

```typescript
const canAsk = await subscriptionsService.canPerformAction(userId, "question");
```

### Track Usage

```typescript
await subscriptionsService.incrementUsage(userId, "question");
```

---

## 🐛 Troubleshooting

### Webhook Not Working?

```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe

# Or ngrok
ngrok http 3001
```

### Usage Not Tracking?

Check:

1. Guard is applied: `@UseGuards(SubscriptionGuard)`
2. Decorator is used: `@RequireFeatureAccess('question')`
3. Interceptor is active: `@UseInterceptors(UsageTrackingInterceptor)`

[More troubleshooting →](docs/015%20-%20STRIPE_SUBSCRIPTION_UPGRADE_SYSTEM.md#-troubleshooting)

---

## 📊 Architecture

```
User Flow:
1. Browse packages at /pricing
2. Click Subscribe → Checkout
3. Pay with Stripe
4. Webhook creates subscription
5. User sees stats at /subscription

Usage Flow:
1. User makes request
2. Guard checks subscription
3. Guard checks usage limit
4. Action proceeds
5. Interceptor tracks usage
```

---

## 🎓 Learn More

-   [Stripe Documentation](https://stripe.com/docs)
-   [Stripe Testing Guide](https://stripe.com/docs/testing)
-   [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

## 🆘 Support

-   **Issues?** Check [Troubleshooting Guide](docs/015%20-%20STRIPE_SUBSCRIPTION_UPGRADE_SYSTEM.md#-troubleshooting)
-   **Examples?** See [Integration Example](api/src/modules/subscriptions/INTEGRATION_EXAMPLE.ts)
-   **API?** Check [Quick Reference](STRIPE_SUBSCRIPTION_QUICK_REFERENCE.md)

---

## ✅ Status

**Production Ready** - All features implemented and tested

-   ✅ Backend API complete
-   ✅ Frontend UI complete
-   ✅ Webhook handling
-   ✅ Usage tracking
-   ✅ Guards & restrictions
-   ✅ Documentation complete

---

## 🎉 You're Ready!

Start testing:

```bash
npm run dev           # Start API
cd ../ui && npm run dev   # Start UI
# Visit: http://localhost:3000/pricing
```

**Happy coding!** 🚀
