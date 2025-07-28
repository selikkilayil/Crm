-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'CONFIGURABLE', 'CALCULATED');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'PER_UNIT', 'CALCULATED', 'VARIANT_BASED');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'DIMENSION', 'BOOLEAN');

-- AlterTable
ALTER TABLE "quotation_items" ADD COLUMN     "calculatedPrice" DECIMAL(10,2),
ADD COLUMN     "configuration" JSONB,
ADD COLUMN     "estimatedCost" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "variantId" TEXT,
ALTER COLUMN "productName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "category" TEXT,
    "productType" "ProductType" NOT NULL DEFAULT 'SIMPLE',
    "pricingType" "PricingType" NOT NULL DEFAULT 'FIXED',
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costPrice" DECIMAL(10,2),
    "calculationFormula" TEXT,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "currentStock" DECIMAL(10,3) DEFAULT 0,
    "minStockLevel" DECIMAL(10,3) DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isConfigurable" BOOLEAN NOT NULL DEFAULT true,
    "minValue" DECIMAL(10,3),
    "maxValue" DECIMAL(10,3),
    "defaultValue" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_options" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayName" TEXT,
    "priceModifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costModifier" DECIMAL(10,2) DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribute_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "configuration" JSONB NOT NULL,
    "price" DECIMAL(10,2),
    "costPrice" DECIMAL(10,2),
    "stock" DECIMAL(10,3) DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_options" ADD CONSTRAINT "attribute_options_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
