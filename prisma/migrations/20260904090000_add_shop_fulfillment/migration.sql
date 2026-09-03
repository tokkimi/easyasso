ALTER TABLE "Order"
ADD COLUMN "fulfillmentProvider" TEXT,
ADD COLUMN "fulfillmentReference" TEXT,
ADD COLUMN "fulfillmentStatus" TEXT,
ADD COLUMN "fulfillmentError" TEXT;

ALTER TABLE "OrderItem"
ADD COLUMN "externalVariantId" TEXT,
ADD COLUMN "externalData" JSONB NOT NULL DEFAULT '{}';
