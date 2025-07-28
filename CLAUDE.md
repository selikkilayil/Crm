# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design Guidelines

- Always remember we need to use font color that is able to see in sense that if background is light the fontcolor/textcolor should be dark
- always in mind this app should work properly on mobile
- dont forget to use different contrast colors if text is dark background is light

## Project Overview

This is a comprehensive CRM (Customer Relationship Management) application built with Next.js 15, TypeScript, and PostgreSQL. The app manages the complete business workflow: Lead → Customer → Quotation → Production.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Next.js API Routes with RESTful design
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 with mobile-first approach
- **Authentication**: Custom lightweight auth system with localStorage
- **PDF Generation**: @react-pdf/renderer and jsPDF

## Common Development Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build           # Build for production (includes Prisma generate)
npm start               # Start production server
npm run lint            # Run ESLint
```

### Database Operations
```bash
npm run db:seed         # Seed database with sample data
npm run db:migrate      # Deploy migrations and seed data
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create and apply new migration
npx prisma studio       # Open Prisma Studio
```

## Project Architecture

### Core Business Models
- **Users**: Role-based system (SUPERADMIN, ADMIN, MANAGER, SALES) with custom roles
- **Leads**: Lead lifecycle management (NEW → CONTACTED → QUALIFIED → CONVERTED → LOST)
- **Customers**: Complete customer profiles with billing/shipping addresses
- **Activities**: Timeline tracking (NOTES, CALLS, EMAILS, MEETINGS, TASKS)
- **Tasks**: Assignment system with priorities and due dates
- **Tags**: Color-coded segmentation for leads/customers
- **Quotations**: Professional quotation system with line items and calculations
- **CustomRoles & Permissions**: Dynamic role-based access control system

### Key File Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (RESTful endpoints)
│   ├── dashboard/         # Main dashboard
│   ├── leads/             # Lead management (Kanban + Table views)
│   ├── customers/         # Customer management (Grid + Table views)
│   ├── activities/        # Activity timeline and management
│   ├── tasks/             # Task assignment and tracking
│   ├── quotations/        # Quotation management system
│   ├── users/             # User management (Admin only)
│   └── login/             # Authentication
├── components/            # Reusable React components
│   ├── AuthGuard.tsx      # Route protection
│   ├── NavBar.tsx         # Responsive navigation
│   ├── PermissionGuard.tsx # Permission-based component protection
│   └── pdf/               # PDF generation components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Authentication utilities
│   ├── permissions.ts    # Role-based permission system
│   ├── prisma.ts         # Database connection
│   └── api-client.ts     # Centralized API client
└── middleware.ts          # Route protection middleware
```

### Authentication & Authorization Architecture
- **Client-side**: AuthGuard component protects routes, useAuth hook manages state
- **Server-side**: Middleware + individual API route protection
- **Permissions**: Role-based system with granular permissions (view, create, edit, delete)
- **Special Roles**: SUPERADMIN restricted to user management only

### Database Design Patterns
- **Soft Deletes**: Most models use `isArchived` instead of hard deletion
- **Audit Trails**: All models have `createdAt` and `updatedAt` timestamps
- **Relationships**: Proper foreign keys with cascade delete where appropriate
- **Enums**: TypeScript enums for status, priorities, roles
- **Decimal Precision**: Financial calculations use Prisma Decimal type

## API Design Patterns

### RESTful Endpoints
- `GET /api/[resource]` - List with optional filtering/search
- `POST /api/[resource]` - Create new record
- `GET /api/[resource]/[id]` - Get single record with relationships
- `PUT /api/[resource]/[id]` - Update record
- `DELETE /api/[resource]/[id]` - Delete (usually soft delete)

### API Response Format
```typescript
// Success responses
{ data: T, message?: string }

// Error responses  
{ error: string, details?: any }
```

### Authentication Headers
API routes expect `x-auth-user` header with JSON stringified user object for authenticated requests.

## Mobile-First Development

### Design Principles
- Start with mobile layout, enhance for desktop
- Minimum 44px touch targets
- Proper contrast ratios (dark text on light backgrounds)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Key Responsive Patterns
- **Navigation**: Hamburger menu on mobile, full nav on desktop
- **Tables**: Transform to cards on mobile screens
- **Modals**: Full-screen on mobile, centered on desktop
- **Kanban**: Horizontal scroll on mobile, full columns on desktop

## Component Development Guidelines

### Reusable Components
- **AuthGuard**: Wrap pages requiring authentication
- **PermissionGuard**: Wrap components requiring specific permissions
- **TagComponent**: Reusable tag display with edit/remove functionality
- **ActivityTimeline**: Timeline view for activities
- **TaskSection**: Task management component

### State Management Patterns
- Use `useState` and `useEffect` for local state
- Custom hooks for shared logic (useAuth, usePermissions)
- API calls centralized in `lib/api-client.ts`
- Real-time updates using localStorage events

## Testing & Quality

### Code Quality
- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Tailwind CSS for consistent styling
- Mobile-first responsive design testing required

### Database Testing
- Use `npm run db:seed` to populate test data
- Sample data includes all relationships and realistic business scenarios
- Test user: demo@crm.com (Admin role)

## Security Considerations

### Authentication
- Demo mode uses localStorage (not for production)
- Server-side validation on all API endpoints
- Role-based access control enforced both client and server side
- SUPERADMIN role restricted to user management only

### Data Protection
- Input validation on all forms
- SQL injection prevention via Prisma
- XSS protection through proper escaping
- Sensitive operations require appropriate permissions

## Production Deployment Notes

### Environment Variables Required
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

### Build Configuration
- TypeScript and ESLint errors ignored in production build (configured in next.config.ts)
- Automatic Prisma client generation during build
- Turbopack enabled for faster development

### Performance Optimizations
- Database queries include only necessary relationships
- API endpoints support pagination and filtering
- Images optimized through Next.js Image component
- Static assets served through Next.js optimization

## Common Development Patterns

### Adding New Features
1. Update Prisma schema if database changes needed
2. Run migration: `npx prisma migrate dev`
3. Create/update API endpoints following RESTful patterns
4. Build mobile-first UI components
5. Add proper error handling and loading states
6. Test with different user roles and permissions

### Permission-Based Development
- Always check user permissions before showing UI elements
- Use `PermissionGuard` component for conditional rendering
- Validate permissions on both client and server side
- Follow principle of least privilege

### Mobile Testing Checklist
- Test on actual mobile devices when possible
- Verify touch targets are appropriately sized
- Check text contrast and readability
- Ensure modals and forms work properly on small screens
- Test navigation and menu functionality

## Troubleshooting

### Common Issues
- **Database connection**: Check PostgreSQL service and DATABASE_URL
- **Prisma client**: Run `npx prisma generate` after schema changes
- **Authentication**: Clear localStorage and re-login for auth issues
- **Permissions**: Check user role and permission assignments

### Development Reset
```bash
npm run db:migrate      # Reset and seed database
npm run dev            # Start development server
```

## important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.