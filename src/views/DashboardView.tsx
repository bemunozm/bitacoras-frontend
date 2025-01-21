import { getBitacorasByPeriod } from "@/api/BitacoraAPI";
import ActivitiesByCategory from "@/components/charts/ActivitiesByCategory";
import ActivitiesByResidence from "@/components/charts/ActivitiesByResidence";
import { LastActivities } from "@/components/charts/LastActivities";
import TopUsers from "@/components/charts/TopUsers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Activity } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ExampleTable from "@/components/tables/ExampleTable";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

export default function DashboardView() {

  const navigate = useNavigate()
    
  const {data: user} = useAuth()

  

  const handleLogout = () => {
    localStorage.removeItem("AUTH_TOKEN")
    navigate("/auth/login")
    toast({
        title: "Hasta luego!",
        description: "Tu sesión ha sido cerrada exitosamente.",
    })
}

  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const {data, isLoading} = useQuery({
    queryFn: () => getBitacorasByPeriod(selectedPeriod),
    queryKey: ["bitacorasByPeriod", selectedPeriod],	
  });

  const activities = data?.map((bitacora) => bitacora.activities?.map((activity) => activity)).flat()

  if (isLoading) return <LoadingSpinner/>

    return (
      <>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-sidebar-foreground">Escritorio</h1>
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48 text-sidebar-foreground">
                <SelectValue placeholder="Selecciona un periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Este mes</SelectItem>
                <SelectItem value="last_month">Mes pasado</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                <SelectItem value="history">Históricos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-4">
            <Card className="border-0 dark:border dark:border-sidebar-border">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10 rounded-full">
                    {user?.profile_image ? (
                      <AvatarImage src={user.profile_image} alt={user.name} />
                    ) : (
                      <AvatarImage src="/avatars/shadcn.jpg" alt={user?.name} />
                    )}
                    <AvatarFallback className="rounded-full">NN</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-sidebar-foreground">Bienvenido/a</h2>
                    <p className="text-sm text-sidebar-foreground">{user?.name || "Usuario"}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-border rounded-lg p-2 flex items-center space-x-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Salir</span>
                </button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className=" border-0 dark:border dark:border-sidebar-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sidebar-foreground">Bitácoras</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold  text-sidebar-foreground">{data?.length || "0"}</p>
                  <p className="text-xs  text-sidebar-foreground">Totales</p>
                </CardContent>
              </Card>

              <Card className=" border-0 dark:border dark:border-sidebar-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium  text-sidebar-foreground">Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold  text-sidebar-foreground">{activities?.length || "0"}</p>
                  <p className="text-xs  text-sidebar-foreground">Totales</p>
                </CardContent>
              </Card>

              <Card className=" border-0 dark:border dark:border-sidebar-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium  text-sidebar-foreground">Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold  text-sidebar-foregrounde">
                    {activities?.filter((activity: Activity) => new Date(activity.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0])?.length || "0"}
                  </p>
                  <p className="text-xs  text-sidebar-foreground">Realizadas hoy</p>
                </CardContent>
              </Card>

              <Card className=" border-0 dark:border dark:border-sidebar-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium  text-sidebar-foreground">Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold  text-sidebar-foreground">
                    {activities?.filter((activity: Activity) => new Date(activity.created_at).toISOString().split('T')[0] === new Date().toISOString().split('T')[0])?.length || "0"}
                  </p>
                  <p className="text-xs  text-sidebar-foreground">Registradas hoy</p>
                </CardContent>
              </Card>
            </div>
            
          </div>
        

        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <LastActivities/>
            {activities && <ActivitiesByCategory activities={activities} period={selectedPeriod}/>}
            {data && <ActivitiesByResidence bitacoras={data} period={selectedPeriod}/>}
            {data && <TopUsers bitacoras={data} period={selectedPeriod}/>}
            
            <div className="col-span-1 md:col-span-2 overflow-x-scroll"><ExampleTable/></div>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
      </>
    )
  }