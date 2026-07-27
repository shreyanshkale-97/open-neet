import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private activeUsers = 0;
  private totalAiTokens = 0;
  private totalAiCostUsd = 0;

  incrementActiveUsers() {
    this.activeUsers++;
  }

  decrementActiveUsers() {
    if (this.activeUsers > 0) this.activeUsers--;
  }

  recordAiUsage(tokens: number, costUsd: number) {
    this.totalAiTokens += tokens;
    this.totalAiCostUsd += costUsd;
  }

  getMetricsSnapshot() {
    return {
      activeUsers: this.activeUsers,
      totalAiTokens: this.totalAiTokens,
      totalAiCostUsd: Number(this.totalAiCostUsd.toFixed(4)),
      timestamp: new Date().toISOString(),
    };
  }
}