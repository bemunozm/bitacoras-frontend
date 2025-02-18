import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bitacora } from "@/types"
import { getPrograms } from "@/api/ProgramAPI"
import { useQuery } from "@tanstack/react-query"

type ActivitiesByResidenceProps = {
    bitacoras: Bitacora[],
    period: string
}

const {data: programs } = useQuery({
  queryKey: ['programs'],
  queryFn: getPrograms
});

const groupActivitiesByProgram = (bitacoras: Bitacora[]) => {
  const grouped: { [key: string]: { name: string, actividades: number } } = {}

  // Initialize all programs with 0 activities
  programs?.forEach(program => {
  grouped[program.name] = { name: program.name, actividades: 0 }
  })

  // Count activities for each program
  bitacoras.forEach(bitacora => {
    const programName = bitacora.program?.name
    if (programName && grouped[programName]) {
      grouped[programName].actividades += bitacora.activities?.length || 0
    }
  })
  
  return grouped
}

const generateChartData = (bitacoras: Bitacora[]) => {
  const groupedActivities = groupActivitiesByProgram(bitacoras)
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
