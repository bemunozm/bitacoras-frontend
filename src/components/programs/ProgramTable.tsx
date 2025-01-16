import { getPrograms } from "@/api/ProgramAPI";
import { Program } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUpDown, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditProgramModal from "@/components/programs/EditProgramModal";
import DeleteProgramModal from "@/components/programs/DeleteProgramModal";

export default function ProgramTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Program;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Program) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const filteredAndSortedPrograms = data && data
    .filter(program =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="overflow-x-auto rounded-md border dark:border-sidebar-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Nombre</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('company')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Mandante</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('address')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Dirección</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('state')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Región</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedPrograms && filteredAndSortedPrograms.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium dark:text-sidebar-foreground">{program.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{program.company}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{program.address}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{program.state}</TableCell>
              <TableCell className="dark:text-sidebar-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedProgram(program);
                      setIsEditOpen(true);
                    }}>
                      <SquarePen className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedProgram(program);
                      setIsDeleteOpen(true);
                    }} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
