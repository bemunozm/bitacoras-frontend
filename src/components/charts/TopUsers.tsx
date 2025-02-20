import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Bitacora } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Este componente muestra un gráfico de barras horizontal con los 5 usuarios más activos
// basado en la cantidad de actividades que han registrado en un período específico

type TopUsersProps = {
    bitacoras: Bitacora[],
    period: string
}

// Función auxiliar para formatear el período en texto legible
const formatPeriod = (period: string) => {
  switch (period) {
    case 'current_month':
      return 'este mes';
    case 'last_month':
      return 'el mes pasado';
    case 'last_3_months':
      return 'los últimos 3 meses';
    case 'last_6_months':
      return 'los últimos 6 meses';
    case 'history':
      return 'históricamente';
    default:
      return period;
  }
}

export default function TopUsers({ bitacoras, period }: TopUsersProps) {
  // Calcula el número de actividades por usuario
  // Reduce el array de bitácoras a un objeto que cuenta actividades por usuario
  const userActivityCount = bitacoras.reduce((acc, bitacora) => {
    const userName = bitacora.user.name
    acc[userName] = (acc[userName] || 0) + (bitacora.activities?.length || 0)
    return acc
  }, {} as Record<string, number>)

  // Transforma los datos para el gráfico:
  // 1. Convierte el objeto en array de entries
  // 2. Ordena por número de actividades (descendente)
  // 3. Toma los primeros 5
  // 4. Mapea a la estructura requerida por el gráfico
  const topUsers = Object.entries(userActivityCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([user, activities], index) => ({
      user,
      activities,
      fill: `hsl(var(--chart-${index + 1}))`
    }))

  // Configuración del gráfico con tipos y etiquetas
  const chartConfig = {
    activities: {
      label: "Actividades",
    },
    user: {
      label: "Usuario",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    // Renderiza un gráfico de barras horizontal dentro de una Card
    // usando componentes de Recharts para la visualización
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Usuarios</CardTitle>
        <CardDescription>
          Usuarios con más actividades registradas {formatPeriod(period)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={topUsers}
            layout="vertical"
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <YAxis
              dataKey="user"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label || value
              }
            />
            <XAxis dataKey="activities" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="activities" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
