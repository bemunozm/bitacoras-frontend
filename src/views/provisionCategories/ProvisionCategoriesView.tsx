import ProvisionCategoryTable from "@/components/provision_category/ProvisionCategoryTable"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import ProvisionCategoryForm from "@/components/provision_category/ProvisionCategoryForm"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ProvisionCategoriesView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear nueva categoría"
        description="Rellena el formulario para crear una nueva categoría."
      >
        <ProvisionCategoryForm setIsOpen={setIsCreateOpen} />
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <h2 className="text-3xl text-center font-bold tracking-tight dark:text-sidebar-foreground">
            Categorías de Prestaciones
          </h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Categoría
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
            />
          </div>
        </div>
        <ProvisionCategoryTable searchTerm={searchTerm} />
      </div>
    </>
  )
}