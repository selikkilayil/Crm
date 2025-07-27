# Deployment Guide

## Database Setup

### 1. Run Migrations
```bash
npx prisma migrate deploy
```

### 2. Seed Database
```bash
npm run db:seed
```

This will create:
- Default users (admin@crm.com, manager@crm.com, sales@crm.com)
- SuperAdmin user
- Permissions and roles
- **PDF Settings with default values**

### 3. Alternative: Quick Migration + Seed
```bash
npm run db:migrate
```

## PDF Settings

The deployment includes default PDF settings that will be automatically created:

- **Company Info**: Template company information
- **Colors**: Professional blue/purple theme
- **Tax Rate**: 18% default (configurable)
- **Currency**: USD with $ symbol (configurable)
- **Terms**: Default payment/delivery terms
- **Validity**: 30-day default validity period

### Customizing for Your Business

After deployment, login as admin and go to Settings > PDF Settings to customize:

1. **Company Info** tab: Update your business details
2. **Colors & Branding** tab: Match your brand colors
3. **Quotation Format** tab: Set your quotation numbering and currency
4. **Quotation Defaults** tab: Configure default terms and tax rates

## Environment Variables

Make sure these are set in your deployment environment:

```env
DATABASE_URL="your-postgres-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="your-domain"
```

## Login Credentials (Default)

- **Admin**: admin@crm.com / admin123
- **Manager**: manager@crm.com / manager123  
- **Sales**: sales@crm.com / sales123

⚠️ **Important**: Change default passwords after deployment!

## Features Ready

✅ **Quotation Settings**: Fully configured and ready
✅ **PDF Generation**: Uses custom settings automatically
✅ **Default Values**: New quotations pre-filled with your settings
✅ **Multi-role Access**: Admin and role-based permissions