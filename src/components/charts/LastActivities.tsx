import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Activity } from "@/types"
import { useQuery } from "@tanstack/react-query";
import { getBitacorasByPeriod } from "@/api/BitacoraAPI";

const getLast7Days = () => {
  const dates = [];
  for (let i = 0; i <= 6; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-CA')); 
  }
  return dates.reverse();
};

const groupActivitiesByDate = (activities: Activity[]) => {
  const grouped: { [key: string]: number } = {};
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateString = localDate.toLocaleDateString('en-CA');
    if (!grouped[dateString]) {
      grouped[dateString] = 0;
    }
    grouped[dateString]++;
  });
  return grouped;
};

const generateChartData = (activities: Activity[]) => {
  const last7Days = getLast7Days();
  console.log('last7Days', last7Days);
  const groupedActivities = groupActivitiesByDate(activities);
  console.log('groupedActivities', groupedActivities);

  const chartData = last7Days.map(date => ({
    date,
    actividades: groupedActivities[date] || 0,
  }));

  console.log('chartData', chartData);

  return chartData
};

const chartConfig = {
  desktop: {
    label: "Actividades",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig



export function LastActivities() {

  const {data: bitacoras} = useQuery({
    queryFn: () => getBitacorasByPeriod('current_month'),
    queryKey: ["activities"],
  });

  const activities = bitacoras?.map((bitacora) => bitacora.activities).flat();

  const chartData = generateChartData(activities || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades por día</CardTitle>
        <CardDescription>Cantidad de actividades diarias en los últimos 7 días.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const [year, month, day] = value.split('-');
                const date = new Date(Number(year), Number(month) - 1, Number(day));
                return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="actividades"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          <p>
            <strong>Actividades totales en los últimos 7 días: </strong> 
            <span className="font-semibold text-primary">
              {chartData.reduce((total, item) => total + item.actividades, 0)} Actividades
            </span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
