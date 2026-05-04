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
  await prisma.weapon.createMany({ data: WEAPONS as any })

  console.log("Inserindo armaduras...")
  await prisma.armorSet.createMany({ data: ARMOR_SETS as any })

  console.log("Inserindo runas...")
  await prisma.rune.createMany({ data: RUNES as any })

  console.log("Inserindo gemas...")
  await prisma.gem.createMany({ data: GEMS as any })

  console.log("Inserindo facets...")
  await prisma.facet.createMany({ data: FACETS as any })

  console.log("Inserindo acessórios...")
  await prisma.accessory.createMany({ data: ACCESSORIES as any })

  console.log("Inserindo encantamentos...")
  await prisma.enchantment.createMany({ data: ENCHANTMENTS as any })

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
      "Gnarled Staff":    { s: { Intelligence: "C", Focus: "B" }, ed: 30 },
      "Bear Slayer":      { s: { Strength: "B" } },
      "Dried Hive":       { s: { Intelligence: "B" },         ed: 32 },
      "False Truth":      { s: { Intelligence: "B", Faith: "C" }, ed: 36 },
      "Pinwheel":         { s: { Intelligence: "A", Focus: "B" }, ed: 48 } }
  ),

  // ── Wands (one-handed, Intelligence, Ranged) ──────────────────────────────
  ...cat(
    ["Flame Becomes Us", "Sanglier Staff"],
    "Wands", 22, { Intelligence: "A" },
    "Fast", false, "Ranged", 2, 2, { Intelligence: 18 },
    ["ranged", "elemental", "dot", "magic"],
    { "Flame Becomes Us": { ed: 55, unique: true },
      "Sanglier Staff":   { s: { Intelligence: "B", Focus: "B" }, ed: 48 } }
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
      "Executioner's Halberd":  { s: { Strength: "B" }, unique: true },
      "Bolein Polearm":         { s: { Dexterity: "C", Focus: "B" } },
      "Regal Cleft":            { s: { Strength: "C", Focus: "C" } } }
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
// compatibleWeaponTypes: "one-handed" | "two-handed" | "Bows" | "Double Daggers" | "Staves" | "Wands"
// [] = universal (funciona em qualquer arma)

