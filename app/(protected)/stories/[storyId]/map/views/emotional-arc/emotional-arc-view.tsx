"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { useMap } from "../../map-context";

export function EmotionalArcView() {
  const { scenes } = useMap();

  const data = scenes.map((scene) => ({
    name: scene.title,
    tension: scene.tension,
    order: scene.order,
  }));

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500 dark:text-zinc-400">
        <p>No scenes yet. Add scenes to see the emotional arc.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Emotional Arc</h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Tension over time (1-10)
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="order"
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Scene Sequence', position: 'insideBottom', offset: -10, fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              tickCount={6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: '#1f2937'
              }}
              itemStyle={{ color: '#3b82f6' }}
              labelStyle={{ color: '#6b7280', marginBottom: '0.25rem' }}
              formatter={(value: number) => [value, 'Tension']}
              labelFormatter={(label) => `Scene ${label}`}
            />
            <ReferenceLine y={5} stroke="#9ca3af" strokeDasharray="3 3" opacity={0.5} />
            <Area
              type="monotone"
              dataKey="tension"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTension)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
