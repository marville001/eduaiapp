# Token-Based Credit System Migration

This document describes the migration from fixed credit costs per AI operation to a token-based pricing model.

## Overview

### Previous System (Fixed Costs)

```typescript
export const CREDIT_COSTS = {
    [CreditTransactionType.AI_QUESTION]: 5, // 5 credits per question
    [CreditTransactionType.AI_CHAT_MESSAGE]: 2, // 2 credits per message
    [CreditTransactionType.AI_DOCUMENT_ANALYSIS]: 10, // 10 credits per analysis
    [CreditTransactionType.AI_IMAGE_GENERATION]: 20, // 20 credits per image
    [CreditTransactionType.AI_ADVANCED_MODEL]: 10, // 10 additional credits
    [CreditTransactionType.FEATURE_USAGE]: 1, // 1 credit
};
```

### New System (Token-Based Pricing)

Credits are now calculated based on actual input and output tokens:

```typescript
total_credits = (input_tokens × input_cost_per_1k / 1000) +
                (output_tokens × output_cost_per_1k / 1000)
```

## New Files Created

### 1. Token Pricing Configuration

**File:** `api/src/modules/billing/token-pricing.config.ts`

Contains:

-   `TokenPricingConfig` interface - pricing per 1K tokens for each model
-   `TokenUsage` interface - input/output/total tokens
-   `TokenCostBreakdown` interface - detailed cost calculation results
-   `DEFAULT_TOKEN_PRICING` - pricing configs for different AI models (GPT-4, GPT-3.5, Claude, etc.)
-   `ESTIMATED_TOKENS` - average token estimates per operation type
-   `calculateTokenCost()` - calculate cost from actual token usage
-   `estimateOperationCost()` - estimate cost for pre-authorization

### 2. Database Migration

**File:** `api/src/database/migrations/1765600000000-AddTokenUsageToCreditsTransaction.ts`

Adds columns to `credit_transactions` table:

-   `input_tokens` (int) - input token count
-   `output_tokens` (int) - output token count
-   `total_tokens` (int) - total token count
-   `ai_model` (varchar) - model name used
-   `token_cost_breakdown` (JSON) - detailed cost breakdown

## Modified Files

### Backend (API)

1. **`credit-transaction.entity.ts`**

    - Added new columns for token usage
    - Added `tokenCostBreakdown` JSON field
    - Added helper methods `hasTokenUsage()` and `getTokenUsageSummary()`

2. **`credit.service.ts`**

    - Added `calculateTokenBasedCost()` method
    - Added `estimateOperationCost()` method
    - Updated `consumeCredits()` to use token-based pricing when token data available
    - Updated `canPerformOperation()` to use token estimation
    - Legacy fixed costs kept for backward compatibility

3. **`credit-transaction.repository.ts`**

    - Updated `CreateTransactionDto` with token fields

4. **`credit.guard.ts`**

    - Now uses token-based estimation for pre-authorization
    - Passes model name to estimation function

5. **`credit-consumption.interceptor.ts`**

    - Extracts token usage from AI responses
    - Passes token data to `consumeCredits()`
    - Includes token breakdown in response

6. **`ai.service.ts`**

    - Updated to use `AiResponse` interface with detailed token usage
    - Stores token details in question metadata

7. **`openai.service.ts`**

    - Created `TokenUsageDetails` and `AiResponse` interfaces
    - Returns detailed token usage (input/output/total)

8. **`ai.repository.ts`**
    - Updated `updateQuestionAnswer()` to accept token details

### Frontend (UI)

1. **`types/billing.ts`**

    - Added `TokenUsage`, `TokenCostBreakdown`, `CreditInfoResponse` interfaces
    - Added token fields to `CreditTransaction` interface
    - Added helper functions: `formatTokens()`, `formatTokenUsage()`, `hasTokenUsage()`

2. **`components/billing/transaction-history.tsx`**
    - Now displays token usage for AI transactions
    - Shows model name and input/output token counts

## Token Pricing Configuration

### Default Pricing (per 1,000 tokens)

| Model           | Input Cost | Output Cost | Minimum |
| --------------- | ---------- | ----------- | ------- |
| gpt-4o          | 2.5        | 10          | 1       |
| gpt-4o-mini     | 0.15       | 0.6         | 1       |
| gpt-4-turbo     | 5          | 15          | 1       |
| gpt-3.5-turbo   | 0.25       | 0.75        | 1       |
| claude-3-opus   | 7.5        | 37.5        | 2       |
| claude-3-sonnet | 1.5        | 7.5         | 1       |
| claude-3-haiku  | 0.125      | 0.625       | 1       |
| default         | 1          | 3           | 1       |

### Estimated Tokens (for pre-authorization)

| Operation Type       | Input Tokens | Output Tokens |
| -------------------- | ------------ | ------------- |
| ai_question          | 500          | 1500          |
| ai_chat_message      | 300          | 800           |
| ai_document_analysis | 2000         | 2000          |
| ai_image_generation  | 100          | 0             |

## How It Works

### Pre-Authorization (Guard)

1. User makes AI request
2. Guard estimates token usage based on operation type
3. Calculates estimated cost using model pricing
4. Checks if user has sufficient credits
5. Allows or rejects request

### Post-Execution (Interceptor)

1. AI operation completes successfully
2. Interceptor extracts actual token usage from response
3. Calculates real cost based on actual tokens
4. Deducts credits from user account
5. Records transaction with full token details

### Credit Response

AI responses now include credit info:

```typescript
{
  creditInfo: {
    consumed: 15,
    remaining: 485,
    tokenUsage: {
      inputTokens: 450,
      outputTokens: 1200,
      totalTokens: 1650
    },
    tokenCostBreakdown: {
      inputCost: 1.125,
      outputCost: 12,
      totalCost: 13.125,
      minimumApplied: false,
      modelMultiplier: 1,
      finalCost: 14
    }
  }
}
```

## Migration Steps

1. Run the database migration:

    ```bash
    npm run migration:run
    ```

2. The system automatically uses token-based pricing for new transactions when token data is available

3. Legacy transactions (without token data) continue to work with the old fixed pricing

## Backward Compatibility

-   The old `CREDIT_COSTS` object is kept but marked as deprecated
-   Transactions without token data fall back to fixed costs
-   Existing transaction history remains unchanged
-   UI gracefully handles transactions with or without token data

## Future Enhancements

1. **Admin UI for pricing configuration** - Allow admins to adjust token pricing from dashboard
2. **Usage analytics** - Dashboard showing token usage patterns
3. **Budget alerts** - Notify users when approaching token-based spending limits
4. **Model-specific limits** - Allow packages to limit access to expensive models
