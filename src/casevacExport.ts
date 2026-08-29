export interface CasevacExportData {
  uid: string;
  title: string;
  timestamp: string;
  version?: string | number | null;
  callsign?: string | null;
  casevac?: boolean | null;
  urgent?: number | null;
  urgent_surgical?: number | string | null;
  priority?: number | null;
  routine?: number | null;
  convenience?: number | null;
  hoist?: boolean | null;
  extraction_equipment?: boolean | null;
  ventilator?: boolean | null;
  equipment_none?: boolean | null;
  equipment_other?: boolean | null;
  equipment_detail?: string | null;
  litter?: number | null;
  ambulatory?: number | null;
  security?: number | string | null;
  hlz_marking?: number | string | null;
  marked_by?: string | null;
  hlz_remarks?: string | null;
  us_military?: number | null;
  us_civilian?: number | null;
  nonus_military?: number | null;
  nonus_civilian?: number | null;
  epw?: number | null;
  child?: number | null;
  terrain_none?: boolean | null;
  terrain_slope?: boolean | null;
  terrain_slope_dir?: string | null;
  terrain_rough?: boolean | null;
  terrain_loose?: boolean | null;
  terrain_other?: boolean | null;
  terrain_other_detail?: string | null;
  terrain_detail?: string | null;
  obstacles?: string | null;
  winds_are_from?: string | null;
  zone_prot_selection?: number | string | null;
  medline_remarks?: string | null;
  freq?: number | string | null;
  friendlies?: string | null;
  enemy?: string | number | null;
  eud?: { callsign?: string | null } | null;
  point?: {
    latitude?: number | null;
    longitude?: number | null;
    hae?: number | null;
  } | null;
  zmist?: {
    z?: string | number | null;
    title?: string | null;
    m?: string | null;
    i?: string | null;
    s?: string | null;
    t?: string | null;
  } | null;
}

export interface NineLineReport {
  title: string;
  uid: string;
  timestamp: string;
  reportingCallsign: string;
  lines: Array<{ number: number; label: string; value: string }>;
  remarks?: string;
  zmist?: {
    title: string;
    zapNumber: string;
    mechanism: string;
    injuries: string;
    signs: string;
    treatment: string;
  };
}

type ExportFormat = 'txt' | 'pdf';

const NOT_PROVIDED = 'Not provided';
const SECURITY_LABELS = [
  'N - No enemy troops in area',
  'P - Possible enemy troops in area; approach with caution',
  'E - Enemy troops in area; approach with caution',
  'X - Enemy troops in area close by; armed escort required',
];
const MARKING_LABELS = [
  'A - Panels',
  'B - Pyrotechnic signal',
  'C - Smoke',
  'D - None',
  'E - Other',
];

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

function textValue(value: unknown): string {
  return hasValue(value) ? String(value) : NOT_PROVIDED;
}

function codedValue(value: number | string | null | undefined, labels: string[]): string {
  if (!hasValue(value)) {
    return NOT_PROVIDED;
  }

  const index = typeof value === 'number' ? value : Number(value);
  if (Number.isInteger(index) && labels[index]) {
    return labels[index];
  }
  return `Code ${String(value)}`;
}

function joinProvided(values: Array<string | null | undefined>): string {
  const provided = values.filter((value): value is string => Boolean(value));
  return provided.length > 0 ? provided.join('; ') : NOT_PROVIDED;
}

function countLine(entries: Array<[string, number | string | null | undefined]>): string {
  const provided = entries
    .filter(([, value]) => hasValue(value))
    .map(([label, value]) => `${label}: ${String(value)}`);
  return provided.length > 0 ? provided.join('; ') : NOT_PROVIDED;
}

function equipmentLine(casevac: CasevacExportData): string {
  if (casevac.equipment_none) {
    return 'A - None';
  }

  return joinProvided([
    casevac.hoist ? 'B - Hoist' : null,
    casevac.extraction_equipment ? 'C - Extraction equipment' : null,
    casevac.ventilator ? 'D - Ventilator' : null,
    casevac.equipment_other ? 'E - Other' : null,
    hasValue(casevac.equipment_detail) ? `Detail: ${casevac.equipment_detail}` : null,
  ]);
}

function terrainLine(casevac: CasevacExportData): string {
  const terrain = casevac.terrain_none
    ? ['None reported']
    : [
        casevac.terrain_rough ? 'Rough' : null,
        casevac.terrain_loose ? 'Loose' : null,
        casevac.terrain_slope
          ? `Slope${hasValue(casevac.terrain_slope_dir) ? ` (${casevac.terrain_slope_dir})` : ''}`
          : null,
        casevac.terrain_other ? 'Other terrain' : null,
      ];

  return joinProvided([
    ...terrain,
    hasValue(casevac.terrain_other_detail) ? `Other: ${casevac.terrain_other_detail}` : null,
    hasValue(casevac.terrain_detail) ? `Terrain detail: ${casevac.terrain_detail}` : null,
    hasValue(casevac.obstacles) ? `Obstacles: ${casevac.obstacles}` : null,
    hasValue(casevac.winds_are_from) ? `Winds from: ${casevac.winds_are_from}` : null,
    hasValue(casevac.zone_prot_selection)
      ? `Protection zone code: ${casevac.zone_prot_selection}`
      : null,
  ]);
}

