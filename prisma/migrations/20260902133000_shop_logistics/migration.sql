-- Connected shop logistics: structured addresses, customer sessions, shipping
-- rates, operational statuses and an immutable customer-visible timeline.
ALTER TABLE "Product"
  ADD COLUMN "sku" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "weightGrams" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "requiresShipping" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Order"
  ADD COLUMN "orderNumber" TEXT,
  ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
  ADD COLUMN "deliveryStatus" TEXT NOT NULL DEFAULT 'NOT_SHIPPED',
  ADD COLUMN "customerProfileId" TEXT,
  ADD COLUMN "shippingLine1" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingLine2" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingPostalCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingCity" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingRegion" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingCountryCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingMethod" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "subtotalCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "taxCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "carrier" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "trackingNumber" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "trackingUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "internalNote" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "customerNote" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "preparingAt" TIMESTAMP(3),
  ADD COLUMN "shippedAt" TIMESTAMP(3),
  ADD COLUMN "deliveredAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

UPDATE "Order" SET
  "orderNumber" = 'IMP-' || upper(substr(md5("id"), 1, 8)),
  "subtotalCents" = "totalCents",
  "paymentStatus" = CASE WHEN "status" IN ('PAID','SHIPPED') THEN 'PAID' WHEN "status" = 'CANCELLED' THEN 'CANCELLED' ELSE 'PENDING' END,
  "fulfillmentStatus" = CASE WHEN "status" = 'SHIPPED' THEN 'FULFILLED' WHEN "status" = 'CANCELLED' THEN 'CANCELLED' ELSE 'UNFULFILLED' END,
  "deliveryStatus" = CASE WHEN "status" = 'SHIPPED' THEN 'IN_TRANSIT' WHEN "status" = 'CANCELLED' THEN 'CANCELLED' ELSE 'NOT_SHIPPED' END;

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_organizationId_fulfillmentStatus_deliveryStatus_idx" ON "Order"("organizationId", "fulfillmentStatus", "deliveryStatus");
CREATE INDEX "Order_customerProfileId_createdAt_idx" ON "Order"("customerProfileId", "createdAt");
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CustomerProfile"
  ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'fr';

CREATE TABLE "CustomerAddress" (
  "id" TEXT NOT NULL,
  "customerProfileId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Adresse principale',
  "recipientName" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "line1" TEXT NOT NULL,
  "line2" TEXT NOT NULL DEFAULT '',
  "postalCode" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "region" TEXT NOT NULL DEFAULT '',
  "countryCode" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomerAddress_customerProfileId_isDefault_idx" ON "CustomerAddress"("customerProfileId", "isDefault");
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CustomerSession" (
  "id" TEXT NOT NULL,
  "customerProfileId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerSession_tokenHash_key" ON "CustomerSession"("tokenHash");
CREATE INDEX "CustomerSession_customerProfileId_expiresAt_idx" ON "CustomerSession"("customerProfileId", "expiresAt");
ALTER TABLE "CustomerSession" ADD CONSTRAINT "CustomerSession_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ShippingRate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "countryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "freeAboveCents" INTEGER,
  "minOrderCents" INTEGER NOT NULL DEFAULT 0,
  "maxOrderCents" INTEGER,
  "minDeliveryDays" INTEGER,
  "maxDeliveryDays" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ShippingRate_organizationId_active_order_idx" ON "ShippingRate"("organizationId", "active", "order");
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "OrderEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT NOT NULL DEFAULT '',
  "actorType" TEXT NOT NULL DEFAULT 'SYSTEM',
  "actorId" TEXT,
  "actorName" TEXT NOT NULL DEFAULT '',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "visibleToCustomer" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
