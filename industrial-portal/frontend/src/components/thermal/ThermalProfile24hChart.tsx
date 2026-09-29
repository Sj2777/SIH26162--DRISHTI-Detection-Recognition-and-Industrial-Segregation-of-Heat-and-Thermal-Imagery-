import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ThermalPoint24h } from '../../types';

interface ThermalProfile24hChartProps {
  data: ThermalPoint24h[];
}

export const ThermalProfile24hChart: React.FC<ThermalProfile24hChartProps> = ({ data }) => {
  const times = data.map((d) => d.time);
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
        if (!item) return '';
        const point = data[item.dataIndex];
        const isAnomaly = point?.isAnomaly;
        return `
          <div style="font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #94a3b8; margin-bottom: 4px;">Time: ${item.name} UTC</div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Thermal Intensity:</span>
              <span style="font-weight: bold; color: ${isAnomaly ? '#ef4444' : '#f97316'};">${item.value}×</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Facility Baseline:</span>
              <span style="color: #64748b;">1.0×</span>
            </div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #243242; color: ${
              isAnomaly ? '#f87171' : '#10b981'
            };">
              ${isAnomaly ? '⚠ ABNORMAL ELEVATION DETECTED' : '✔ WITHIN OPERATIONAL PROFILE'}
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#243242' } },
      axisLabel: { color: '#7e90a5', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: {
      type: 'value',
      min: 0.5,
      max: 3.0,
      interval: 0.5,
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
        name: 'Thermal Intensity',
        type: 'line',
        smooth: 0.25,
        data: values,
        lineStyle: {
          width: 2.5,
          color: '#f97316',
        },
        itemStyle: {
          color: (params: any) => {
            const pt = data[params.dataIndex];
            return pt?.isAnomaly ? '#ef4444' : '#f97316';
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.35)' },
              { offset: 0.7, color: 'rgba(249, 115, 22, 0.1)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.0)' },
            ],
          },
        },
        // Facility Baseline MarkLine & Normal Envelope Area
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 1.0,
              lineStyle: { color: '#0284c7', type: 'dashed', width: 1.5 },
              label: {
                formatter: 'Baseline 1.0×',
                position: 'insideEndTop',
                color: '#38bdf8',
                fontSize: 10,
                fontFamily: 'monospace',
              },
            },
            {
              yAxis: 1.4,
              lineStyle: { color: '#10b981', type: 'dotted', width: 1 },
              label: {
                formatter: 'Normal Max 1.4×',
                position: 'insideEndTop',
                color: '#34d399',
                fontSize: 9,
                fontFamily: 'monospace',
              },
            },
          ],
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 44,
          data: [
            {
              coord: ['14:32', 2.7],
              value: '2.7×',
              itemStyle: { color: '#dc2626' },
              label: {
                color: '#ffffff',
                fontWeight: 'bold',
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
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col h-[380px]">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            24-Hour Diurnal Thermal Behaviour
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
            ACUTE SPIKE: +170% OVER BASELINE
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#7e90a5]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#f97316]"></span> Observed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#0284c7] border-t border-dashed"></span> Baseline (1.0×)
          </span>
        </div>
      </div>
      <div className="flex-1 w-full p-2">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
