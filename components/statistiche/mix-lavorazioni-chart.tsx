"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { ResponsiveContainer } from "recharts";

type MixLavorazione = {
  typeRaw: string;
  type: string;
  count: number;
  percentuale: number;
};

export function MixLavorazioniChart({ data }: { data: MixLavorazione[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 160)}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis
          dataKey="type"
          type="category"
          axisLine={false}
          tickLine={false}
          width={140}
          tick={{ fontSize: 12, fill: "#334155" }}
        />
        <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="percentuale"
            position="right"
            formatter={(value) => `${value ?? 0}%`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
