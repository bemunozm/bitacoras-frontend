import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bitacora } from "@/types"

type ActivitiesByResidenceProps = {
    bitacoras: Bitacora[],
    period: string
}

const groupActivitiesByResidence = (bitacoras: Bitacora[]) => {
  const grouped: { [key: string]: { name: string, actividades: number } } = {}

  bitacoras.forEach(bitacora => {
    bitacora.programs.residences?.forEach(residence => {
      if (!grouped[residence.name]) {
        grouped[residence.name] = { name: residence.name, actividades: 0 }
      }
      grouped[residence.name].actividades += bitacora.activities?.length || 0
    })
  })
  return grouped
}

const generateChartData = (bitacoras: Bitacora[]) => {
  const groupedActivities = groupActivitiesByResidence(bitacoras)
  return Object.values(groupedActivities)
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

const chartConfig = {
  desktop: {
    label: "Actividades",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function ActivitiesByResidence({bitacoras, period}: ActivitiesByResidenceProps) {
  const chartData = generateChartData(bitacoras)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades por Residencia</CardTitle>
        <CardDescription>
          Número de actividades por residencia publicadas {formatPeriod(period)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 30 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="actividades" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
