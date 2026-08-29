import { Alert, Box, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconFlag,
  IconHelicopterLanding,
  IconMapPin,
  IconMessage,
  IconUser,
} from '@tabler/icons-react';

import { buildCasevacHlzSummary, type CasevacExportData } from '@/casevacExport';
import classes from './CasevacHlzPanel.module.css';

interface CasevacHlzPanelProps {
  casevac: CasevacExportData;
}

interface HlzDetailProps {
  icon: typeof IconMapPin;
  label: string;
  value: string;
  coordinate?: boolean;
}

function HlzDetail({ icon: Icon, label, value, coordinate = false }: HlzDetailProps) {
  return (
    <Group align="flex-start" gap="sm" wrap="nowrap" className={classes.detail}>
      <ThemeIcon variant="light" color="blue" size="sm" radius="sm">
        <Icon size={14} stroke={1.8} />
      </ThemeIcon>
      <Box>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {label}
        </Text>
        <Text
          size="sm"
          fw={600}
          className={`${classes.value} ${coordinate ? classes.coordinate : ''}`}
        >
          {value}
        </Text>
      </Box>
    </Group>
  );
}

export default function CasevacHlzPanel({ casevac }: CasevacHlzPanelProps) {
  const hlz = buildCasevacHlzSummary(casevac);
  const needsAttention = hlz.sourceStatus !== 'supplied';
  const statusColor = needsAttention ? 'orange' : 'teal';

  return (
    <Paper withBorder radius="md" className={classes.panel}>
      <div className={`${classes.statusBar} ${needsAttention ? classes.statusBarMissing : ''}`} />
      <Stack gap="md" p="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="red" variant="filled" size="lg" radius="sm">
              <IconHelicopterLanding size={20} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Text component="h3" fw={800} size="sm" className={classes.heading}>
                Helicopter Landing Zone
              </Text>
              <Text size="xs" c={statusColor} fw={700}>
                {hlz.statusMessage}
              </Text>
            </Box>
          </Group>
        </Group>

        {needsAttention && (
          <Alert color="orange" variant="light" icon={<IconAlertTriangle size={18} />}>
            {hlz.sourceStatus === 'explicit-none'
              ? 'ATAK sent no marker identity, remarks, obstacles, or wind details with this CASEVAC.'
              : 'The CASEVAC identifies the pickup point, but ATAK sent no HLZ marking selection, marker identity, remarks, terrain, obstacles, or wind details.'}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <HlzDetail icon={IconMapPin} label="Pickup point" value={hlz.location} coordinate />
          <HlzDetail icon={IconFlag} label="Marking" value={hlz.marking} />
          <HlzDetail icon={IconUser} label="Marked by" value={hlz.markedBy} />
          <HlzDetail icon={IconMessage} label="HLZ remarks" value={hlz.remarks} />
          <HlzDetail
            icon={IconMapPin}
            label="Protected zone coordinate"
            value={hlz.protectedCoordinate}
            coordinate
          />
        </SimpleGrid>

        <HlzDetail icon={IconAlertTriangle} label="Terrain / hazards" value={hlz.hazards} />
      </Stack>
    </Paper>
  );
}
