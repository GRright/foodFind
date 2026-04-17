/**
 * 关键业务指标追踪器
 * 追踪推荐点击率、转化率、用户活跃度等核心指标
 */

const METRICS_CONFIG = {
  MAX_HISTORY_DAYS: 30,
  UPLOAD_INTERVAL: 24 * 60 * 60 * 1000
};

class MetricsTracker {
  constructor() {
    this._metrics = null;
    this._loadMetrics();
  }

  _loadMetrics() {
    try {
      this._metrics = wx.getStorageSync('user_metrics') || this._createDefaultMetrics();
    } catch (e) {
      this._metrics = this._createDefaultMetrics();
    }
  }

  _saveMetrics() {
    wx.setStorageSync('user_metrics', this._metrics);
  }

  _createDefaultMetrics() {
    return {
      sessionCount: 0,
      totalViews: 0,
      totalClicks: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalOrders: 0,
      dailyActiveDays: 0,
      lastActiveDate: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  recordSession() {
    const today = new Date().toDateString();
    
    this._metrics.sessionCount++;
    
    if (this._metrics.lastActiveDate !== today) {
      this._metrics.dailyActiveDays++;
      this._metrics.lastActiveDate = today;
    }
    
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  recordView() {
    this._metrics.totalViews++;
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  recordClick() {
    this._metrics.totalClicks++;
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  recordLike() {
    this._metrics.totalLikes++;
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  recordDislike() {
    this._metrics.totalDislikes++;
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  recordOrder() {
    this._metrics.totalOrders++;
    this._metrics.updatedAt = Date.now();
    this._saveMetrics();
  }

  getMetrics() {
    const m = this._metrics;
    return {
      sessionCount: m.sessionCount,
      dailyActiveDays: m.dailyActiveDays,
      retentionRate: m.sessionCount > 0 ? (m.dailyActiveDays / Math.max(1, m.sessionCount)) * 100 : 0,
      clickRate: m.totalViews > 0 ? (m.totalClicks / m.totalViews) * 100 : 0,
      likeRate: m.totalViews > 0 ? (m.totalLikes / m.totalViews) * 100 : 0,
      engagementScore: this._calculateEngagementScore()
    };
  }

  _calculateEngagementScore() {
    const m = this._metrics;
    const recency = m.lastActiveDate === new Date().toDateString() ? 50 : 0;
    const frequency = Math.min(m.sessionCount * 5, 30);
    const interaction = Math.min((m.totalLikes + m.totalClicks) * 2, 20);
    
    return Math.min(recency + frequency + interaction, 100);
  }

  exportForUpload() {
    return {
      ...this._metrics,
      exportAt: Date.now()
    };
  }

  clear() {
    wx.removeStorageSync('user_metrics');
    this._metrics = this._createDefaultMetrics();
  }
}

module.exports = new MetricsTracker();
