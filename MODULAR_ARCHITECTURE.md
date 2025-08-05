# CRM Modular Architecture Plan

## 🎯 Goals
- **Scalability**: Easy to add new features and modules
- **Maintainability**: Clear separation of concerns
- **Reusability**: Shared components and services
- **Team Collaboration**: Multiple developers can work on different modules
- **Testing**: Isolated testing of modules

## 📁 New Folder Structure

```
src/
├── modules/                          # Domain modules
│   ├── auth/                         # Authentication module
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   ├── leads/                        # Lead management module
│   │   ├── components/
│   │   │   ├── LeadKanban.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   └── LeadCard.tsx
│   │   ├── services/
│   │   │   └── leads.service.ts
│   │   ├── hooks/
│   │   │   ├── useLeads.ts
│   │   │   └── useLeadMutation.ts
│   │   ├── types/
│   │   │   └── lead.types.ts
│   │   ├── pages/
│   │   │   ├── LeadsPage.tsx
│   │   │   └── LeadEditPage.tsx
│   │   └── index.ts
│   │
│   ├── customers/                    # Customer management module
│   │   ├── components/
│   │   │   ├── CustomerGrid.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerCard.tsx
│   │   │   └── CustomerProfile.tsx
│   │   ├── services/
│   │   │   └── customers.service.ts
│   │   ├── hooks/
│   │   │   └── useCustomers.ts
│   │   ├── types/
│   │   │   └── customer.types.ts
│   │   ├── pages/
│   │   │   ├── CustomersPage.tsx
│   │   │   └── CustomerDetailPage.tsx
│   │   └── index.ts
│   │
│   ├── products/                     # Product management module
│   │   ├── components/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── AttributeEditor.tsx
│   │   │   └── VariantEditor.tsx
│   │   ├── services/
│   │   │   └── products.service.ts
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   └── useProductCalculation.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   ├── pages/
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductCreatePage.tsx
│   │   │   └── ProductEditPage.tsx
│   │   └── index.ts
│   │
│   ├── quotations/                   # Quotation module
│   │   ├── components/
│   │   │   ├── QuotationForm.tsx
│   │   │   ├── QuotationList.tsx
│   │   │   ├── QuotationItemRow.tsx
│   │   │   └── QuotationPDF.tsx
│   │   ├── services/
│   │   │   └── quotations.service.ts
│   │   ├── hooks/
│   │   │   ├── useQuotations.ts
│   │   │   └── useQuotationTotals.ts
│   │   ├── types/
│   │   │   └── quotation.types.ts
│   │   ├── pages/
│   │   │   ├── QuotationsPage.tsx
│   │   │   ├── QuotationCreatePage.tsx
│   │   │   └── QuotationEditPage.tsx
│   │   └── index.ts
│   │
│   ├── tasks/                        # Task management module
│   │   ├── components/
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskSection.tsx
│   │   ├── services/
│   │   │   └── tasks.service.ts
│   │   ├── hooks/
│   │   │   └── useTasks.ts
│   │   ├── types/
│   │   │   └── task.types.ts
│   │   ├── pages/
│   │   │   └── TasksPage.tsx
│   │   └── index.ts
│   │
│   ├── activities/                   # Activity tracking module
│   │   ├── components/
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── ActivityForm.tsx
│   │   │   └── ActivityCard.tsx
│   │   ├── services/
│   │   │   └── activities.service.ts
│   │   ├── hooks/
│   │   │   └── useActivities.ts
│   │   ├── types/
│   │   │   └── activity.types.ts
│   │   ├── pages/
│   │   │   └── ActivitiesPage.tsx
│   │   └── index.ts
│   │
│   ├── users/                        # User management module
│   │   ├── components/
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserList.tsx
│   │   │   └── UserCard.tsx
│   │   ├── services/
│   │   │   └── users.service.ts
│   │   ├── hooks/
│   │   │   └── useUsers.ts
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   ├── pages/
│   │   │   └── UsersPage.tsx
│   │   └── index.ts
│   │
│   └── dashboard/                    # Dashboard module
│       ├── components/
│       │   ├── StatCard.tsx
│       │   ├── ChartWidget.tsx
│       │   └── DashboardGrid.tsx
│       ├── services/
│       │   └── dashboard.service.ts
│       ├── hooks/
│       │   └── useDashboard.ts
│       ├── types/
│       │   └── dashboard.types.ts
│       ├── pages/
│       │   └── DashboardPage.tsx
│       └── index.ts
│
├── shared/                           # Shared utilities and components
│   ├── components/                   # Reusable UI components
│   │   ├── forms/
│   │   │   ├── FormWrapper.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── FormButton.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── Modal.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── NavBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageLayout.tsx
│   │   └── guards/
│   │       ├── AuthGuard.tsx
│   │       └── PermissionGuard.tsx
│   │
│   ├── services/                     # Shared services
│   │   ├── api/
│   │   │   ├── api-client.ts
│   │   │   ├── api-auth.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   └── storage.service.ts
│   │   └── validation/
│   │       └── validation.service.ts
│   │
│   ├── hooks/                        # Shared hooks
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePermissions.ts
│   │   └── index.ts
│   │
│   ├── types/                        # Shared types
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── date.ts
│   │   └── index.ts
│   │
│   └── constants/                    # App constants
│       ├── routes.ts
│       ├── permissions.ts
│       └── index.ts
│
├── app/                              # Next.js App Router (simplified)
│   ├── (dashboard)/                  # Route groups
│   │   ├── leads/
│   │   │   ├── page.tsx              # Re-exports from modules
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                          # API routes (kept separate)
│   │   └── [existing structure]
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
└── [existing lib, middleware, etc.]
```

