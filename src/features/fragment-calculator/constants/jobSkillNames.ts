// Job-specific  skill names mapping
// This data is extracted from the tempOrder file and contains all job skill mappings

export interface JobSkillMapping {
  originSkill: string;
  ascentSkill: string;
  masterySkills: string[];
  boostSkills: string[];
  commonSkills: string[];
}

export const jobSkillNames: Record<string, JobSkillMapping> = {
  Hero: {
    originSkill: "Spirit Calibur",
    ascentSkill: "Silent Cleave",
    masterySkills: ["Raging Blow", "Rising Rage", "Beam Blade", "Cry Valhalla"],
    boostSkills: ["Burning Soul Blade", "Instinctual Combo", "Worldreaver", "Sword Illusion"],
    commonSkills: ["Sol Janus"]
  },
  "Dark Knight": {
    originSkill: "Dead Space",
    ascentSkill: "Dark Halidom",
    masterySkills: ["Gungnir's Descent", "Dark Impale", "Revenge of the Evil Eye", "Evil Eye Shock"],
    boostSkills: ["Spear of Darkness", "Radiant Evil", "Calamitous Cyclone", "Darkness Aura"],
    commonSkills: ["Sol Janus"]
  },
  Paladin: {
    originSkill: "Sacred Bastion",
    ascentSkill: "Dominus Obrion",
    masterySkills: ["Blast", "Divine Charge", "Heaven's Hammer", "Final Attack"],
    boostSkills: ["Divine Echo", "Hammers of the Righteous", "Grand Guardian", "Mighty Mjolnir"],
    commonSkills: ["Sol Janus"]
  },
  "Arch Mage (Ice, Lightning)": {
    originSkill: "Frozen Lightning",
    ascentSkill: "Parabolic Bolt",
    masterySkills: ["Chain Lightning", "Frozen Orb", "Lightning Orb", "Thunder Sphere"],
    boostSkills: ["Ice Age", "Bolt Barrage", "Spirit of Snow", "Jupiter Thunder"],
    commonSkills: ["Sol Janus"]
  },
  "Arch Mage (Fire, Poison)": {
    originSkill: "Infernal Venom",
    ascentSkill: "Torrential Flame",
    masterySkills: ["Flame Sweep", "Flame Haze", "Ignite", "Creeping Toxin"],
    boostSkills: ["DoT Punisher", "Poison Nova", "Elemental Fury", "Poison Chain"],
    commonSkills: ["Sol Janus"]
  },
  Bishop: {
    originSkill: "Holy Advent",
    ascentSkill: "Command of Heaven",
    masterySkills: ["Angel Ray", "Big Bang", "Angelic Wrath", "Genesis"],
    boostSkills: ["Benediction", "Angel of Balance", "Peacemaker", "Divine Punishment"],
    commonSkills: ["Sol Janus"]
  },
  Pathfinder: {
    originSkill: "Forsaken Relic",
    ascentSkill: "Relic Penetration",
    masterySkills: ["Cardinal Burst", "Cardinal Deluge", "Glyph of Impalement", "Combo Assault"],
    boostSkills: ["Nova Blast", "Raven Tempest", "Obsidian Barrier", "Relic Unbound"],
    commonSkills: ["Sol Janus"]
  },
  Marksman: {
    originSkill: "Final Aim",
    ascentSkill: "Fatal Trigger",
    masterySkills: ["Snipe", "Piercing Arrow", "Frostprey", "Final Attack"],
    boostSkills: ["Perfect Shot", "Split Shot", "Surge Bolt", "Repeating Crossbow Cartridge"],
    commonSkills: ["Sol Janus"]
  },
  Bowmaster: {
    originSkill: "Ascendant Shadow",
    ascentSkill: "Point Zero",
    masterySkills: ["Hurricane", "Arrow Stream", "Quiver Cartridge", "Speed Mirage"],
    boostSkills: ["Storm of Arrows", "Inhuman Speed", "Quiver Barrage", "Silhouette Mirage"],
    commonSkills: ["Sol Janus"]
  },
  "Dual Blade": {
    originSkill: "Karma Blade",
    ascentSkill: "Yamaz Decree",
    masterySkills: ["Phantom Blow", "Asura's Anger", "Blade Clone", "Blade Fury"],
    boostSkills: ["Blade Storm", "Blades of Destiny", "Blade Tornado", "Haunted Edge"],
    commonSkills: ["Sol Janus"]
  },
  Shadower: {
    originSkill: "Halve Cut",
    ascentSkill: "Authentic Darkness",
    masterySkills: ["Assassinate", "Meso Explosion", "Dark Flare", "Sudden Raid"],
    boostSkills: ["Shadow Assault", "Trickblade", "Sonic Blow", "Slash Shadow Formation"],
    commonSkills: ["Sol Janus"]
  },
  "Night Lord": {
    originSkill: "Life and Death",
    ascentSkill: "Crucial Assault",
    masterySkills: ["Quad Star", "Assassin's Mark", "Dark Flare", "Sudden Raid"],
    boostSkills: ["Throwing Star Barrage", "Shurrikane", "Dark Lord's Omen", "Throw Blasting"],
    commonSkills: ["Sol Janus"]
  },
  Cannoneer: {
    originSkill: "Super Cannon Explosion",
    ascentSkill: "Barrel of Monkeys",
    masterySkills: ["Cannon Barrage", "Cannon Bazooka", "Rolling Rainbow", "Monkey Militia"],
    boostSkills: ["Cannon of Mass Destruction", "The Nuclear Option", "Monkey Business", "Poolmaker"],
    commonSkills: ["Sol Janus"]
  },
  Buccaneer: {
    originSkill: "Unleash Neptunus",
    ascentSkill: "Haymaker",
    masterySkills: ["Octopunch", "Sea Serpent Burst", "Serpent Scale", "Hook Bomber"],
    boostSkills: ["Lightning Form", "Lord of the Deep", "Serpent Vortex", "Howling Fist"],
    commonSkills: ["Sol Janus"]
  },
  Corsair: {
    originSkill: "The Dreadnought",
    ascentSkill: "Firecracker",
    masterySkills: ["Rapid Fire", "Broadside", "Brain Scrambler", "All Aboard"],
    boostSkills: ["Bullet Barrage", "Target Lock", "Nautilus Assault", "Death Trigger"],
    commonSkills: ["Sol Janus"]
  },
  "Dawn Warrior": {
    originSkill: "Astral Blitz",
    ascentSkill: "Totality",
    masterySkills: ["Luna Divide", "Cosmic Shower", "Cosmic Burst", "Equinox Slash"],
    boostSkills: ["Cosmos", "Rift of Damnation", "Soul Eclipse", "Flare Slash"],
    commonSkills: ["Sol Janus"]
  },
  "Thunder Breaker": {
    originSkill: "Thunder Wall Sea Wave",
    ascentSkill: "Strong Wave Annihilation",
    masterySkills: ["Annihilate", "Thunderbolt", "Typhoon", "Sea Wave"],
    boostSkills: ["Lightning Cascade", "Shark Torpedo", "Lightning God Spear Strike", "Lightning Spear Multistrike"],
    commonSkills: ["Sol Janus"]
  },
  "Night Walker": {
    originSkill: "Silence",
    ascentSkill: "Stygian Command",
    masterySkills: ["Quintuple Star", "Shadow Bat", "Dark Omen", "Dominion"],
    boostSkills: ["Shadow Spear", "Greater Dark Servant", "Shadow Bite", "Rapid Throw"],
    commonSkills: ["Sol Janus"]
  },
  "Wind Archer": {
    originSkill: "Mistral Spring",
    ascentSkill: "Element Tempest",
    masterySkills: ["Song of Heaven", "Trifling Wind", "Storm Bringer", "Storm Whim"],
    boostSkills: ["Howling Gale", "Merciless Winds", "Gale Barrier", "Vortex Sphere"],
    commonSkills: ["Sol Janus"]
  },
  "Blaze Wizard": {
    originSkill: "Eternity",
    ascentSkill: "Flame Concerto",
    masterySkills: ["Orbital Flame", "Blazing Extinction", "Orbital Explosion", "Towering Inferno"],
    boostSkills: ["Orbital Inferno", "Savage Flame", "Inferno Sphere", "Salamander Mischief"],
    commonSkills: ["Sol Janus"]
  },
  Mihile: {
    originSkill: "Durendal",
    ascentSkill: "Knight Immortals",
    masterySkills: ["Radiant Cross", "Royal Guard", "Install Shield", "Offensive Defense"],
    boostSkills: ["Shield of Light", "Sword of Light", "Radiant Soul", "Light of Courage"],
    commonSkills: ["Sol Janus"]
  },
  Mercedes: {
    originSkill: "Unfading Glory",
    ascentSkill: "Elemental Spirit",
    masterySkills: ["Ishtar's Ring", "Wrath of Enlil", "Unicorn Spike", "Elemental Knights"],
    boostSkills: ["Spirit of Elluel", "Sylvidia's Flight", "Irkalla's Wrath", "Royal Knights"],
    commonSkills: ["Sol Janus"]
  },
  Aran: {
    originSkill: "Endgame",
    ascentSkill: "Frost Bluster",
    masterySkills: ["Beyond Blade", "Finisher - Hunter's Prey", "Last Stand", "Adrenaline Overload"],
    boostSkills: ["Finisher - Adrenaline Surge", "Maha's Carnage", "Final Beyond Blade - White Tiger", "Blizzard Tempest"],
    commonSkills: ["Sol Janus"]
  },
  Phantom: {
    originSkill: "Defying Fate",
    ascentSkill: "Moonlight Serenade",
    masterySkills: ["Tempest", "Mille Aiguilles", "Carte Noir", "Carte Rose Finale"],
    boostSkills: ["Luck of the Draw", "Ace in the Hole", "Phantom's Mark", "Rift Break"],
    commonSkills: ["Sol Janus"]
  },
  Luminous: {
    originSkill: "Harmonic Paradox",
    ascentSkill: "Lustrous Orb",
    masterySkills: ["Ender", "Reflection", "Apocalypse", "Twilight Nova"],
    boostSkills: ["Gate of Light", "Aether Conduit", "Baptism of Light and Darkness", "Liberation Orb"],
    commonSkills: ["Sol Janus"]
  },
  Evan: {
    originSkill: "Zodiac Burst",
    ascentSkill: "Union Drive",
    masterySkills: ["Mana Burst", "Thunder Circle", "Earth Circle", "Wind Circle"],
    boostSkills: ["Elemental Barrage", "Dragon Slam", "Elemental Radiance", "Spiral of Mana"],
    commonSkills: ["Sol Janus"]
  },
  Shade: {
    originSkill: "Advent of the Fox",
    ascentSkill: "Eternal Moon",
    masterySkills: ["Spirit Claw", "Fox Spirits", "Bomb Punch", "Spirit Frenzy"],
    boostSkills: ["Fox God Flash", "Spiritgate", "True Spirit Claw", "Smashing Multipunch"],
    commonSkills: ["Sol Janus"]
  },
  "Battle Mage": {
    originSkill: "Crimson Pact",
    ascentSkill: "Gloomy Aura",
    masterySkills: ["Condemnation", "Finishing Blow", "Dark Shock", "Dark Genesis"],
    boostSkills: ["Aura Scythe", "Altar of Annihilation", "Grim Harvest", "Abyssal Lightning"],
    commonSkills: ["Sol Janus"]
  },
  Blaster: {
    originSkill: "Final Destroyer",
    ascentSkill: "Vanguard Impact",
    masterySkills: ["Magnum Punch", "Bunker Buster Explosion", "Revolving Cannon Mastery", "Revolving Cannon"],
    boostSkills: ["Rocket Punch", "Gatling Punch", "Bullet Blast", "Afterimage Shock"],
    commonSkills: ["Sol Janus"]
  },
  Mechanic: {
    originSkill: "Ground Zero",
    ascentSkill: "Metal Armor: Extermination",
    masterySkills: ["AP Salvo Plus", "Homing Beacon", "Distortion Bomb", "Robo Launcher RM7"],
    boostSkills: ["Doomsday Device", "Mobile Missile Battery", "Full Metal Barrage", "Mecha Carrier"],
    commonSkills: ["Sol Janus"]
  },
  "Wild Hunter": {
    originSkill: "Nature's Truth",
    ascentSkill: "Gear Storm",
    masterySkills: ["Wild Arrow Blast", "Swipe", "Summon Jaguar", "Hunting Assistant Unit"],
    boostSkills: ["Jaguar Storm", "Primal Fury", "Primal Grenade", "Wild Arrow Blast Type X"],
    commonSkills: ["Sol Janus"]
  },
  Xenon: {
    originSkill: "Artificial Evolution",
    ascentSkill: "Neoteric Trice",
    masterySkills: ["Mecha Purge: Snipe", "Triangulation", "Aegis System", "Beam Dance"],
    boostSkills: ["Omega Blaster", "Core Overload", "Hypogram Field: Fusion", "Photon Ray"],
    commonSkills: ["Sol Janus"]
  },
  "Demon Slayer": {
    originSkill: "Nightmare",
    ascentSkill: "Amethystine Intrusion",
    masterySkills: ["Demon Impact", "Demon Lash", "Demon Cry", "Cerberus Chomp"],
    boostSkills: ["Demon Awakening", "Spirit of Rage", "Orthrus", "Demon Bane"],
    commonSkills: ["Sol Janus"]
  },
  "Demon Avenger": {
    originSkill: "Requiem",
    ascentSkill: "Rageborne Daredevil",
    masterySkills: ["Nether Shield", "Exceed: Execution", "Exceed: Lunar Slash", "Thousand Swords"],
    boostSkills: ["Demonic Frenzy", "Demonic Blast", "Dimensional Sword", "Revenant"],
    commonSkills: ["Sol Janus"]
  },
  "Angelic Buster": {
    originSkill: "Grand Finale",
    ascentSkill: "Genuine Encore",
    masterySkills: ["Trinity", "Soul Seeker", "Supreme Supernova", "Celestial Roar"],
    boostSkills: ["Sparkle Burst", "Superstar Spotlight", "Mighty Mascot", "Trinity Fusion"],
    commonSkills: ["Sol Janus"]
  },
  Kaiser: {
    originSkill: "Nova Triumphant",
    ascentSkill: "Pyro Instinct",
    masterySkills: ["Gigas Wave", "Blade Burst", "Inferno Breath", "Wing Beat"],
    boostSkills: ["Nova Guardians", "Bladefall", "Draco Surge", "Dragonflare"],
    commonSkills: ["Sol Janus"]
  },
  Cadena: {
    originSkill: "Chain Arts: Grand Arsenal",
    ascentSkill: "Brutal Ravage",
    masterySkills: ["Chain Arts: Thrash", "Muscle Memory", "Summon Scimitar", "Summon Shotgun"],
    boostSkills: ["Chain Arts: Void Strike", "Apocalypse Cannon", "Chain Arts: Maelstrom", "Muscle Memory Finale"],
    commonSkills: ["Sol Janus"]
  },
  Kain: {
    originSkill: "Total Annihilation",
    ascentSkill: "Malicious Flicker",
    masterySkills: ["Falling Dust", "Strike Arrow", "Dragon Fang", "Death's Blessing"],
    boostSkills: ["Dragon Burst", "Fatal Blitz", "Thanatos Descent", "Grip of Agony"],
    commonSkills: ["Sol Janus"]
  },
  Kanna: {
    originSkill: "Hakumenkonmou Juubi",
    ascentSkill: "",
    masterySkills: ["Shikigami Haunting", "Vanquisher's Charm", "Shikigami Doppelganger", "Kishin Shoukan"],
    boostSkills: ["Yuki-musume Shoukan", "Spirit's Domain", "Liberated Spirit Circle", "Ghost Yaksha Bosses' Boss"],
    commonSkills: ["Sol Janus"]
  },
  Hayato: {
    originSkill: "Jin Quick Draw",
    ascentSkill: "",
    masterySkills: ["Rai Blade Flash", "Shinsoku", "Falcon's Honor", "Hitokiri Strike"],
    boostSkills: ["Battoujutsu Zankou", "Iaijutsu Phantom Blade", "Battoujutsu Ultimate Will", "Instant Slice"],
    commonSkills: ["Sol Janus"]
  },
  Adele: {
    originSkill: "Maestro",
    ascentSkill: "Einheit",
    masterySkills: ["Cleave", "Hunting Decree", "Impale", "Aether Forge"],
    boostSkills: ["Ruin", "Infinity Blade", "Legacy Restoration", "Storm"],
    commonSkills: ["Sol Janus"]
  },
  Ark: {
    originSkill: "Primordial Abyss",
    ascentSkill: "Whisper of the Absolute Abyss",
    masterySkills: ["Basic Charge Drive", "Grievous Wound", "Vengeful Hate", "Endless Nightmare"],
    boostSkills: ["Abyssal Recall", "Infinity Spell", "Devious Nightmare", "Endlessly Starving Beast"],
    commonSkills: ["Sol Janus"]
  },
  Illium: {
    originSkill: "Mytocrystal Expanse",
    ascentSkill: "Excidium",
    masterySkills: ["Radiant Javelin", "Reaction - Domination", "Ex", "Longinus Spear"],
    boostSkills: ["Crystal Ignition", "Templar Knight", "Crystalline Spirit", "Crystal Gate"],
    commonSkills: ["Sol Janus"]
  },
  Khali: {
    originSkill: "Hex: Sandstorm",
    ascentSkill: "Void Awake",
    masterySkills: ["Arts: Flurry", "Void Rush", "Hex: Chakram Sweep", "Resonate"],
    boostSkills: ["Hex: Pandemonium", "Void Burst", "Arts: Astra", "Resonate: Ultimatum"],
    commonSkills: ["Sol Janus"]
  },
  Hoyoung: {
    originSkill: "Sage: Apotheosis",
    ascentSkill: "Heavenly World Swing Spirit",
    masterySkills: ["Heaven: Consuming Flames", "Heaven: Iron Fan Gale", "Talisman: Clone", "Scroll: Star Vortex"],
    boostSkills: ["Sage: Clone Rampage", "Scroll: Tiger of Songyu", "Sage: Wrath of Gods", "Sage: Three Paths Apparition"],
    commonSkills: ["Sol Janus"]
  },
  Lara: {
    originSkill: "Universe in Bloom",
    ascentSkill: "Overflow",
    masterySkills: ["Essence Sprinkle", "Dragon Vein Eruption", "Dragon Vein Absorption", "Wakeup Call"],
    boostSkills: ["Big Stretch", "Land's Connection", "Surging Essence", "Winding Mountain Ridge"],
    commonSkills: ["Sol Janus"]
  },
  Kinesis: {
    originSkill: "From Another Realm",
    ascentSkill: "Fractal Horizon",
    masterySkills: ["Ultimate - Metal Press", "Psychic Grab", "Ultimate - Trainwreck", "Kinetic Combo"],
    boostSkills: ["Psychic Tornado", "Ultimate - Mind Over Matter", "Ultimate - Psychic Shockwave", "Law of Gravity"],
    commonSkills: ["Sol Janus"]
  },
  Zero: {
    originSkill: "End Time",
    ascentSkill: "Bitemporis",
    masterySkills: ["Giga Crash", "Spin Driver", "Flash Assault", "Moon Strike"],
    boostSkills: ["Chrono Break", "Twin Blades of Time", "Shadow Flash", "Ego Weapon"],
    commonSkills: ["Sol Janus"]
  },
  Lynn: {
    originSkill: "Source Flow",
    ascentSkill: "",
    masterySkills: ["Strike", "Sneak Attack", "Peck", "[Focus] Heal"],
    boostSkills: ["Beast's Rage", "Beak Strike", "[Focus] Awaken", "Nature's Grace"],
    commonSkills: ["Sol Janus"]
  },
  "Mo Xuan": {
    originSkill: "Soul Art: Jianghu Dragon",
    ascentSkill: "",
    masterySkills: ["Xuanshan Arts [Tian]", "Divine Art: Howling Storm", "Divine Art: Swirling Tide", "Secret Art: Qi Projection"],
    boostSkills: ["Soul Art: Beneath Heaven", "Divine Art: Crashing Earth", "Soul Art: The Conquered Self", "Soul Art: The Opened Gate"],
    commonSkills: ["Sol Janus"]
  },
  "Sia Astelle": {
    originSkill: "Celestial Design",
    ascentSkill: "",
    masterySkills: ["SHINE Ray"],
    boostSkills: ["Shine", "Stellar XI - Sirius", "Stellar XII - Sadalsuud", "Savior's Circle"],
    commonSkills: ["Sol Janus"]
  },
  Len: {
    originSkill: "Sky Splitting Azure Dragon Sword: Ascension",
    ascentSkill: "Sky Splitting Azure Dragon Sword: Single Falling Plum Blossom, Heavenly Rain Humanity Desolation",
    masterySkills: ["Plum Blossom Sword Fundamental: Relentless Slash", "Lost Soul Sword Fundamental: Soul Strike", "Lost Soul Advent", "Plum Blossom Sword 2nd Form: Scattering Plums"],
    boostSkills: ["Plum Blossom Sword Ultimate: Plum Tree Aroma", "Lost Soul Awakening", "Plum Blossom Sword Ultimate: Dance of Annihilation", "Plum Blossom Sword Ultimate: Soul Blade"],
    commonSkills: ["Sol Janus"]
  }
};

// Get all available job names
export const getAvailableJobNames = (): string[] => {
  return Object.keys(jobSkillNames);
};

// Get skill mapping for a specific job
export const getJobSkillMapping = (jobName: string): JobSkillMapping | undefined => {
  return jobSkillNames[jobName];
};
