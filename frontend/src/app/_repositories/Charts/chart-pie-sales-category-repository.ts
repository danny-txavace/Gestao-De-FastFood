import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { FormatCurrencyValue, FormatQty } from '../../_utils/global-methods';
import { IChartPieSalesCategoryDto } from '../../_interfaces/Charts/ichart-pie-sales-category-dto';

@Injectable({
  providedIn: 'root'
})
export class ChartPieSalesCategoryRepository {
  getChartConfig(data: IChartPieSalesCategoryDto | null): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 14, fontFamily: 'K2D, sans-serif' },
        padding: [6, 10],
        borderRadius: 6,
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          const totalAmount = FormatCurrencyValue(param.data?.totalAmount || param.value);
          const totalQty = FormatQty(param.data?.totalQty || param.value)
          return `
            <div style="text-align: center; font-weight: bold;">${param.name}:</div>
            <div style="text-align: center; font-weight: bold;">${totalAmount}</div>
            <div style="text-align: center; font-weight: bold;">${totalQty}</div>
          `;
        },
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'vertical',
        left: 0,
        top: 0,
        bottom: 10,
        textStyle: {
          fontFamily: 'K2D, sans-serif',
          fontSize: 13,
          fontWeight: 200,
          color: 'oklch(50% 0.01468 184.999)'
        },
        itemGap: 12,
        itemWidth: 25,
        itemHeight: 15,
      },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: true
      },
      series:
      [
        {
          name: 'Sales by Category',
          type: 'pie',
          roseType: 'area',
          radius: ['20%', '80%'],
          center: ['60%', '50%'],
          top: 20,
          bottom: 20,
          data: data?.category.map((category: string, index: number) => {
            const colors = [
              { start: 'rgba(255,0,0,0.9)', end: 'rgba(255,100,100,0.8)' },       // 1 - Neon Red
              { start: 'rgba(0,255,0,0.9)', end: 'rgba(100,255,100,0.8)' },       // 2 - Neon Green
              { start: 'rgba(0,150,255,0.9)', end: 'rgba(100,200,255,0.8)' },     // 3 - Electric Blue
              { start: 'rgba(255,0,255,0.9)', end: 'rgba(255,120,255,0.8)' },     // 4 - Magenta Glow
              { start: 'rgba(255,255,0,0.9)', end: 'rgba(255,255,100,0.8)' },     // 5 - Neon Yellow
              { start: 'rgba(255,95,31,0.9)', end: 'rgba(255,160,90,0.8)' },      // 6 - Neon Orange
              { start: 'rgba(0,255,255,0.9)', end: 'rgba(100,255,255,0.8)' },     // 7 - Cyan Flash
              { start: 'rgba(185,0,255,0.9)', end: 'rgba(220,100,255,0.8)' },     // 8 - Violet Pulse
              { start: 'rgba(57,255,20,0.9)', end: 'rgba(150,255,120,0.8)' },     // 9 - Toxic Green
              { start: 'rgba(255,20,147,0.9)', end: 'rgba(255,130,190,0.8)' },    // 10 - Neon Pink

              { start: 'rgba(255,140,0,0.9)', end: 'rgba(255,200,100,0.8)' },     // 11 - Bright Amber
              { start: 'rgba(255,69,0,0.9)', end: 'rgba(255,150,90,0.8)' },       // 12 - Fiery Red
              { start: 'rgba(138,43,226,0.9)', end: 'rgba(186,85,211,0.8)' },     // 13 - Deep Violet
              { start: 'rgba(0,191,255,0.9)', end: 'rgba(135,206,255,0.8)' },     // 14 - Sky Pulse
              { start: 'rgba(255,215,0,0.9)', end: 'rgba(255,240,130,0.8)' },     // 15 - Golden Shine
              { start: 'rgba(199,21,133,0.9)', end: 'rgba(255,105,180,0.8)' },    // 16 - Neon Rose
              { start: 'rgba(50,205,50,0.9)', end: 'rgba(144,238,144,0.8)' },     // 17 - Lush Green
              { start: 'rgba(72,61,139,0.9)', end: 'rgba(123,104,238,0.8)' },     // 18 - Dark Indigo
              { start: 'rgba(64,224,208,0.9)', end: 'rgba(175,238,238,0.8)' },    // 19 - Aqua Breeze
              { start: 'rgba(255,99,71,0.9)', end: 'rgba(255,160,122,0.8)' },     // 20 - Hot Coral

              { start: 'rgba(176,224,230,0.9)', end: 'rgba(224,255,255,0.8)' },   // 21 - Ice Blue
              { start: 'rgba(255,182,193,0.9)', end: 'rgba(255,228,225,0.8)' },   // 22 - Soft Pink
              { start: 'rgba(154,205,50,0.9)', end: 'rgba(202,255,112,0.8)' },    // 23 - Lime Flash
              { start: 'rgba(0,255,127,0.9)', end: 'rgba(127,255,212,0.8)' },     // 24 - Mint Energy
              { start: 'rgba(0,206,209,0.9)', end: 'rgba(72,209,204,0.8)' },      // 25 - Deep Cyan
              { start: 'rgba(186,85,211,0.9)', end: 'rgba(218,112,214,0.8)' },    // 26 - Neon Purple
              { start: 'rgba(255,20,20,0.9)', end: 'rgba(255,120,120,0.8)' },     // 27 - Intense Red
              { start: 'rgba(0,100,255,0.9)', end: 'rgba(100,150,255,0.8)' },     // 28 - Deep Electric
              { start: 'rgba(255,255,240,0.9)', end: 'rgba(255,255,200,0.8)' },   // 29 - Soft Light
              { start: 'rgba(255,160,122,0.9)', end: 'rgba(255,200,150,0.8)' },   // 30 - Warm Peach

              { start: 'rgba(255,105,180,0.9)', end: 'rgba(255,182,193,0.8)' },   // 31 - Candy Pink
              { start: 'rgba(139,0,139,0.9)', end: 'rgba(186,85,211,0.8)' },      // 32 - Dark Magenta
              { start: 'rgba(255,248,220,0.9)', end: 'rgba(255,250,240,0.8)' },   // 33 - Light Cream
              { start: 'rgba(34,139,34,0.9)', end: 'rgba(60,179,113,0.8)' },      // 34 - Forest Green
              { start: 'rgba(0,191,255,0.9)', end: 'rgba(173,216,230,0.8)' },     // 35 - Crystal Blue
              { start: 'rgba(255,228,181,0.9)', end: 'rgba(255,239,213,0.8)' },   // 36 - Golden Sand
              { start: 'rgba(70,130,180,0.9)', end: 'rgba(100,149,237,0.8)' },    // 37 - Steel Glow
              { start: 'rgba(255,0,127,0.9)', end: 'rgba(255,105,180,0.8)' },     // 38 - Neon Rose
              { start: 'rgba(46,139,87,0.9)', end: 'rgba(60,179,113,0.8)' },      // 39 - Emerald Shine
              { start: 'rgba(255,69,200,0.9)', end: 'rgba(255,150,240,0.8)' },    // 40 - Cyber Pink

              { start: 'rgba(123,104,238,0.9)', end: 'rgba(147,112,219,0.8)' },   // 41 - Soft Indigo
              { start: 'rgba(255,165,0,0.9)', end: 'rgba(255,200,100,0.8)' },     // 42 - Neon Amber
              { start: 'rgba(0,250,154,0.9)', end: 'rgba(144,238,144,0.8)' },     // 43 - Spring Green
              { start: 'rgba(173,255,47,0.9)', end: 'rgba(202,255,112,0.8)' },    // 44 - Lime Burst
              { start: 'rgba(255,240,245,0.9)', end: 'rgba(255,228,225,0.8)' },   // 45 - Blush
              { start: 'rgba(210,105,30,0.9)', end: 'rgba(244,164,96,0.8)' },     // 46 - Burnt Copper
              { start: 'rgba(0,128,255,0.9)', end: 'rgba(100,180,255,0.8)' },     // 47 - Neon Azure
              { start: 'rgba(138,43,226,0.9)', end: 'rgba(186,85,211,0.8)' },     // 48 - Vivid Violet
              { start: 'rgba(50,50,255,0.9)', end: 'rgba(120,120,255,0.8)' },     // 49 - Deep Electric Blue
              { start: 'rgba(255,215,0,0.9)', end: 'rgba(255,239,150,0.8)' }      // 50 - Golden Neon
            ];
            const c = colors[index];
            return {
              name: category, // Use the translated label
              value: data.totalAmount[index],
              totalQty: data.totalQty[index],
              itemStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0.5, color: c.start },
                  { offset: 1, color: c.end },
                ]),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 3,
              },
              label: {
                show: true,
                position: 'outside',
                formatter: (params: any) => `${FormatQty(params.data?.totalQty || params.value)}`,
                fontSize: 18,
                fontFamily: 'K2D, sans-serif',
                color: '#fff',
              }
            };
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 7,
              shadowOffsetY: 5,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
      backgroundColor: 'transparent',
      animationDuration: 3000,
      animationEasing: 'cubicOut',
    };
  }
}
