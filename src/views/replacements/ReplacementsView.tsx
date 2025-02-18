import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import ReplacementTable from "@/components/replacements/ReplacementTable"
import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { ReplacementForm } from "@/components/replacements/ReplacementForm"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { useAuth } from "@/hooks/useAuth"

export default function ReplacementsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {setBreadcrumbItems} = useBreadcrumb()

  const { data: user } = useAuth();

  const isAdmin = user?.roles?.some((role) => role?.name === "Administrador");

  useEffect(() => {
    const route = [
      {label: 'Escritorio', to: '/'},
      {label: isAdmin ? 'Administración' : 'Coordinación', to: undefined},
      {label: 'Reemplazos', to: undefined}
    ]
    setBreadcrumbItems(route)
  }, [setBreadcrumbItems])

  return (
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear nuevo reemplazo"
        description="Rellena el formulario para crear un nuevo reemplazo."
      >
        <ReplacementForm setIsOpen={setIsCreateOpen} />
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">
            Reemplazos
          </h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Reemplazo
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar reemplazos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
            />
          </div>
        </div>

        <ReplacementTable searchTerm={searchTerm} />
      </div>
    </>
  )
}
