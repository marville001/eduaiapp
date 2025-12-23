# Credit Billing System Implementation

## 🎯 Overview

A comprehensive credit-based billing system has been implemented for the AI Education Platform. This system tracks user credits, manages credit consumption for AI operations, supports subscription-based credit allocation, and provides top-up purchasing capabilities.

---

## 📋 Architecture Overview

### System Design

```
┌──────────────────────────────────────────────────────────────────┐
│                      CREDIT BILLING SYSTEM                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │   UserCredits   │    │CreditTransaction│    │ CreditPackage  │ │
│  │    (Balance)    │    │    (Ledger)     │    │   (Top-ups)    │ │
│  └────────┬────────┘    └────────┬────────┘    └───────┬────────┘ │
│           │                      │                     │          │
│           └──────────────┬───────┴─────────────────────┘          │
│                          │                                        │
│                 ┌────────▼────────┐                               │
│                 │  CreditService  │                               │
│                 └────────┬────────┘                               │
│                          │                                        │
│     ┌────────────────────┼────────────────────┐                   │
│     │                    │                    │                   │
│     ▼                    ▼                    ▼                   │
│ ┌────────┐       ┌─────────────┐      ┌─────────────┐            │
│ │  AI    │       │Subscription │      │   Admin     │            │
│ │Service │       │  Service    │      │  Dashboard  │            │
│ └────────┘       └─────────────┘      └─────────────┘            │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Credit Flow

```
Subscription Created/Renewed          Top-up Purchase
           │                                │
           ▼                                ▼
    ┌──────────────┐               ┌──────────────┐
    │ Allocate     │               │   Process    │
    │ Monthly      │               │   Payment    │
    │ Credits      │               │              │
    └──────┬───────┘               └──────┬───────┘
           │                              │
           └──────────┬───────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ UserCredits   │
              │ (Balance +)   │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │ Transaction   │
              │ Logged        │
              └───────────────┘

AI Operation (Question/Chat/etc.)
           │
           ▼
    ┌──────────────┐
    │ CreditGuard  │──── Insufficient ────▶ 403 Error
    │ Check        │
    └──────┬───────┘
           │ Sufficient
           ▼
    ┌──────────────┐
    │ Process      │
    │ Request      │
    └──────┬───────┘
           │ Success
           ▼
    ┌──────────────┐
    │ Consume      │
    │ Credits      │
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ UserCredits  │
    │ (Balance -)  │
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ Transaction  │
    │ Logged       │
    └──────────────┘
```

---

## 🗂️ Files Created/Modified

### Backend Files

#### Entities

```
api/src/modules/billing/entities/
├── user-credits.entity.ts          # User credit balance tracking
├── credit-transaction.entity.ts    # Transaction ledger
├── credit-package.entity.ts        # Top-up packages
└── index.ts                        # Entity exports
```

#### Repositories

```
api/src/modules/billing/
├── user-credits.repository.ts           # User credits data access
├── credit-transaction.repository.ts     # Transaction data access
└── credit-package.repository.ts         # Package data access
```

#### Services

```
api/src/modules/billing/
├── credit.service.ts               # Main credit business logic
└── billing.module.ts               # Module definition
```

#### DTOs

```
api/src/modules/billing/dto/
├── credits.dto.ts                  # Credit operation DTOs
├── credit-package.dto.ts           # Package management DTOs
└── index.ts                        # DTO exports
```

#### Controller

```
api/src/modules/billing/
└── billing.controller.ts           # API endpoints
```

#### Guards & Interceptors

```
api/src/common/guards/
└── credit.guard.ts                 # Credit check guard

