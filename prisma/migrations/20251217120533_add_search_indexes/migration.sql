-- DropIndex
DROP INDEX "Commande_dateLivraisonPrevue_status_idx";

-- CreateIndex
CREATE INDEX "Client_firstName_idx" ON "Client"("firstName");

-- CreateIndex
CREATE INDEX "Client_lastName_idx" ON "Client"("lastName");

-- CreateIndex
CREATE INDEX "Client_telephone_idx" ON "Client"("telephone");

-- CreateIndex
CREATE INDEX "Commande_clientId_idx" ON "Commande"("clientId");

-- CreateIndex
CREATE INDEX "Commande_assignedToId_idx" ON "Commande"("assignedToId");

-- CreateIndex
CREATE INDEX "Commande_controleurId_idx" ON "Commande"("controleurId");

-- CreateIndex
CREATE INDEX "Fourniture_designation_idx" ON "Fourniture"("designation");

-- CreateIndex
CREATE INDEX "Style_model_idx" ON "Style"("model");
