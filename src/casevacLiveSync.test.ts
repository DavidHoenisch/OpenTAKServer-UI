import { describe, expect, it, vi } from 'vitest';
import { removeCasevacFromList, removeCasevacMapLayers } from './casevacLiveSync';

describe('CASEVAC live deletion sync', () => {
  it('removes the deleted CASEVAC from table state', () => {
    const casevacs = [{ uid: 'keep' }, { uid: 'delete' }];

    expect(removeCasevacFromList(casevacs, 'delete')).toEqual([{ uid: 'keep' }]);
  });

  it('removes both the CASEVAC marker and its HLZ overlay from the map', () => {
    const marker = { kind: 'marker' };
    const overlay = { kind: 'overlay' };
    const markers = { delete: marker };
    const overlays = { delete: overlay };
    const markerLayer = { removeLayer: vi.fn() };
    const hlzLayer = { removeLayer: vi.fn() };

    expect(removeCasevacMapLayers('delete', markerLayer, markers, hlzLayer, overlays)).toBe(true);
    expect(markerLayer.removeLayer).toHaveBeenCalledWith(marker);
    expect(hlzLayer.removeLayer).toHaveBeenCalledWith(overlay);
    expect(markers).not.toHaveProperty('delete');
    expect(overlays).not.toHaveProperty('delete');
  });
});
