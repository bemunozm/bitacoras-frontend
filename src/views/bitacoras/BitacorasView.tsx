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
import { ReplacementBitacoraForm } from "@/components/bitacoras/ReplacementBitacoraForm";

export default function BitacorasView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateOpenReplacement, setIsCreateOpenReplacement] = useState(false);
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

      <ResponsiveDialog
        isOpen={isCreateOpenReplacement}
        setIsOpen={setIsCreateOpenReplacement}
        title="Crear una nueva bitácora de reemplazo"
        description="Rellena el formulario para crear una nueva bitácora de reemplazo."
      >
        {data && <ReplacementBitacoraForm user={data} setIsOpen={setIsCreateOpenReplacement}/>}
      </ResponsiveDialog>

      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <h2 className="text-3xl text-center font-bold tracking-tight dark:text-sidebar-foreground">
            Bitácoras
          </h2>
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Bitácora
          </Button>
            {data?.roles?.some(role => role?.name === 'Coordinador' || role?.name === 'Administrador') && (
            <Button
              onClick={() => setIsCreateOpenReplacement(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Bitácora Remplazo
            </Button>
            )}
          </div>
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

        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex justify-center my-5">
                <TabsList className={`grid w-full ${
                    data?.roles?.some((role) => role?.name === 'Coordinador')
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                } max-w-[400px] h-auto`}>
                    <TabsTrigger 
                        value="all" 
                        className="text-[11px] sm:text-sm data-[state=active]:h-10"
                    >
                        Todas
                    </TabsTrigger>
                    <TabsTrigger 
                        value="mine" 
                        className="text-[11px] sm:text-sm h-10 data-[state=active]:h-10"
                    >
                        Mis bitácoras
                    </TabsTrigger>
                    {data?.roles?.some((role) => role?.name === 'Coordinador') && (
                        <TabsTrigger 
                            value="coordinator" 
                            className="text-[11px] sm:text-sm h-10 data-[state=active]:h-10"
                        >
                            Programas
                        </TabsTrigger>
                    )} 
                </TabsList>
            </div>
          <TabsContent value="all">
            {data && <BitacoraTable user={data} searchTerm={searchTerm} filter="all" />}
          </TabsContent>
          <TabsContent value="mine">
            {data && <BitacoraTable user={data} searchTerm={searchTerm} filter="mine" />}
          </TabsContent>
          <TabsContent value="coordinator">
            {data && <BitacoraTable user={data} searchTerm={searchTerm} filter="coordinator" />}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
