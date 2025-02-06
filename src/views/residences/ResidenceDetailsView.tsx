import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getResidence, getParticipantsByResidence } from '@/api/ResidenceAPI';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from 'react-data-table-component';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useTheme } from '@/components/theme-provider';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { themes } from '@/utils/theme';


export default function ResidenceDetailsView() {
  const { id } = useParams<{ id: string }>();
  
  const { data: residence, isLoading: isResidenceLoading } = useQuery({
    queryKey: ['residence', +id!],
    queryFn: () => getResidence(+id!),
    enabled: !!id,
  });

  const { data: participants, isLoading: isParticipantsLoading } = useQuery({
    queryKey: ['participantsByResidence', +id!],
    queryFn: () => getParticipantsByResidence(+id!),
    enabled: !!id,
  });

  const [filterStatus, setFilterStatus] = useState<string>('Residencia en Curso');

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
  };

const filteredParticipants = participants?.filter((participant: any) => {
    return filterStatus === 'Todos' ? true : participant.status === filterStatus;
});

  const columns = [
    {
      name: 'Nombre',
      selector: (row: any) => row.participant.name,
      sortable: true,
    },
    {
      name: 'RUT',
      selector: (row: any) => row.participant.run,
      sortable: true,
    },
    {
      name: 'Fecha de Ingreso',
      selector: (row: any) => new Date(row.admission_date).toLocaleDateString() || '',
      sortable: true,
    },
    {
      name: 'Fecha de salida',
      selector: (row: any) => new Date(row.departure_date).toLocaleDateString() || '',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: (row: any) => (
        <Badge
          variant={row.status === 'Finalizado' ? "secondary" : row.status === 'Expulsado' ? "destructive" : "default"}
          className={row.status === 'Finalizado' ? "bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400" : row.status === 'Expulsado' ? "bg-red-500 dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-400" : row.status === 'Residencia en Curso' ? "bg-green-500 dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-400" : "bg-gray-500 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400"}
        >
          {row.status}
        </Badge>
      ),
      sortable: true,
    },
  ];

  const theme = useTheme().theme;

  const currentOccupants = participants?.filter((participant: any) => participant.status === 'Residencia en Curso' || participant.status === 'Pendiente de Salida').length || 0;

   const { setBreadcrumbItems } = useBreadcrumb()
  
      useEffect(() => {
          const rutas = [
              { label: "Escritorio", to: "/" },
              { label: "Residencias", to: "/residencias" },
          ]
          setBreadcrumbItems(rutas)
          if (residence) {
              setBreadcrumbItems([
                  ...rutas,
                  { label: `${residence.name}`, to: undefined }
              ])
          }
          
          return () => {
              setBreadcrumbItems([]) // Limpiar al desmontar
          }
      }, [residence, setBreadcrumbItems])

  if (isResidenceLoading || isParticipantsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="w-full overflow-x-hidden">
        <CardHeader className="text-sidebar-foreground border-b border-sidebar-border flex flex-row justify-between">
          <CardTitle className="flex items-center text-2xl">
            Información de la Residencia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:w-full">
              <div>
                <h3 className="text-lg font-semibold text-sidebar-foreground">{residence?.name}</h3>
                <p className="text-sm text-sidebar-ring">Nombre</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sidebar-foreground">{residence?.address}</h3>
                <p className="text-sm text-sidebar-ring">Dirección</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sidebar-foreground">{residence?.capacity}</h3>
                <p className="text-sm text-sidebar-ring">Capacidad</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sidebar-foreground">{currentOccupants}</h3>
                <p className="text-sm text-sidebar-ring">Ocupantes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-sidebar-foreground mb-2 md:mb-0">Participantes asociados</h2>
        <div className="relative w-full md:w-72">
          <Select onValueChange={handleStatusFilterChange} defaultValue="Residencia en Curso">
            <SelectTrigger className="w-full dark:text-sidebar-foreground">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Pendiente de Admision">Pendiente de Admision</SelectItem>
              <SelectItem value="Residencia en Curso">Residencia en Curso</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
              <SelectItem value="Expulsado">Expulsado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
        <DataTable
          title='Participantes'
          columns={columns}
          data={filteredParticipants || []}
          theme={theme === 'dark' ? themes.dark : themes.default}
          pagination
          paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
          highlightOnHover
          pointerOnHover
          noHeader
          noDataComponent="No hay participantes disponibles"
        />
      </div>
    </div>
  );
}
