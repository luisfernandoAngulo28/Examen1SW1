import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /** GET /analytics/dashboard — Global KPIs */
  @Get('dashboard')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  /** GET /analytics/policy/:id — Per-policy analytics with bottleneck detection */
  @Get('policy/:id')
  getPolicyAnalytics(@Param('id') id: string) {
    return this.analyticsService.getPolicyAnalytics(id);
  }
}
