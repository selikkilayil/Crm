-- CreateTable
CREATE TABLE "pdf_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'YOUR COMPANY NAME',
    "companyAddress" TEXT NOT NULL DEFAULT '123 Business Street, Business City, State 12345',
    "companyPhone" TEXT NOT NULL DEFAULT '+91 98765 43210',
    "companyEmail" TEXT NOT NULL DEFAULT 'info@company.com',
    "companyWebsite" TEXT NOT NULL DEFAULT 'www.yourcompany.com',
    "companyGST" TEXT NOT NULL DEFAULT '29ABCDE1234F1Z5',
    "logoUrl" TEXT,
    "logoText" TEXT NOT NULL DEFAULT 'L',
    "primaryColor" TEXT NOT NULL DEFAULT '#2d3748',
    "secondaryColor" TEXT NOT NULL DEFAULT '#6366f1',
    "textColor" TEXT NOT NULL DEFAULT '#1f2937',
    "lightBackground" TEXT NOT NULL DEFAULT '#f8fafc',
    "quotationPrefix" TEXT NOT NULL DEFAULT 'QT',
    "quotationNumberFormat" TEXT NOT NULL DEFAULT 'QT-YYYY-####',
    "footerText" TEXT NOT NULL DEFAULT 'Thank you for your business!',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_settings_pkey" PRIMARY KEY ("id")
);
