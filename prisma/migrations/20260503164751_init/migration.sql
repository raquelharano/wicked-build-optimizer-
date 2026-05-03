-- CreateEnum
CREATE TYPE "AttackSpeed" AS ENUM ('Slow', 'Normal', 'Fast', 'VeryFast');

-- CreateEnum
CREATE TYPE "WeaponRange" AS ENUM ('Melee', 'Ranged');

-- CreateEnum
CREATE TYPE "WeightClass" AS ENUM ('Light', 'Medium', 'Heavy');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "Archetype" AS ENUM ('MeleeBerserker', 'TankBruiser', 'ElementalRanger', 'CriticalAssassin', 'SpellbladeHybrid');

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseDamage" INTEGER NOT NULL,
    "elementalDamage" INTEGER NOT NULL DEFAULT 0,
    "scalingTable" JSONB NOT NULL,
    "attackSpeed" "AttackSpeed" NOT NULL,
    "range" "WeaponRange" NOT NULL,
    "twoHanded" BOOLEAN NOT NULL DEFAULT false,
    "maxRuneSlots" INTEGER NOT NULL DEFAULT 0,
    "maxGemSlots" INTEGER NOT NULL DEFAULT 0,
    "enchantments" TEXT[],
    "facets" TEXT[],
    "requirements" JSONB NOT NULL,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "playstyleTags" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArmorSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightClass" "WeightClass" NOT NULL,
    "helmet" JSONB NOT NULL,
    "chest" JSONB NOT NULL,
    "gloves" JSONB NOT NULL,
    "boots" JSONB NOT NULL,
    "totalDefense" INTEGER NOT NULL,
    "resistances" JSONB NOT NULL,
    "setBonusThreshold" INTEGER NOT NULL DEFAULT 2,
    "setBonusDescription" TEXT,
    "synergyTags" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArmorSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effects" TEXT[],
    "attributeBonus" JSONB NOT NULL,
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rune" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effects" TEXT[],
    "elementalType" TEXT,
    "triggerCondition" TEXT NOT NULL,
    "cooldownSeconds" DOUBLE PRECISION,
    "stackLimit" INTEGER,
    "compatibleWeaponTypes" TEXT[],
    "synergyTags" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "effects" TEXT[],
    "elementalType" TEXT,
    "synergyTags" TEXT[],
    "compatibleItems" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enchantment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effects" TEXT[],
    "compatibleCategories" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enchantment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effectDescription" TEXT NOT NULL,
    "triggerCondition" TEXT NOT NULL,
    "compatibleWeaponTypes" TEXT[],
    "synergyTags" TEXT[],
    "patchVersion" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "archetype" "Archetype" NOT NULL,
    "playstyle" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "isStarterBuild" BOOLEAN NOT NULL DEFAULT false,
    "patchVersion" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "elementalType" TEXT,
    "attributes" JSONB NOT NULL,
    "attributeTotal" INTEGER NOT NULL,
    "gameplayExplanation" TEXT NOT NULL,
    "synergyExplanation" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "weaponId" TEXT NOT NULL,
    "armorSetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsChanged" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessoryToBuild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccessoryToBuild_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BuildToRune" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuildToRune_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BuildToGem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuildToGem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BuildToEnchantment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuildToEnchantment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BuildToFacet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuildToFacet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Weapon_name_key" ON "Weapon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ArmorSet_name_key" ON "ArmorSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_name_key" ON "Accessory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rune_name_key" ON "Rune"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Gem_name_key" ON "Gem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Enchantment_name_key" ON "Enchantment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Facet_name_key" ON "Facet"("name");

-- CreateIndex
CREATE INDEX "_AccessoryToBuild_B_index" ON "_AccessoryToBuild"("B");

-- CreateIndex
CREATE INDEX "_BuildToRune_B_index" ON "_BuildToRune"("B");

-- CreateIndex
CREATE INDEX "_BuildToGem_B_index" ON "_BuildToGem"("B");

-- CreateIndex
CREATE INDEX "_BuildToEnchantment_B_index" ON "_BuildToEnchantment"("B");

-- CreateIndex
CREATE INDEX "_BuildToFacet_B_index" ON "_BuildToFacet"("B");

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_armorSetId_fkey" FOREIGN KEY ("armorSetId") REFERENCES "ArmorSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessoryToBuild" ADD CONSTRAINT "_AccessoryToBuild_A_fkey" FOREIGN KEY ("A") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessoryToBuild" ADD CONSTRAINT "_AccessoryToBuild_B_fkey" FOREIGN KEY ("B") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToRune" ADD CONSTRAINT "_BuildToRune_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToRune" ADD CONSTRAINT "_BuildToRune_B_fkey" FOREIGN KEY ("B") REFERENCES "Rune"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToGem" ADD CONSTRAINT "_BuildToGem_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToGem" ADD CONSTRAINT "_BuildToGem_B_fkey" FOREIGN KEY ("B") REFERENCES "Gem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToEnchantment" ADD CONSTRAINT "_BuildToEnchantment_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToEnchantment" ADD CONSTRAINT "_BuildToEnchantment_B_fkey" FOREIGN KEY ("B") REFERENCES "Enchantment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToFacet" ADD CONSTRAINT "_BuildToFacet_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToFacet" ADD CONSTRAINT "_BuildToFacet_B_fkey" FOREIGN KEY ("B") REFERENCES "Facet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
