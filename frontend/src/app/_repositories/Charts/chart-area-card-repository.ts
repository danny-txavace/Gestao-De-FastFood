import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';

interface PayloadChart {
  charAmount: number[]
  chartDate: string[]
}

@Injectable({
  providedIn: 'root'
})
export class ChartAreaCardRepository {
  getChartConfig(type: string, data: PayloadChart | null): EChartsOption {
    let format = type;
    let cl = '';
    let ca = '';
    let caa = '';

    if (format === 'openingBalance')
    { cl='#475569'; ca='rgba(71, 85, 105, 0.6)'; caa='rgba(71, 85, 105, 0)' }
    else if (format === 'inflows')
    { cl='#62ff00'; ca='rgba(56, 240, 0, 0.6)'; caa='rgba(56, 240, 0, 0)' }
    else if (format === 'outflows')
    { cl='#d32f2f'; ca='rgba(244, 67, 54, 0.6)'; caa='rgba(244, 67, 54, 0)' }
    else if (format === 'closingBalance')
    { cl='#2563EB'; ca='rgba(37, 99, 235, 0.6)'; caa='rgba(37, 99, 235, 0)' }
    else if (format === 'numOfSales')
    { cl='#00ffe1'; ca='rgba(0, 213, 188, 0.6)'; caa='rgba(0, 213, 188, 0)' }
    else if (format === 'expectedBalance')
    { cl='#94A3B8'; ca='rgba(148, 163, 184, 0.6)'; caa='rgba(148, 163, 184, 0)' }
    else if (format === 'averageTicket')
    { cl='#7C3AED'; ca='rgba(124, 58, 237, 0.6)'; caa='rgba(124, 58, 237, 0)' }

    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        type: 'time',
        axisLabel: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { show: false },
        splitLine: { show: false }
      },
      series: [
        {
          type: 'line',
          data: data?.charAmount?.map((_, index) => {
            if (!data?.chartDate[index]) return null;
            return { value: [new Date(data.chartDate[index]).getTime(), data.charAmount[index] ?? 0] };
          }).filter(Boolean) || [],
          smooth: false, // curva
          silent: true,
          sampling: 'average',
          lineStyle: { color: cl, width: 1, shadowColor: 'rgba(0, 0, 0, 0.2)', shadowBlur: 5 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: ca },
                { offset: 1, color: caa }
              ]
            }
          },
          showSymbol: false,
          animation: true,
          animationDuration: 2000,
          animationEasing: 'cubicInOut'
        }
      ],
      backgroundColor: 'transparent'
    };
  }
}