export function buildNineLineReport(casevac: CasevacExportData): NineLineReport {
  const latitude = casevac.point?.latitude;
  const longitude = casevac.point?.longitude;
  const location =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? joinProvided([
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          typeof casevac.point?.hae === 'number' ? `HAE: ${casevac.point.hae} m` : null,
        ])
      : NOT_PROVIDED;
  const callsign = casevac.eud?.callsign || casevac.callsign || '';
  const frequency = hasValue(casevac.freq) ? `${casevac.freq} MHz` : '';
  const security = codedValue(casevac.security, SECURITY_LABELS);
  const securityContext = joinProvided([
    security === NOT_PROVIDED ? null : security,
    hasValue(casevac.friendlies) ? `Friendlies: ${casevac.friendlies}` : null,
    hasValue(casevac.enemy) ? `Enemy: ${casevac.enemy}` : null,
  ]);
  const marking = codedValue(casevac.hlz_marking, MARKING_LABELS);

  return {
    title: casevac.title || 'Untitled CASEVAC',
    uid: casevac.uid,
    timestamp: casevac.timestamp,
    reportingCallsign: callsign || NOT_PROVIDED,
    lines: [
      { number: 1, label: 'Pickup Location', value: location },
      {
        number: 2,
        label: 'Radio Frequency / Callsign',
        value: joinProvided([frequency || null, callsign || null]),
      },
      {
        number: 3,
        label: 'Patients by Precedence',
        value: countLine([
          ['A - Urgent', casevac.urgent],
          ['B - Urgent Surgical', casevac.urgent_surgical],
          ['C - Priority', casevac.priority],
          ['D - Routine', casevac.routine],
          ['E - Convenience', casevac.convenience],
        ]),
      },
      { number: 4, label: 'Special Equipment Required', value: equipmentLine(casevac) },
      {
        number: 5,
        label: 'Patients by Type',
        value: countLine([
          ['L - Litter', casevac.litter],
          ['A - Ambulatory', casevac.ambulatory],
        ]),
      },
      { number: 6, label: 'Security at Pickup Site', value: securityContext },
      {
        number: 7,
        label: 'Method of Marking Pickup Site',
        value: joinProvided([
          marking === NOT_PROVIDED ? null : marking,
          hasValue(casevac.marked_by) ? `Marked by: ${casevac.marked_by}` : null,
          hasValue(casevac.hlz_remarks) ? `Remarks: ${casevac.hlz_remarks}` : null,
        ]),
      },
      {
        number: 8,
        label: 'Patient Nationality / Status',
        value: countLine([
          ['A - Coalition Military', casevac.us_military],
          ['B - Coalition Civilian', casevac.us_civilian],
          ['C - Non-Coalition Military', casevac.nonus_military],
          ['D - Non-Coalition Civilian', casevac.nonus_civilian],
          ['E - Opposing Force / Detainee', casevac.epw],
          ['F - Children', casevac.child],
        ]),
      },
      { number: 9, label: 'Pickup Site / Hazards', value: terrainLine(casevac) },
    ],
    remarks: hasValue(casevac.medline_remarks) ? String(casevac.medline_remarks) : undefined,
    zmist: casevac.zmist
      ? {
          title: casevac.zmist.title || 'Patient',
          zapNumber: textValue(casevac.zmist.z),
          mechanism: textValue(casevac.zmist.m),
          injuries: textValue(casevac.zmist.i),
          signs: textValue(casevac.zmist.s),
          treatment: textValue(casevac.zmist.t),
        }
      : undefined,
  };
}

export function formatNineLineText(casevac: CasevacExportData): string {
  const report = buildNineLineReport(casevac);
  const sections = [
    '9-LINE MEDEVAC REQUEST',
    `Title: ${report.title}`,
    `Reported: ${report.timestamp || NOT_PROVIDED}`,
    `Reporting callsign: ${report.reportingCallsign}`,
    `UID: ${report.uid}`,
    '',
    ...report.lines.flatMap((line) => [
      `${line.number}. ${line.label.toUpperCase()}`,
      line.value,
      '',
    ]),
  ];

  if (report.remarks) {
    sections.push('REMARKS', report.remarks, '');
  }
  if (report.zmist) {
    sections.push(
      `ZMIST - ${report.zmist.title}`,
      `Z - Zap number: ${report.zmist.zapNumber}`,
      `M - Mechanism: ${report.zmist.mechanism}`,
      `I - Injuries: ${report.zmist.injuries}`,
      `S - Signs / symptoms: ${report.zmist.signs}`,
      `T - Treatment: ${report.zmist.treatment}`,
      '',
    );
  }

  return `${sections.join('\n').trimEnd()}\n`;
}

