import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import BitacoraTable from "@/components/bitacoras/BitacoraTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BitacoraForm } from "@/components/bitacoras/BitacoraForm";
import { useAuth } from "@/hooks/useAuth";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

export default function BitacorasView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all");

  const {setBreadcrumbItems} = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([
      {label: "Escritorio", to: "/"},
      {label: "Bitácoras", to: undefined},
    ]);
  }, []);

  const {data} = useAuth();

  return (
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear una nueva bitácora"
        description="Rellena el formulario para crear una nueva bitácora."
      >
        {data && <BitacoraForm user={data} setIsOpen={setIsCreateOpen} />}
      </ResponsiveDialog>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <h2 className="text-3xl text-center font-bold tracking-tight dark:text-sidebar-foreground">
            Bitácoras
          </h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Bitácora
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar bitácoras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
            />
          </div>
        </div>

        
        <Tabs value={tab} onValueChange={setTab}>
            <div className="flex justify-center my-5">
                <TabsList>
                    <TabsTrigger value="all">Todas las bitácoras</TabsTrigger>
                    <TabsTrigger value="mine">Mis bitácoras</TabsTrigger>
                </TabsList>
            </div>
          <TabsContent value="all">
            {data && <BitacoraTable user={data} searchTerm={searchTerm} filter="all" />}
          </TabsContent>
          <TabsContent value="mine">
            {data && <BitacoraTable user={data} searchTerm={searchTerm} filter="mine" />}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
