import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import UserTable from "@/components/users/UserTable"
import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react";
import { UserForm } from "@/components/users/UserForm"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

export default function UsersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {setBreadcrumbItems} = useBreadcrumb()
    
      useEffect(() => {
        const route = [
            {label: 'Escritorio', to: '/'},
            {label: 'Administración', to: undefined},
            {label: 'Usuarios', to: undefined}
        ]
        setBreadcrumbItems(route)
        }, [setBreadcrumbItems])
  return (
    <>
      <ResponsiveDialog
            isOpen={isCreateOpen}
            setIsOpen={setIsCreateOpen}
            title="Crea un nuevo usuario"
            description="Rellena el formulario para crear un nuevo usuario."
          >
            <UserForm setIsOpen={setIsCreateOpen} />
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
            <h2 className="text-3xl text-center font-bold tracking-tight dark:text-sidebar-foreground">
              Usuarios
            </h2>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
              />
            </div>
          </div>

          <UserTable searchTerm={searchTerm} />
      </div>
    </>
  )
}
