import { MODULE_ID, DAGGERHEART_SYSTEM_REPO, IgnoredUpdatesModel } from "./modules-data.js";
import { ModulesListApp } from "./modules-app.js";

/**
 * Registers the module settings including the button to open the full modules list.
 * Triggered by the "init" Foundry Hook.
 */
function registerSettings() {
  game.settings.register(MODULE_ID, "checkOnLoad", {
    name: "Check for Updates on World Load",
    hint: "Automatically check for module updates when the world loads.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "checkThirdPartyUpdates", {
    name: "Alert on Third-Party Module Updates",
    hint: "When enabled, third-party modules are also included in update alerts on world load. Version info is always displayed regardless of this setting.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "checkThirdPartyDHUpdates", {
    name: "Alert on Daggerheart-Specific Third-Party Module Updates",
    hint: "When enabled, Daggerheart-specific third-party modules (adventures, content packs, DH tools) are also included in update alerts on world load. Version info is always displayed regardless of this setting.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "ignoredUpdates", {
    name: "Ignored Module Updates",
    hint: "Tracks which module updates have been dismissed.",
    scope: "world",
    config: false,
    type: IgnoredUpdatesModel,
    default: { modules: {} }
  });

  game.settings.register(MODULE_ID, "firstRun", {
    name: "First Run",
    hint: "Tracks whether the module dashboard has been shown on first activation.",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "ignoredSystemVersion", {
    name: "Ignored System Version",
    hint: "Tracks which Daggerheart system version update has been dismissed.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.registerMenu(MODULE_ID, "openModulesList", {
    name: "Modules Dashboard",
    label: "Open Dashboard",
    hint: "View the status of all recommended Daggerheart modules, including versions and updates.",
    icon: "fa-solid fa-cubes",
    type: ModulesListApp,
    restricted: false
  });
}

/**
 * Loads the module-row Handlebars partial so the main template can reference it.
 * Uses the V13 namespaced API `foundry.applications.handlebars.loadTemplates` to register the partial automatically.
 * Triggered during the "init" Foundry Hook.
 * @returns {Promise<void>}
 */
async function registerPartials() {
  await foundry.applications.handlebars.loadTemplates({
    "dh-bm-module-row": `modules/${MODULE_ID}/templates/module-row.hbs`
  });
}

/**
 * Checks for module and system updates on world load and opens the dashboard if any are pending.
 * Respects the "ignoredUpdates" and "ignoredSystemVersion" settings to avoid re-alerting dismissed items.
 * Only runs if the "checkOnLoad" setting is enabled.
 * Triggered by the "ready" Foundry Hook.
 * @returns {Promise<void>}
 */
async function checkOnWorldLoad() {
  if (!game.settings.get(MODULE_ID, "checkOnLoad")) return;

  const [statuses, systemLatestVersion] = await Promise.all([
    ModulesListApp.gatherModuleStatuses(),
    ModulesListApp.fetchLatestSystemVersion(DAGGERHEART_SYSTEM_REPO)
  ]);

  const ignoredUpdates = game.settings.get(MODULE_ID, "ignoredUpdates")?.modules ?? {};

  // Find installed modules with updates that haven't been dismissed
  const moduleUpdatesAvailable = statuses.filter((m) => {
    if (!m.installed || !m.hasUpdate) return false;
    // Check if this specific version update has been ignored
    const ignoreKey = `${m.id}@${m.latestVersion}`;
    return !ignoredUpdates[ignoreKey];
  });

  // Check for a system update that hasn't been ignored
  const installedVersion = game.system.version;
  const ignoredSystemVersion = game.settings.get(MODULE_ID, "ignoredSystemVersion");
  const systemUpdatePending = systemLatestVersion
    && foundry.utils.isNewerVersion(systemLatestVersion, installedVersion)
    && systemLatestVersion !== ignoredSystemVersion;

  if (systemUpdatePending) {
    // System update takes priority — open the full dashboard so the system panel is visible
    new ModulesListApp({ showAll: true }).render({ force: true });
  } else if (moduleUpdatesAvailable.length > 0) {
    new ModulesListApp({ showAll: false, filterUpdatesOnly: true }).render({ force: true });
  }
}

/**
 * Injects a "Best Modules Dashboard" button into the Foundry Settings sidebar.
 * Inserts after the system info block (.info .system), which places it
 * at the top of the panel — above Help and Documentation.
 * Pattern taken from the PbtA system (asacolips-projects/pbta).
 * @param {ApplicationV2} app - The Settings application instance
 * @param {HTMLElement} html - The rendered HTML element
 */
function injectSettingsButton(app, html) {
  if (html.querySelector("#dh-bm-settings-btn")) return;

  const div = document.createElement("div");
  div.id = "dh-bm-settings-btn";
  div.innerHTML = `
    <button type="button" style="width:100%">
      <i class="fa-solid fa-cubes"></i>
      Best Modules Dashboard
    </button>
  `;

  div.querySelector("button").addEventListener("click", () => {
    new ModulesListApp({ showAll: true }).render({ force: true });
  });

  // .info is the full system/world info block — inserting afterend places our button below Active Modules
  const anchor = html.querySelector(".info");
  if (anchor) {
    anchor.insertAdjacentElement("afterend", div);
  }
}

/* ---------------------------------------- */
/*  Hook Registration                       */
/* ---------------------------------------- */

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing Best Modules dashboard`);
  registerSettings();
  registerPartials();
});

Hooks.once("ready", async () => {
  const isFirstRun = game.settings.get(MODULE_ID, "firstRun");
  if (isFirstRun) {
    await game.settings.set(MODULE_ID, "firstRun", false);
    new ModulesListApp({ showAll: true }).render({ force: true });
    return;
  }
  checkOnWorldLoad();
});

// Re-inject on every settings panel open, since Foundry re-renders the HTML from scratch each time
Hooks.on("renderSettings", (app, html) => {
  injectSettingsButton(app, html);
});
