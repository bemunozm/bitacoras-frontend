import { getPrograms } from "@/api/ProgramAPI";
import { Program } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditProgramModal from "@/components/programs/EditProgramModal";
import DeleteProgramModal from "@/components/programs/DeleteProgramModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { themes } from "@/utils/theme";

export default function ProgramTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const filteredPrograms = data?.filter((program: Program) => {
    return program.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      name: 'Nombre',
      selector: (row: Program) => row.name,
      sortable: true,
    },
    {
      name: 'Mandante',
      selector: (row: Program) => row.company,
      sortable: true,
    },
    {
      name: 'Dirección',
      selector: (row: Program) => row.address,
      sortable: true,
    },
    {
      name: 'Región',
      selector: (row: Program) => row.state,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: Program) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedProgram(row); setIsEditOpen(true); }}>
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedProgram(row); setIsDeleteOpen(true); }} className="text-red-500">
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
        title='Programas'
        columns={columns}
        data={filteredPrograms || []}
        theme={theme === 'dark' ? themes.dark : themes.default}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay programas disponibles"
      />

      {selectedProgram && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita el programa ${selectedProgram.name}`}
            description="Rellena el formulario para editar el programa."
          >
            <EditProgramModal id={selectedProgram.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar el programa ${selectedProgram.name}`}
            description={`¿Estás seguro de que deseas eliminar el programa ${selectedProgram.name}?`}
          >
            <DeleteProgramModal id={selectedProgram.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
