"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";

const config = { revenue: { label: "Revenue", color: "#e2551f" } } satisfies ChartConfig;

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <figure>
      <ChartContainer config={config} className="aspect-auto h-64 w-full" aria-label="Daily revenue over the last 30 days">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={day} />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v) => usd(v)} />
          <ChartTooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { date: string; revenue: number; orders: number };
              return (
                <div className="rounded-xl border bg-white px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold">{day(p.date)}</p>
                  <p className="mt-1 flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: "#e2551f" }} aria-hidden /> {usd(p.revenue)}
                  </p>
                  <p className="text-muted-foreground">{p.orders} orders</p>
                </div>
              );
            }}
          />
          <Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#rev-fill)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
        </AreaChart>
      </ChartContainer>
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer">View as table</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr className="text-left">
              <th className="py-1 font-semibold">Date</th>
              <th className="py-1 text-right font-semibold">Revenue</th>
              <th className="py-1 text-right font-semibold">Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-t">
                <td className="py-1">{day(d.date)}</td>
                <td className="py-1 text-right tabular-nums">{usd(d.revenue)}</td>
                <td className="py-1 text-right tabular-nums">{d.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
