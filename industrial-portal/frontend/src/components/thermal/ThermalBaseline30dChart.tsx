import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ThermalBaseline30dPoint } from '../../types';

interface ThermalBaseline30dChartProps {
  data: ThermalBaseline30dPoint[];
}

export const ThermalBaseline30dChart: React.FC<ThermalBaseline30dChartProps> = ({ data }) => {
  const days = data.map((d) => d.day);
  const values = data.map((d) => d.intensity);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#16202c',
      borderColor: '#2a3a4e',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        return `
          <div style="font-family: monospace; font-size: 11px;">
            <div style="color: #94a3b8; margin-bottom: 2px;">Observation: ${item?.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Thermal Index:</span>
              <span style="font-weight: bold; color: ${
                item?.dataIndex === days.length - 1 ? '#ef4444' : '#38bdf8'
              };">${item?.value}×</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Operating Fingerprint:</span>
              <span style="color: #64748b;">1.0×</span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#243242' } },
      axisLabel: {
        color: '#7e90a5',
        fontSize: 9,
        fontFamily: 'monospace',
        interval: 4,
      },
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
        name: 'Historical Thermal Index',
        type: 'line',
        step: 'middle',
        data: values,
        lineStyle: { width: 1.8, color: '#38bdf8' },
        itemStyle: {
          color: (params: any) => {
            return params.dataIndex === days.length - 1 ? '#ef4444' : '#0284c7';
          },
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 1.0,
              lineStyle: { color: '#10b981', type: 'solid', width: 1.5 },
              label: {
                formatter: 'Facility Fingerprint Baseline 1.0×',
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
          30-Day Facility Thermal Baseline Fingerprint
        </span>
        <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
          NOMINAL STABILITY ENVELOPE
        </span>
      </div>
      <div className="flex-1 w-full p-2">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
