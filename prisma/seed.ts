import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Limpando dados anteriores...")
  await prisma.build.deleteMany()
  await prisma.facet.deleteMany()
  await prisma.gem.deleteMany()
  await prisma.rune.deleteMany()
  await prisma.enchantment.deleteMany()
  await prisma.accessory.deleteMany()
  await prisma.armorSet.deleteMany()
  await prisma.weapon.deleteMany()

  console.log("Inserindo armas...")
  await prisma.weapon.createMany({ data: WEAPONS })

  console.log("Inserindo armaduras...")
  await prisma.armorSet.createMany({ data: ARMOR_SETS })

  console.log("Inserindo runas...")
  await prisma.rune.createMany({ data: RUNES })

  console.log("Inserindo gemas...")
  await prisma.gem.createMany({ data: GEMS })

  console.log("Inserindo facets...")
  await prisma.facet.createMany({ data: FACETS })

  console.log("Inserindo acessórios...")
  await prisma.accessory.createMany({ data: ACCESSORIES })

  console.log("Inserindo encantamentos...")
  await prisma.enchantment.createMany({ data: ENCHANTMENTS })

  console.log("✅ Seed concluído!")
}

// ─── ARMAS ────────────────────────────────────────────────────────────────────

const WEAPONS = [
  // Straight Swords
  {
    name: "Iron Longsword",
    category: "Straight Swords",
    baseDamage: 45,
    elementalDamage: 0,
    scalingTable: { Strength: "C", Dexterity: "B" },
    attackSpeed: "Normal",
    range: "Melee",
    twoHanded: false,
    maxRuneSlots: 2,
    maxGemSlots: 1,
    enchantments: [],
    facets: [],
    requirements: { Strength: 10, Dexterity: 12 },
    isUnique: false,
    playstyleTags: ["melee", "aggressive", "balanced"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Crucible Longsword",
    category: "Straight Swords",
    baseDamage: 62,
    elementalDamage: 0,
    scalingTable: { Strength: "B", Dexterity: "A" },
    attackSpeed: "Normal",
    range: "Melee",
    twoHanded: false,
    maxRuneSlots: 3,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Strength: 14, Dexterity: 16 },
    isUnique: false,
    playstyleTags: ["melee", "aggressive", "critical", "technical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Great Swords
  {
    name: "Iron Greatsword",
    category: "Great Swords",
    baseDamage: 72,
    elementalDamage: 0,
    scalingTable: { Strength: "B" },
    attackSpeed: "Slow",
    range: "Melee",
    twoHanded: true,
    maxRuneSlots: 2,
    maxGemSlots: 1,
    enchantments: [],
    facets: [],
    requirements: { Strength: 18 },
    isUnique: false,
    playstyleTags: ["melee", "stagger", "aggressive", "high_risk"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Siegreave",
    category: "Great Swords",
    baseDamage: 90,
    elementalDamage: 0,
    scalingTable: { Strength: "A" },
    attackSpeed: "Slow",
    range: "Melee",
    twoHanded: true,
    maxRuneSlots: 3,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Strength: 22 },
    isUnique: true,
    playstyleTags: ["melee", "stagger", "aggressive", "high_risk"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Axes
  {
    name: "Handaxe",
    category: "Axes",
    baseDamage: 42,
    elementalDamage: 0,
    scalingTable: { Strength: "C", Dexterity: "C" },
    attackSpeed: "Fast",
    range: "Melee",
    twoHanded: false,
    maxRuneSlots: 2,
    maxGemSlots: 1,
    enchantments: [],
    facets: [],
    requirements: { Strength: 10 },
    isUnique: false,
    playstyleTags: ["melee", "aggressive"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Great Axes
  {
    name: "War Axe",
    category: "Great Axes",
    baseDamage: 80,
    elementalDamage: 0,
    scalingTable: { Strength: "A" },
    attackSpeed: "Slow",
    range: "Melee",
    twoHanded: true,
    maxRuneSlots: 2,
    maxGemSlots: 1,
    enchantments: [],
    facets: [],
    requirements: { Strength: 20 },
    isUnique: false,
    playstyleTags: ["melee", "stagger", "aggressive", "high_risk"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Staves
  {
    name: "Staff of Smiting",
    category: "Staves",
    baseDamage: 35,
    elementalDamage: 30,
    scalingTable: { Intelligence: "B", Faith: "C" },
    attackSpeed: "Normal",
    range: "Melee",
    twoHanded: true,
    maxRuneSlots: 3,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Intelligence: 16, Faith: 12 },
    isUnique: false,
    playstyleTags: ["magic", "hybrid", "buff", "elemental"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Arcane Staff",
    category: "Staves",
    baseDamage: 28,
    elementalDamage: 48,
    scalingTable: { Intelligence: "S" },
    attackSpeed: "Slow",
    range: "Melee",
    twoHanded: true,
    maxRuneSlots: 3,
    maxGemSlots: 3,
    enchantments: [],
    facets: [],
    requirements: { Intelligence: 22 },
    isUnique: false,
    playstyleTags: ["magic", "elemental", "dot", "ranged"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Bows
  {
    name: "Shortbow",
    category: "Bows",
    baseDamage: 38,
    elementalDamage: 0,
    scalingTable: { Dexterity: "B" },
    attackSpeed: "Fast",
    range: "Ranged",
    twoHanded: true,
    maxRuneSlots: 2,
    maxGemSlots: 1,
    enchantments: [],
    facets: [],
    requirements: { Dexterity: 14 },
    isUnique: false,
    playstyleTags: ["ranged", "mobile", "dot"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Crucible Bow",
    category: "Bows",
    baseDamage: 55,
    elementalDamage: 0,
    scalingTable: { Dexterity: "A" },
    attackSpeed: "Normal",
    range: "Ranged",
    twoHanded: true,
    maxRuneSlots: 3,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Dexterity: 18 },
    isUnique: false,
    playstyleTags: ["ranged", "mobile", "dot", "elemental"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Double Daggers
  {
    name: "Iron Daggers",
    category: "Double Daggers",
    baseDamage: 32,
    elementalDamage: 0,
    scalingTable: { Dexterity: "B" },
    attackSpeed: "VeryFast",
    range: "Melee",
    twoHanded: false,
    maxRuneSlots: 2,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Dexterity: 12 },
    isUnique: false,
    playstyleTags: ["melee", "critical", "burst", "mobile", "technical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Shadow Blades",
    category: "Double Daggers",
    baseDamage: 44,
    elementalDamage: 0,
    scalingTable: { Dexterity: "S" },
    attackSpeed: "VeryFast",
    range: "Melee",
    twoHanded: false,
    maxRuneSlots: 3,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Dexterity: 20 },
    isUnique: true,
    playstyleTags: ["melee", "critical", "burst", "mobile", "technical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  // Wands
  {
    name: "Wand of Burning",
    category: "Wands",
    baseDamage: 22,
    elementalDamage: 50,
    scalingTable: { Intelligence: "A" },
    attackSpeed: "Fast",
    range: "Ranged",
    twoHanded: false,
    maxRuneSlots: 2,
    maxGemSlots: 2,
    enchantments: [],
    facets: [],
    requirements: { Intelligence: 18 },
    isUnique: false,
    playstyleTags: ["ranged", "elemental", "dot", "magic"],
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── ARMADURAS ────────────────────────────────────────────────────────────────

const ARMOR_SETS = [
  {
    name: "Commoner's Set",
    weightClass: "Light",
    helmet: { defense: 5, resistances: { Fire: 2, Ice: 2 }, weight: 1.2 },
    chest:  { defense: 8, resistances: { Fire: 3, Ice: 3 }, weight: 2.1 },
    gloves: { defense: 4, resistances: { Fire: 1, Ice: 1 }, weight: 0.8 },
    boots:  { defense: 4, resistances: { Fire: 1, Ice: 1 }, weight: 0.9 },
    totalDefense: 21,
    resistances: { Fire: 7, Ice: 7, Lightning: 3, Poison: 5 },
    setBonusThreshold: 4,
    setBonusDescription: "Aumenta velocidade de rolagem",
    synergyTags: ["mobile", "ranged", "critical", "dot"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Soldier's Armor",
    weightClass: "Medium",
    helmet: { defense: 12, resistances: { Fire: 5, Ice: 5 }, weight: 2.5 },
    chest:  { defense: 20, resistances: { Fire: 8, Ice: 8 }, weight: 4.8 },
    gloves: { defense: 8,  resistances: { Fire: 3, Ice: 3 }, weight: 1.8 },
    boots:  { defense: 9,  resistances: { Fire: 4, Ice: 4 }, weight: 2.0 },
    totalDefense: 49,
    resistances: { Fire: 20, Ice: 20, Lightning: 15, Poison: 12 },
    setBonusThreshold: 4,
    setBonusDescription: "Reduz custo de estamina em ataques",
    synergyTags: ["melee", "balanced", "sustain", "defensive"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Crucible Armor",
    weightClass: "Heavy",
    helmet: { defense: 22, resistances: { Fire: 10, Ice: 10 }, weight: 5.0 },
    chest:  { defense: 38, resistances: { Fire: 15, Ice: 15 }, weight: 9.5 },
    gloves: { defense: 16, resistances: { Fire: 7,  Ice: 7  }, weight: 3.5 },
    boots:  { defense: 18, resistances: { Fire: 8,  Ice: 8  }, weight: 4.0 },
    totalDefense: 94,
    resistances: { Fire: 40, Ice: 40, Lightning: 30, Poison: 20 },
    setBonusThreshold: 2,
    setBonusDescription: "Reduz dano recebido em 15% ao bloquear",
    synergyTags: ["defensive", "sustain", "slow_paced", "stagger"],
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── RUNAS ────────────────────────────────────────────────────────────────────

const RUNES = [
  {
    name: "Burning Edge",
    effects: ["Aplica Burn no inimigo ao acertar", "Burn causa dano por segundo por 4s"],
    elementalType: "Fire",
    triggerCondition: "on hit",
    cooldownSeconds: 3.0,
    stackLimit: 3,
    compatibleWeaponTypes: [],
    synergyTags: ["elemental", "dot", "fire", "aggressive"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Thunder Strike",
    effects: ["Adiciona dano de raio ao próximo ataque", "Chance de atordoar o inimigo"],
    elementalType: "Lightning",
    triggerCondition: "on hit",
    cooldownSeconds: 5.0,
    stackLimit: null,
    compatibleWeaponTypes: [],
    synergyTags: ["elemental", "stagger", "aggressive"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Lifedrain",
    effects: ["Recupera vida proporcional ao dano causado", "Efeito maior em golpes críticos"],
    elementalType: null,
    triggerCondition: "on kill",
    cooldownSeconds: null,
    stackLimit: null,
    compatibleWeaponTypes: [],
    synergyTags: ["sustain", "defensive", "critical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Phantom Step",
    effects: ["Próximo ataque após esquiva causa 30% mais dano", "Janela de 1.5s após a esquiva"],
    elementalType: null,
    triggerCondition: "on dodge",
    cooldownSeconds: 2.0,
    stackLimit: null,
    compatibleWeaponTypes: [],
    synergyTags: ["mobile", "burst", "critical", "technical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Frost Brand",
    effects: ["Aplica Slow no inimigo", "Inimigos com Slow recebem 10% mais dano"],
    elementalType: "Ice",
    triggerCondition: "on hit",
    cooldownSeconds: 4.0,
    stackLimit: 1,
    compatibleWeaponTypes: [],
    synergyTags: ["elemental", "dot", "defensive", "sustain"],
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── GEMAS ────────────────────────────────────────────────────────────────────

const GEMS = [
  {
    name: "Fire Crystal",
    rarity: "Uncommon",
    effects: ["Adiciona 15 de dano de Fogo à arma"],
    elementalType: "Fire",
    synergyTags: ["elemental", "fire", "dot", "aggressive"],
    compatibleItems: ["weapon"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Ice Shard",
    rarity: "Uncommon",
    effects: ["Adiciona 15 de dano de Gelo à arma", "5% de chance de congelar"],
    elementalType: "Ice",
    synergyTags: ["elemental", "dot", "defensive"],
    compatibleItems: ["weapon"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Sharpening Stone",
    rarity: "Common",
    effects: ["Aumenta dano físico em 8%"],
    elementalType: null,
    synergyTags: ["aggressive", "burst", "stagger"],
    compatibleItems: ["weapon"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Vitality Gem",
    rarity: "Common",
    effects: ["Aumenta HP máximo em 50"],
    elementalType: null,
    synergyTags: ["sustain", "defensive"],
    compatibleItems: ["armor"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Critical Edge",
    rarity: "Rare",
    effects: ["Aumenta chance de crítico em 8%", "Críticos causam 20% mais dano"],
    elementalType: null,
    synergyTags: ["critical", "burst", "technical"],
    compatibleItems: ["weapon"],
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── FACETS ───────────────────────────────────────────────────────────────────

const FACETS = [
  {
    name: "Critical Chance",
    effectDescription: "Aumenta a chance de acertos críticos em 12%",
    triggerCondition: "passive",
    compatibleWeaponTypes: [],
    synergyTags: ["critical", "burst", "technical"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Burn Amplification",
    effectDescription: "Dano de Burn aumentado em 25%",
    triggerCondition: "passive",
    compatibleWeaponTypes: [],
    synergyTags: ["elemental", "fire", "dot", "aggressive"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Bleed",
    effectDescription: "Ataques têm chance de aplicar Sangramento, causando dano por tempo",
    triggerCondition: "on hit",
    compatibleWeaponTypes: [],
    synergyTags: ["dot", "aggressive", "melee"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Armor Break",
    effectDescription: "Ataques reduzem a defesa do inimigo temporariamente",
    triggerCondition: "on hit",
    compatibleWeaponTypes: [],
    synergyTags: ["stagger", "aggressive", "melee"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Stamina Recovery",
    effectDescription: "Regeneração de stamina aumentada em 20%",
    triggerCondition: "passive",
    compatibleWeaponTypes: [],
    synergyTags: ["sustain", "defensive", "mobile"],
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── ACESSÓRIOS ───────────────────────────────────────────────────────────────

const ACCESSORIES = [
  {
    name: "Ring of Strength",
    effects: ["Aumenta Strength em 3"],
    attributeBonus: { Strength: 3 },
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Amulet of the Scholar",
    effects: ["Aumenta Intelligence em 4", "Aumenta dano elemental em 5%"],
    attributeBonus: { Intelligence: 4 },
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Hunter's Pendant",
    effects: ["Aumenta Dexterity em 3", "Aumenta velocidade de ataque em 5%"],
    attributeBonus: { Dexterity: 3 },
    patchVersion: "0.1",
    needsReview: false,
  },
]

// ─── ENCANTAMENTOS ────────────────────────────────────────────────────────────

const ENCHANTMENTS = [
  {
    name: "Sharp",
    effects: ["Aumenta escalamento com Dexterity em um grau"],
    compatibleCategories: ["Straight Swords", "Double Daggers", "Bows", "Knives"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Heavy",
    effects: ["Aumenta escalamento com Strength em um grau"],
    compatibleCategories: ["Great Swords", "Great Axes", "Great Hammers", "Axes", "Hammers"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Arcane",
    effects: ["Adiciona escalamento com Intelligence"],
    compatibleCategories: ["Staves", "Wands", "Straight Swords"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Fiery",
    effects: ["Adiciona dano de Fogo à arma"],
    compatibleCategories: [],
    patchVersion: "0.1",
    needsReview: false,
  },
]

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
