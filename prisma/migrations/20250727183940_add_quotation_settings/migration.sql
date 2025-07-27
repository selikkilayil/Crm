-- AlterTable
ALTER TABLE "pdf_settings" ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '₹',
ADD COLUMN     "defaultCurrency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "defaultDeliveryTerms" TEXT NOT NULL DEFAULT 'Delivery within 7-10 working days',
ADD COLUMN     "defaultPaymentTerms" TEXT NOT NULL DEFAULT '100% advance payment required',
ADD COLUMN     "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
ADD COLUMN     "defaultTermsConditions" TEXT NOT NULL DEFAULT '1. Prices are valid for the period mentioned above.
2. Payment terms as agreed.
3. Delivery will be made as per schedule.
4. All disputes subject to local jurisdiction.',
ADD COLUMN     "defaultValidityDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "showTaxBreakdown" BOOLEAN NOT NULL DEFAULT true;
