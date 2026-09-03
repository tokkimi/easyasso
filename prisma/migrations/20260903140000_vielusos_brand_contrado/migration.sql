-- VIELUSOS-only credentials are encrypted by the application before storage.
CREATE TABLE "ExternalIntegration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "secretEncrypted" TEXT NOT NULL,
  "storeId" TEXT,
  "storeName" TEXT,
  "lastSyncedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExternalIntegration_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product" ADD COLUMN "provider" TEXT;
ALTER TABLE "Product" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Product" ADD COLUMN "externalData" JSONB NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX "ExternalIntegration_organizationId_provider_key" ON "ExternalIntegration"("organizationId", "provider");
CREATE INDEX "ExternalIntegration_organizationId_idx" ON "ExternalIntegration"("organizationId");
CREATE UNIQUE INDEX "Product_organizationId_provider_externalId_key" ON "Product"("organizationId", "provider", "externalId");

ALTER TABLE "ExternalIntegration" ADD CONSTRAINT "ExternalIntegration_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
