import semver from 'semver';

/**
 * Takes a version string and returns a cleaned version string.
 *
 * If the given version string is not a valid SemVer string, it attempts to parse it as a range
 * and returns the minimum version in that range. If the given string is completely invalid,
 * it returns the original string.
 *
 * @param {string} version - The version string to clean.
 * @returns {string} The cleaned version string.
 */
export default function cleanVersionString(version) {
  const parsed = semver.parse(version) || semver.minVersion(version);
  return parsed?.version ?? version;
}
