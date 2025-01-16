import { getResidences } from "@/api/ResidenceAPI";
import { Residence } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUpDown, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditResidenceModal from "@/components/residences/EditResidenceModal";
import DeleteResidenceModal from "@/components/residences/DeleteResidenceModal";

export default function ResidenceTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Residence;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Residence) => {
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

  const filteredAndSortedResidences = data && data
    .filter(residence =>
      residence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residence.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <TableHead onClick={() => handleSort('address')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Direccion</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('capacity')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Capacidad</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedResidences && filteredAndSortedResidences.map((residence) => (
            <TableRow key={residence.id}>
              <TableCell className="font-medium dark:text-sidebar-foreground">{residence.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{residence.address}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{residence.capacity}</TableCell>
              <TableCell className="dark:text-sidebar-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedResidence(residence);
                      setIsEditOpen(true);
                    }}>
                      <SquarePen className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedResidence(residence);
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

      {selectedResidence && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la residencia ${selectedResidence.name}`}
            description="Rellena el formulario para editar la residencia."
          >
            <EditResidenceModal id={selectedResidence.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la residencia ${selectedResidence.name}`}
            description={`¿Estás seguro de que deseas eliminar la residencia ${selectedResidence.name}?`}
          >
            <DeleteResidenceModal id={selectedResidence.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
