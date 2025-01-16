import { getBitacoras } from "@/api/BitacoraAPI";
import { Bitacora, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUpDown, CircleCheck, CircleX, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import { getPeriod } from "@/helpers";
import EditBitacoraModal from "@/components/bitacoras/EditBitacoraModal";
import DeleteBitacoraModal from "@/components/bitacoras/DeleteBitacoraModal";
import { useNavigate } from "react-router-dom";

export default function BitacoraTable({ searchTerm, filter, user }: { searchTerm: string, filter: string, user: User }) {
  const { data, isLoading } = useQuery({
    queryKey: ['bitacoras'],
   queryFn: getBitacoras
   });

   const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBitacora, setSelectedBitacora] = useState<Bitacora | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Bitacora | 'Completado' | 'Aprobado';
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Bitacora | 'Completado' | 'Aprobado') => {
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

  const filteredAndSortedBitacoras = data && data
    .filter(bitacora => {
      if (filter === "mine") {
        const currentUser = user?.id; // Reemplaza esto con la lógica real
        return bitacora.user_id === currentUser;
      }
      return true;
    })
    .filter(bitacora =>
      bitacora.created_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bitacora.users.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;

      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'Completado' || sortConfig.key === 'Aprobado') {
        aValue = a.status === (sortConfig.key === 'Completado' ? 'Completado' : 'Aprobado');
        bValue = b.status === (sortConfig.key === 'Completado' ? 'Completado' : 'Aprobado');
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (sortConfig.key === 'Completado' || sortConfig.key === 'Aprobado') {
        const aStatus = a.status === (sortConfig.key === 'Completado' ? 'Completado' : 'Aprobado');
        const bStatus = b.status === (sortConfig.key === 'Completado' ? 'Completado' : 'Aprobado');
        if (aStatus < bStatus) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStatus > bStatus) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const calculateTotalAttachments = (bitacora: Bitacora) => {
        return bitacora.activities?.reduce((acc, activity) => {
            return acc + activity.attachments.length;
        }, 0);
    }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="overflow-x-auto rounded-md border dark:border-sidebar-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Periodo</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('users')} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Usuario</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('activities')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Número de actividades</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('activities')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Número de fotos</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('programs')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Programa</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('programs')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Coordinador</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('Completado')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Terminado?</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('Aprobado')} className="cursor-pointer hidden lg:table-cell">
              <div className="flex items-center space-x-1">
                <span>Aprobado?</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedBitacoras && filteredAndSortedBitacoras.map((bitacora) => (
            <TableRow key={bitacora.id} onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.actions-cell')) {
                navigate(`/bitacoras/${bitacora.id}`);
              }
            }} className="cursor-pointer">
              <TableCell className="font-medium dark:text-sidebar-foreground first-letter:uppercase">{getPeriod(bitacora.month)}</TableCell>
              <TableCell className="dark:text-sidebar-foreground">{bitacora.users.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{bitacora.activities?.length}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{calculateTotalAttachments(bitacora)}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{bitacora.programs.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{bitacora.programs.coordinator.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{bitacora.status === 'Completado' || 'Aprobado' ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/> }</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{bitacora.status === 'Aprobado' ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/> }</TableCell>
              <TableCell className="dark:text-sidebar-foreground actions-cell" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedBitacora(bitacora);
                      setIsEditOpen(true);
                    }}>
                      <SquarePen className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedBitacora(bitacora);
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

      {selectedBitacora && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la bitácora del mes de ${getPeriod(selectedBitacora.month)}`}
            description="Rellena el formulario para editar la bitácora."
          >
            <EditBitacoraModal id={selectedBitacora.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la bitácora ${getPeriod(selectedBitacora.month)}`}
            description={`¿Estás seguro de que deseas eliminar la bitácora ${getPeriod(selectedBitacora.month)}?\n Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
          >
            <DeleteBitacoraModal id={selectedBitacora.id} setIsOpen={setIsDeleteOpen} />
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
