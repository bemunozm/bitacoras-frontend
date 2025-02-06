import { getEvents } from "@/api/EventAPI";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditEventModal from "@/components/events/EditEventModal";
import DeleteEventModal from "@/components/events/DeleteEventModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { themes } from "@/utils/theme";

export default function EventTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = data?.filter((event: Event) => {
    return event.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      name: 'Descripción',
      selector: (row: Event) => row.description,
      sortable: true,
    },
    {
      name: 'Fecha',
      selector: (row: Event) => row.date,
      sortable: true,
    },
    {
      name: 'Tipo',
      selector: (row: Event) => row.type,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: Event) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedEvent(row); setIsEditOpen(true); }}>
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedEvent(row); setIsDeleteOpen(true); }} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      button: true
    }
  ];

  const theme = useTheme().theme;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
      <DataTable
        title='Eventos'
        columns={columns}
        data={filteredEvents || []}
        theme={theme === 'dark' ? themes.dark : themes.default}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay eventos registrados"
      />

      {selectedEvent && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita el evento ${selectedEvent.description}`}
            description="Rellena el formulario para editar el evento."
          >
            <EditEventModal id={selectedEvent.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar el evento ${selectedEvent.description}`}
            description={`¿Estás seguro de que deseas eliminar el evento ${selectedEvent.description}?`}
          >
            <DeleteEventModal id={selectedEvent.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
