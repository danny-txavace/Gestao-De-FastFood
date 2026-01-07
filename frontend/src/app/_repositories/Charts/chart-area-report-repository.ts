import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EChartsOption } from 'echarts';
import { ChartAreaReportDTO } from '../../_interfaces/chart-area-report-dto';
import { FormatCurrencyValue } from '../../_utils/global-methods';

@Injectable({
  providedIn: 'root',
})
export class ChartAreaReportRepository {
  private translateService = inject(TranslateService);

  getChartConfig(data: ChartAreaReportDTO | null): EChartsOption {
    if (!data?.date?.length) {
      return { backgroundColor: 'transparent', series: [] };
    }

    const labels = data.date;

    const chartData = Array.isArray(data?.amounts) && data.amounts.length > 0
      ? data.amounts.map(a => Number(a) || 0)
      : [0];

    return {
      backgroundColor: 'transparent',

      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 6,
        padding: 10,
        textStyle: { color: '#fff', fontSize: 14, fontFamily: 'K2D, sans-serif' },
        formatter: (params: any) => {
          if (!params?.length) return '';
          const index = params[0].dataIndex;
          const time = labels[index];
          const value = params[0].value;
          return `<div style="text-align:left;">
                    <strong>${time}</strong><br/>
                    ${FormatCurrencyValue(value)}
                  </div>`;
        }
      },

      grid: { left: 0, right: 0, top: 20, bottom: 5, containLabel: true },

      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          color: 'oklch(60% 0 0)',
          fontSize: 12,
          fontFamily: 'K2D, sans-serif',
          rotate: 0,
          interval: 0
        },
        axisTick: { alignWithLabel: true }
      },

      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'oklch(60% 0 0)',
          fontSize: 12,
          formatter: FormatCurrencyValue
        },
        splitLine: { lineStyle: { color: 'rgba(56,56,56,0.5)', type: 'dashed' } }
      },

      series: [{
        name: this.translateService.instant('COMMON.CHART.REVENUE'),
        type: 'line',
        data: chartData,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: '#18CA00', width: 2 },
        itemStyle: { color: '#18CA00' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0,   color: 'rgba(24, 202, 0, 0.6)' },
              { offset: 0.8, color: 'rgba(24, 202, 0, 0.1)' },
              { offset: 1,   color: 'rgba(24, 202, 0, 0)' }
            ]
          }
        }
      },],
    };
  }
}
