const allowedFormats = `
------------- BEGIN RELEASE NOTES ------------------
A single release note.
------------- END RELEASE NOTES --------------------

or

------------- BEGIN RELEASE NOTES ------------------
* Multiple release notes
* As separate bullets
------------- END RELEASE NOTES --------------------

or

------------- BEGIN RELEASE NOTES ------------------
NO RELEASE NOTES
------------- END RELEASE NOTES --------------------
`;

const RELEASE_NOTES_REGEX =
  /^-+\s*BEGIN RELEASE NOTES\s*-+$\s*(.*)\s*^-+\s*END RELEASE NOTES\s*-+$/gms;

const BULLET_POINT_REGEX = /^\s*[*-]\s*(.+)\s*$/gm;

export function getReleaseNotesFromPrBody(prBody: string): string[] {
  const releaseNotesMatches = prBody.matchAll(RELEASE_NOTES_REGEX);

  // using ... to convert iterator to array
  const releaseNotesMatchesArray = [...releaseNotesMatches];
  if (releaseNotesMatchesArray.length === 0) {
    throw new Error(
      `Release notes section not found in PR body. Valid formats are: ${allowedFormats}`
    );
  }
  if (releaseNotesMatchesArray.length !== 1) {
    throw new Error(
      `Expected 1 release notes section in PR, but found ${releaseNotesMatchesArray.length}. Valid formats are: ${allowedFormats}`
    );
  }

  const releaseNotesMatch = releaseNotesMatchesArray[0];

  if (releaseNotesMatch.length !== 2) {
    throw new Error(
      `Release notes section in PR is malformed. Valid formats are: ${allowedFormats}`
    );
  }

  const releaseNotesSection = releaseNotesMatch[1].trim();

  if (releaseNotesSection === "") {
    throw new Error(
      `Release notes section is empty. This is an error.

If you intend for this PR to have no release notes, please write \`NO RELEASE NOTES\` in the release notes section`
    );
  }

  if (releaseNotesSection.toUpperCase() === "NO RELEASE NOTES") {
    return [];
  }

  const bulletsMatches = [...releaseNotesSection.matchAll(BULLET_POINT_REGEX)];

  if (bulletsMatches.length === 0) {
    // if there's text but no bullet points, the text is interpreted as a single release note.
    return [releaseNotesSection];
  }

  return bulletsMatches.map((match) => match[1]);
}
