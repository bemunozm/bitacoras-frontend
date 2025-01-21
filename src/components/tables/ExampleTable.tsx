import DataTable, { createTheme } from 'react-data-table-component'
import { useTheme } from '../theme-provider';
import { formatDate } from '@/helpers';
import { Activity } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/api/ActivityAPI';
import { getBitacorasByPeriod } from '@/api/BitacoraAPI';

export default function ExampleTable() {

    createTheme(
        'dark',
        {
            text: {
                primary: '#f0f0f0', // --sidebar-foreground
                secondary: '#c0c0c0', // --sidebar-accent-foreground
            },
            background: {
                default: 'transparent', // --custom-background
            },
            context: {
                background: '#3a3a3a', // --sidebar-accent
                text: '#f0f0f0', // --sidebar-accent-foreground
            },
            divider: {
                default: '#2a2a2a', // --sidebar-border
            },
            button: {
                default: '#3a3a3a', // --sidebar-accent
                hover: 'rgba(0,0,0,.08)',
                focus: 'rgba(255,255,255,.12)',
                disabled: 'rgba(255, 255, 255, .34)',
            },
            sortFocus: {
                default: '#3a3a3a', // --sidebar-accent
            },
        },
        'dark',
    );

    createTheme(
        'default',
        {
            text: {
                primary: '#3f3f3f', // --sidebar-foreground
                secondary: '#1a1a1a', // --sidebar-primary
            },
            background: {
                default: 'transparent', // --custom-background
            },
            context: {
                background: '#e0e0e0', // --sidebar-accent
                text: '#1a1a1a', // --sidebar-primary
            },
            divider: {
                default: '#d0d0d0', // --sidebar-border
            },
            button: {
                default: '#e0e0e0', // --sidebar-accent
                hover: 'rgba(0,0,0,.08)',
                focus: 'rgba(0,0,0,.12)',
                disabled: 'rgba(0, 0, 0, .34)',
            },
            sortFocus: {
                default: '#e0e0e0', // --sidebar-accent
            },
        },
        'default',
    );


    const columns = [
      {
        name: 'Fecha',
        selector: (row: any) => row.date,
        format: (row: any) => formatDate(row.date),
        sortable: true,
      },
      {
        name: 'Usuario',
        selector: (row: any) => row.user,
      },
      {
        name: 'Descripcion',
        selector: (row: any) => row.description,
      },
    ]

    const {data} = useQuery({
        queryFn: () => getBitacorasByPeriod('current_month'),
        queryKey: ['activities']
    })
    
    const rows = data?.map((bitacora) => 
      bitacora.activities?.map((activity: Activity) => ({
        ...activity,
        user: bitacora.users.name
      }))
    ).flat()

    const theme = useTheme().theme

    
  return (
    <DataTable
        title='Ultimas actividades registradas'
        columns={columns}
        data={rows || []}
        theme={theme === 'dark' ? 'dark' : 'default'}
        pagination
        paginationComponentOptions={ { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' } }
        highlightOnHover
        pointerOnHover
        noDataComponent="No hay actividades registradas"
    />
  )
}
