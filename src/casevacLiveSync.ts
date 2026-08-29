export function removeCasevacFromList<T extends { uid: string }>(casevacs: T[], uid: string): T[] {
  return casevacs.filter((casevac) => casevac.uid !== uid);
}

export function removeCasevacMapLayers<TMarker, THlz>(
  uid: string,
  markerLayer: { removeLayer: (layer: TMarker) => unknown },
  markers: Record<string, TMarker>,
  hlzLayer: { removeLayer: (layer: THlz) => unknown } | null,
  hlzOverlays: Record<string, THlz>,
): boolean {
  let removed = false;

  if (Object.hasOwn(markers, uid)) {
    markerLayer.removeLayer(markers[uid]);
    delete markers[uid];
    removed = true;
  }

  if (Object.hasOwn(hlzOverlays, uid)) {
    hlzLayer?.removeLayer(hlzOverlays[uid]);
    delete hlzOverlays[uid];
    removed = true;
  }

  return removed;
}
