import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import ProgramTable from "@/components/programs/ProgramTable";
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function ProgramsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {setBreadcrumbItems} = useBreadcrumb()
    
      useEffect(() => {
        const route = [
            {label: 'Escritorio', to: '/'},
            {label: 'Administración', to: undefined},
            {label: 'Programas', to: undefined}
        ]
        setBreadcrumbItems(route)
        }, [setBreadcrumbItems])

  return (
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear un nuevo programa"
        description="Rellena el formulario para crear un nuevo programa."
      >
        <ProgramForm setIsOpen={setIsCreateOpen} />
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <h2 className="text-3xl text-center font-bold tracking-tight dark:text-sidebar-foreground">
            Programas
          </h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Programa
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar programas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
            />
          </div>
        </div>

        <ProgramTable searchTerm={searchTerm} />
      </div>
    </>
  );
}
