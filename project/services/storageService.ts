/**
 * Storage Service for JanBol Platform
 * Handles local storage, offline support, and data synchronization
 */

interface IssueReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    locality: string;
    district: string;
    state: string;
  };
  attachments: string[];
  language: string;
  timestamp: Date;
  lastUpdated: Date;
  assignedTo?: string;
  estimatedResolution?: Date;
  actualResolution?: Date;
  feedback?: {
    rating: number;
    comment: string;
    timestamp: Date;
  };
}

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: {
    locality: string;
    district: string;
    state: string;
  };
  preferredLanguage: string;
  notificationSettings: {
    push: boolean;
    sms: boolean;
    voice: boolean;
  };
  joinDate: Date;
  reportsSubmitted: number;
  issuesResolved: number;
  points: number;
  badge: string;
}

interface SyncStatus {
  lastSync: Date;
  pendingUploads: string[];
  pendingDownloads: string[];
  conflictResolution: 'local' | 'remote' | 'merge';
}

export class StorageService {
  private static instance: StorageService;
  private dbName = 'JanBolDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Storage keys
  private readonly KEYS = {
    USER_PROFILE: 'user_profile',
    REPORTS: 'user_reports',
    SYNC_STATUS: 'sync_status',
    OFFLINE_QUEUE: 'offline_queue',
    CACHE_TIMESTAMP: 'cache_timestamp',
    APP_SETTINGS: 'app_settings'
  };

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('reports')) {
          const reportsStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportsStore.createIndex('userId', 'userId', { unique: false });
          reportsStore.createIndex('status', 'status', { unique: false });
          reportsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    // Save to localStorage for quick access
    localStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));

    // Save to IndexedDB for offline access
    if (this.db) {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      await this.promisifyRequest(store.put(profile));
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    // Try localStorage first
    const localData = localStorage.getItem(this.KEYS.USER_PROFILE);
    if (localData) {
      return JSON.parse(localData);
    }

    // Fallback to IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const result = await this.promisifyRequest(store.getAll());
      return result[0] || null;
    }

    return null;
  }

  /**
   * Save issue report
   */
  async saveReport(report: IssueReport): Promise<void> {
    // Save to localStorage for current session
    const reports = await this.getReports();
    const updatedReports = reports.filter(r => r.id !== report.id);
    updatedReports.push(report);
    localStorage.setItem(this.KEYS.REPORTS, JSON.stringify(updatedReports));

    // Save to IndexedDB for persistence
    if (this.db) {
      const transaction = this.db.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      await this.promisifyRequest(store.put(report));
    }
  }

  /**
   * Get all reports for current user
   */
  async getReports(userId?: string): Promise<IssueReport[]> {
    // Try localStorage first
    const localData = localStorage.getItem(this.KEYS.REPORTS);
    if (localData) {
      const reports = JSON.parse(localData);
      return userId ? reports.filter((r: IssueReport) => r.userId === userId) : reports;
    }

    // Fallback to IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      
      if (userId) {
        const index = store.index('userId');
        const result = await this.promisifyRequest(index.getAll(userId));
        return result;
      } else {
        const result = await this.promisifyRequest(store.getAll());
        return result;
      }
    }

    return [];
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<IssueReport | null> {
    const reports = await this.getReports();
    return reports.find(r => r.id === reportId) || null;
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string): Promise<void> {
    // Remove from localStorage
    const reports = await this.getReports();
    const filteredReports = reports.filter(r => r.id !== reportId);
    localStorage.setItem(this.KEYS.REPORTS, JSON.stringify(filteredReports));

    // Remove from IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      await this.promisifyRequest(store.delete(reportId));
    }
  }

  /**
   * Queue action for offline sync
   */
  async queueOfflineAction(action: {
    type: 'create' | 'update' | 'delete';
    entity: 'report' | 'user' | 'feedback';
    data: any;
    timestamp: Date;
  }): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    await this.promisifyRequest(store.add(action));
  }

  /**
   * Get pending offline actions
   */
  async getPendingActions(): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['offline_queue'], 'readonly');
    const store = transaction.objectStore('offline_queue');
    const result = await this.promisifyRequest(store.getAll());
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Clear processed offline actions
   */
  async clearProcessedActions(actionIds: number[]): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');

    for (const id of actionIds) {
      await this.promisifyRequest(store.delete(id));
    }
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, expiryHours: number = 24): Promise<void> {
    const cacheItem = {
      key,
      data,
      timestamp: new Date(),
      expiry: new Date(Date.now() + expiryHours * 60 * 60 * 1000)
    };

    // Cache in localStorage
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));

    // Cache in IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await this.promisifyRequest(store.put(cacheItem));
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    // Try localStorage first
    const localData = localStorage.getItem(`cache_${key}`);
    if (localData) {
      const cacheItem = JSON.parse(localData);
      if (new Date() < new Date(cacheItem.expiry)) {
        return cacheItem.data;
      }
      // Remove expired cache
      localStorage.removeItem(`cache_${key}`);
    }

    // Try IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const result = await this.promisifyRequest(store.get(key));
      
      if (result && new Date() < new Date(result.expiry)) {
        return result.data;
      } else if (result) {
        // Remove expired cache
        const deleteTransaction = this.db.transaction(['cache'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('cache');
        await this.promisifyRequest(deleteStore.delete(key));
      }
    }

    return null;
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalReports: number;
    pendingSync: number;
    cacheSize: number;
    lastSync: Date | null;
  }> {
    const reports = await this.getReports();
    const pendingActions = await this.getPendingActions();
    const syncData = localStorage.getItem(this.KEYS.SYNC_STATUS);
    const lastSync = syncData ? new Date(JSON.parse(syncData).lastSync) : null;

    return {
      totalReports: reports.length,
      pendingSync: pendingActions.length,
      cacheSize: this.calculateLocalStorageSize(),
      lastSync
    };
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });

    // Clear IndexedDB cache
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await this.promisifyRequest(store.clear());
    }
  }

  /**
   * Export user data for backup
   */
  async exportUserData(): Promise<{
    profile: UserProfile | null;
    reports: IssueReport[];
    settings: any;
    exportDate: Date;
  }> {
    const profile = await this.getUserProfile();
    const reports = await this.getReports();
    const settings = JSON.parse(localStorage.getItem(this.KEYS.APP_SETTINGS) || '{}');

    return {
      profile,
      reports,
      settings,
      exportDate: new Date()
    };
  }

  /**
   * Import user data from backup
   */
  async importUserData(data: {
    profile: UserProfile;
    reports: IssueReport[];
    settings: any;
  }): Promise<void> {
    // Import profile
    if (data.profile) {
      await this.saveUserProfile(data.profile);
    }

    // Import reports
    for (const report of data.reports) {
      await this.saveReport(report);
    }

    // Import settings
    if (data.settings) {
      localStorage.setItem(this.KEYS.APP_SETTINGS, JSON.stringify(data.settings));
    }
  }

  /**
   * Check if device has enough storage space
   */
  async checkStorageSpace(): Promise<{
    available: boolean;
    usage: number;
    quota: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const available = usage < quota * 0.9; // Keep 10% buffer

      return { available, usage, quota };
    }

    // Fallback for browsers without storage API
    return { available: true, usage: 0, quota: 0 };
  }

  /**
   * Helper function to promisify IndexedDB requests
   */
  private promisifyRequest(request: IDBRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate localStorage usage
   */
  private calculateLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Update sync status
   */
  async updateSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    const current = JSON.parse(localStorage.getItem(this.KEYS.SYNC_STATUS) || '{}');
    const updated = { ...current, ...status, lastSync: new Date() };
    localStorage.setItem(this.KEYS.SYNC_STATUS, JSON.stringify(updated));
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    const defaultStatus: SyncStatus = {
      lastSync: new Date(0),
      pendingUploads: [],
      pendingDownloads: [],
      conflictResolution: 'merge'
    };

    const stored = localStorage.getItem(this.KEYS.SYNC_STATUS);
    return stored ? { ...defaultStatus, ...JSON.parse(stored) } : defaultStatus;
  }
}

export const storageService = StorageService.getInstance();