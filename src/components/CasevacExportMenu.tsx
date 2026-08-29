import { ActionIcon, Button, Menu } from '@mantine/core';
import { IconDownload, IconFileText, IconFileTypePdf } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { t } from 'i18next';

import { downloadCasevacExport, type CasevacExportData } from '@/casevacExport';

interface CasevacExportMenuProps {
  casevac: CasevacExportData;
  compact?: boolean;
}

export default function CasevacExportMenu({ casevac, compact = false }: CasevacExportMenuProps) {
  const exportReport = async (format: 'txt' | 'pdf') => {
    try {
      await downloadCasevacExport(casevac, format);
    } catch {
      notifications.show({
        title: t('Export failed'),
        message: t('The 9-line report could not be generated.'),
        color: 'red',
      });
    }
  };

  return (
    <Menu position="bottom-end" shadow="md" width={210} withinPortal>
      <Menu.Target>
        {compact ? (
          <ActionIcon
            aria-label={t('Export 9-Line')}
            title={t('Export 9-Line')}
            variant="light"
            size="lg"
          >
            <IconDownload size={17} />
          </ActionIcon>
        ) : (
          <Button leftSection={<IconDownload size={16} />} variant="light">
            {t('Export 9-Line')}
          </Button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('Download format')}</Menu.Label>
        <Menu.Item leftSection={<IconFileText size={17} />} onClick={() => exportReport('txt')}>
          {t('Plain text (.txt)')}
        </Menu.Item>
        <Menu.Item leftSection={<IconFileTypePdf size={17} />} onClick={() => exportReport('pdf')}>
          {t('Formatted PDF (.pdf)')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