## 🔧 Module Structure Pattern

Each module follows this pattern:

### 1. **Components** (`/components`)
- UI components specific to the module
- Form components
- Display components
- Modal components

### 2. **Services** (`/services`)
- API calls
- Business logic
- Data transformation
- External integrations

### 3. **Hooks** (`/hooks`)
- React hooks for data fetching
- State management hooks
- Custom business logic hooks

### 4. **Types** (`/types`)
- TypeScript interfaces
- Enums
- Type definitions

### 5. **Pages** (`/pages`)
- Main page components
- Page-specific logic
- Route handling logic

### 6. **Index File** (`/index.ts`)
- Public API of the module
- Controlled exports
- Module interface

## 🚀 Migration Strategy

### Phase 1: Create Shared Foundation
1. Create `shared/` directory structure
2. Move reusable components to `shared/components/`
3. Create shared services and hooks
4. Establish type definitions

### Phase 2: Extract First Module (Leads)
1. Create `modules/leads/` structure
2. Extract lead-related components
3. Create lead service
4. Update imports and references
5. Test thoroughly

### Phase 3: Extract Remaining Modules
1. Customers module
2. Products module
3. Quotations module
4. Tasks module
5. Activities module
6. Users module
7. Dashboard module

### Phase 4: Optimize and Refine
1. Remove duplicate code
2. Optimize imports
3. Add module-level testing
4. Document module APIs

## 📋 Benefits

### For Development
- **Clear boundaries**: Each module is self-contained
- **Parallel development**: Multiple developers can work on different modules
- **Easier testing**: Test modules in isolation
- **Better IDE support**: Clear imports and structure

### For Maintenance
- **Easier debugging**: Issues are contained within modules
- **Simpler refactoring**: Changes are localized
- **Clear dependencies**: Explicit module relationships
- **Better documentation**: Each module is documented

### For Scaling
- **Add new modules**: Follow established patterns
- **Feature flags**: Enable/disable modules
- **Lazy loading**: Load modules on demand
- **Micro-frontend ready**: Modules can become separate apps

## 🔌 Module Communication

### Direct Module Communication
```typescript
import { leadService } from '@/modules/leads'
import { customerService } from '@/modules/customers'
```

### Through Shared Services
```typescript
import { apiClient } from '@/shared/services'
```

### Event-Driven Communication
```typescript
import { eventBus } from '@/shared/services'
```

## 📝 Implementation Guidelines

### 1. **Barrel Exports**
Each module has an index.ts file that exports its public API:

```typescript
// modules/leads/index.ts
export { LeadsPage } from './pages/LeadsPage'
export { LeadForm } from './components/LeadForm'
export { useLeads } from './hooks/useLeads'
export { leadService } from './services/leads.service'
export type { Lead, LeadStatus } from './types/lead.types'
```

### 2. **Dependency Rules**
- Modules can import from `shared/`
- Modules cannot import from other modules directly
- Pages can import from their own module
- Shared code cannot import from modules

### 3. **Naming Conventions**
- Files: kebab-case (`lead-form.component.tsx`)
- Components: PascalCase (`LeadForm`)
- Services: camelCase with `.service` suffix (`leads.service.ts`)
- Hooks: camelCase with `use` prefix (`useLeads`)
- Types: PascalCase (`Lead`, `LeadStatus`)

This modular architecture will make the CRM much more maintainable and scalable while preserving all existing functionality.