/**
 * Central registry of all recommended Daggerheart modules.
 * Each entry maps a module ID to its display metadata, GitHub repository, and category.
 * @module modules-data
 */

export const MODULE_ID = "dh-best-modules";

/**
 * GitHub repository path for this module itself.
 * Used to build changelog and support links for the self-entry in the dashboard.
 */
export const SELF_REPO = "brunocalado/dh-best-modules";

/**
 * GitHub repository path for the Foundryborne Daggerheart system.
 * Used to query the GitHub Releases API for the latest system version.
 */
export const DAGGERHEART_SYSTEM_REPO = "Foundryborne/daggerheart";

/**
 * Category constants for module classification.
 * @enum {string}
 */
export const CATEGORY = {
  MUST_HAVE: "must-have",
  RECOMMENDED: "recommended",
  THIRD_PARTY_DH: "third-party-dh",
  THIRD_PARTY: "third-party"
};

/**
 * @typedef {object} ModuleEntry
 * @property {string} id - Foundry module ID
 * @property {string} title - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} repo - "owner/repo" path (used to build the default GitHub URL)
 * @property {string} [url] - Override URL for the repo link (e.g. GitLab repos)
 * @property {string} manifest - Raw URL to the module.json
 * @property {string} category - One of CATEGORY values
 * @property {boolean} [useReleasesApi] - If true, fetch latest version via GitHub Releases API instead of manifest URL
 * @property {boolean} [useGitLabApi] - If true, fetch latest version via GitLab Releases API instead of manifest URL
 */

