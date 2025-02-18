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

type TopUsersProps = {
    bitacoras: Bitacora[],
    period: string
}

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
  const userActivityCount = bitacoras.reduce((acc, bitacora) => {
    const userName = bitacora.user.name
    acc[userName] = (acc[userName] || 0) + (bitacora.activities?.length || 0)
    return acc
  }, {} as Record<string, number>)

  const topUsers = Object.entries(userActivityCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([user, activities], index) => ({
      user,
      activities,
      fill: `hsl(var(--chart-${index + 1}))`
    }))

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
