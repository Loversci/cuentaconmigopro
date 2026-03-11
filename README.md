# cuentaconmigopro

Financial tracking and budgeting application services.

## Overview

cuentaconmigopro provides a set of core services for managing personal finances:

- **UserService** – user registration, authentication, and profile management
- **AccountService** – financial account management (checking, savings, credit, etc.)
- **TransactionService** – transaction recording, filtering, and spending summaries
- **BudgetService** – budget creation, spending tracking, and active budget queries

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Test with coverage

```bash
npm run test:coverage
```

## Services

### UserService

Manages user accounts with secure password hashing.

```ts
const userService = new UserService();
const user = await userService.createUser({ email: 'user@example.com', password: 'secret', name: 'Alice' });
const validated = await userService.validateCredentials('user@example.com', 'secret');
```

### AccountService

Manages financial accounts per user.

```ts
const accountService = new AccountService();
const account = accountService.createAccount({ userId: user.id, name: 'Checking', type: 'checking', initialBalance: 1000 });
const total = accountService.getTotalBalanceByUserId(user.id);
```

### TransactionService

Records and queries financial transactions.

```ts
const txService = new TransactionService();
txService.createTransaction({ accountId: account.id, userId: user.id, amount: 50, type: 'expense', category: 'Food', description: 'Lunch' });
const summary = txService.getSummaryByUserId(user.id);
// { totalIncome, totalExpenses, netBalance }
```

### BudgetService

Creates and tracks budgets by category.

```ts
const budgetService = new BudgetService();
const budget = budgetService.createBudget({ userId: user.id, name: 'Food Budget', category: 'Food', limit: 500, period: 'monthly', startDate, endDate });
budgetService.recordSpending(budget.id, 80);
const remaining = budgetService.getRemainingAmount(budget.id); // 420
```

