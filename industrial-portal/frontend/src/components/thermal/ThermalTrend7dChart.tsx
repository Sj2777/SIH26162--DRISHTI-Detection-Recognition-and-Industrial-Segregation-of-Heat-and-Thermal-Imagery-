import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ThermalTrend7dPoint } from '../../types';

interface ThermalTrend7dChartProps {
  data: ThermalTrend7dPoint[];
}

export const ThermalTrend7dChart: React.FC<ThermalTrend7dChartProps> = ({ data }) => {
  const dates = data.map((d) => d.date);
  const avgValues = data.map((d) => d.avgIntensity);
  const maxValues = data.map((d) => d.maxIntensity);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#16202c',
      borderColor: '#2a3a4e',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params: any) => {
        let res = `<div style="font-family: monospace; font-size: 11px;">
          <div style="font-weight: bold; color: #94a3b8; margin-bottom: 4px;">${params[0]?.name}</div>`;
        params.forEach((p: any) => {
          res += `<div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="color: ${p.color};">${p.seriesName}:</span>
            <span style="font-weight: bold;">${p.value}×</span>
          </div>`;
        });
        res += `<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px;">
          <span style="color: #64748b;">Facility Baseline:</span>
          <span>1.0×</span>
        </div></div>`;
        return res;
      },
    },
    legend: {
      data: ['Daily Average', 'Peak Intensity'],
      top: '2%',
      right: '4%',
      textStyle: { color: '#7e90a5', fontSize: 11, fontFamily: 'monospace' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#243242' } },
      axisLabel: { color: '#7e90a5', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: {
      type: 'value',
      min: 0.5,
      max: 3.0,
      axisLabel: {
        color: '#7e90a5',
        fontSize: 10,
        fontFamily: 'monospace',
        formatter: '{value}×',
      },
      splitLine: { lineStyle: { color: '#1a232f', type: 'dashed' } },
    },
    series: [
      {
        name: 'Daily Average',
        type: 'bar',
        data: avgValues,
        barWidth: '28%',
        itemStyle: {
          color: (params: any) => {
            return params.dataIndex === dates.length - 1 ? '#ea580c' : '#0284c7';
          },
          borderRadius: [2, 2, 0, 0],
        },
      },
      {
        name: 'Peak Intensity',
        type: 'line',
        data: maxValues,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 1.0,
              lineStyle: { color: '#10b981', type: 'dashed' },
              label: {
                formatter: 'Baseline 1.0×',
                position: 'insideEndTop',
                color: '#34d399',
                fontSize: 10,
                fontFamily: 'monospace',
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col h-[320px]">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
          7-Day Thermal Intensity Trend
        </span>
        <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
          ROLLING AGGREGATION
        </span>
      </div>
      <div className="flex-1 w-full p-2">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
