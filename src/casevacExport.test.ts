import { describe, expect, it } from 'vitest';

import {
  buildCasevacHlzSummary,
  buildNineLineReport,
  createNineLinePdf,
  formatNineLineText,
  getCasevacExportFilename,
  type CasevacExportData,
} from './casevacExport';

const casevac: CasevacExportData = {
  uid: '4bd17856-1a20-4076-a9bd-b38bdb848abc',
  title: 'MED.28.192604',
  timestamp: '2026-08-29T17:30:00Z',
  casevac: true,
  urgent: 2,
  urgent_surgical: 1,
  priority: 3,
  routine: 1,
  convenience: 0,
  hoist: true,
  extraction_equipment: false,
  ventilator: true,
  equipment_none: false,
  equipment_other: true,
  equipment_detail: 'Blood warmer',
  litter: 4,
  ambulatory: 3,
  security: 1,
  hlz_marking: 2,
  marked_by: 'Orange smoke',
  hlz_remarks: 'Marking on request only',
  us_military: 5,
  us_civilian: 0,
  nonus_military: 1,
  nonus_civilian: 0,
  epw: 0,
  child: 1,
  terrain_none: false,
  terrain_slope: true,
  terrain_slope_dir: 'NE',
  terrain_rough: true,
  terrain_loose: false,
  terrain_other: true,
  terrain_other_detail: 'Tree line on west edge',
  terrain_detail: 'Confined landing area',
  obstacles: 'Power lines south of pickup site',
  winds_are_from: 'W',
  zone_prot_selection: 0,
  medline_remarks: 'Approach from the north.',
  freq: 38.9,
  friendlies: 'HAWK element securing site',
  enemy: 'None observed',
  eud: { callsign: 'HAWK' },
  point: { latitude: 47.6205, longitude: -122.3493, hae: 28 },
  zmist: {
    z: '2',
    title: 'Patient 2',
    m: 'Fall from height',
    i: 'Suspected lower-leg fracture',
    s: 'Alert, stable pulse',
    t: 'Splinted and monitored',
  },
};

