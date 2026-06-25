import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60000, // 1 minute
  });
}

export function useLeadsByStatus() {
  return useQuery({
    queryKey: ['leads-by-status'],
    queryFn: dashboardService.getLeadsByStatus,
    staleTime: 60000,
  });
}

export function useLeadsTrend(days = 30) {
  return useQuery({
    queryKey: ['leads-trend', days],
    queryFn: () => dashboardService.getLeadsTrend(days),
    staleTime: 60000,
  });
}

export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 60000,
  });
}

export function useTopLeads(limit = 5) {
  return useQuery({
    queryKey: ['top-leads', limit],
    queryFn: () => dashboardService.getTopLeads(limit),
    staleTime: 60000,
  });
}

export function useDashboardFollowups(days = 7) {
  return useQuery({
    queryKey: ['dashboard-followups', days],
    queryFn: () => dashboardService.getUpcomingFollowups(days),
    staleTime: 60000,
  });
}
