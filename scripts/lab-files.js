'use strict';

/**
 * Where a lab's site copy lives.
 *
 * Guided labs (`lab_format: missions`) keep their site copy in
 * `_labs/mission-<slug>.md`, so authors can tell the two formats apart in the
 * folder; classic labs stay at `_labs/<slug>.md`. The prefix is only a file
 * naming convention. The lab's identity stays the unprefixed slug, pinned by
 * `slug` and `permalink` front matter, so its URL, its README folder
 * (`labs/<slug>/`), agendas, modules and the content feed all keep `<slug>`.
 */

const fs = require('node:fs');
const path = require('node:path');

const MISSION_PREFIX = 'mission-';
const SLUG_RE = /^[A-Za-z0-9_-]+$/;

/** The lab slug for a `_labs` file name: `mission-x.md` and `x.md` both mean lab `x`. */
function labSlugFromSource(filename) {
  const name = path.basename(filename, '.md');
  return name.startsWith(MISSION_PREFIX) ? name.slice(MISSION_PREFIX.length) : name;
}

/**
 * Path of a lab's site copy: the mission file when it exists, otherwise the
 * classic path (which may not exist yet, for a new lab). Throws when both
 * exist, because both would publish to the same URL.
 */
function labSourcePath(root, slug) {
  // Slugs come from file names and command-line arguments; keep them inside _labs/.
  if (typeof slug !== 'string' || !slug || /[\\/]/.test(slug)) throw new Error(`Invalid lab slug: ${slug}`);
  const classic = path.join(root, '_labs', `${slug}.md`);
  const mission = path.join(root, '_labs', `${MISSION_PREFIX}${slug}.md`);
  const hasMission = fs.existsSync(mission);
  if (hasMission && fs.existsSync(classic)) {
    throw new Error(`Both _labs/${slug}.md and _labs/${MISSION_PREFIX}${slug}.md exist; keep one site copy for lab ${slug}.`);
  }
  return hasMission ? mission : classic;
}

/**
 * The published slug of a collection file. A `mission-` lab file must pin its
 * unprefixed identity in front matter, otherwise Jekyll would publish it under
 * the prefixed name and break every link to the lab.
 */
function sourceSlug(collection, filename, metadata = {}) {
  const name = path.basename(filename, '.md');
  if (collection !== 'labs' || !name.startsWith(MISSION_PREFIX)) return name;
  const slug = labSlugFromSource(filename);
  if (!SLUG_RE.test(slug) || metadata.lab_format !== 'missions' ||
      metadata.slug !== slug || metadata.permalink !== `/labs/${slug}/`) {
    throw new Error(`_labs/${name}.md must set lab_format: missions, slug: ${slug} and permalink: /labs/${slug}/ to keep the lab's unprefixed URL.`);
  }
  return slug;
}

module.exports = { MISSION_PREFIX, labSlugFromSource, labSourcePath, sourceSlug };
