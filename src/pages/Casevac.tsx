import {Table, Button, Modal, Center} from '@mantine/core';
import {IconCheck, IconCircleMinus, IconX} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import axios from '@/axios_config';
import { apiRoutes } from '@/apiRoutes';
import {t} from "i18next";
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { notifications } from '@mantine/notifications';
import CasevacExportMenu from '@/components/CasevacExportMenu';
import { buildCasevacHlzSummary, type CasevacExportData } from '@/casevacExport';

interface Casevac extends CasevacExportData {
    delete_button: React.ReactNode;
    export_button: React.ReactNode;
    hlz_status?: string;
}

export default function Casevac() {
    const [casevacs, setCasevacs] = useState<Casevac[]>([]);
    const [casevactToDelete, setCasevacToDelete] = useState('');
    const [deleteCasevacOpen, setDeleteCasevacOpen] = useState(false);
    const [casevacCount, setCasevacCount] = useState(0);
    const [activePage, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Casevac>>({
        columnAccessor: 'title',
        direction: 'desc',
    });

    function deleteCasevac(uid: string) {
        axios.delete(apiRoutes.casevac, {params: {uid}}).then(r => {
            if (r.status === 200) {
                getCasevacs();
                notifications.show({
                    message: t("Successfully Deleted CasEvac"),
                    icon: <IconCheck />,
                    color: 'green',
                })
            }
        }).catch(err => {
            notifications.show({
                title: t('Failed to delete CasEvac'),
                message: err.response.data.error,
                icon: <IconX />,
                color: 'red',
            })
        })
    }

    function getCasevacs() {
        setLoading(true);
        axios.get(apiRoutes.casevac, { params: { page: activePage, per_page: pageSize, sort_by: sortStatus.columnAccessor, sort_direction: sortStatus.direction} }).then(r => {
            setLoading(false);
            if (r.status === 200) {
                setCasevacCount(r.data.total);
                let rows: Casevac[] = [];

                r.data.results.map((row: Casevac) => {
                    row.hlz_status = buildCasevacHlzSummary(row).statusMessage;
                    row.delete_button = <Button
                        onClick={() => {
                            setCasevacToDelete(row.uid);
                            setDeleteCasevacOpen(true);
                        }}
                        key={`${row.title}_delete`}
                        color="red"
                    ><IconCircleMinus size={14} /></Button>;
                    row.export_button = <CasevacExportMenu casevac={row} compact />;

                    rows.push(row);
                });

                setPage(r.data.current_page);
                setTotalPages(r.data.total_pages);
                setCasevacs(rows);
            }
        }).catch(err => {
            setLoading(false);
            notifications.show({
                title: t('Failed to get CasEvacs'),
                message: err.response.data.error,
                icon: <IconX />,
                color: 'red',
            })
        });
    }

    useEffect(() => {
        getCasevacs()
    }, [activePage, sortStatus]);

    useEffect(() => {
        setPage(1);
        getCasevacs();
    }, [pageSize]);

    return (
        <>
            <Modal opened={deleteCasevacOpen} onClose={() => setDeleteCasevacOpen(false)} title={t("Are you sure you want to delete this CasEvac?")}>
                <Center>
                    <Button onClick={() => {
                        deleteCasevac(casevactToDelete);
                        setDeleteCasevacOpen(false);
                    }}
                    mr="md"
                    >{t("Yes")}</Button>
                    <Button onClick={() => setDeleteCasevacOpen(false)}>{t("No")}</Button>
                </Center>
            </Modal>
            <Table.ScrollContainer minWidth="100%">
                <DataTable
                    withTableBorder
                    borderRadius="md"
                    shadow="sm"
                    striped
                    highlightOnHover
                    records={casevacs}
                    columns={[{accessor: "title", title: t("Title"), sortable: true}, {accessor: "timestamp", title: t("Timestamp"), sortable: true},
                        {accessor: "eud.callsign", title: t("Callsign"), sortable: true}, {accessor: "casevac", title: t("CasEvac"), sortable: true},
                        {accessor: "urgent", title: t("Urgent"), sortable: true}, {accessor: "hoist", title: t("Hoist")},
                        {accessor: "routine", title: t("Routine")}, {accessor: "version", title: t("Version"), sortable: true},
                        {accessor: "extraction_equipment", title: t("Extraction Equipment"), sortable: true}, {accessor: "ventilator", title: t("Ventilator"), sortable: true},
                        {accessor: "equipment_detail", title: t("Equipment Detail"), sortable: true}, {accessor: "litter", title: t("Litter"), sortable: true},
                        {accessor: "ambulatory", title: t("Ambulatory"), sortable: true}, {accessor: "security", title: t("Security"), sortable: true},
                        {accessor: "hlz_status", title: t("HLZ Status")},
                        {accessor: "hlz_marking", title: t("HLZ Marking"), sortable: true,
                            render: (row) => buildCasevacHlzSummary(row).marking},
                        {accessor: "marked_by", title: t("Marked By"), sortable: true}, {accessor: "hlz_remarks", title: t("HLZ Remarks"), sortable: true},
                        {accessor: "us_military", title: t("Coalition Military"), sortable: true}, {accessor: "us_civilian", title: t("Coalition Civilian"), sortable: true},
                        {accessor: "nonus_military", title: t("Non-Coalition Military"), sortable: true}, {accessor: "nonus_civilian", title: t("Non-Coalition Civilian"), sortable: true},
                        {accessor: "epw", title: t("Opposing Force or Detainee"), sortable: true}, {accessor: "child", title: t("Children"), sortable: true},
                        {accessor: "terrain_slope_dir", title: t("Terrain Slope Direction"), sortable: true}, {accessor: "terrain_rough", title: t("Rough Terrain"), sortable: true},
                        {accessor: "terrain_loose", title: t("Loose Terrain"), sortable: true}, {accessor: "terrain_other_detail", title: t("Terrain Remarks"), sortable: true},
                        {accessor: "terrain_detail", title: t("Terrain Detail"), sortable: true}, {accessor: "obstacles", title: t("Obstacles"), sortable: true},
                        {accessor: "winds_are_from", title: t("Winds From"), sortable: true}, {accessor: "zone_prot_selection", title: t("Protection Zone"), sortable: true},
                        {accessor: "medline_remarks", title: t("Remarks"), sortable: true}, {accessor: "zmist.i", title: t("Injuries Sustained"), sortable: true},
                        {accessor: "zmist.m", title: t("Mechanism of Injury"), sortable: true}, {accessor: "zmist.s", title: t("Symptoms and Signs"), sortable: true},
                        {accessor: "zmist.t", title: t("Treatment Given"), sortable: true}, {accessor: "zmist.title", title: t("Title"), sortable: true},
                        {accessor: "zmist.z", title: t("Zap Number"), sortable: true}, {accessor: "export_button", title: t("Export")},
                        {accessor: "delete_button", title: t("Delete")}
                    ]}
                    page={activePage}
                    onPageChange={(p) => setPage(p)}
                    onRecordsPerPageChange={setPageSize}
                    totalRecords={casevacCount}
                    recordsPerPage={pageSize}
                    recordsPerPageOptions={[10, 15, 20, 25, 30, 35, 40, 45, 50]}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    fetching={loading}
                    minHeight={180}
                />
            </Table.ScrollContainer>
        </>
);
}