const RUNES = [
  // ── Uma mão — físicas ────────────────────────────────────────────────────────
  { name: "Spin",             effects: ["Gira com a arma, atingindo inimigos ao redor"],                  elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["melee", "aoe"],              patchVersion: "0.1", needsReview: false },
  { name: "Thrust",           effects: ["Avança e empurra o inimigo para longe"],                         elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["melee", "mobile"],           patchVersion: "0.1", needsReview: false },
  { name: "Slashing Dash",    effects: ["Avança rapidamente e corta o inimigo"],                          elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["melee", "mobile", "burst"], patchVersion: "0.1", needsReview: false },
  { name: "Charge Strike",    effects: ["Carrega e descarrega um golpe poderoso"],                        elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["melee", "stagger"],          patchVersion: "0.1", needsReview: false },
  { name: "Leap",             effects: ["Salta e cai sobre o inimigo com força"],                        elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["melee", "stagger"],          patchVersion: "0.1", needsReview: false },
  // ── Uma mão — elementais ─────────────────────────────────────────────────────
  { name: "Fire Dash",        effects: ["Avança em chamas, causando dano de Fogo"],                      elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["fire", "elemental", "mobile"],      patchVersion: "0.1", needsReview: false },
  { name: "Fire Flurry",      effects: ["Série de golpes em chamas"],                                    elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["fire", "elemental", "aggressive"],  patchVersion: "0.1", needsReview: false },
  { name: "Fire Whirl",       effects: ["Redemoinho de fogo ao redor do personagem"],                    elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Frost Dash",       effects: ["Avança com gelo, causando dano de Gelo"],                      elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["ice", "elemental", "mobile"],       patchVersion: "0.1", needsReview: false },
  { name: "Frost Strike",     effects: ["Golpe que congela o alvo"],                                     elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["ice", "elemental", "stagger"],      patchVersion: "0.1", needsReview: false },
  { name: "Lightning Dash",   effects: ["Avança como um raio, causando dano Elétrico"],                  elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["lightning", "elemental", "mobile"], patchVersion: "0.1", needsReview: false },
  { name: "Lightning Flurry", effects: ["Série de golpes elétricos que encadeiam entre inimigos"],       elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["lightning", "elemental", "aoe"],    patchVersion: "0.1", needsReview: false },
  { name: "Lightning Slam",   effects: ["Golpe que descarrega raio no ponto de impacto"],                elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["lightning", "elemental", "stagger"],patchVersion: "0.1", needsReview: false },
  { name: "Plague Dash",      effects: ["Avança espalhando praga no caminho"],                           elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["plague", "elemental", "mobile"],    patchVersion: "0.1", needsReview: false },
  { name: "Plague Strike",    effects: ["Golpe que infecta o inimigo com Praga"],                        elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["one-handed"], synergyTags: ["plague", "elemental"],              patchVersion: "0.1", needsReview: false },
  // ── Duas mãos — físicas ──────────────────────────────────────────────────────
  { name: "Ground Slam",      effects: ["Bate a arma no chão causando onda de choque"],                  elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["melee", "stagger", "aoe"],   patchVersion: "0.1", needsReview: false },
  { name: "Crushing Slam",    effects: ["Golpe esmagador que derruba o inimigo"],                        elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["melee", "stagger"],          patchVersion: "0.1", needsReview: false },
  { name: "Berserk Slam",     effects: ["Série de golpes frenéticos e pesados"],                         elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["melee", "aggressive"],       patchVersion: "0.1", needsReview: false },
  { name: "Cyclone Swipe",    effects: ["Gira a arma em círculo atingindo múltiplos inimigos"],          elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["melee", "aoe"],              patchVersion: "0.1", needsReview: false },
  // ── Duas mãos — elementais ───────────────────────────────────────────────────
  { name: "Fire Slam",        effects: ["Golpe que explode em chamas no impacto"],                       elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["fire", "elemental", "stagger"],     patchVersion: "0.1", needsReview: false },
  { name: "Fire Swipe",       effects: ["Corte em arco que deixa rastro de fogo"],                       elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Fire Whirlwind",   effects: ["Redemoinho de chamas em área ampla"],                           elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Ice Ram",          effects: ["Avanço com armadura de gelo, congela ao impacto"],              elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["ice", "elemental", "stagger"],      patchVersion: "0.1", needsReview: false },
  { name: "Lightning Assault",effects: ["Avanço relâmpago que encadeia raios entre inimigos"],           elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["lightning", "elemental", "mobile"], patchVersion: "0.1", needsReview: false },
  { name: "Plague Crush",     effects: ["Golpe esmagador que espalha névoa de praga"],                   elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["two-handed"], synergyTags: ["plague", "elemental", "aoe"],       patchVersion: "0.1", needsReview: false },
  // ── Arcos ────────────────────────────────────────────────────────────────────
  { name: "Arrow",            effects: ["Dispara uma flecha básica precisa"],                             elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged"],                           patchVersion: "0.1", needsReview: false },
  { name: "Multi Shot",       effects: ["Dispara múltiplas flechas simultaneamente"],                     elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "burst", "aoe"],           patchVersion: "0.1", needsReview: false },
  { name: "Evasive Shot",     effects: ["Salta para trás e dispara uma flecha enquanto recua"],           elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "mobile"],                 patchVersion: "0.1", needsReview: false },
  { name: "Arrowstorm",       effects: ["Dispara flecha ao céu; chuva de flechas cai na área"],          elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "aoe"],                    patchVersion: "0.1", needsReview: false },
  { name: "Fire Arrow",       effects: ["Dispara uma flecha incendiária"],                                elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "fire", "elemental"],      patchVersion: "0.1", needsReview: false },
  { name: "Ice Arrow",        effects: ["Flecha que congela o alvo ao impacto"],                         elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "ice", "elemental"],       patchVersion: "0.1", needsReview: false },
  { name: "Lightning Arrow",  effects: ["Flecha carregada de eletricidade"],                             elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "lightning", "elemental"], patchVersion: "0.1", needsReview: false },
  { name: "Skybreaker",       effects: ["Salta e dispara flecha que cria explosão elétrica"],            elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "lightning", "elemental", "stagger"], patchVersion: "0.1", needsReview: false },
  { name: "Plague Arrow",     effects: ["Flecha infectada com praga"],                                   elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Bows"], synergyTags: ["ranged", "plague", "elemental"],    patchVersion: "0.1", needsReview: false },
  // ── Adagas Duplas ────────────────────────────────────────────────────────────
  { name: "Dual Flurry",      effects: ["Sequência rápida de golpes com as duas adagas"],                elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Double Daggers"], synergyTags: ["melee", "burst", "aggressive"], patchVersion: "0.1", needsReview: false },
  { name: "Dual Slash",       effects: ["Dois cortes em X simultâneos"],                                 elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Double Daggers"], synergyTags: ["melee", "burst"],              patchVersion: "0.1", needsReview: false },
  { name: "Tornado Spin",     effects: ["Gira em redemoinho com as duas adagas"],                        elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Double Daggers"], synergyTags: ["melee", "aoe"],                patchVersion: "0.1", needsReview: false },
  { name: "Wild Rush",        effects: ["Série frenética de ataques para frente"],                       elementalType: null,        triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Double Daggers"], synergyTags: ["melee", "aggressive", "mobile"],patchVersion: "0.1", needsReview: false },
  { name: "Lightning Claw",   effects: ["Golpe elétrico com as duas adagas que encadeia dano"],          elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Double Daggers"], synergyTags: ["lightning", "elemental", "burst"], patchVersion: "0.1", needsReview: false },
  // ── Cajados / Varinhas ───────────────────────────────────────────────────────
  { name: "Fireball",         effects: ["Lança bola de fogo que explode no impacto"],                    elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Fire Burst",       effects: ["Explosão de fogo em área ao redor do conjurador"],              elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Fire Blast",       effects: ["Raio de fogo concentrado em linha reta"],                       elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["fire", "elemental"],               patchVersion: "0.1", needsReview: false },
  { name: "Hellfire",         effects: ["Invoca colunas de fogo do chão (custo alto de Focus)"],         elementalType: "Fire",      triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["fire", "elemental", "aoe"],         patchVersion: "0.1", needsReview: false },
  { name: "Icebolt",          effects: ["Projétil de gelo que congela o alvo"],                          elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["ice", "elemental"],                patchVersion: "0.1", needsReview: false },
  { name: "Frost Nova",       effects: ["Explosão de gelo em área ao redor do conjurador"],              elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["ice", "elemental", "aoe"],          patchVersion: "0.1", needsReview: false },
  { name: "Glacial Spike",    effects: ["Cria enorme espinho de gelo (custo alto de Focus)"],            elementalType: "Ice",       triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["ice", "elemental", "stagger"],      patchVersion: "0.1", needsReview: false },
  { name: "Chain Lightning",  effects: ["Raio que encadeia entre inimigos próximos"],                    elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["lightning", "elemental", "aoe"],    patchVersion: "0.1", needsReview: false },
  { name: "Lightning Blast",  effects: ["Feixe de raio contínuo"],                                      elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["lightning", "elemental"],           patchVersion: "0.1", needsReview: false },
  { name: "Thunderstrike",    effects: ["Invoca raio massivo (custo alto de Focus)"],                    elementalType: "Lightning", triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["lightning", "elemental", "stagger"],patchVersion: "0.1", needsReview: false },
  { name: "Plague Burst",     effects: ["Explosão de praga em área ao redor do conjurador"],             elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["plague", "elemental", "aoe"],       patchVersion: "0.1", needsReview: false },
  { name: "Plague Wave",      effects: ["Onda de praga que percorre o terreno à frente"],               elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["plague", "elemental"],              patchVersion: "0.1", needsReview: false },
  { name: "Plague Explosion", effects: ["Explosão massiva de praga (custo alto de Focus)"],              elementalType: "Plague",    triggerCondition: "active", cooldownSeconds: null, stackLimit: null, compatibleWeaponTypes: ["Staves", "Wands"], synergyTags: ["plague", "elemental", "aoe"],       patchVersion: "0.1", needsReview: false },
]

// ─── GEMAS ────────────────────────────────────────────────────────────────────
// Nomes reais do jogo (Chipped = Tier 1, Mottled = Tier 2)

const GEMS = [
  // ── Físico ───────────────────────────────────────────────────────────────────
  { name: "Chipped Spike",      rarity: "Common", effects: ["+8% de Dano"],                                    elementalType: null,        synergyTags: ["physical", "damage", "aggressive"],   compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Spike",      rarity: "Rare",   effects: ["+15% de Dano"],                                   elementalType: null,        synergyTags: ["physical", "damage", "aggressive"],   compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Fogo ─────────────────────────────────────────────────────────────────────
  { name: "Chipped Ruby",       rarity: "Common", effects: ["+8% de Dano de Fogo"],                            elementalType: "Fire",      synergyTags: ["fire", "elemental", "dot"],           compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Ruby",       rarity: "Rare",   effects: ["+15% de Dano de Fogo"],                           elementalType: "Fire",      synergyTags: ["fire", "elemental", "dot"],           compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Gelo ─────────────────────────────────────────────────────────────────────
  { name: "Chipped Sapphire",   rarity: "Common", effects: ["+8% de Dano de Gelo"],                            elementalType: "Ice",       synergyTags: ["ice", "elemental"],                   compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Sapphire",   rarity: "Rare",   effects: ["+15% de Dano de Gelo"],                           elementalType: "Ice",       synergyTags: ["ice", "elemental"],                   compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Raio ─────────────────────────────────────────────────────────────────────
  { name: "Chipped Quartz",     rarity: "Common", effects: ["+8% de Dano de Raio"],                            elementalType: "Lightning", synergyTags: ["lightning", "elemental"],             compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Quartz",     rarity: "Rare",   effects: ["+15% de Dano de Raio"],                           elementalType: "Lightning", synergyTags: ["lightning", "elemental"],             compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Praga ────────────────────────────────────────────────────────────────────
  { name: "Chipped Amethyst",   rarity: "Common", effects: ["+8% de Dano de Praga"],                           elementalType: "Plague",    synergyTags: ["plague", "elemental", "dot"],         compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Amethyst",   rarity: "Rare",   effects: ["+15% de Dano de Praga"],                          elementalType: "Plague",    synergyTags: ["plague", "elemental", "dot"],         compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Roubo de vida ────────────────────────────────────────────────────────────
  { name: "Chipped Blood Stone", rarity: "Common", effects: ["Recupera 5% de HP em abates"],                  elementalType: null,        synergyTags: ["lifesteal", "sustain", "defensive"],  compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Mottled Blood Stone", rarity: "Rare",   effects: ["Recupera 10% de HP em abates"],                 elementalType: null,        synergyTags: ["lifesteal", "sustain", "defensive"],  compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Focus ─────────────────────────────────────────────────────────────────────
  { name: "Chipped Topaz",      rarity: "Common", effects: ["Ganha 2% de Focus ao causar dano"],               elementalType: null,        synergyTags: ["focus", "spellblade"],                compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  { name: "Chipped Moon Stone",  rarity: "Common", effects: ["Regenera 0.4 Focus por segundo"],                elementalType: null,        synergyTags: ["focus", "spellblade"],                compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
  // ── Crítico ───────────────────────────────────────────────────────────────────
  { name: "Chipped Jewel",      rarity: "Common", effects: ["+60% Poder de Encantamento com Focus cheio"],     elementalType: null,        synergyTags: ["critical", "focus"],                  compatibleItems: ["weapon"], patchVersion: "0.1", needsReview: false },
]

// ─── FACETS ───────────────────────────────────────────────────────────────────
// Facets reais do jogo — modificadores permanentes nas armas (buff + penalidade)
// Fonte: nrftw.wiki.gg/wiki/List_of_Facets

const FACETS = [
  // ── Crítico ──────────────────────────────────────────────────────────────────
  { name: "Keen",          effectDescription: "+5% de Chance de Crítico | -20% de Dano de Poise",              triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["CriticalAssassin", "critical"],             patchVersion: "0.1", needsReview: false },
  { name: "Razor",         effectDescription: "+5% de Chance de Crítico | -50% de Durabilidade",               triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["CriticalAssassin", "critical"],             patchVersion: "0.1", needsReview: false },
  { name: "Sharp",         effectDescription: "+30–40% de Dano Crítico | -10% de Dano Base",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["CriticalAssassin", "critical", "burst"],    patchVersion: "0.1", needsReview: false },
  // ── Dano ─────────────────────────────────────────────────────────────────────
  { name: "Heavy",         effectDescription: "+20% de Dano | +25% de Custo de Stamina nos Ataques",           triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["MeleeBerserker", "TankBruiser", "damage"],  patchVersion: "0.1", needsReview: false },
  { name: "Clumsy",        effectDescription: "+20% de Dano | -10% de Velocidade de Ataque",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["MeleeBerserker", "damage"],                 patchVersion: "0.1", needsReview: false },
  { name: "Mundane",       effectDescription: "+20% de Dano | -25% de Ganho de Focus",                         triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["MeleeBerserker", "damage"],                 patchVersion: "0.1", needsReview: false },
  { name: "Reliable",      effectDescription: "+20% de Dano, +20% de Dano de Poise | -100% Chance de Crítico", triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["TankBruiser", "damage", "stagger"],         patchVersion: "0.1", needsReview: false },
  // ── Poise ────────────────────────────────────────────────────────────────────
  { name: "Blunt",         effectDescription: "+20% de Dano de Poise | -25% de Ganho de Focus",                triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["TankBruiser", "stagger"],                   patchVersion: "0.1", needsReview: false },
  // ── Velocidade / Stamina ─────────────────────────────────────────────────────
  { name: "Quick",         effectDescription: "+10% de Velocidade de Ataque | -10% de Dano",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["CriticalAssassin", "mobile"],               patchVersion: "0.1", needsReview: false },
  { name: "Nimble",        effectDescription: "-25% de Custo de Stamina nos Ataques | -25% de Ganho de Focus", triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["CriticalAssassin", "mobile", "stamina"],    patchVersion: "0.1", needsReview: false },
  // ── Focus / Magia ─────────────────────────────────────────────────────────────
  { name: "Ritualistic",   effectDescription: "+25% de Ganho de Focus ao Acertar | +25% de Custo de Stamina",  triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["SpellbladeHybrid", "focus"],                patchVersion: "0.1", needsReview: false },
  // ── Elementais ───────────────────────────────────────────────────────────────
  { name: "Festering",     effectDescription: "Infusão de Fogo na arma | -10% de Dano Base",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["ElementalRanger", "fire"],                  patchVersion: "0.1", needsReview: false },
  { name: "Flaming",       effectDescription: "Infusão de Fogo na arma | -10% de Dano Base",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["ElementalRanger", "fire"],                  patchVersion: "0.1", needsReview: false },
  { name: "Frigid",        effectDescription: "Infusão de Gelo na arma | -10% de Dano Base",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["ElementalRanger", "ice"],                   patchVersion: "0.1", needsReview: false },
  { name: "Voltaic",       effectDescription: "Infusão de Raio na arma | -10% de Dano Base",                   triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: ["ElementalRanger", "lightning"],             patchVersion: "0.1", needsReview: false },
  // ── Durabilidade ─────────────────────────────────────────────────────────────
  { name: "Durable",       effectDescription: "+75 de Durabilidade | -20% de Ganho de Focus",                  triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: [],                                          patchVersion: "0.1", needsReview: false },
  { name: "Indestructible",effectDescription: "Durabilidade infinita (sem penalidade)",                        triggerCondition: "passive", compatibleWeaponTypes: [], synergyTags: [],                                          patchVersion: "0.1", needsReview: false },
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
// Positivos (blue / plagued upside) e negativos (plagued downside, marcados com "debuff").
// compatibleCategories inclui tags para filtragem no engine: "damage","critical","stamina",
// "lifesteal","stagger","rune","focus","fire","ice","lightning","plague","debuff"

const ENCHANTMENTS = [
  // ── Positivos — Dano ─────────────────────────────────────────────────────────
  { name: "Dano de Ataque +10%",                effects: ["+10% de Dano de Ataque"],                                   compatibleCategories: ["weapon", "damage"],    patchVersion: "0.1", needsReview: false },
  { name: "Dano +15% contra Inimigos Grandes",  effects: ["+15% de Dano contra inimigos grandes"],                     compatibleCategories: ["weapon", "damage"],    patchVersion: "0.1", needsReview: false },
  { name: "Dano de Stagger +15%",               effects: ["+15% de Dano de Stagger"],                                  compatibleCategories: ["weapon", "stagger"],   patchVersion: "0.1", needsReview: false },
  { name: "Dano +5% por Inimigo Próximo",       effects: ["+5% de Dano por inimigo nas proximidades"],                 compatibleCategories: ["weapon", "damage"],    patchVersion: "0.1", needsReview: false },
  { name: "Dano +10% por 30s após Backstab",    effects: ["+10% de Dano por 30s após backstab"],                       compatibleCategories: ["weapon", "critical"],  patchVersion: "0.1", needsReview: false },
  // ── Positivos — Crítico ───────────────────────────────────────────────────────
  { name: "Chance Crítica +3%",                 effects: ["+3% de Chance de Acerto Crítico"],                          compatibleCategories: ["weapon", "critical"],  patchVersion: "0.1", needsReview: false },
  { name: "Dano Crítico +8%",                   effects: ["+8% de Dano em Críticos"],                                  compatibleCategories: ["weapon", "critical"],  patchVersion: "0.1", needsReview: false },
  // ── Positivos — Runas ────────────────────────────────────────────────────────
  { name: "Dano de Runa +10%",                  effects: ["+10% de Dano de Runas"],                                    compatibleCategories: ["weapon", "rune"],      patchVersion: "0.1", needsReview: false },
  { name: "Dano de Ataque +15% por 10s após Runa", effects: ["+15% de Dano por 10s após usar runa"],                  compatibleCategories: ["weapon", "rune"],      patchVersion: "0.1", needsReview: false },
  // ── Positivos — Stamina / Sustain ─────────────────────────────────────────────
  { name: "Custo de Stamina -10%",              effects: ["-10% de Custo de Stamina nos Ataques"],                     compatibleCategories: ["weapon", "stamina"],   patchVersion: "0.1", needsReview: false },
  { name: "Ganhar 5% HP em Abate",              effects: ["Recupera 5% de HP ao abater um inimigo"],                  compatibleCategories: ["weapon", "lifesteal"], patchVersion: "0.1", needsReview: false },
  // ── Positivos — Elementais ────────────────────────────────────────────────────
  { name: "Dano de Fogo +10%",                  effects: ["+10% de Dano de Fogo"],                                     compatibleCategories: ["weapon", "fire"],      patchVersion: "0.1", needsReview: false },
  { name: "Dano de Queimadura +30%",            effects: ["+30% de Dano de Queimadura (Plagued)"],                     compatibleCategories: ["weapon", "fire"],      patchVersion: "0.1", needsReview: false },
  { name: "Dano de Gelo +10%",                  effects: ["+10% de Dano de Gelo"],                                     compatibleCategories: ["weapon", "ice"],       patchVersion: "0.1", needsReview: false },
  { name: "Acúmulo de Gelo +15%",               effects: ["+15% de Acúmulo de Congelamento (Plagued)"],                compatibleCategories: ["weapon", "ice"],       patchVersion: "0.1", needsReview: false },
  { name: "Dano de Raio +10%",                  effects: ["+10% de Dano de Raio"],                                     compatibleCategories: ["weapon", "lightning"], patchVersion: "0.1", needsReview: false },
  { name: "Acúmulo de Raio +15%",               effects: ["+15% de Acúmulo de Raio (Plagued)"],                        compatibleCategories: ["weapon", "lightning"], patchVersion: "0.1", needsReview: false },
  { name: "Dano de Praga +10%",                 effects: ["+10% de Dano de Praga"],                                    compatibleCategories: ["weapon", "plague"],    patchVersion: "0.1", needsReview: false },
  // ── Negativos — Plagued Downside (obrigatório em armas roxas) ─────────────────
  { name: "Penalidade: Drena Focus em Combate", effects: ["Perde Focus continuamente durante combate"],                compatibleCategories: ["debuff"],              patchVersion: "0.1", needsReview: false },
  { name: "Penalidade: Carga Reduzida 25%",     effects: ["Carga máxima de equipamento reduzida em 25%"],              compatibleCategories: ["debuff"],              patchVersion: "0.1", needsReview: false },
  { name: "Penalidade: Custo de Focus +30%",    effects: ["Custo de Focus de runas aumentado em 30%"],                 compatibleCategories: ["debuff"],              patchVersion: "0.1", needsReview: false },
  { name: "Penalidade: Custo de Stamina +25%",  effects: ["Custo de Stamina nos ataques aumentado em 25%"],            compatibleCategories: ["debuff"],              patchVersion: "0.1", needsReview: false },
  { name: "Penalidade: Drena HP em Combate",    effects: ["Perde HP continuamente durante combate"],                   compatibleCategories: ["debuff"],              patchVersion: "0.1", needsReview: false },
]

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