api/src/common/interceptors/
└── credit-consumption.interceptor.ts  # Auto credit consumption
```

#### Migration

```
api/src/database/migrations/
└── 1765500000000-AddBillingCreditsSystem.ts
```

### Frontend Files

#### Types

```
ui/src/types/
└── billing.ts                      # TypeScript interfaces
```

#### API Layer

```
ui/src/lib/api/
└── billing.ts                      # API functions
```

#### Components

```
ui/src/components/billing/
├── credit-balance-card.tsx         # Credit balance display
├── transaction-history.tsx         # Transaction list
├── credit-top-up.tsx              # Purchase packages
├── usage-analytics.tsx            # Usage charts
├── insufficient-credits-modal.tsx # Insufficient credits alert
└── index.ts                       # Component exports
```

#### Hooks

```
ui/src/hooks/
└── use-credit-balance.ts          # Credit management hook
```

#### Pages

```
ui/src/app/(protected)/billing/
├── page.tsx                       # Billing dashboard
└── top-up/
    └── page.tsx                   # Credit top-up page
```

---

## 📊 Database Schema

### user_credits

| Column               | Type      | Description                   |
| -------------------- | --------- | ----------------------------- |
| id                   | int       | Primary key                   |
| user_id              | int       | User reference (unique)       |
| available_credits    | decimal   | Current balance               |
| total_allocated      | decimal   | All-time allocated            |
| total_consumed       | decimal   | All-time consumed             |
| expiring_credits     | decimal   | Subscription credits (expire) |
| purchased_credits    | decimal   | Top-up credits (don't expire) |
| credits_expire_at    | timestamp | Expiration date               |
| last_reset_at        | timestamp | Last billing cycle reset      |
| low_credit_threshold | int       | Warning threshold             |
| low_credit_notified  | boolean   | Notification sent flag        |

### credit_transactions (Ledger)

| Column           | Type      | Description                |
| ---------------- | --------- | -------------------------- |
| id               | int       | Primary key                |
| user_id          | int       | User reference             |
| transaction_type | enum      | Type of transaction        |
| amount           | decimal   | Credit amount (+/-)        |
| balance_before   | decimal   | Balance before             |
| balance_after    | decimal   | Balance after              |
| status           | enum      | Transaction status         |
| description      | varchar   | Human-readable description |
| reference_id     | varchar   | Related entity ID          |
| reference_type   | varchar   | Related entity type        |
| ip_address       | varchar   | Request IP                 |
| user_agent       | varchar   | Request user agent         |
| metadata         | json      | Additional data            |
| expires_at       | timestamp | Credit expiration          |

### credit_packages

| Column              | Type    | Description             |
| ------------------- | ------- | ----------------------- |
| id                  | int     | Primary key             |
| name                | varchar | Package name            |
| description         | text    | Package description     |
| credits             | int     | Base credits            |
| price_cents         | int     | Price in cents          |
| currency            | varchar | Currency code           |
| bonus_credits       | int     | Extra free credits      |
| discount_percentage | decimal | Savings percentage      |
| is_active           | boolean | Available for purchase  |
| is_featured         | boolean | Featured package        |
| is_popular          | boolean | Popular badge           |
| expiry_days         | int     | Credit expiry (0=never) |

---

## 🔐 Credit Costs

Default credit costs per operation (legacy fixed costs - use token-based pricing instead):

| Operation         | Credits |
| ----------------- | ------- |
| AI Question       | 5       |
| AI Chat Message   | 2       |
| Document Analysis | 10      |
| Image Generation  | 20      |
| Advanced AI Model | +10     |
| Generic Feature   | 1       |

---

## 🎯 Token-Based Pricing System

### Overview

The system now supports dynamic token-based pricing that charges based on actual input/output tokens used by AI operations. Token pricing can be configured per AI model through the admin panel.

### Pricing Configuration

Each AI model in the `ai_model_configurations` table has the following pricing fields:

| Field                     | Type    | Default | Description                         |
| ------------------------- | ------- | ------- | ----------------------------------- |
| input_cost_per_1k_tokens  | decimal | 1.0     | Credits per 1000 input tokens       |
| output_cost_per_1k_tokens | decimal | 3.0     | Credits per 1000 output tokens      |
| minimum_credits           | integer | 1       | Minimum credits charged per request |
| model_multiplier          | decimal | 1.0     | Multiplier for premium models       |

### Cost Calculation Formula

```
inputCost = (inputTokens × inputCostPer1kTokens) / 1000
outputCost = (outputTokens × outputCostPer1kTokens) / 1000
totalCost = inputCost + outputCost

