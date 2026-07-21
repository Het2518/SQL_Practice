import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function DataVisualizer({ result }) {
  const [chartType, setChartType] = useState('bar');

  const { data, xAxisKey, yAxisKeys } = useMemo(() => {
    if (!result || !result.columns || !result.values || result.values.length === 0) {
      return { data: [], xAxisKey: null, yAxisKeys: [] };
    }

    // Convert sql.js result format to array of objects
    const formattedData = result.values.map(row => {
      const obj = {};
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    // Auto-detect axes
    let xKey = null;
    let yKeys = [];

    // Simple heuristic: first column that looks like a string/category/date is X.
    // Rest of numeric columns are Y.
    result.columns.forEach((col, idx) => {
      const sampleVal = result.values[0][idx];
      if (typeof sampleVal === 'number') {
        yKeys.push(col);
      } else if (!xKey) {
        xKey = col;
      }
    });

    // Fallbacks
    if (!xKey && yKeys.length > 0) xKey = result.columns[0];
    if (yKeys.length === 0 && result.columns.length > 1) {
      // Treat second col as Y even if it didn't look like a number
      yKeys.push(result.columns[1]);
    }

    return { data: formattedData, xAxisKey: xKey, yAxisKeys: yKeys };
  }, [result]);

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 13 }}>
        Not enough data to visualize. Run a query that returns rows.
      </div>
    );
  }

  if (yAxisKeys.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 13 }}>
        Could not detect numeric columns for charting.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button 
          onClick={() => setChartType('bar')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: chartType === 'bar' ? 'var(--primary-muted)' : 'transparent',
            color: chartType === 'bar' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
          <BarChart3 size={14} /> Bar
        </button>
        <button 
          onClick={() => setChartType('line')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: chartType === 'line' ? 'var(--primary-muted)' : 'transparent',
            color: chartType === 'line' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
          <LineIcon size={14} /> Line
        </button>
        <button 
          onClick={() => setChartType('pie')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: chartType === 'pie' ? 'var(--primary-muted)' : 'transparent',
            color: chartType === 'pie' ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
          <PieIcon size={14} /> Pie
        </button>
      </div>

      <div style={{ flex: 1, padding: '16px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey={xAxisKey} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
                itemStyle={{ color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              {yAxisKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={60} />
              ))}
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey={xAxisKey} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              {yAxisKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey={yAxisKeys[0]}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