function compactTimestamp(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return 'undated';
  }
  return parsed
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function safeSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'report'
  );
}

export function getCasevacExportFilename(casevac: CasevacExportData, format: ExportFormat): string {
  return `casevac-${safeSlug(casevac.title)}-${compactTimestamp(casevac.timestamp)}.${format}`;
}

export async function createNineLinePdf(casevac: CasevacExportData): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');
  const report = buildNineLineReport(casevac);
  const document = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 48;
  let y = 0;

  document.setProperties({
    title: `9-Line MEDEVAC - ${report.title}`,
    subject: 'CASEVAC 9-line export',
    author: 'OpenTAKServer',
    creator: 'OpenTAKServer WebUI',
  });

  const drawPageHeader = (continuation = false) => {
    document.setFillColor(16, 42, 67);
    document.rect(0, 0, pageWidth, 70, 'F');
    document.setFillColor(190, 30, 45);
    document.rect(0, 0, 10, 70, 'F');
    document.setTextColor(255, 255, 255);
    document.setFont('helvetica', 'bold');
    document.setFontSize(18);
    document.text('9-LINE MEDEVAC REQUEST', margin, 31);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text(continuation ? `${report.title} - continued` : report.title, margin, 50);
    document.setTextColor(20, 32, 43);
    y = 92;
  };

  const nextPageIfNeeded = (height: number) => {
    if (y + height <= bottomLimit) {
      return;
    }
    document.addPage();
    drawPageHeader(true);
  };

  const drawBlock = (heading: string, value: string) => {
    document.setFont('helvetica', 'normal');
    document.setFontSize(9.5);
    const wrapped = document.splitTextToSize(value, contentWidth - 28) as string[];
    const height = 31 + wrapped.length * 12;
    nextPageIfNeeded(height + 8);
    document.setFillColor(244, 247, 249);
    document.roundedRect(margin, y, contentWidth, height, 3, 3, 'F');
    document.setTextColor(75, 85, 99);
    document.setFont('helvetica', 'bold');
    document.setFontSize(8);
    document.text(heading.toUpperCase(), margin + 14, y + 17);
    document.setTextColor(20, 32, 43);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9.5);
    document.text(wrapped, margin + 14, y + 34);
    y += height + 8;
  };

  drawPageHeader();
  document.setFontSize(8.5);
  document.setTextColor(75, 85, 99);
  document.text(`REPORTED  ${report.timestamp || NOT_PROVIDED}`, margin, y);
  document.text(`CALLSIGN  ${report.reportingCallsign}`, margin + 260, y);
  y += 25;

  for (const line of report.lines) {
    document.setFont('helvetica', 'normal');
    document.setFontSize(9.5);
    const wrapped = document.splitTextToSize(line.value, contentWidth - 86) as string[];
    const height = Math.max(52, 31 + wrapped.length * 12);
    nextPageIfNeeded(height + 8);

    document.setFillColor(247, 248, 250);
    document.roundedRect(margin, y, contentWidth, height, 3, 3, 'F');
    document.setFillColor(190, 30, 45);
    document.roundedRect(margin, y, 48, height, 3, 3, 'F');
    document.setTextColor(255, 255, 255);
    document.setFont('helvetica', 'bold');
    document.setFontSize(20);
    document.text(String(line.number), margin + 24, y + height / 2 + 7, { align: 'center' });
    document.setTextColor(75, 85, 99);
    document.setFontSize(8);
    document.text(line.label.toUpperCase(), margin + 62, y + 17);
    document.setTextColor(20, 32, 43);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9.5);
    document.text(wrapped, margin + 62, y + 34);
    y += height + 8;
  }

  if (report.remarks) {
    drawBlock('Remarks', report.remarks);
  }
  if (report.zmist) {
    drawBlock(
      `ZMIST - ${report.zmist.title}`,
      [
        `Z - Zap number: ${report.zmist.zapNumber}`,
        `M - Mechanism: ${report.zmist.mechanism}`,
        `I - Injuries: ${report.zmist.injuries}`,
        `S - Signs / symptoms: ${report.zmist.signs}`,
        `T - Treatment: ${report.zmist.treatment}`,
      ].join('\n'),
    );
  }

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setDrawColor(216, 222, 228);
    document.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);
    document.setFont('helvetica', 'normal');
    document.setFontSize(7.5);
    document.setTextColor(100, 110, 120);
    document.text(`OpenTAKServer | ${report.uid}`, margin, pageHeight - 18);
    document.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 18, {
      align: 'right',
    });
  }

  return document.output('arraybuffer');
}

function triggerDownload(content: BlobPart, mimeType: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadCasevacExport(casevac: CasevacExportData, format: ExportFormat) {
  if (format === 'txt') {
    triggerDownload(
      formatNineLineText(casevac),
      'text/plain;charset=utf-8',
      getCasevacExportFilename(casevac, format),
    );
    return;
  }

  const pdf = await createNineLinePdf(casevac);
  triggerDownload(pdf, 'application/pdf', getCasevacExportFilename(casevac, format));
}
