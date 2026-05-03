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

  console.log(`Inserindo ${WEAPONS.length} armas...`)
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

// ─── HELPER ───────────────────────────────────────────────────────────────────

type Speed = "Slow" | "Normal" | "Fast" | "VeryFast"
type RangeType = "Melee" | "Ranged"

interface Override {
  s?: Record<string, string>  // scaling override
  ed?: number                 // elemental damage
  unique?: boolean
}

function cat(
  names: string[],
  category: string,
  baseDmg: number,
  scaling: Record<string, string>,
  speed: Speed,
  twoHanded: boolean,
  range: RangeType,
  runeSlots: number,
  gemSlots: number,
  req: Record<string, number>,
  tags: string[],
  overrides: Record<string, Override> = {}
) {
  return names.map((name, i) => {
    const ov = overrides[name] ?? {}
    return {
      name,
      category,
      baseDamage: baseDmg + (i % 5) * 4,
      elementalDamage: ov.ed ?? 0,
      scalingTable: ov.s ?? scaling,
      attackSpeed: speed,
      range,
      twoHanded,
      maxRuneSlots: runeSlots + (ov.unique ? 1 : 0),
      maxGemSlots: gemSlots,
      enchantments: [] as string[],
      facets: [] as string[],
      requirements: req,
      isUnique: ov.unique ?? false,
      playstyleTags: tags,
      patchVersion: "0.1",
      needsReview: false,
    }
  })
}

// ─── ARMAS ────────────────────────────────────────────────────────────────────

