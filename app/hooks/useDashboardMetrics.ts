import { useState, useEffect } from 'react';
import { DashboardMetrics } from '../types/dashboard';
import { pusherClient, PUSHER_CHANNELS } from '@/lib/pusher';

const DEFAULT_METRICS: DashboardMetrics = {
  totalQuotations: 0,
  totalAccounts: 0,
  totalMessages: 0,
  accountStats: []
};

export function useDashboardMetrics(initialMetrics: DashboardMetrics) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics || DEFAULT_METRICS);

  useEffect(() => {
    const channel = pusherClient.subscribe(PUSHER_CHANNELS.CHAT);

    const handleMetricsUpdate = (updatedMetrics: DashboardMetrics) => {
      console.log('Received metrics update:', updatedMetrics);
      setMetrics(updatedMetrics || DEFAULT_METRICS);
    };

    // Listen for metrics updates
    channel.bind('metrics-updated', handleMetricsUpdate);
    channel.bind('quotation-created', (data: { metrics: DashboardMetrics }) => handleMetricsUpdate(data.metrics));
    channel.bind('quotation-deleted', (data: { metrics: DashboardMetrics }) => handleMetricsUpdate(data.metrics));
    channel.bind('quotation-updated', (data: { metrics: DashboardMetrics }) => handleMetricsUpdate(data.metrics));

    return () => {
      channel.unbind('metrics-updated', handleMetricsUpdate);
      channel.unbind('quotation-created');
      channel.unbind('quotation-deleted');
      channel.unbind('quotation-updated');
      pusherClient.unsubscribe(PUSHER_CHANNELS.CHAT);
    };
  }, []);

  return metrics;
}