import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import ProvisionTable from "@/components/provisions/ProvisionTable"
import { Plus, Search } from "lucide-react"
import { useState } from "react";
import { ProvisionForm } from "@/components/provisions/ProvisionForm"

export default function ProvisionsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  return (
    <>
      <ResponsiveDialog
            isOpen={isCreateOpen}
            setIsOpen={setIsCreateOpen}
            title="Crea una nueva prestación"
            description="Rellena el formulario para crear una nueva prestación."
          >
            <ProvisionForm setIsOpen={setIsCreateOpen} />
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">
              Prestaciones
            </h2>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Prestación
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
              <Input
                placeholder="Buscar prestaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
              />
            </div>
          </div>

          <ProvisionTable searchTerm={searchTerm} />
      </div>
    </>
  )
}
