
const BALL_START = Object.freeze({
  x: 45,
  z: 0.55
});

const LATERAL_ENVELOPE = Object.freeze({
  axis: 'y',
  min: -2.4,
  max: 2.4
});

const MARKER_NAMES = ['center', 'left', 'right'];

function validMarkers(markers) {
  return (
    markers &&
    MARKER_NAMES.every(
      name =>
        Number.isFinite(markers[name]) &&
        markers[name] >= -1 &&
        markers[name] <= 1
    )
  );
}

function markerTarget(normalizedPosition) {
  const y = normalizedPosition * LATERAL_ENVELOPE.max;

  return {
    y: Math.max(
      LATERAL_ENVELOPE.min,
      Math.min(LATERAL_ENVELOPE.max, y)
    )
  };
}

export function createStartConfig(profile) {
  const credentialed = profile?.credentialed === true;

  if (credentialed && !validMarkers(profile.markers)) {
    throw new TypeError('Invalid credentialed session markers');
  }

  const markers = credentialed
    ? Object.fromEntries(
        MARKER_NAMES.map(name => [
          name,
          markerTarget(profile.markers[name])
        ])
      )
    : null;

  return {
    version: 1,

    stance: {
      position: {
        x: BALL_START.x,
        y: markers?.center.y ?? 0,
        z: BALL_START.z
      },
      rotation: { x: 0, y: 0, z: 0 }
    },

    envelope: {
      ...LATERAL_ENVELOPE,
      ballRadius: BALL_START.z
    },

    markers,

    selection: {
      source: credentialed ? 'session-profile' : 'default',
      marker: 'center',
      credentialed
    },

    relevance: {
      sessionProfileVersion: profile?.version ?? null
    },

    notices: []
  };
}

export function selectStartMarker(config, markerName) {
  if (!config.markers || !config.markers[markerName]) {
    throw new TypeError(`Unavailable start marker: ${markerName}`);
  }

  const target = config.markers[markerName];

  return {
    ...config,
    stance: {
      ...config.stance,
      position: {
        ...config.stance.position,
        y: target.y
      }
    },
    selection: {
      ...config.selection,
      marker: markerName
    }
  };
}
