/**
 * 离场上传管理器 - 优化版
 * 本地记账，离场结账
 */

const { CACHE_CONFIG } = require('./constants.js');

const CACHE_KEYS = {
  BEHAVIOR_QUEUE: 'behavior_queue',
  PROFILE_DIRTY: 'profile_dirty',
  USER_PROFILE: 'user_profile',
  PRELOAD_PACKAGE: 'preload_package',
  PENDING_SYNC: 'pending_sync'
};

class ExitUploadManager {
  constructor() {
    this.isSyncing = false;
    this.heartbeatTimer = null;
    this.sessionId = null;
  }

  // ========== 数据记录（只写本地）==========

  recordBehavior(actionType, itemType, itemId, details = {}) {
    const queue = this._getQueue();
    
    queue.push({
      action_type: actionType,
      item_type: itemType,
      item_id: itemId,
      details,
      timestamp: Date.now(),
      session_id: this.sessionId
    });

    // 队列过长时移除旧数据
    if (queue.length > CACHE_CONFIG.MAX_BEHAVIOR_QUEUE) {
      queue.shift();
    }

    this._saveQueue(queue);
    this._markPending();
  }

  updateProfile(updates) {
    const profile = { ...this._getProfile(), ...updates, updatedAt: Date.now() };
    wx.setStorageSync(CACHE_KEYS.USER_PROFILE, profile);
    wx.setStorageSync(CACHE_KEYS.PROFILE_DIRTY, true);
    this._markPending();
  }

  // ========== 离场上传 ==========

  async syncOnExit() {
    if (this.isSyncing || !this._hasPending()) {
      return { success: false };
    }

    this.isSyncing = true;

    try {
      const data = this._prepareSyncData();
      if (!data.hasData) {
        this._clearPending();
        return { success: true };
      }

      const result = await wx.cloud.callFunction({
        name: 'batchSync',
        data,
        timeout: 5000
      });

      if (result.result?.success) {
        this._clearSyncedData();
        if (result.result.preloadPackage) {
          this._savePreload(result.result.preloadPackage);
        }
        return { success: true };
      }

      return { success: false, error: result.result?.error };
    } catch (err) {
      console.error('[ExitUpload] sync error:', err);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncOnLaunch() {
    return this._hasPending() ? this.syncOnExit() : { success: true };
  }

  // ========== 心跳定时器（优化版）==========

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.syncOnExit();
    }, CACHE_CONFIG.HEARTBEAT_INTERVAL);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ========== 预加载包 ==========

  getPreloadPackage() {
    try {
      const pkg = wx.getStorageSync(CACHE_KEYS.PRELOAD_PACKAGE);
      if (pkg && Date.now() - pkg.savedAt < CACHE_CONFIG.PRELOAD_PACKAGE_TTL) {
        return pkg;
      }
      wx.removeStorageSync(CACHE_KEYS.PRELOAD_PACKAGE);
      return null;
    } catch (e) {
      return null;
    }
  }

  // ========== 会话管理 ==========

  resetSession() {
    this.sessionId = 'sess_' + Date.now();
    this.stopHeartbeat();
  }

  // ========== 私有方法 ==========

  _getQueue() {
    try {
      return wx.getStorageSync(CACHE_KEYS.BEHAVIOR_QUEUE) || [];
    } catch (e) {
      return [];
    }
  }

  _saveQueue(queue) {
    wx.setStorageSync(CACHE_KEYS.BEHAVIOR_QUEUE, queue);
  }

  _getProfile() {
    try {
      return wx.getStorageSync(CACHE_KEYS.USER_PROFILE) || {};
    } catch (e) {
      return {};
    }
  }

  _hasPending() {
    try {
      return wx.getStorageSync(CACHE_KEYS.PENDING_SYNC) === true;
    } catch (e) {
      return false;
    }
  }

  _markPending() {
    wx.setStorageSync(CACHE_KEYS.PENDING_SYNC, true);
  }

  _clearPending() {
    wx.removeStorageSync(CACHE_KEYS.PENDING_SYNC);
  }

  _prepareSyncData() {
    const queue = this._getQueue();
    const profile = this._getProfile();
    const isDirty = wx.getStorageSync(CACHE_KEYS.PROFILE_DIRTY);

    return {
      hasData: queue.length > 0 || isDirty,
      behaviors: queue,
      profile: isDirty ? profile : null,
      syncTime: Date.now()
    };
  }

  _clearSyncedData() {
    wx.removeStorageSync(CACHE_KEYS.BEHAVIOR_QUEUE);
    wx.removeStorageSync(CACHE_KEYS.PROFILE_DIRTY);
    this._clearPending();
  }

  _savePreload(packageData) {
    wx.setStorageSync(CACHE_KEYS.PRELOAD_PACKAGE, {
      ...packageData,
      savedAt: Date.now()
    });
  }
}

module.exports = new ExitUploadManager();
