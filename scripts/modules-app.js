import { MODULE_ID, MODULES, CATEGORY, SELF_REPO, DAGGERHEART_SYSTEM_REPO } from "./modules-data.js";

/**
 * In-memory cache for remote version lookups.
 * Prevents redundant GitHub API calls within the same session and across multiple renders.
 * Key: manifest URL or "owner/repo" path. Value: { version: string|null, fetchedAt: number }.
 * @type {Map<string, {version: string|null, fetchedAt: number}>}
 */
const _versionCache = new Map();

/** Cache TTL in milliseconds (10 minutes). */
const VERSION_CACHE_TTL = 10 * 60 * 1000;

/**
 * Returns the cached version for a given key if it exists and is within TTL.
 * @param {string} key - Manifest URL or repo path
 * @returns {string|null|undefined} Cached version string or null (failed fetch), undefined on cache miss
 */
function _getCached(key) {
  const entry = _versionCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > VERSION_CACHE_TTL) {
    _versionCache.delete(key);
    return undefined;
  }
  return entry.version;
}

/**
 * Stores a version result in the cache.
 * @param {string} key - Manifest URL or repo path
 * @param {string|null} version - Version string, or null if the fetch failed
 */
function _setCache(key, version) {
  _versionCache.set(key, { version, fetchedAt: Date.now() });
}

/**
 * ApplicationV2 window that displays the status of all recommended Daggerheart modules.
 * Shows installed / active state, current version, and latest available version from GitHub.
 * Triggered automatically on world load (uninstalled-only view) or via settings button (full view).
 * @extends HandlebarsApplicationMixin(ApplicationV2)
 */