// Apply minimum credits rule
costAfterMinimum = max(totalCost, minimumCredits)

// Apply model multiplier
costAfterMultiplier = costAfterMinimum × modelMultiplier

// Apply user's subscription multiplier
finalCost = ceil(costAfterMultiplier × userSubscriptionMultiplier)
```

### Default Pricing by Model

| Model           | Input (per 1K) | Output (per 1K) | Min Credits | Multiplier |
| --------------- | -------------- | --------------- | ----------- | ---------- |
| gpt-4o          | 2.5            | 10              | 1           | 1.0        |
| gpt-4o-mini     | 0.15           | 0.6             | 1           | 1.0        |
| gpt-4-turbo     | 5              | 15              | 1           | 1.0        |
| gpt-3.5-turbo   | 0.25           | 0.75            | 1           | 1.0        |
| claude-3-opus   | 7.5            | 37.5            | 2           | 1.0        |
| claude-3-sonnet | 1.5            | 7.5             | 1           | 1.0        |
| claude-3-haiku  | 0.125          | 0.625           | 1           | 1.0        |

### Admin Configuration

Administrators can update token pricing for each AI model through:

1. **Admin Panel**: Navigate to Settings → AI Models → Edit Model
2. **API**: `PATCH /settings/ai-models/:id` with pricing fields

Example update request:

```json
{
    "inputCostPer1kTokens": 2.5,
    "outputCostPer1kTokens": 10.0,
    "minimumCredits": 1,
    "modelMultiplier": 1.0
}
```

### Transaction Tracking

Token usage is tracked in each credit transaction:

| Field                | Description                        |
| -------------------- | ---------------------------------- |
| input_tokens         | Number of input tokens used        |
| output_tokens        | Number of output tokens generated  |
| total_tokens         | Sum of input and output tokens     |
| ai_model             | Model name used for the operation  |
| token_cost_breakdown | JSON breakdown of cost calculation |

---

## 🛣️ API Endpoints

### User Endpoints

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| GET    | `/billing/credits/balance`       | Get current balance     |
| GET    | `/billing/credits/transactions`  | Transaction history     |
| GET    | `/billing/credits/usage-summary` | Usage summary           |
| GET    | `/billing/credits/ai-usage`      | AI usage breakdown      |
| GET    | `/billing/credits/daily-usage`   | Daily usage chart       |
| PATCH  | `/billing/credits/threshold`     | Update low credit alert |

### Package Endpoints

| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| GET    | `/billing/packages`          | List available packages |
| GET    | `/billing/packages/:id`      | Get package details     |
| POST   | `/billing/packages/purchase` | Purchase package        |

### Admin Endpoints

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/billing/admin/packages`               | All packages (inc. inactive) |
| POST   | `/billing/admin/packages`               | Create package               |
| PATCH  | `/billing/admin/packages/:id`           | Update package               |
| DELETE | `/billing/admin/packages/:id`           | Delete package               |
| POST   | `/billing/admin/credits/adjust`         | Adjust user credits          |
| GET    | `/billing/admin/users/:id/credits`      | Get user balance             |
| GET    | `/billing/admin/users/:id/transactions` | User transactions            |
| GET    | `/billing/admin/statistics`             | Billing statistics           |

---

## 🚀 Usage Examples

### Backend - Protect AI Endpoint

```typescript
import { CreditGuard, RequireCredits } from '@/common/guards/credit.guard';
import { CreditConsumptionInterceptor } from '@/common/interceptors/credit-consumption.interceptor';
import { CreditTransactionType } from '@/modules/billing/entities/credit-transaction.entity';

@Post('ask')
@UseGuards(JwtAuthGuard, CreditGuard)
@UseInterceptors(CreditConsumptionInterceptor)
@RequireCredits(CreditTransactionType.AI_QUESTION)
async askQuestion(@Body() dto: AskQuestionDto) {
  // Credits are checked before and consumed after success
  return this.aiService.askQuestion(dto);
}
```

