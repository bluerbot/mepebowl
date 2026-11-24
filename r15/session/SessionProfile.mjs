const STORAGE_KEY = 'mepebowl.session.profile.v1';

function emptyProfile() {
  return {
    version: 1,
    credentialed: false,
    markers: {
      center: 0,
      left: 0,
      right: 0
    }
  };
}

function validMarkers(markers) {
  return (
    markers &&
    ['center', 'left', 'right'].every(
      key =>
        Number.isFinite(markers[key]) &&
        markers[key] >= -1 &&
        markers[key] <= 1
    )
  );
}

export function readSessionProfile() {
  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) return emptyProfile();

  try {
    const profile = JSON.parse(stored);

    if (
      profile.version !== 1 ||
      typeof profile.credentialed !== 'boolean' ||
      !validMarkers(profile.markers)
    ) {
      return emptyProfile();
    }

    return profile;
  } catch {
    return emptyProfile();
  }
}

export function credentialMarkers(markers) {
  if (!validMarkers(markers)) {
    throw new TypeError('Invalid marker positions');
  }

  const profile = {
    version: 1,
    credentialed: true,
    markers: { ...markers }
  };

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profile)
  );

  return profile;
}

export function clearSessionProfile() {
  sessionStorage.removeItem(STORAGE_KEY);
}
