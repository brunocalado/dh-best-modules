/**
 * Module-wide constants — dependency-free leaf, safe to import anywhere without circular-import risk.
 * All shared identifiers (setting keys, flag keys, template paths) belong here as they arise.
 * @module constants
 */

export const MODULE_ID = "dh-best-modules";

/** GitHub repository path for this module itself. */
export const SELF_REPO = "brunocalado/dh-best-modules";

/** GitHub repository path for the Foundryborne Daggerheart system. */
export const DAGGERHEART_SYSTEM_REPO = "Foundryborne/daggerheart";

/**
 * Category constants for module classification in the dashboard registry.
 * @enum {string}
 */
export const CATEGORY = {
  MUST_HAVE: "must-have",
  RECOMMENDED: "recommended",
  THIRD_PARTY_DH: "third-party-dh",
  THIRD_PARTY: "third-party"
};
