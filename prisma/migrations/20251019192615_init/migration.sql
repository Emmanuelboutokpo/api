-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'CARTE', 'VIREMENT');

-- CreateEnum
CREATE TYPE "PaiementStatut" AS ENUM ('EN_ATTENTE', 'VALIDE', 'ECHEC', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CONTROLLEUR', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "CommandeStatus" AS ENUM ('EN_COURS', 'ASSIGNEE', 'MESURE_ENREGISTREE', 'EN_PRODUCTION', 'EN_CONTROLE', 'NON_CONFORME', 'RETOUCHE', 'PRET', 'LIVRE', 'RETARD', 'ANNULE');

-- CreateEnum
CREATE TYPE "NotifStatus" AS ENUM ('EN_ATTENTE', 'ASSIGNATION', 'RAPPEL_LIVRAISON', 'PENALITE', 'VALIDATION', 'LIVRAISON_PRET', 'RETARD', 'CONTROLE');

-- CreateEnum
CREATE TYPE "PenaliteType" AS ENUM ('RETARD', 'NON_CONFORME', 'AUTRE');

-- CreateEnum
CREATE TYPE "RemuStatus" AS ENUM ('EN_ATTENTE', 'PAYEE', 'EN_RETARD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "expoPushToken" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disponibilite" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT,
    "imageUrl" TEXT,
    "gender" "Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Style" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,

    CONSTRAINT "Style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesureType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,

    CONSTRAINT "MesureType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesure" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,

    CONSTRAINT "Mesure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesureValeur" (
    "id" TEXT NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "mesureTypeId" TEXT NOT NULL,
    "mesureId" TEXT NOT NULL,

    CONSTRAINT "MesureValeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateLivraisonPrevue" TIMESTAMP(3) NOT NULL,
    "status" "CommandeStatus" NOT NULL DEFAULT 'EN_COURS',
    "prix" DOUBLE PRECISION,
    "montantAvance" DOUBLE PRECISION,
    "imgCmd" TEXT,
    "audioFile" TEXT,
    "clientId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "controleurId" TEXT,
    "assignedToId" TEXT,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fourniture" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "commandeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fourniture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Controle" (
    "id" TEXT NOT NULL,
    "dateControle" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conforme" BOOLEAN NOT NULL DEFAULT true,
    "remarques" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "controleurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Controle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penalite" (
    "id" TEXT NOT NULL,
    "type" "PenaliteType" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "raison" TEXT NOT NULL,
    "datePenalite" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penalite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remuneration" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "RemuStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "employeId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remuneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dateNotification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotifStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "destinataireId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modePaiement" "ModePaiement" NOT NULL DEFAULT 'ESPECES',
    "statut" "PaiementStatut" NOT NULL DEFAULT 'VALIDE',
    "description" TEXT,
    "commandeId" TEXT NOT NULL,
    "clientId" TEXT,
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientStyles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClientStyles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_telephone_key" ON "Client"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Style_model_key" ON "Style"("model");

-- CreateIndex
CREATE UNIQUE INDEX "MesureType_label_key" ON "MesureType"("label");

-- CreateIndex
CREATE INDEX "Commande_dateLivraisonPrevue_status_idx" ON "Commande"("dateLivraisonPrevue", "status");

-- CreateIndex
CREATE INDEX "Commande_status_idx" ON "Commande"("status");

-- CreateIndex
CREATE INDEX "Commande_dateCommande_idx" ON "Commande"("dateCommande");

-- CreateIndex
CREATE INDEX "_ClientStyles_B_index" ON "_ClientStyles"("B");

-- AddForeignKey
ALTER TABLE "Mesure" ADD CONSTRAINT "Mesure_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesure" ADD CONSTRAINT "Mesure_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesureValeur" ADD CONSTRAINT "MesureValeur_mesureTypeId_fkey" FOREIGN KEY ("mesureTypeId") REFERENCES "MesureType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesureValeur" ADD CONSTRAINT "MesureValeur_mesureId_fkey" FOREIGN KEY ("mesureId") REFERENCES "Mesure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_controleurId_fkey" FOREIGN KEY ("controleurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fourniture" ADD CONSTRAINT "Fourniture_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Controle" ADD CONSTRAINT "Controle_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Controle" ADD CONSTRAINT "Controle_controleurId_fkey" FOREIGN KEY ("controleurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalite" ADD CONSTRAINT "Penalite_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalite" ADD CONSTRAINT "Penalite_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remuneration" ADD CONSTRAINT "Remuneration_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remuneration" ADD CONSTRAINT "Remuneration_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientStyles" ADD CONSTRAINT "_ClientStyles_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientStyles" ADD CONSTRAINT "_ClientStyles_B_fkey" FOREIGN KEY ("B") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;
