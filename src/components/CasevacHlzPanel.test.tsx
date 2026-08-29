import { screen } from '@testing-library/react';

import { render } from '../../test-utils';
import CasevacHlzPanel from './CasevacHlzPanel';

const suppliedHlz = {
  uid: 'casevac-1',
  title: 'MED.29.104217',
  timestamp: '2026-08-29T17:42:17Z',
  hlz_marking: 2,
  marked_by: 'Green smoke',
  hlz_remarks: 'Mark on final approach',
  terrain_rough: true,
  obstacles: 'Power lines to the south',
  winds_are_from: 'West',
  point: { latitude: 47.6205, longitude: -122.3493, hae: 28 },
};

it('shows the complete HLZ picture supplied with a CASEVAC', () => {
  render(<CasevacHlzPanel casevac={suppliedHlz} />);

  expect(screen.getByRole('heading', { name: 'Helicopter Landing Zone' })).toBeInTheDocument();
  expect(screen.getByText('HLZ details supplied by ATAK')).toBeInTheDocument();
  expect(screen.getByText('47.620500, -122.349300; HAE: 28 m')).toBeInTheDocument();
  expect(screen.getByText('C - Smoke')).toBeInTheDocument();
  expect(screen.getByText('Green smoke')).toBeInTheDocument();
  expect(screen.getByText('Mark on final approach')).toBeInTheDocument();
  expect(screen.getByText(/Power lines to the south/)).toBeInTheDocument();
  expect(screen.getByText(/Winds from: West/)).toBeInTheDocument();
});

it('warns when ATAK sent a pickup point without additional HLZ details', () => {
  render(
    <CasevacHlzPanel
      casevac={{
        uid: 'casevac-2',
        title: 'MED.29.104218',
        timestamp: '2026-08-29T17:43:17Z',
        hlz_marking: 3,
        terrain_none: true,
        zone_prot_selection: 0,
        point: { latitude: 47.6, longitude: -122.3 },
      }}
    />,
  );

  expect(
    screen.getByText('ATAK explicitly reported no HLZ marking and no terrain hazards'),
  ).toBeInTheDocument();
  expect(screen.getByText('D - None')).toBeInTheDocument();
  expect(screen.getByText(/ATAK sent no marker identity, remarks, obstacles/)).toBeInTheDocument();
  expect(screen.getByText(/Protection zone code: 0/)).toBeInTheDocument();
});
