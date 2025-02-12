import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Activity } from '@/types'

type ActivitiesByCategoryProps = {
    activities: Activity[],
    period: string
}

const groupActivitiesByCategory = (activities: Activity[]) => {
   const grouped: { [key: string]: { name: string, value: number } } = {}

    activities.forEach(activity => {
      if (!grouped[activity.categories.name]) {
         grouped[activity.categories.name] = { name: activity.categories.name, value: 0 }
      }
      grouped[activity.categories.name].value++
    })

    return grouped
}

const generateChartData = (activities: Activity[]) => {
  const groupedActivities = groupActivitiesByCategory(activities)
  return Object.values(groupedActivities).map((data, index) => ({
    ...data,
    fill: `hsl(var(--chart-${index + 1}))`
  }))
}

const generateChartConfig = (categories: string[]) => {
  return categories.reduce((acc, category, index) => {
    acc[category] = { label: category, color: `hsl(var(--chart-${index + 1}))` }
    return acc
  }, { categories: { label: "Categorías" } } as ChartConfig)
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

export default function ActivitiesByCategory({activities, period}: ActivitiesByCategoryProps) {
  const chartData = generateChartData(activities)
  const categories = chartData.map((data: any) => data.name)
  const chartConfig = generateChartConfig(categories)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades por Categoría</CardTitle>
        <CardDescription>
          Número de actividades por categoría publicadas {formatPeriod(period)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" />
            <ChartLegend content={<ChartLegendContent nameKey="name" className="flex flex-wrap text-xs md:text-sm" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