const WEAPONS = [

  // ── Axes (one-handed, Strength) ──────────────────────────────────────────
  ...cat(
    ["Boarskin Tusk", "Hunter's Axe", "Jade-Spined Axe", "Reclaimer",
     "Ripper", "Royal Hewn Axe", "Shroudcleaver", "Tongue Splitter"],
    "Axes", 48, { Strength: "B", Dexterity: "C" },
    "Normal", false, "Melee", 2, 1, { Strength: 12 },
    ["melee", "aggressive"],
    { "Royal Hewn Axe": { s: { Strength: "A" }, unique: true },
      "Ripper":         { s: { Strength: "B" }, unique: true } }
  ),

  // ── Great Axes (two-handed, Strength) ────────────────────────────────────
  ...cat(
    ["Bandit's Cleaver", "Broken Fang", "Cavalier", "Gavlan's Great Axe",
     "Gilded Twibill", "Mountain Eater", "Penelope", "Short Bardiche",
     "Spalled Axe", "Warlord's Thirst"],
    "Great Axes", 82, { Strength: "A" },
    "Slow", true, "Melee", 2, 1, { Strength: 20 },
    ["melee", "stagger", "aggressive", "high_risk"],
    { "Warlord's Thirst": { s: { Strength: "S" }, unique: true },
      "Mountain Eater":   { s: { Strength: "A" }, unique: true } }
  ),

  // ── Straight Swords (two-handed, Dex/Str) ────────────────────────────────
  ...cat(
    ["Azure Blade", "Backstabber", "Blood-Rusted Sword", "Coiled Sword",
     "Cronus", "Governor's Dagger", "Keeper's Grace", "Nith Blade",
     "Phalen Sliver", "Sacrament's Pride", "Weave Cutter", "Wooden Sword"],
    "Straight Swords", 52, { Dexterity: "B", Strength: "C" },
    "Normal", true, "Melee", 2, 1, { Dexterity: 14, Strength: 10 },
    ["melee", "balanced", "aggressive"],
    { "Sacrament's Pride": { s: { Dexterity: "A", Strength: "C" }, unique: true },
      "Cronus":            { s: { Strength: "B", Dexterity: "B" }, unique: true },
      "Wooden Sword":      { s: { Strength: "D", Dexterity: "D" } } }
  ),

  // ── Great Swords (two-handed, Strength) ──────────────────────────────────
  ...cat(
    ["Baron's Edge", "Blister", "Burning Thorn", "Claymore",
     "Corpse Smeared Blade", "Culvarie", "Falstead's Fury", "Deep Mind",
     "Festering Earth", "Freiheit", "Frost Bringer", "Gnarled Saw",
     "Icebreaker", "Keeper's Mercy", "Shattered Sun", "Sieger",
     "Solitude", "Summer's Sting"],
    "Great Swords", 78, { Strength: "B" },
    "Slow", true, "Melee", 2, 2, { Strength: 18 },
    ["melee", "stagger", "aggressive", "high_risk"],
    { "Sieger":        { s: { Strength: "A" }, unique: true },
      "Frost Bringer": { s: { Strength: "B" }, ed: 20, unique: true },
      "Burning Thorn": { s: { Strength: "C", Intelligence: "B" }, ed: 15 },
      "Deep Mind":     { s: { Intelligence: "B", Strength: "C" }, ed: 20 } }
  ),

  // ── Bows (two-handed, Dexterity, Ranged) ─────────────────────────────────
  ...cat(
    ["Answered Prayer", "Glimmering Bolt", "Lacquered Bow", "Pale Ash",
     "Patience", "Short Bow", "Siren's Song", "Twinned Recurve Bow",
     "Woodland Protector", "Yewn Longbow"],
    "Bows", 38, { Dexterity: "B" },
    "Fast", true, "Ranged", 2, 1, { Dexterity: 14 },
    ["ranged", "mobile", "dot"],
    { "Siren's Song":        { s: { Dexterity: "A" }, unique: true },
      "Answered Prayer":     { s: { Dexterity: "B", Faith: "C" }, unique: true },
      "Woodland Protector":  { s: { Dexterity: "B" }, unique: true } }
  ),

  // ── Double Daggers (two-handed, Dexterity) ───────────────────────────────
  ...cat(
    ["All's Well", "Ash Soothed Daggers", "Bleeder's Delight", "Brothers Keepers",
     "Chipped Daggers", "Death's Touch", "Grave Scrapers", "Rogue Messer",
     "The Vizier's Advice", "Wavering Faith", "Wolf Bane"],
    "Double Daggers", 30, { Dexterity: "A" },
    "VeryFast", true, "Melee", 2, 2, { Dexterity: 16 },
    ["melee", "critical", "burst", "mobile", "technical"],
    { "Death's Touch":      { s: { Dexterity: "S" }, unique: true },
      "Wavering Faith":     { s: { Dexterity: "B", Faith: "C" } },
      "The Vizier's Advice":{ s: { Dexterity: "A" }, unique: true } }
  ),

  // ── Staves (two-handed, Intelligence/Faith, Magic) ───────────────────────
  ...cat(
    ["Alsoc's Ruined Staff", "Bear Slayer", "Cursed Crone", "Dried Hive",
     "Falling Sky", "False Truth", "Gnarled Staff", "Pinwheel",
     "Root Tender", "Sinner's Crown", "Spherin", "Stag Head"],
    "Staves", 28, { Intelligence: "B" },
    "Slow", true, "Melee", 3, 2, { Intelligence: 16 },
    ["magic", "elemental", "buff", "hybrid"],
    { "Stag Head":        { s: { Faith: "A" },               ed: 45, unique: true },
      "Root Tender":      { s: { Intelligence: "B", Faith: "B" }, ed: 35 },
      "Sinner's Crown":   { s: { Intelligence: "A" },         ed: 50, unique: true },
      "Falling Sky":      { s: { Intelligence: "B", Faith: "C" }, ed: 40 },
      "Spherin":          { s: { Intelligence: "S" },         ed: 55, unique: true },
      "Cursed Crone":     { s: { Intelligence: "C", Faith: "B" }, ed: 38 },
      "Alsoc's Ruined Staff": { s: { Intelligence: "D" },    ed: 20 },
      "Gnarled Staff":    { s: { Intelligence: "C" },         ed: 30 },
      "Bear Slayer":      { s: { Strength: "B" } },
      "Dried Hive":       { s: { Intelligence: "B" },         ed: 32 },
      "False Truth":      { s: { Intelligence: "B", Faith: "C" }, ed: 36 },
      "Pinwheel":         { s: { Intelligence: "A" },         ed: 48 } }
  ),

  // ── Wands (one-handed, Intelligence, Ranged) ──────────────────────────────
  ...cat(
    ["Flame Becomes Us", "Sanglier Staff"],
    "Wands", 22, { Intelligence: "A" },
    "Fast", false, "Ranged", 2, 2, { Intelligence: 18 },
    ["ranged", "elemental", "dot", "magic"],
    { "Flame Becomes Us": { ed: 55, unique: true },
      "Sanglier Staff":   { ed: 48 } }
  ),

  // ── Halberds (two-handed, Dex/Str) ───────────────────────────────────────
  ...cat(
    ["Bolein Polearm", "Executioner's Halberd", "God's Reach", "Gristleborn",
     "Ocean Sweeper", "Phoenix Crest", "Regal Cleft", "Seabed Scraper",
     "Serrated Cutter"],
    "Halberds", 60, { Strength: "C", Dexterity: "B" },
    "Normal", true, "Melee", 2, 1, { Strength: 14, Dexterity: 12 },
    ["melee", "balanced", "stagger"],
    { "God's Reach":            { s: { Strength: "B", Dexterity: "B" }, unique: true },
      "Phoenix Crest":          { s: { Dexterity: "A" }, ed: 15, unique: true },
      "Executioner's Halberd":  { s: { Strength: "B" }, unique: true } }
  ),

  // ── Scythes (two-handed, Str/Int) ────────────────────────────────────────
  ...cat(
    ["Hope Shorn", "Scythe of Wretches", "Soul Thresher"],
    "Scythes", 68, { Strength: "B", Intelligence: "C" },
    "Slow", true, "Melee", 2, 2, { Strength: 16, Intelligence: 10 },
    ["melee", "aggressive", "dot"],
    { "Soul Thresher":      { s: { Intelligence: "B", Strength: "C" }, ed: 25, unique: true },
      "Hope Shorn":         { s: { Strength: "B" }, unique: true } }
  ),

  // ── Curved Swords (one-handed, Dexterity) ────────────────────────────────
  ...cat(
    ["A Supple End", "Buried Shamshir", "Cerulean Blade", "Dark Tide",
     "Demon's Key", "Etched Yatagan", "Filleter", "Giant's Toothpick",
     "Malwoven Hook", "Risen Blade", "Rusty Arakh", "Scimitar",
     "Song of Steel", "Talwar", "Tempered Cutlass", "Tremble"],
    "Curved Swords", 38, { Dexterity: "B" },
    "Fast", false, "Melee", 2, 1, { Dexterity: 12 },
    ["melee", "critical", "mobile", "technical"],
    { "Demon's Key":   { s: { Dexterity: "A" }, unique: true },
      "Song of Steel": { s: { Dexterity: "A" }, unique: true },
      "Dark Tide":     { s: { Dexterity: "B" }, ed: 15 },
      "Cerulean Blade":{ s: { Dexterity: "B", Intelligence: "C" }, ed: 12 } }
  ),

  // ── Curved Greatswords (two-handed, Dex/Str) ─────────────────────────────
  ...cat(
    ["Death's Shroud", "Divine Scimitar", "Sunbeam"],
    "Curved Greatswords", 72, { Dexterity: "A", Strength: "C" },
    "Normal", true, "Melee", 3, 2, { Dexterity: 18, Strength: 12 },
    ["melee", "critical", "aggressive", "mobile"],
    { "Sunbeam":      { s: { Dexterity: "A" }, ed: 20, unique: true },
      "Death's Shroud":{ s: { Dexterity: "B", Strength: "B" }, unique: true } }
  ),

  // ── Hammers (one-handed, Strength) ───────────────────────────────────────
  ...cat(
    ["Broken Forge", "Brutal Maul", "Climber's Pick", "Crystalline Sledge",
     "Deadblow", "Grimacing Stone", "Oxen's Vengeance", "Rostock",
     "Singing Peal", "Splintered Wing"],
    "Hammers", 50, { Strength: "B" },
    "Normal", false, "Melee", 2, 1, { Strength: 14 },
    ["melee", "stagger", "aggressive"],
    { "Oxen's Vengeance":  { s: { Strength: "A" }, unique: true },
      "Singing Peal":      { s: { Strength: "B", Faith: "C" }, unique: true },
      "Crystalline Sledge":{ s: { Strength: "B" }, ed: 15 } }
  ),

  // ── Great Hammers (two-handed, Strength) ─────────────────────────────────
  ...cat(
    ["Bud of the Everlasting Tree", "Cinder & Stone", "Eternal Companion",
     "Festering Cleft", "Night Protector", "Pound of Cadavers",
     "Spliced Hammer", "The Ram", "Tooth of the Ancient One", "Weeping Earth"],
    "Great Hammers", 90, { Strength: "A" },
    "Slow", true, "Melee", 2, 1, { Strength: 22 },
    ["melee", "stagger", "aggressive", "high_risk"],
    { "Bud of the Everlasting Tree": { s: { Strength: "S" }, unique: true },
      "The Ram":                     { s: { Strength: "A" }, unique: true },
      "Weeping Earth":               { s: { Strength: "B", Faith: "C" }, unique: true } }
  ),

  // ── Maces (one-handed, Strength/Faith) ───────────────────────────────────
  ...cat(
    ["Cleric's Mace", "Comet Fall", "Malice", "Savage Cathecism",
     "Shrike Tree", "Tapestry Mender", "The Last Stitch", "Weave Eater"],
    "Maces", 45, { Strength: "B" },
    "Normal", false, "Melee", 2, 1, { Strength: 12 },
    ["melee", "defensive", "balanced"],
    { "Cleric's Mace":    { s: { Strength: "C", Faith: "A" }, unique: true },
      "Comet Fall":       { s: { Intelligence: "C", Faith: "B" }, ed: 20 },
      "Savage Cathecism": { s: { Strength: "B", Faith: "C" } },
      "Tapestry Mender":  { s: { Strength: "B", Faith: "C" } },
      "Weave Eater":      { s: { Strength: "C", Intelligence: "B" }, ed: 15 } }
  ),

  // ── Spears (two-handed, Dex/Str) ─────────────────────────────────────────
  ...cat(
    ["Assegai", "Boar Spiker", "Coral Piercer", "Gnarled Harpoon",
     "Needle Spear", "Petalled Spear", "Proud Lance", "Sacrament's Sin",
     "Talon of the Balak Taw", "The Cage", "The Oldest Betrayal", "The Shrieker"],
    "Spears", 52, { Dexterity: "B", Strength: "C" },
    "Normal", true, "Melee", 2, 1, { Dexterity: 14, Strength: 10 },
    ["melee", "mobile", "balanced"],
    { "Sacrament's Sin":      { s: { Dexterity: "A" }, unique: true },
      "The Cage":             { s: { Strength: "B", Dexterity: "C" }, unique: true },
      "Proud Lance":          { s: { Dexterity: "B", Strength: "B" }, unique: true },
      "Talon of the Balak Taw":{ s: { Dexterity: "A" }, unique: true } }
  ),

  // ── Rapiers (one-handed, Dexterity) ──────────────────────────────────────
  ...cat(
    ["Estoc", "Gentleman's Gambit", "Longnail", "Moon Shaft",
     "Odessa's Saber", "Pig Sticker", "Royal Rapier", "Sinew",
     "Siren Queen's Horn", "Stitcher", "Tucked Falcon", "Winnick's Rapier"],
    "Rapiers", 35, { Dexterity: "A" },
    "Fast", false, "Melee", 2, 1, { Dexterity: 16 },
    ["melee", "critical", "technical", "burst"],
    { "Gentleman's Gambit": { s: { Dexterity: "S" }, unique: true },
      "Siren Queen's Horn": { s: { Dexterity: "A" }, ed: 12, unique: true },
      "Moon Shaft":         { s: { Dexterity: "A", Intelligence: "C" }, ed: 10 } }
  ),

  // ── Clubs (one-handed, Strength) ─────────────────────────────────────────
  ...cat(
    ["Nail-Laden Club", "Ogre's Club"],
    "Clubs", 44, { Strength: "B" },
    "Normal", false, "Melee", 1, 1, { Strength: 10 },
    ["melee", "aggressive"],
    { "Ogre's Club": { s: { Strength: "A" }, unique: true } }
  ),

  // ── Great Clubs (two-handed, Strength) ───────────────────────────────────
  ...cat(
    ["Fetid Club", "The Voice of Our Lord", "Wretched Mace"],
    "Great Clubs", 85, { Strength: "A" },
    "Slow", true, "Melee", 2, 1, { Strength: 20 },
    ["melee", "stagger", "high_risk"],
    { "The Voice of Our Lord": { s: { Strength: "S", Faith: "C" }, unique: true } }
  ),

  // ── Knives (one-handed, Dexterity) ───────────────────────────────────────
  ...cat(
    ["A Singular Purpose", "Barbtrader", "Butcher's Work", "Glimmering Bone",
     "Glory's Bite", "Hunter's Knife", "Jackknife", "Midnight Blade",
     "Scowling Dirk", "Serpent's Tongue", "The Old Ways"],
    "Knives", 28, { Dexterity: "B" },
    "Fast", false, "Melee", 2, 2, { Dexterity: 12 },
    ["melee", "critical", "burst", "mobile"],
    { "The Old Ways":       { s: { Dexterity: "A" }, unique: true },
      "Midnight Blade":     { s: { Dexterity: "A" }, unique: true },
      "Serpent's Tongue":   { s: { Dexterity: "B" }, ed: 12 },
      "Glory's Bite":       { s: { Dexterity: "B" }, unique: true } }
  ),

  // ── Wakizashi (one-handed, Dexterity) ────────────────────────────────────
  ...cat(
    ["Grass Cutter", "Hanzo Blade", "Honed Frenzy", "Katana",
     "Tachi", "Uchigatana", "Wakizashi", "Wind of Death"],
    "Wakizashi", 32, { Dexterity: "A" },
    "VeryFast", false, "Melee", 2, 2, { Dexterity: 14 },
    ["melee", "critical", "mobile", "technical"],
    { "Hanzo Blade":   { s: { Dexterity: "S" }, unique: true },
      "Wind of Death": { s: { Dexterity: "A" }, unique: true },
      "Tachi":         { s: { Dexterity: "B", Strength: "C" } } }
  ),

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
    resistances: { Fire: 7, Ice: 7, Lightning: 3, Plague: 5, Bleed: 3 },
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
    resistances: { Fire: 20, Ice: 20, Lightning: 15, Plague: 12, Bleed: 10 },
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
    resistances: { Fire: 40, Ice: 40, Lightning: 30, Plague: 20, Bleed: 18 },
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
    compatibleCategories: ["Straight Swords", "Double Daggers", "Bows", "Knives", "Wakizashi", "Rapiers", "Curved Swords"],
    patchVersion: "0.1",
    needsReview: false,
  },
  {
    name: "Heavy",
    effects: ["Aumenta escalamento com Strength em um grau"],
    compatibleCategories: ["Great Swords", "Great Axes", "Great Hammers", "Axes", "Hammers", "Clubs", "Great Clubs"],
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
