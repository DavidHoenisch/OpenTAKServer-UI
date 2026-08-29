import { buildCasevacHlzSummary, type CasevacExportData } from './casevacExport';

export interface CasevacHlzOverlay {
  uid: string;
  position: [number, number];
  label: string;
  status: 'supplied' | 'explicit-none' | 'missing';
  statusMessage: string;
  color: string;
  dashArray?: string;
}

const STATUS_STYLE = {
  supplied: { color: '#2f9e44', dashArray: undefined },
  'explicit-none': { color: '#868e96', dashArray: '4 4' },
  missing: { color: '#f08c00', dashArray: '4 4' },
} as const;

export function buildCasevacHlzOverlay(casevac: CasevacExportData): CasevacHlzOverlay | null {
  if (casevac.point?.latitude == null || casevac.point?.longitude == null) {
    return null;
  }

  const latitude = Number(casevac.point.latitude);
  const longitude = Number(casevac.point.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  const hlz = buildCasevacHlzSummary(casevac);
  const style = STATUS_STYLE[hlz.sourceStatus];

  return {
    uid: casevac.uid,
    position: [latitude, longitude],
    label: `HLZ · ${casevac.title}`,
    status: hlz.sourceStatus,
    statusMessage: hlz.statusMessage,
    color: style.color,
    dashArray: style.dashArray,
  };
}
