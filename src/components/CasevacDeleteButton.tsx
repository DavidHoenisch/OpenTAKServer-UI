import { Button, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { useState } from 'react';

import { apiRoutes } from '@/apiRoutes';
import axios from '@/axios_config';

interface CasevacDeleteTarget {
  uid: string;
  title: string;
}

interface CasevacDeleteButtonProps {
  casevac: CasevacDeleteTarget;
  onDeleted: (uid: string) => void;
}

export default function CasevacDeleteButton({ casevac, onDeleted }: CasevacDeleteButtonProps) {
  const [opened, setOpened] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteCasevac = async () => {
    setDeleting(true);
    try {
      await axios.delete(apiRoutes.casevac, { params: { uid: casevac.uid } });
      onDeleted(casevac.uid);
      setOpened(false);
      notifications.show({
        message: t('Successfully Deleted CasEvac'),
        icon: <IconCheck size={17} />,
        color: 'green',
      });
    } catch (error) {
      const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
      notifications.show({
        title: t('Failed to delete CasEvac'),
        message: message ?? t('The CASEVAC could not be deleted.'),
        icon: <IconX size={17} />,
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        color="red"
        variant="light"
        leftSection={<IconTrash size={16} />}
        onClick={() => setOpened(true)}
      >
        {t('Delete CASEVAC')}
      </Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('Delete CASEVAC?')}
        centered
        closeOnClickOutside={!deleting}
        closeOnEscape={!deleting}
        withCloseButton={!deleting}
      >
        <Stack gap="md">
          <Group align="flex-start" wrap="nowrap">
            <ThemeIcon color="red" variant="light" size="lg" radius="sm">
              <IconAlertTriangle size={19} />
            </ThemeIcon>
            <div>
              <Text fw={600}>
                {t('Delete this CASEVAC from the server and connected TAK devices?')}
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                {casevac.title}
              </Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed">
            {t('This action cannot be undone.')}
          </Text>
          <Group justify="flex-end">
            <Button variant="default" disabled={deleting} onClick={() => setOpened(false)}>
              {t('Cancel')}
            </Button>
            <Button
              color="red"
              loading={deleting}
              leftSection={<IconTrash size={16} />}
              onClick={deleteCasevac}
            >
              {t('Delete from network')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
