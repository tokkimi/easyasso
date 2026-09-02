ALTER TABLE "Invitation" ADD COLUMN "roleId" TEXT;
CREATE INDEX "Invitation_roleId_idx" ON "Invitation"("roleId");
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
