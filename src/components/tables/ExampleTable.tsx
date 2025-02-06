import DataTable from 'react-data-table-component'
import { useTheme } from '../theme-provider';
import { formatDate } from '@/helpers';
import { Activity } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getBitacorasByPeriod } from '@/api/BitacoraAPI';
import { themes } from '@/utils/theme';

export default function ExampleTable() {

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
        theme={theme === 'dark' ? themes.dark : themes.default }
        pagination
        paginationComponentOptions={ { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' } }
        highlightOnHover
        pointerOnHover
        noDataComponent="No hay actividades registradas"
    />
  )
}