/** @type {ModuleEntry[]} */
export const MODULES = [
  /* ---------------------------------------- */
  /*  Must Have                               */
  /* ---------------------------------------- */
  {
    id: "dh-best-modules",
    title: "Best Modules",
    icon: "\u{1F451}",
    description: "The module hub for Daggerheart. Tracks installation status, available updates, and system version for the full recommended module suite — all from one dashboard.",
    repo: "brunocalado/dh-best-modules",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-best-modules/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-advmanager",
    title: "Adversary Manager",
    icon: "\u{1F480}",
    description: "The ultimate GM tool for Daggerheart. Scale any adversary from Tier 1–4 in seconds, preview stat changes before applying them, build encounters with automatic Battle Point budgeting and difficulty estimates, and browse a full dice probability calculator — all from one panel.",
    repo: "brunocalado/daggerheart-advmanager",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-advmanager/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-distances",
    title: "Distances",
    icon: "\u{1F4CF}",
    description: "Draws Daggerheart's four range bands (Melee, Very Close, Close, Far) as visual rings around tokens on the map. Hover any token to instantly see how far it is from yours. Supports customizable themes, animated fills, edge-to-edge measurement for large tokens, and 3D elevation modes.",
    repo: "brunocalado/daggerheart-distances",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-distances/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-fear-tracker",
    title: "Fear Tracker",
    icon: "\u{1F631}",
    description: "Replaces the system's default Fear bar with a draggable, animated tracker that syncs automatically with the Daggerheart Fear resource. Features pulsing pip effects, a brief shake animation when Fear rises, multiple visual themes (Nuclear, Ghost, Skull, Blood Drop…), and adjustable size and position per user.",
    repo: "brunocalado/daggerheart-fear-tracker",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-fear-tracker/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "dh-mystery-box",
    title: "Mystery Box",
    icon: "\u{1F381}",
    description: "Lets the GM create loot boxes that players open for randomized rewards. Choose between Percentage mode (each item rolls independently — players might get everything, one item, or nothing) or Raffle mode (a guaranteed fixed number of items drawn by weighted chance). Rewards land in inventory automatically, with optional confetti, video, or sound reveal effects.",
    repo: "brunocalado/dh-mystery-box",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-mystery-box/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-quickactions",
    title: "Quick Actions",
    icon: "\u{26A1}",
    description: "Adds a Quick Actions menu to the Daggerheart sidebar with one-click tools for common mid-session needs: Falling Damage calculator, Downtime activities, Request Roll (GM sends a roll prompt to players), Scar Check, Help an Ally (spends Hope and rolls the Help Die), Spotlight Token, and Level Up.",
    repo: "brunocalado/daggerheart-quickactions",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-quickactions/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-quickrules",
    title: "Quick Rules",
    icon: "\u{1F4DC}",
    description: "A floating, searchable rule reference that stays on screen during play. Press Shift+D or click the canvas button to open it. Supports favorites (pin your most-used rules), adjustable font size, deep text search, and a custom folder for GMs to add house rules or setting lore.",
    repo: "brunocalado/daggerheart-quickrules",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-quickrules/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "daggerheart-store",
    title: "Store",
    icon: "\u{1F6D2}",
    description: "A full in-game shop for Daggerheart. Players browse categorized items, compare stats against their current gear, and buy with automatic currency deduction and inventory delivery. The GM controls prices (global multiplier or per-item), stock limits, sale discounts, vendor identity with relationship-based pricing, and can save multiple store profiles for different merchants or locations.",
    repo: "brunocalado/daggerheart-store",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-store/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "dh-tagteam",
    title: "Tag Team",
    icon: "\u{1F91D}",
    description: "Adds a Tag Team button directly to the character sheet. When clicked, it validates that the character has the required 3 Hope, consumes it, and registers the move — keeping the action visible and tracked without any manual bookkeeping.",
    repo: "brunocalado/dh-tagteam",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-tagteam/main/module.json",
    category: CATEGORY.MUST_HAVE
  },
  {
    id: "dh-containers",
    title: "Containers",
    icon: "\u{1F4E5}",
    description: "Organizes a flat Daggerheart inventory into collapsible groups. Mark any loot item as a container (backpack, chest, pouch), then drag weapons, armor, and consumables inside it. Items collapse out of view with one click, cleaning up crowded character sheets without moving or modifying the underlying data.",
    repo: "brunocalado/dh-containers",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-containers/main/module.json",
    category: CATEGORY.MUST_HAVE
  },

  /* ---------------------------------------- */
  /*  Recommended                             */
  /* ---------------------------------------- */
  {
    id: "daggerheart-critical",
    title: "Critical",
    icon: "\u{1F4A5}",
    description: "Triggers cinematic screen effects and audio whenever a critical moment happens: a Duality Dice match for players, a d20 crit for the GM, or a character level-up. Visual styles (shattered glass, energy borders), sounds (heroic fanfares vs. threatening stings), and per-player settings are all configurable.",
    repo: "brunocalado/daggerheart-critical",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-critical/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "daggerheart-death-moves",
    title: "Death Moves",
    icon: "\u{2620}\u{FE0F}",
    description: "Turns the Death Move into a full-table cinematic event. The dying player sees a dramatic full-screen choice (Avoid Death, Blaze of Glory, Risk it All) with a countdown timer, while all other players see a synchronized spectator screen. Results are announced with a banner, audio, and stylized chat cards. Supports English and Brazilian Portuguese voice lines.",
    repo: "brunocalado/daggerheart-death-moves",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-death-moves/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "daggerheart-extra-content",
    title: "Extra Content",
    icon: "\u{1F4E6}",
    description: "A homebrew compendium for Daggerheart — additional ancestries, classes, items, and other ready-to-use content that extends the core system without replacing it.",
    repo: "brunocalado/daggerheart-extra-content",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-extra-content/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "daggerheart-stats",
    title: "Stats",
    icon: "\u{1F3B2}",
    description: "Tracks every dice roll made at the table — by players and the GM — and displays statistics over time. Useful for spotting trends, settling debates about who's been unlucky, and adding a layer of transparency to the session.",
    repo: "brunocalado/daggerheart-stats",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-stats/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "daggerheart-fear-macros",
    title: "Fear Macros",
    icon: "\u{1F916}",
    description: "Automatically fires one or more macros whenever the Daggerheart Fear resource changes. Lets GMs wire ambient effects, lighting changes, or custom scripts to specific Fear thresholds without any manual triggering.",
    repo: "brunocalado/daggerheart-fear-macros",
    manifest: "https://raw.githubusercontent.com/brunocalado/daggerheart-fear-macros/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "dh-statblock-importer",
    title: "Stats Toolbox",
    icon: "\u{1F9E0}",
    description: "Import adversaries and NPCs by pasting a plain-text statblock. The module parses it and creates a fully populated Foundry actor, saving the manual data-entry work of copying stats field by field.",
    repo: "brunocalado/dh-statblock-importer",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-statblock-importer/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "dh-new-stat-tracker",
    title: "Custom Stat Tracker",
    icon: "\u{1F4A0}",
    description: "Adds custom resource trackers to any actor sheet. Define a name, max value, and icon, and the tracker appears on the sheet alongside the built-in stats — useful for homebrew resources, condition counters, or any value you need to watch during play.",
    repo: "brunocalado/dh-new-stat-tracker",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-new-stat-tracker/main/module.json",
    category: CATEGORY.RECOMMENDED
  },
  {
    id: "the-void-unofficial",
    title: "The Void (Unofficial)",
    icon: "\u{1F300}",
    description: "An unofficial implementation of Void mechanics for Daggerheart — a dark, corrupting force that characters can accumulate. Adds the necessary tracking, rules integration, and compendium content to run Void-themed campaigns.",
    repo: "brunocalado/the-void-unofficial",
    manifest: "https://raw.githubusercontent.com/brunocalado/the-void-unofficial/main/module.json",
    category: CATEGORY.RECOMMENDED
  },

  /* ---------------------------------------- */
  /*  Third Party                             */
  /* ---------------------------------------- */
  {
    id: "daggerheart-gm-hud",
    title: "GM HUD",
    icon: "\u{1F5A5}",
    description: "A persistent HUD overlay for the GM that surfaces key token stats and action shortcuts without needing to open individual sheets. Keeps the most-needed information visible at a glance during combat.",
    repo: "mordachai/daggerheart-gm-hud",
    manifest: "https://raw.githubusercontent.com/mordachai/daggerheart-gm-hud/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "chat-media",
    title: "Chat Media",
    icon: "\u{1F4F7}",
    description: "Allows images, videos, and audio files to be embedded directly in Foundry chat messages — useful for sharing scene art, handouts, or mood clips with players without leaving the chat panel.",
    repo: "p4535992/foundryvtt-chat-media",
    manifest: "https://raw.githubusercontent.com/p4535992/foundryvtt-chat-media/main/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY
  },
  {
    id: "daggerheart-hud",
    title: "Daggerheart HUD",
    icon: "\u{1F3AE}",
    description: "A compact player-facing HUD that shows a character's core stats (HP, Stress, Hope, Armor) as an always-visible overlay on the canvas, so players never need to open the full sheet to check their numbers mid-combat.",
    repo: "mordachai/daggerheart-hud",
    manifest: "https://raw.githubusercontent.com/mordachai/daggerheart-hud/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "art-for-daggerheart",
    title: "Art for Daggerheart",
    icon: "\u{1F3A8}",
    description: "A collection of character art and token images styled for the Daggerheart setting. Drop-in ready for actors, covering a range of ancestries and archetypes to give your world a consistent visual feel without sourcing art externally.",
    repo: "mordachai/art-for-daggerheart",
    manifest: "https://raw.githubusercontent.com/mordachai/art-for-daggerheart/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "dice-tray",
    title: "Dice Tray",
    icon: "\u{1FA84}",
    description: "Places a clickable dice palette just below the chat box. Click any die face to roll it instantly without typing a formula — handy for quick rolls and for players who prefer not to use chat commands.",
    repo: "mclemente/fvtt-dice-tray",
    manifest: "https://raw.githubusercontent.com/mclemente/fvtt-dice-tray/main/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY
  },
  {
    id: "permission_viewer",
    title: "Ownership Viewer",
    icon: "\u{1F441}",
    description: "Adds a small panel to the sidebar that shows which users have Owner, Observer, or Limited access to each document. Makes it easy to confirm at a glance that players can see exactly what they should — no more hunting through permission dialogs.",
    repo: "mclemente/fvtt-ownership-viewer",
    manifest: "https://raw.githubusercontent.com/mclemente/fvtt-ownership-viewer/main/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY
  },
  {
    id: "vtta-tokenizer",
    title: "Tokenizer",
    icon: "\u{1F9D9}",
    description: "A token editor built into Foundry. Layer a character portrait over a ring frame, apply masks, adjust scale and position, and export the result directly as a token image — no external image editing software needed.",
    repo: "mrprimate/tokenizer",
    manifest: "https://raw.githubusercontent.com/mrprimate/tokenizer/main/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY
  },
  {
    id: "martial-adversaries-for-daggerheart",
    title: "Martial Adversaries",
    icon: "\u{2694}\u{FE0F}",
    description: "60 new statblocks for warriors, soldiers, & military formations.",
    repo: "CaelReader/martial-adversaries-for-daggerheart",
    manifest: "https://github.com/CaelReader/martial-adversaries-for-daggerheart/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "undead-adversaries-for-daggerheart",
    title: "Undead Adversaries",
    icon: "\u{1F9DF}",
    description: "60 new statblocks for ghosts, ghouls, mummies, vampires, and more undead varieties.",
    repo: "CaelReader/undead-adversaries-for-daggerheart",
    manifest: "https://github.com/CaelReader/undead-adversaries-for-daggerheart/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "dh-qs-sablewood-messengers",
    title: "Quickstart Adventure: Sablewood Messengers",
    icon: "\u{1F5FA}",
    description: "The official Daggerheart quickstart adventure module. Includes 5 pre-made characters and step-by-step instructions to guide both GMs and players through a complete introductory adventure.",
    repo: "cptn-cosmo/dh-qs-sablewood-messengers",
    manifest: "https://github.com/cptn-cosmo/dh-qs-sablewood-messengers/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "hotpot-daggerheart",
    title: "Hotpot!",
    icon: "\u{1F372}",
    description: "A crafting and cooking system for Daggerheart. Players gather ingredients, follow recipes, and cook meals with mechanical effects. Includes a compendium of macros and supports custom ingredient and recipe item types.",
    repo: "joaquinpereyra98/hotpot-daggerheart",
    manifest: "https://github.com/joaquinpereyra98/hotpot-daggerheart/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "dh-motherboard",
    title: "DH Motherboard",
    icon: "\u{1F916}",
    description: "A homebrew compendium for the Daggerheart Motherboard setting. Includes custom frames, items, roll tables, and journal entries ready to drop into any campaign.",
    repo: "brunocalado/dh-motherboard",
    manifest: "https://raw.githubusercontent.com/brunocalado/dh-motherboard/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "i-wish-daggerheart-adventure",
    title: "I Wish (Adventure)",
    icon: "\u{1FA84}",
    description: "A wealthy merchant cursed to die seeks one final expedition into a dangerous mountain to retrieve a legendary artifact. A complete adventure for Daggerheart with scenes, actors, and journal entries.",
    repo: "brunocalado/i-wish-daggerheart-adventure",
    manifest: "https://raw.githubusercontent.com/brunocalado/i-wish-daggerheart-adventure/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "suicide-squad-daggerheart-adventure",
    title: "Suicide Squad (Adventure)",
    icon: "\u{1F4A3}",
    description: "Cursed criminals forced into service by a ruthless master must hunt a target of unimaginable importance in a land on the brink of war. A complete adventure with actors, scenes, journals, and a playlist.",
    repo: "brunocalado/suicide-squad-daggerheart-adventure",
    manifest: "https://raw.githubusercontent.com/brunocalado/suicide-squad-daggerheart-adventure/main/module.json",
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "daggerheart-plus",
    title: "Daggerheart Plus",
    icon: "\u{2795}",
    description: "UI/UX improvements for the default Daggerheart system. Enhances character sheets and general interface elements to provide a more polished play experience.",
    repo: "featureJosh/daggerheart-plus",
    manifest: "https://github.com/featureJosh/daggerheart-plus/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "daggerheart-sleek-ui",
    title: "Daggerheart: Sleek UI",
    icon: "\u{1F58C}",
    description: "A visual overhaul for the Foundryborne Daggerheart character sheet. Redesigns the layout and styling of sheets for characters, adversaries, and companions into a cleaner, more ergonomic interface.",
    repo: "pasoktcm/daggerheart-sleek-ui",
    manifest: "https://github.com/pasoktcm/daggerheart-sleek-ui/releases/latest/download/module.json",
    useReleasesApi: true,
    category: CATEGORY.THIRD_PARTY_DH
  },
  {
    id: "timeline-builder",
    title: "Timeline Builder",
    icon: "\u{23F3}",
    description: "A module for creating and managing campaign timelines.",
    repo: "brunocalado/timeline-builder",
    manifest: "https://raw.githubusercontent.com/brunocalado/timeline-builder/main/module.json",
    category: CATEGORY.THIRD_PARTY
  },
  {
    id: "group-tokens",
    title: "Group Tokens",
    icon: "\u{1FAB9}",
    description: "Easily collapse groups of tokens into a single token and vice versa — useful for representing parties or formations.",
    repo: "brunocalado/group-tokens",
    manifest: "https://raw.githubusercontent.com/brunocalado/group-tokens/main/module.json",
    category: CATEGORY.THIRD_PARTY
  }
];

/**
 * DataModel for the "ignoredUpdates" setting.
 * Stores a map of "moduleId@version" → true entries for dismissed update alerts.
 * Provides schema validation instead of using a plain Object type.
 * @extends foundry.abstract.DataModel
 */
export class IgnoredUpdatesModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    return {
      modules: new foundry.data.fields.ObjectField()
    };
  }
}
