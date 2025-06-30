'use client';

import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/features/platform-admin/lib/analytics-api';
import { ProjectUsageHistoryResponse } from '@activepieces/shared';

export function ProjectUsageHistory() {
  const [selectedMonths, setSelectedMonths] = React.useState<number>(6);

  const { data: usageHistory, isLoading, refetch } = useQuery({
    queryKey: ['project-usage-history', selectedMonths],
    queryFn: () => analyticsApi.getProjectUsageHistory(selectedMonths),
    staleTime: 60 * 1000,
  });

  const handleMonthsChange = (value: string) => {
    const months = parseInt(value);
    setSelectedMonths(months);
  };

  const handleExport = () => {
    if (!usageHistory) return;
    
    const csvContent = [
      ['Project Name', 'Month', 'Total Tasks', 'Total AI Cost'].join(','),
      ...usageHistory.map(item => [
        `"${item.projectName}"`,
        item.month,
        item.totalTasks.toString(),
        item.totalAICost.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project-usage-history-${selectedMonths}months.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupedData = React.useMemo(() => {
    if (!usageHistory) return [];
    
    const grouped = usageHistory.reduce((acc, item) => {
      const key = item.projectName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ProjectUsageHistoryResponse>);

    return Object.entries(grouped).map(([projectName, items]) => ({
      projectName,
      items: items.sort((a, b) => b.month.localeCompare(a.month)),
      totalTasks: items.reduce((sum, item) => sum + item.totalTasks, 0),
      totalAICost: items.reduce((sum, item) => sum + item.totalAICost, 0),
    }));
  }, [usageHistory]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <div className="text-xl font-semibold">{t('Project Usage History')}</div>
          <p>{t('Monthly breakdown of AI credits and task usage per project')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonths.toString()} onValueChange={handleMonthsChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('Select months')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">{t('3 months')}</SelectItem>
              <SelectItem value="6">{t('6 months')}</SelectItem>
              <SelectItem value="12">{t('12 months')}</SelectItem>
              <SelectItem value="24">{t('24 months')}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!usageHistory || usageHistory.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('Export CSV')}
          </Button>
        </div>
      </div>
      
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usageHistory && usageHistory.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Project Name')}</TableHead>
                  <TableHead>{t('Month')}</TableHead>
                  <TableHead className="text-right">{t('Tasks')}</TableHead>
                  <TableHead className="text-right">{t('AI Credits')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData.map((project) => (
                  <React.Fragment key={project.projectName}>
                    {project.items.map((item, index) => (
                      <TableRow key={`${item.projectId}-${item.month}`}>
                        <TableCell className="font-medium">
                          {index === 0 ? item.projectName : ''}
                        </TableCell>
                        <TableCell>{item.month}</TableCell>
                        <TableCell className="text-right">
                          {item.totalTasks.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.totalAICost.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-semibold">
                        {t('Total for {{projectName}}', { projectName: project.projectName })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {t('{{months}} months', { months: selectedMonths })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {project.totalTasks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {project.totalAICost.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('No usage data found for the selected time period')}
          </div>
        )}
      </div>
    </>
  );
}