export class ModulesListApp extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  /**
   * @param {object} [options] - ApplicationV2 options
   * @param {boolean} [options.showAll=true] - If false, only uninstalled modules are shown
   * @param {boolean} [options.filterUpdatesOnly=false] - If true, only modules with updates are shown
   */
  constructor(options = {}) {
    super(options);
    /** @type {boolean} Whether to display all modules or only uninstalled ones */
    this.showAll = options.showAll ?? true;
    /** @type {boolean} Whether to filter only modules with available updates */
    this.filterUpdatesOnly = options.filterUpdatesOnly ?? false;
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    id: "dh-best-modules-list",
    classes: ["dh-best-modules"],
    position: { width: 900, height: 700 },
    window: {
      title: "Daggerheart: Best Modules",
      icon: "fa-solid fa-cubes",
      resizable: true
    },
    actions: {
      installModule: ModulesListApp.onInstallModule,
      refreshVersions: ModulesListApp.onRefreshVersions,
      enableModule: ModulesListApp.onEnableModule,
      dismissUpdate: ModulesListApp.onDismissUpdate,
      remindLater: ModulesListApp.onRemindLater,
      viewChangelog: ModulesListApp.onViewChangelog,
      ignoreSystemUpdate: ModulesListApp.onIgnoreSystemUpdate,
      viewSystemChangelog: ModulesListApp.onViewSystemChangelog,
      openSupport: ModulesListApp.onOpenSupport
    }
  };

  /** @override */
  static PARTS = {
    list: {
      template: `modules/${MODULE_ID}/templates/modules-list.hbs`
    }
  };

  /**
   * Fetches the latest version from a module's GitHub-hosted module.json.
   * Uses a cache-busting query param to avoid stale responses.
   * @param {string} manifestUrl - Raw GitHub URL to the module.json
   * @returns {Promise<string|null>} The latest version string or null on failure
   */
  static async fetchLatestVersion(manifestUrl) {
    const cached = _getCached(manifestUrl);
    if (cached !== undefined) return cached;
    try {
      const response = await fetch(`${manifestUrl}?t=${Date.now()}`);
      if (!response.ok) {
        console.warn(`${MODULE_ID} | fetchLatestVersion: HTTP ${response.status} for ${manifestUrl}`);
        _setCache(manifestUrl, null);
        return null;
      }
      const data = await response.json();
      const version = data.version ?? null;
      _setCache(manifestUrl, version);
      return version;
    } catch (err) {
      console.warn(`${MODULE_ID} | Could not fetch latest version from: ${manifestUrl}`, err);
      _setCache(manifestUrl, null);
      return null;
    }
  }

  /**
   * Fetches the latest Daggerheart system version from the GitHub Releases API.
   * Uses releases/latest which is populated by GitHub Actions CI on every release.
   * The system.json on main contains placeholder URLs and cannot be used for this purpose.
   * @param {string} repo - "owner/repo" path, e.g. "Foundryborne/daggerheart"
   * @returns {Promise<string|null>} The latest version string (tag_name without leading "v"), or null on failure
   */
  static async fetchLatestSystemVersion(repo) {
    const cached = _getCached(repo);
    if (cached !== undefined) return cached;
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
      if (!response.ok) {
        _setCache(repo, null);
        return null;
      }
      const data = await response.json();
      // tag_name may or may not have a leading "v" — normalize it
      const version = data.tag_name?.replace(/^v/, "") ?? null;
      _setCache(repo, version);
      return version;
    } catch {
      _setCache(repo, null);
      return null;
    }
  }

  /**
   * Fetches the latest version from a GitLab repository's Releases API.
   * Uses the GitLab REST API v4 endpoint for releases, sorted by created_at descending.
   * @param {string} repo - "namespace/project" path, e.g. "riccisi/foundryvtt-dice-so-nice"
   * @returns {Promise<string|null>} The latest version string (tag_name without leading "v"), or null on failure
   */
  static async fetchLatestVersionGitLab(repo) {
    const cached = _getCached(repo);
    if (cached !== undefined) return cached;
    try {
      const encoded = encodeURIComponent(repo);
      const response = await fetch(
        `https://gitlab.com/api/v4/projects/${encoded}/releases?per_page=1&order_by=created_at&sort=desc`
      );
      if (!response.ok) {
        _setCache(repo, null);
        return null;
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        _setCache(repo, null);
        return null;
      }
      const version = data[0].tag_name?.replace(/^v/, "") ?? null;
      _setCache(repo, version);
      return version;
    } catch {
      _setCache(repo, null);
      return null;
    }
  }

  /**
   * Gathers status information for every module in the registry.
   * Checks installed state, active state, current version, and fetches latest from GitHub.
   * @returns {Promise<object[]>} Array of enriched module status objects
   */
  static async gatherModuleStatuses() {
    const checkThirdParty = game.settings.get(MODULE_ID, "checkThirdPartyUpdates");
    const checkThirdPartyDH = game.settings.get(MODULE_ID, "checkThirdPartyDHUpdates");

    const statuses = await Promise.all(
      MODULES.map(async (entry) => {
        const installedModule = game.modules.get(entry.id);
        const installed = !!installedModule;
        const active = installed ? installedModule.active : false;
        const currentVersion = installed ? installedModule.version : null;
        const isThirdParty = entry.category === CATEGORY.THIRD_PARTY;
        const isThirdPartyDH = entry.category === CATEGORY.THIRD_PARTY_DH;

        // Fetch version for all modules — third-party included — so version info always renders.
        // Route to the correct API: GitLab Releases, GitHub Releases, or manifest URL.
        let latestVersion;
        if (entry.useGitLabApi) {
          latestVersion = await ModulesListApp.fetchLatestVersionGitLab(entry.repo);
        } else if (entry.useReleasesApi) {
          latestVersion = await ModulesListApp.fetchLatestSystemVersion(entry.repo);
        } else {
          latestVersion = await ModulesListApp.fetchLatestVersion(entry.manifest);
        }

        // hasUpdate for third-party categories only fires when the respective setting is enabled
        const hasUpdate =
          installed && latestVersion && currentVersion &&
          (!isThirdParty || checkThirdParty) &&
          (!isThirdPartyDH || checkThirdPartyDH)
            ? foundry.utils.isNewerVersion(latestVersion, currentVersion)
            : false;

        return {
          ...entry,
          installed,
          active,
          currentVersion,
          latestVersion,
          hasUpdate,
          isThirdParty,
          isThirdPartyDH
        };
      })
    );
    return statuses;
  }

  /**
   * Prepares context data for the Handlebars template.
   * Filters modules based on showAll flag.
   * @override
   * @param {object} context - The render context
   * @returns {Promise<object>} Template data with modules array and display flags
   */
  async _prepareContext(context) {
    const allStatuses = await ModulesListApp.gatherModuleStatuses();
    // Read once so both the filtered list and updatesCount are consistent
    const ignoredUpdates = game.settings.get(MODULE_ID, "ignoredUpdates")?.modules ?? {};

    let filtered;
    if (this.filterUpdatesOnly) {
      // Show only installed modules with available updates that have not been dismissed
      filtered = allStatuses.filter((m) => {
        if (!m.installed || !m.hasUpdate) return false;
        return !ignoredUpdates[`${m.id}@${m.latestVersion}`];
      });
    } else if (this.showAll) {
      // Show all modules
      filtered = allStatuses;
    } else {
      // Show only uninstalled modules
      filtered = allStatuses.filter((m) => !m.installed);
    }

    const sortByTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

    const mustHave = filtered
      .filter((m) => m.category === CATEGORY.MUST_HAVE)
      .sort(sortByTitle);

    const recommended = filtered
      .filter((m) => m.category === CATEGORY.RECOMMENDED)
      .sort(sortByTitle);

    // Third-party DH and generic third-party modules are always shown in full view; excluded from the uninstalled/updates-only views
    const thirdPartyDH = (this.showAll && !this.filterUpdatesOnly
      ? allStatuses.filter((m) => m.category === CATEGORY.THIRD_PARTY_DH)
      : []
    ).sort(sortByTitle);

    const thirdParty = (this.showAll && !this.filterUpdatesOnly
      ? allStatuses.filter((m) => m.category === CATEGORY.THIRD_PARTY)
      : []
    ).sort(sortByTitle);

    // Add view flags to each module for template access
    const addFlag = (modules, extra = {}) => modules.map((m) => ({ ...m, filterUpdatesOnly: this.filterUpdatesOnly, ...extra }));

    // Fetch system version alongside module statuses; failures surface as null
    const systemInstalledVersion = game.system.version;
    const systemLatestVersion = await ModulesListApp.fetchLatestSystemVersion(DAGGERHEART_SYSTEM_REPO);
    const systemHasUpdate = systemLatestVersion
      ? foundry.utils.isNewerVersion(systemLatestVersion, systemInstalledVersion)
      : false;

    const ignoredSystemVersion = game.settings.get(MODULE_ID, "ignoredSystemVersion");
    const systemUpdateIgnored = systemHasUpdate && ignoredSystemVersion === systemLatestVersion;

    return {
      mustHave: addFlag(mustHave),
      recommended: addFlag(recommended),
      thirdPartyDH: addFlag(thirdPartyDH, { isThirdPartyDH: true }),
      thirdParty: addFlag(thirdParty, { isThirdParty: true }),
      showAll: this.showAll,
      filterUpdatesOnly: this.filterUpdatesOnly,
      totalCount: MODULES.length,
      installedCount: allStatuses.filter((m) => m.installed).length,
      activeCount: allStatuses.filter((m) => m.active).length,
      updatesCount: allStatuses.filter((m) => m.hasUpdate && !ignoredUpdates[`${m.id}@${m.latestVersion}`]).length,
      missingCount: allStatuses.filter((m) => !m.installed).length,
      selfRepo: SELF_REPO,
      systemInstalledVersion,
      systemLatestVersion,
      systemHasUpdate,
      systemUpdateIgnored,
      systemRepo: DAGGERHEART_SYSTEM_REPO
    };
  }

  /**
   * Action handler: opens the Foundry module installer URL for a given module.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-manifest attribute
   * @returns {void}
   */
  static onInstallModule(event, target) {
    const manifest = target.dataset.manifest;
    if (!manifest) return;

    // Opens the built-in Foundry module installer with the manifest pre-filled
    new foundry.applications.api.Dialog({
      window: { title: "Install Module" },
      content: `<p>Copy this manifest URL and paste it in the <strong>Install Module</strong> dialog (Configuration > Add-on Modules > Install Module):</p>
        <input type="text" class="dh-bm-manifest-input" value="${manifest}" readonly>`,
      buttons: [
        {
          action: "copy",
          label: "Copy URL",
          icon: "fa-solid fa-copy",
          callback: () => {
            navigator.clipboard.writeText(manifest);
            ui.notifications.info("Manifest URL copied to clipboard!");
          }
        },
        {
          action: "close",
          label: "Close",
          icon: "fa-solid fa-times"
        }
      ],
      render: (event, html) => {
        html.querySelector(".dh-bm-manifest-input")?.addEventListener("click", (e) => e.target.select());
      }
    }).render({ force: true });
  }

  /**
   * Action handler: enables an installed but inactive module via the Foundry settings API.
   * Requires GM privileges. Prompts a world reload after activation.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-module-id attribute
   * @returns {Promise<void>}
   */
  static async onEnableModule(event, target) {
    const moduleId = target.dataset.moduleId;
    if (!moduleId) return;

    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can enable modules.");
      return;
    }

    const mod = game.modules.get(moduleId);
    if (!mod) return;

    // Build the current active modules map and add the target module
    const activeModules = game.settings.get("core", "moduleConfiguration");
    activeModules[moduleId] = true;

    await game.settings.set("core", "moduleConfiguration", activeModules);
    ui.notifications.info(`${mod.title} has been enabled. The world will reload.`);
    foundry.utils.debouncedReload();
  }

  /**
   * Action handler: copies a module's manifest URL to the clipboard.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-manifest attribute
   * @returns {void}
   */
  static onCopyManifest(event, target) {
    const manifest = target.dataset.manifest;
    if (!manifest) return;
    navigator.clipboard.writeText(manifest);
    ui.notifications.info("Manifest URL copied to clipboard!");
  }

  /**
   * Action handler: dismisses an update alert and stores it in ignoredUpdates.
   * The alert will not appear again for this version.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-module-id and data-version attributes
   * @returns {Promise<void>}
   */
  static async onDismissUpdate(event, target) {
    const moduleId = target.dataset.moduleId;
    const latestVersion = target.dataset.version;
    if (!moduleId || !latestVersion) return;

    const ignoredData = game.settings.get(MODULE_ID, "ignoredUpdates");
    const modules = { ...(ignoredData?.modules ?? {}) };
    modules[`${moduleId}@${latestVersion}`] = true;
    await game.settings.set(MODULE_ID, "ignoredUpdates", { modules });

    ui.notifications.info("Update dismissed. You won't be alerted about this version again.");
    // Close the app if no more updates
    const app = Object.values(foundry.applications.instances).find(
      (a) => a.id === "dh-best-modules-list"
    );
    if (app) {
      const allStatuses = await ModulesListApp.gatherModuleStatuses();
      const activeUpdates = allStatuses.filter(
        (m) => m.installed && m.hasUpdate && !modules[`${m.id}@${m.latestVersion}`]
      );
      if (activeUpdates.length === 0) {
        app.close();
      } else {
        app.render({ force: true });
      }
    }
  }

  /**
   * Action handler: clears the dismiss flag for an update to show the alert again.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-module-id and data-version attributes
   * @returns {Promise<void>}
   */
  static async onRemindLater(event, target) {
    const moduleId = target.dataset.moduleId;
    const latestVersion = target.dataset.version;
    if (!moduleId || !latestVersion) return;

    const ignoredData = game.settings.get(MODULE_ID, "ignoredUpdates");
    const modules = { ...(ignoredData?.modules ?? {}) };
    delete modules[`${moduleId}@${latestVersion}`];
    await game.settings.set(MODULE_ID, "ignoredUpdates", { modules });

    ui.notifications.info("You'll be reminded about this update on the next world load.");
  }

  /**
   * Action handler: fetches and displays a module's changelog in a dialog.
   * Fetches from the GitHub raw URL and displays as formatted text.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-repo attribute
   * @returns {Promise<void>}
   */
  static async onViewChangelog(event, target) {
    const repo = target.dataset.repo;
    const moduleTitle = target.dataset.moduleTitle;
    if (!repo) return;

    const changelogUrl = `https://raw.githubusercontent.com/${repo}/refs/heads/main/CHANGELOG.md`;

    try {
      const response = await fetch(changelogUrl);

      if (!response.ok) {
        console.warn(`${MODULE_ID} | Changelog not found for "${moduleTitle}" — HTTP ${response.status} (${changelogUrl})`);
        return;
      }

      const content = await response.text();
      const htmlContent = ModulesListApp._formatChangelog(content);

      new foundry.applications.api.Dialog({
        window: { title: `${moduleTitle} - Changelog` },
        content: `<div class="dh-bm-changelog">${htmlContent}</div>`,
        buttons: [
          {
            action: "close",
            label: "Close",
            icon: "fa-solid fa-times"
          }
        ]
      }).render({ force: true });
    } catch (err) {
      console.warn(`${MODULE_ID} | Failed to fetch changelog for "${moduleTitle}" (${changelogUrl}):`, err);
    }
  }

  /**
   * Action handler: stores the latest system version as ignored so the dashboard
   * does not auto-open for it on subsequent world loads.
   * The badge in #ui-top will still render as outdated, but no popup will appear.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-version attribute
   * @returns {Promise<void>}
   */
  static async onIgnoreSystemUpdate(event, target) {
    const version = target.dataset.version;
    if (!version) return;
    await game.settings.set(MODULE_ID, "ignoredSystemVersion", version);
    ui.notifications.info(`System update to v${version} dismissed. You won't be alerted about this version again.`);
    const app = Object.values(foundry.applications.instances).find((a) => a.id === "dh-best-modules-list");
    if (app) app.render({ force: true });
  }

  /**
   * Action handler: opens the GitHub Releases page for the specific system version in a new tab.
   * URL is constructed as https://github.com/{repo}/releases/tag/{version}.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - The button element with data-url attribute
   * @returns {void}
   */
  static onViewSystemChangelog(event, target) {
    const url = target.dataset.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /**
   * Formats markdown changelog text to basic HTML.
   * Converts headings, lists, bold, and code blocks to HTML equivalents.
   * @param {string} markdown - Raw markdown text
   * @returns {string} HTML-formatted text
   * @private
   */
  static _formatChangelog(markdown) {
    let html = markdown
      // Escape HTML special chars first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headings
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      // Code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```/g, "").trim();
        return `<pre><code>${code}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      // Lists
      .replace(/^\- (.*?)$/gm, "<li>$1</li>")
      .replace(/^\* (.*?)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.*?)$/gm, "<li>$2</li>")
      // Wrap consecutive list items in ul
      .replace(/(<li>.*?<\/li>)/s, (match) => {
        if (!match.includes("<ul>")) {
          return `<ul>${match}</ul>`;
        }
        return match;
      })
      // Line breaks to paragraphs
      .split("\n\n")
      .map((para) => {
        if (para.trim().startsWith("<")) return para;
        if (para.trim() === "") return "";
        return `<p>${para.trim()}</p>`;
      })
      .join("");

    return html;
  }

  /**
   * Collects all active modules from game.modules and returns a formatted string.
   * Each line: "module-id vX.Y.Z"
   * @returns {string}
   * @private
   */
  static _getActiveModules() {
    return [...game.modules.values()]
      .filter(m => m.active)
      .map(m => `${m.id} v${m.version}`)
      .join("\n");
  }

  /**
   * Serializes the Foundry support report object into a readable plain-text string.
   * Each key/value pair becomes one line; nested objects (e.g. largestTexture) are expanded inline.
   * Appends a full list of active modules to aid reproduction of issues.
   * @param {object} report - The raw object returned by generateSupportReport()
   * @returns {string}
   * @private
   */
  static _formatSupportReport(report) {
    const reportLines = Object.entries(report).map(([key, value]) => {
      if (value !== null && typeof value === "object") {
        // Expand nested objects inline (e.g. largestTexture: {width, height})
        const inner = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(", ");
        return `${key}: ${inner}`;
      }
      return `${key}: ${value}`;
    }).join("\n");

    const activeModules = ModulesListApp._getActiveModules();

    return `${reportLines}\n\n--- Active Modules ---\n${activeModules}`;
  }

  /**
   * Action handler: opens a pre-filled GitHub issue for a specific module (or this module itself).
   * Generates a Foundry support report automatically and embeds it in the issue body.
   * For non-GitHub repositories, opens the issues page directly without pre-fill.
   * Triggered by the Support button in the header (no data-repo) or in a module row.
   * @param {PointerEvent} event - The click event
   * @param {HTMLElement} target - Button optionally carrying data-repo, data-url, data-module-title
   * @returns {Promise<void>}
   */
  static async onOpenSupport(event, target) {
    // Header button has no data-repo — default to this module's own repo
    const repo = target.dataset.repo ?? "brunocalado/dh-best-modules";
    const baseUrl = target.dataset.url ?? `https://github.com/${repo}`;
    const moduleTitle = target.dataset.moduleTitle ?? "Best Modules";

    // For non-GitHub repos (e.g. GitLab), open the issues page directly — pre-fill is not possible
    if (!baseUrl.includes("github.com")) {
      window.open(`${baseUrl}/issues`, "_blank", "noopener,noreferrer");
      return;
    }

    let reportText = "_Could not generate support report automatically._";
    try {
      const report = await foundry.applications.sidebar.apps.SupportDetails.generateSupportReport();
      reportText = ModulesListApp._formatSupportReport(report);
    } catch (err) {
      console.warn(`${MODULE_ID} | Could not generate Foundry support report:`, err);
    }

    const body = [
      `## Describe the problem`,
      `<!-- What happened in **${moduleTitle}**? What did you expect? How do you reproduce it? -->`,
      ``,
      `## Foundry Support Report`,
      `\`\`\``,
      reportText,
      `\`\`\``
    ].join("\n");

    const issueUrl =
      `https://github.com/${repo}/issues/new` +
      `?title=[Bug] ${moduleTitle}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(issueUrl, "_blank", "noopener,noreferrer");
  }

  /**
   * Action handler: clears the version cache and re-renders to fetch fresh data from GitHub.
   * Invalidating the cache is required so that the render does not return stale cached values.
   * @returns {Promise<void>}
   */
  static async onRefreshVersions() {
    _versionCache.clear();
    ui.notifications.info("Refreshing module versions...");
    const app = Object.values(foundry.applications.instances).find(
      (a) => a.id === "dh-best-modules-list"
    );
    if (app) app.render({ force: true });
  }
}