describe('CASEVAC 9-line export', () => {
  it('builds an operational HLZ summary from the details supplied by ATAK', () => {
    const hlz = buildCasevacHlzSummary(casevac);

    expect(hlz.marking).toBe('C - Smoke');
    expect(hlz.location).toBe('47.620500, -122.349300; HAE: 28 m');
    expect(hlz.markedBy).toBe('Orange smoke');
    expect(hlz.remarks).toBe('Marking on request only');
    expect(hlz.hazards).toContain('Power lines south of pickup site');
    expect(hlz.hazards).toContain('Winds from: W');
    expect(hlz.sourceStatus).toBe('supplied');
    expect(hlz.statusMessage).toBe('HLZ details supplied by ATAK');
  });

  it('maps CASEVAC fields into all nine standard lines', () => {
    const report = buildNineLineReport(casevac);

    expect(report.lines).toHaveLength(9);
    expect(report.lines[0].value).toContain('47.620500, -122.349300');
    expect(report.lines[1].value).toContain('38.9 MHz');
    expect(report.lines[1].value).toContain('HAWK');
    expect(report.lines[2].value).toContain('A - Urgent: 2');
    expect(report.lines[2].value).toContain('B - Urgent Surgical: 1');
    expect(report.lines[3].value).toContain('Hoist');
    expect(report.lines[3].value).toContain('Ventilator');
    expect(report.lines[4].value).toBe('L - Litter: 4; A - Ambulatory: 3');
    expect(report.lines[5].value).toContain('P - Possible enemy troops in area');
    expect(report.lines[6].value).toContain('C - Smoke');
    expect(report.lines[7].value).toContain('A - US Military: 5');
    expect(report.lines[7].value).toContain('C - Non-US Military: 1');
    expect(report.lines[8].value).toContain('Rough');
    expect(report.lines[8].value).toContain('Slope (NE)');
    expect(report.zmist?.mechanism).toBe('Fall from height');
  });

  it('produces a readable plain-text report with metadata, remarks, and ZMIST', () => {
    const text = formatNineLineText(casevac);

    expect(text).toContain('9-LINE MEDEVAC REQUEST');
    expect(text).toContain('1. PICKUP LOCATION');
    expect(text).toContain('9. PICKUP SITE / HAZARDS');
    expect(text).toContain('REMARKS\nApproach from the north.');
    expect(text).toContain('ZMIST - Patient 2');
    expect(text).toContain('T - Treatment: Splinted and monitored');
  });

  it('includes a complete HLZ supplement in the plain-text export', () => {
    const text = formatNineLineText(casevac);

    expect(text).toContain('HLZ SITE SUPPLEMENT');
    expect(text).toContain('Status: HLZ details supplied by ATAK');
    expect(text).toContain('Location: 47.620500, -122.349300; HAE: 28 m');
    expect(text).toContain('Marking: C - Smoke');
    expect(text).toContain('Marked by: Orange smoke');
    expect(text).toContain('HLZ remarks: Marking on request only');
    expect(text).toContain('Obstacles: Power lines south of pickup site');
    expect(text).toContain('Winds from: W');
  });

  it('uses stable, filesystem-safe filenames for either format', () => {
    expect(getCasevacExportFilename(casevac, 'txt')).toBe(
      'casevac-med-28-192604-20260829T173000Z.txt',
    );
    expect(getCasevacExportFilename(casevac, 'pdf')).toBe(
      'casevac-med-28-192604-20260829T173000Z.pdf',
    );
  });

  it('creates a valid PDF byte stream containing the report', async () => {
    const pdf = await createNineLinePdf(casevac);
    const signature = new TextDecoder().decode(pdf.slice(0, 5));

    expect(signature).toBe('%PDF-');
    expect(pdf.byteLength).toBeGreaterThan(4_000);
  });

  it('preserves incomplete reports without inventing operational values', () => {
    const report = buildNineLineReport({
      uid: casevac.uid,
      title: 'Partial report',
      timestamp: casevac.timestamp,
      point: null,
      eud: null,
    });

    expect(report.lines[0].value).toBe('Not provided');
    expect(report.lines[1].value).toBe('Not provided');
    expect(report.lines[5].value).toBe('Not provided');
    expect(report.lines[6].value).toBe('Not provided');
  });

  it('identifies the sparse HLZ payload observed in production without inventing details', () => {
    const sparseCasevac: CasevacExportData = {
      uid: '356b6e03-4123-428e-8850-033230f586c5',
      title: 'MED.29.104217',
      timestamp: '2026-08-29T17:42:17Z',
      hlz_marking: 3,
      terrain_none: true,
      zone_prot_selection: 0,
      point: { latitude: 47.6, longitude: -122.3 },
    };

    const hlz = buildCasevacHlzSummary(sparseCasevac);
    const text = formatNineLineText(sparseCasevac);

    expect(hlz.marking).toBe('D - None');
    expect(hlz.sourceStatus).toBe('explicit-none');
    expect(hlz.hazards).toBe('None reported; Protection zone code: 0');
    expect(hlz.statusMessage).toBe(
      'ATAK explicitly reported no HLZ marking and no terrain hazards',
    );
    expect(text).toContain(
      'Status: ATAK explicitly reported no HLZ marking and no terrain hazards',
    );
  });

  it('does not treat an omitted HLZ field as explicitly reported none', () => {
    const markingOnly = buildCasevacHlzSummary({
      uid: 'marking-only',
      title: 'Marking only',
      timestamp: casevac.timestamp,
      hlz_marking: 3,
    });
    const terrainOnly = buildCasevacHlzSummary({
      uid: 'terrain-only',
      title: 'Terrain only',
      timestamp: casevac.timestamp,
      terrain_none: true,
    });

    expect(markingOnly.statusMessage).toBe(
      'ATAK explicitly reported no HLZ marking; terrain hazards were not provided',
    );
    expect(terrainOnly.statusMessage).toBe(
      'ATAK explicitly reported no terrain hazards; HLZ marking was not provided',
    );
  });

  it('treats ATAK protected-zone coordinates as supplied HLZ details', () => {
    const protectedZoneCasevac: CasevacExportData = {
      uid: 'protected-zone',
      title: 'MED.29.133718',
      timestamp: casevac.timestamp,
      hlz_marking: 3,
      terrain_none: true,
      zone_protected_coord: '10T\u200e EH\u200e 12345\u200e 67890',
      zone_prot_marker: '47.610000,-122.330000,100,10,10,0',
      point: { latitude: 47.6, longitude: -122.3 },
    };

    const hlz = buildCasevacHlzSummary(protectedZoneCasevac);
    const text = formatNineLineText(protectedZoneCasevac);

    expect(hlz.sourceStatus).toBe('supplied');
    expect(hlz.statusMessage).toBe('HLZ details supplied by ATAK');
    expect(hlz.protectedCoordinate).toBe('10T EH 12345 67890');
    expect(text).toContain('Protected zone coordinate: 10T EH 12345 67890');
  });
});
