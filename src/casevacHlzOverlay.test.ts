import { describe, expect, it } from 'vitest';

import { buildCasevacHlzOverlay } from './casevacHlzOverlay';

describe('CASEVAC HLZ map overlay', () => {
  it('places a supplied HLZ at the CASEVAC pickup point with a ready-state halo', () => {
    expect(buildCasevacHlzOverlay({
      uid: 'casevac-1',
      title: 'MED.28.192604',
      timestamp: '2026-08-29T17:30:00Z',
      point: { latitude: 47.6205, longitude: -122.3493 },
      hlz_marking: 2,
      marked_by: 'Orange smoke',
      obstacles: 'Power lines south',
    })).toEqual({
      uid: 'casevac-1',
      position: [47.6205, -122.3493],
      label: 'HLZ · MED.28.192604',
      status: 'supplied',
      statusMessage: 'HLZ details supplied by ATAK',
      color: '#2f9e44',
      dashArray: undefined,
    });
  });

  it('does not draw an HLZ when ATAK did not supply a usable pickup point', () => {
    expect(buildCasevacHlzOverlay({
      uid: 'casevac-2',
      title: 'MED.29.104217',
      timestamp: '2026-08-29T17:42:19Z',
      point: { latitude: null, longitude: -122.3493 },
    })).toBeNull();
  });

  it('uses a dashed neutral halo when ATAK explicitly reports no HLZ marking or hazards', () => {
    expect(buildCasevacHlzOverlay({
      uid: 'casevac-3',
      title: 'MED.29.104217',
      timestamp: '2026-08-29T17:42:19Z',
      point: { latitude: 47.62, longitude: -122.34 },
      hlz_marking: 3,
      terrain_none: true,
      zone_prot_selection: 0,
    })).toMatchObject({
      status: 'explicit-none',
      color: '#868e96',
      dashArray: '4 4',
    });
  });

  it('uses a dashed amber halo when the pickup point has no HLZ details', () => {
    expect(buildCasevacHlzOverlay({
      uid: 'casevac-4',
      title: 'MED.30.000001',
      timestamp: '2026-08-29T18:00:00Z',
      point: { latitude: 47.61, longitude: -122.33 },
    })).toMatchObject({
      status: 'missing',
      color: '#f08c00',
      dashArray: '4 4',
    });
  });
});