### Backend - Manual Credit Operations

```typescript
// Allocate credits
await this.creditService.allocateCredits({
    userId: user.id,
    amount: 100,
    transactionType: CreditTransactionType.PROMOTIONAL,
    description: "Holiday promotion bonus",
});

// Check if user can perform operation
const canProceed = await this.creditService.canPerformOperation(
    userId,
    CreditTransactionType.AI_QUESTION
);

if (!canProceed.allowed) {
    throw new ForbiddenException("Insufficient credits");
}

// Consume credits
const result = await this.creditService.consumeCredits({
    userId: user.id,
    transactionType: CreditTransactionType.AI_QUESTION,
    description: "AI question asked",
    referenceId: question.id,
});
```

### Frontend - Credit Balance Hook

```typescript
import { useCreditBalance } from "@/hooks/use-credit-balance";
import { InsufficientCreditsModal } from "@/components/billing";

function AIFeatureComponent() {
    const {
        balance,
        hasCredits,
        showInsufficientModal,
        insufficientData,
        openInsufficientModal,
        closeInsufficientModal,
    } = useCreditBalance();

    const handleAskQuestion = async () => {
        if (!hasCredits(5)) {
            openInsufficientModal(5);
            return;
        }
        // Proceed with question
    };

    return (
        <>
            <button onClick={handleAskQuestion}>Ask AI (5 credits)</button>
            <InsufficientCreditsModal
                isOpen={showInsufficientModal}
                onClose={closeInsufficientModal}
                required={insufficientData?.required || 0}
                available={insufficientData?.available || 0}
                balance={balance}
            />
        </>
    );
}
```

---

## 🔧 Setup Instructions

### 1. Run Migration

```bash
cd api
pnpm migration:run
```

### 2. Configure Subscription Packages

Update existing subscription packages with monthly credits:

```sql
UPDATE subscription_packages
SET monthly_credits = CASE
  WHEN package_type = 'free' THEN 50
  WHEN package_type = 'basic' THEN 500
  WHEN package_type = 'premium' THEN 2000
  WHEN package_type = 'enterprise' THEN 10000
  ELSE 100
END;
```

### 3. Add Permissions (Optional)

Add billing permissions for admin control:

```sql
INSERT INTO permissions (name, description, resource, action)
VALUES
  ('BILLING:READ', 'View billing data', 'BILLING', 'READ'),
  ('BILLING:WRITE', 'Manage credits', 'BILLING', 'WRITE'),
  ('BILLING:DELETE', 'Delete billing data', 'BILLING', 'DELETE');
```

---

## 📈 Event Integration

The system emits and listens to events for integration:

### Emitted Events

-   `credits.consumed` - When credits are used
-   `credits.allocated` - When credits are added
-   `credits.low` - When balance falls below threshold
-   `credits.insufficient` - When operation blocked

### Listened Events

-   `subscription.created` - Allocate initial credits
-   `subscription.renewed` - Allocate renewal credits
-   `subscription.deleted` - Handle cancellation
-   `user.created` - Allocate signup bonus

---

## 🎨 UI Components

### CreditBalanceCard

Displays current balance with usage stats. Supports compact mode for headers.

### TransactionHistory

Paginated transaction list with filtering by type.

### CreditTopUp

Package selection and purchase interface.

### UsageAnalytics

Charts showing AI usage breakdown and daily patterns.

### InsufficientCreditsModal

Alert modal when credits are insufficient.

---

## 🔒 Security Considerations

1. **Atomic Operations**: Credit deductions use database-level atomic operations
2. **Double-Spending Prevention**: Balance checks before and after operations
3. **Audit Trail**: Every credit change is logged in the ledger
4. **IP/User Agent Tracking**: Fraud detection support
5. **Admin-Only Adjustments**: Manual credits require admin permissions
