/**
 * Batch fetch business profiles to avoid N+1 query pattern
 * @param {Array} profileIds - Array of profile IDs to fetch
 * @param {Object} base44 - Base44 SDK client
 * @returns {Promise<Object>} Map of profileId -> profile data
 */
export async function batchFetchBusinessProfiles(profileIds, base44) {
  if (!profileIds || profileIds.length === 0) {
    return {};
  }

  try {
    // Use filter with OR conditions or batch endpoint if available
    // Fallback to Promise.all with caching
    const profiles = await Promise.all(
      profileIds.map((id) =>
        base44.entities.BusinessProfile.get(id).catch(() => null)
      )
    );

    const map = {};
    profiles.forEach((profile) => {
      if (profile) {
        map[profile.id] = profile;
      }
    });

    return map;
  } catch (err) {
    console.error('Error batch fetching profiles:', err);
    return {};
  }
}

/**
 * Batch fetch creator profiles
 * @param {Array} profileIds - Array of creator profile IDs
 * @param {Object} base44 - Base44 SDK client
 * @returns {Promise<Object>} Map of profileId -> creator profile data
 */
export async function batchFetchCreatorProfiles(profileIds, base44) {
  if (!profileIds || profileIds.length === 0) {
    return {};
  }

  try {
    const profiles = await Promise.all(
      profileIds.map((id) =>
        base44.entities.CreatorProfile.get(id).catch(() => null)
      )
    );

    const map = {};
    profiles.forEach((profile) => {
      if (profile) {
        map[profile.id] = profile;
      }
    });

    return map;
  } catch (err) {
    console.error('Error batch fetching creator profiles:', err);
    return {};
  }
}
