import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryAsset } from '../../types';

interface TelemetryTrendChartProps {
  asset: TelemetryAsset;
}

type TrendMetricType = 'temperature' | 'pressure' | 'gas' | 'vibration';

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({ asset }) => {
  const [selectedMetric, setSelectedMetric] = useState<TrendMetricType>('temperature');

  const timestamps = asset.history.map((h) => h.timestamp);

  const getMetricConfig = () => {
    switch (selectedMetric) {
      case 'temperature':
        return {
          title: 'TEMPERATURE TREND',
          unit: '°C',
          data: asset.history.map((h) => h.temperature),
          threshold: asset.temperature.normalMax || 70,
          thresholdLabel: `Normal Max (${asset.temperature.normalMax}°C)`,
          color: '#ef4444',
          areaColor: 'rgba(239, 68, 68, 0.25)',
        };
      case 'pressure':
        return {
          title: 'PRESSURE TREND',
          unit: 'bar',
          data: asset.history.map((h) => h.pressure),
          threshold: asset.pressure.normalMax || 4.2,
          thresholdLabel: `Normal Max (${asset.pressure.normalMax} bar)`,
          color: '#0284c7',
          areaColor: 'rgba(2, 132, 199, 0.2)',
        };
      case 'gas':
        return {
          title: 'GAS CONCENTRATION TREND',
          unit: 'ppm',
          data: asset.history.map((h) => h.gas),
          threshold: asset.gas.normalMax || 10,
          thresholdLabel: `Normal Limit (${asset.gas.normalMax} ppm)`,
          color: '#f97316',
          areaColor: 'rgba(249, 115, 22, 0.25)',
        };
      case 'vibration':
        return {
          title: 'VIBRATION AMPLITUDE TREND',
          unit: 'mm/s',
          data: asset.history.map((h) => h.vibration),
          threshold: asset.vibration.normalMax || 3.0,
          thresholdLabel: `Threshold (${asset.vibration.normalMax} mm/s)`,
          color: '#f59e0b',
          areaColor: 'rgba(245, 158, 11, 0.2)',
        };
    }
  };

  const config = getMetricConfig();

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
        const val = item.value;
        const isOver = val > config.threshold;
        return `
          <div style="font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #94a3b8; margin-bottom: 4px;">Time: ${item.name} UTC</div>
            <div style="display: flex; justify-content: space-between; gap: 14px;">
              <span>${config.title}:</span>
              <span style="font-weight: bold; color: ${isOver ? '#ef4444' : '#38bdf8'};">${val} ${config.unit}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px; margin-top: 2px;">
              <span style="color: #64748b;">Normal Limit:</span>
              <span style="color: #64748b;">${config.threshold} ${config.unit}</span>
            </div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #243242; color: ${
              isOver ? '#f87171' : '#10b981'
            }; font-weight: bold;">
              ${isOver ? '⚠ EXCEEDS NORMAL SPECIFICATION' : '✔ NORMAL RANGE'}
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
      data: timestamps,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#243242' } },
      axisLabel: { color: '#7e90a5', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#7e90a5',
        fontSize: 10,
        fontFamily: 'monospace',
        formatter: `{value} ${config.unit}`,
      },
      splitLine: { lineStyle: { color: '#1a232f', type: 'dashed' } },
    },
    series: [
      {
        name: config.title,
        type: 'line',
        smooth: 0.25,
        data: config.data,
        lineStyle: { width: 2.5, color: config.color },
        itemStyle: { color: config.color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: config.areaColor },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: config.threshold,
              lineStyle: { color: '#dc2626', type: 'dashed', width: 1.5 },
              label: {
                formatter: config.thresholdLabel,
                position: 'insideEndTop',
                color: '#f87171',
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
      {/* Header and Metric Switcher */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            {asset.assetName.toUpperCase()} — TELEMETRY TREND
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            HISTORICAL BUFFER
          </span>
        </div>

        {/* Buttons to switch metric */}
        <div className="flex items-center gap-1 bg-[#0b0f15] border border-[#233140] p-0.5 rounded text-[11px] font-mono">
          {(['temperature', 'pressure', 'gas', 'vibration'] as TrendMetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-2.5 py-1 rounded transition-colors uppercase font-medium ${
                selectedMetric === m
                  ? 'bg-[#1e2a38] text-white border border-[#38bdf8]/40 shadow-sm'
                  : 'text-[#7e90a5] hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full p-2">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
