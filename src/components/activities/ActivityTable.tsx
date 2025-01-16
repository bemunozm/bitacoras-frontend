import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Activity, Bitacora } from "@/types";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import LoadingSpinner from "../LoadingSpinner";
import EditActivityModal from "@/components/activities/EditActivityModal";
import DeleteActivityModal from "@/components/activities/DeleteActivityModal";
import { ActivityForm } from './ActivityForm';
import { useQuery } from '@tanstack/react-query';
import { getActivitiesByBitacoraId } from '@/api/ActivityAPI';
import { formatDate } from '@/helpers';
import { useNavigate } from "react-router-dom";

type ActivityTableProps = {
    bitacoraId: Bitacora['id'];
};

export default function ActivityTable({ bitacoraId }: ActivityTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities', bitacoraId],
        queryFn: () => getActivitiesByBitacoraId(bitacoraId)
    });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Activity;
    direction: 'asc' | 'desc';
  } | null>(null);

  const navigate = useNavigate();

  const handleSort = (key: keyof Activity) => {
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

  const filteredAndSortedActivities = activities && activities
    .filter(activity =>
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.categories.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear una nueva actividad"
        description="Rellena el formulario para crear una nueva actividad."
      >
        <ActivityForm setIsOpen={setIsCreateOpen} id={bitacoraId}/>
        {/* Aquí iría el formulario para crear una actividad */}
      </ResponsiveDialog>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">
            Actividades
          </h3>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Actividad
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar actividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border dark:border-sidebar-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('date')} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Fecha</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('categories.name')} className="cursor-pointer hidden md:table-cell">
                  <div className="flex items-center space-x-1">
                    <span>Categoría</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('description')} className="cursor-pointer hidden md:table-cell">
                  <div className="flex items-center space-x-1">
                    <span>Actividad</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('attachments')} className="cursor-pointer hidden md:table-cell">
                  <div className="flex items-center space-x-1">
                    <span>Adjuntos</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedActivities && filteredAndSortedActivities.map((activity) => (
                <TableRow key={activity.id} onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('.actions-cell')) {
                    navigate(`/activity/${activity.id}`);
                  }
                }} className="cursor-pointer">
                  <TableCell className="font-medium dark:text-sidebar-foreground">{formatDate(activity.date)}</TableCell>
                  <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{activity.categories.name}</TableCell>
                  <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{activity.description}</TableCell>
                  <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">
                    {activity.attachments.length}
                  </TableCell>
                  <TableCell className="dark:text-sidebar-foreground actions-cell" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedActivity(activity);
                          setIsEditOpen(true);
                        }}>
                          <SquarePen className="h-4 w-4 mr-2" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedActivity(activity);
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

          {selectedActivity && (
            <>
              <ResponsiveDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title={`Edita la actividad`}
                description="Rellena el formulario para editar la actividad."
              >
                <EditActivityModal id={selectedActivity.id} setIsOpen={setIsEditOpen} /> 
              </ResponsiveDialog>
              <ResponsiveDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title={`Eliminar la actividad ${selectedActivity.description}`}	
                description={`¿Estás seguro de que deseas eliminar la actividad?`}
              >
                <DeleteActivityModal id={selectedActivity.id} setIsOpen={setIsDeleteOpen} />
              </ResponsiveDialog>
            </>
          )}
        </div>
      </div>
    </>
  );
}
