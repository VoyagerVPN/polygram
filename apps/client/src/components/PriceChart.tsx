import { FC, useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, CrosshairMode, AreaData, Time, AreaSeries } from 'lightweight-charts';
import { COLORS } from '@/constants';
import type { PriceHistoryPoint } from '@/types';

interface PriceChartProps {
  data: PriceHistoryPoint[];
}

export const PriceChart: FC<PriceChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 120,
      timeScale: { 
        visible: false,
        rightOffset: 0,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          style: 2,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          style: 2,
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: COLORS.chart,
      topColor: COLORS.chartTop,
      bottomColor: COLORS.chartBottom,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    // Format data for lightweight-charts
    const formattedData: AreaData<Time>[] = data.map(point => ({
      time: point.time as Time,
      value: point.value,
    }));

    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  if (!data.length) {
    return (
      <div className="h-[120px] flex items-center justify-center text-xs text-white/20 uppercase tracking-widest font-bold">
        No historical data available
      </div>
    );
  }

  return <div ref={chartContainerRef} className="w-full" />;
};
