// Data sync service for localStorage ↔ Supabase synchronization
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '@/services/bossTrackerService';

export interface SyncData {
  boss_progress: any;
  boss_enabled: any;
  boss_party: any;
  temp_disabled_bosses: any;
  last_reset_timestamp: number;
  last_monthly_reset_timestamp: number;
  character_order: string[];
  roster: any[];
  last_synced: number;
}

export class DataSyncService {
  private static readonly SYNC_KEY = 'maplehub_last_synced';
  private static readonly SYNC_VERSION = '1.0';

  // Upload all local data to Supabase
  static async uploadAllData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const syncData: SyncData = {
        boss_progress: this.loadFromLocalStorage(STORAGE_KEYS.BOSS_PROGRESS, {}),
        boss_enabled: this.loadFromLocalStorage(STORAGE_KEYS.BOSS_ENABLED, {}),
        boss_party: this.loadFromLocalStorage(STORAGE_KEYS.BOSS_PARTY, {}),
        temp_disabled_bosses: this.loadFromLocalStorage(STORAGE_KEYS.BOSS_TEMP_DISABLED, {}),
        last_reset_timestamp: this.loadFromLocalStorage(STORAGE_KEYS.LAST_RESET_TIMESTAMP, 0),
        last_monthly_reset_timestamp: this.loadFromLocalStorage(STORAGE_KEYS.LAST_MONTHLY_RESET_TIMESTAMP, 0),
        character_order: this.loadFromLocalStorage(STORAGE_KEYS.CHARACTER_ORDER, []),
        roster: this.loadFromLocalStorage(STORAGE_KEYS.ROSTER, []),
        last_synced: Date.now()
      };

      // Upload each data type
      const uploadPromises = Object.entries(syncData).map(([key, value]) =>
        this.uploadDataType(user.id, key, value)
      );

      await Promise.all(uploadPromises);

      // Mark as synced locally
      localStorage.setItem(this.SYNC_KEY, Date.now().toString());

      console.log('✅ All data uploaded to cloud');
    } catch (error) {
      console.error('❌ Failed to upload data:', error);
      throw error;
    }
  }

  // Download all data from Supabase and merge with local
  static async downloadAllData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dataTypes = [
        'boss_progress',
        'boss_enabled',
        'boss_party',
        'temp_disabled_bosses',
        'last_reset_timestamp',
        'last_monthly_reset_timestamp',
        'character_order',
        'roster'
      ];

      const downloadPromises = dataTypes.map(type => this.downloadDataType(user.id, type));
      const results = await Promise.all(downloadPromises);

      // Merge results with local data
      results.forEach((result, index) => {
        if (result) {
          this.mergeWithLocalData(dataTypes[index], result);
        }
      });

      // Mark as synced locally
      localStorage.setItem(this.SYNC_KEY, Date.now().toString());

      console.log('✅ All data downloaded from cloud');
    } catch (error) {
      console.error('❌ Failed to download data:', error);
      throw error;
    }
  }

  // Sync data (upload local changes, download remote changes)
  static async syncData(): Promise<void> {
    try {
      // First upload any local changes
      await this.uploadAllData();

      // Then download latest remote data
      await this.downloadAllData();

      console.log('✅ Data sync completed');
    } catch (error) {
      console.error('❌ Data sync failed:', error);
      throw error;
    }
  }

  // Check if data needs syncing (based on time since last sync)
  static needsSync(): boolean {
    try {
      const lastSynced = localStorage.getItem(this.SYNC_KEY);
      if (!lastSynced) return true;

      const lastSyncTime = parseInt(lastSynced);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      return (now - lastSyncTime) > oneHour;
    } catch {
      return true;
    }
  }

  // Upload specific data type to Supabase
  private static async uploadDataType(userId: string, dataType: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('user_data' as any)
      .upsert({
        user_id: userId,
        data_type: dataType,
        data: data,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,data_type'
      });

    if (error) throw error;
  }

  // Download specific data type from Supabase
  private static async downloadDataType(userId: string, dataType: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_data' as any)
      .select('data')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data?.data || null;
  }

  // Merge remote data with local data (local takes precedence for conflicts)
  private static mergeWithLocalData(dataType: string, remoteData: any): void {
    const localData = this.loadFromLocalStorage(this.getStorageKey(dataType), null);

    if (!localData && remoteData) {
      // No local data, use remote
      this.saveToLocalStorage(this.getStorageKey(dataType), remoteData);
    } else if (localData && remoteData) {
      // Both exist, merge intelligently
      const merged = this.mergeData(localData, remoteData, dataType);
      this.saveToLocalStorage(this.getStorageKey(dataType), merged);
    }
    // If no remote data, keep local data as-is
  }

  // Intelligent data merging based on data type
  private static mergeData(local: any, remote: any, dataType: string): any {
    switch (dataType) {
      case 'boss_progress':
      case 'boss_enabled':
      case 'boss_party':
      case 'temp_disabled_bosses':
        // For object-based data, merge properties (local wins conflicts)
        return { ...remote, ...local };

      case 'roster':
        // For arrays, merge by ID (local wins)
        if (Array.isArray(local) && Array.isArray(remote)) {
          const merged = [...remote];
          local.forEach(localItem => {
            const existingIndex = merged.findIndex(remoteItem =>
              remoteItem.id === localItem.id
            );
            if (existingIndex >= 0) {
              merged[existingIndex] = localItem; // Local wins
            } else {
              merged.push(localItem); // Add new items
            }
          });
          return merged;
        }
        return local;

      case 'character_order':
        // For arrays, local wins completely
        return local;

      case 'last_reset_timestamp':
      case 'last_monthly_reset_timestamp':
        // For timestamps, take the most recent
        return Math.max(local, remote);

      default:
        return local; // Local wins by default
    }
  }

  // Helper methods
  private static loadFromLocalStorage(key: string, defaultValue: any): any {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  private static getStorageKey(dataType: string): string {
    const keyMap: { [key: string]: string } = {
      boss_progress: STORAGE_KEYS.BOSS_PROGRESS,
      boss_enabled: STORAGE_KEYS.BOSS_ENABLED,
      boss_party: STORAGE_KEYS.BOSS_PARTY,
      temp_disabled_bosses: STORAGE_KEYS.BOSS_TEMP_DISABLED,
      last_reset_timestamp: STORAGE_KEYS.LAST_RESET_TIMESTAMP,
      last_monthly_reset_timestamp: STORAGE_KEYS.LAST_MONTHLY_RESET_TIMESTAMP,
      character_order: STORAGE_KEYS.CHARACTER_ORDER,
      roster: STORAGE_KEYS.ROSTER
    };
    return keyMap[dataType] || dataType;
  }
}
