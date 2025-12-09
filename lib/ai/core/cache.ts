interface CacheEntry {
  value: any;
  createdAt: number;
  lastAccessed: number;
  expiresAt: number;
}

export class GenerationCache {
  private storage: Map<string, CacheEntry>;
  private maxSize: number = 100;
  private ttl: number = 3600; // 1 hour default
  
  constructor() {
    this.storage = new Map();
    this.startCleanupInterval();
  }
  
  async get(key: string): Promise<any | null> {
    const entry = this.storage.get(key);
    
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.storage.delete(key);
      return null;
    }
    
    // Update access time
    entry.lastAccessed = Date.now();
    
    return entry.value;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Enforce size limit
    if (this.storage.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.storage.set(key, {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + (ttl || this.ttl) * 1000
    });
  }
  
  private evictOldest(): void {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.storage.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.storage.delete(oldestKey);
    }
  }
  
  private startCleanupInterval(): void {
    // Check if running in a browser or Node.js environment where interval is allowed
    // Using a simple timeout loop instead of setInterval to avoid potential issues in some serverless environments
    // But for this standard class, setInterval is fine.
    // However, in Next.js edge functions, this might not persist.
    // This is an in-memory cache, so it resets on server restart/cold start.
    // For production, Redis would be better as noted in the doc.
    if (typeof setInterval !== 'undefined') {
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.storage.entries()) {
              if (now > entry.expiresAt) {
                this.storage.delete(key);
              }
            }
          }, 60000); // Every minute
    }
  }
  
  generateCacheKey(type: string, params: any): string {
    // Create deterministic cache key
    const normalized = this.normalizeParams(params);
    const hash = this.simpleHash(JSON.stringify(normalized));
    return `${type}:${hash}`;
  }
  
  private normalizeParams(params: any): any {
    // Sort object keys for consistent hashing
    if (typeof params !== 'object' || params === null) {
      return params;
    }
    
    if (Array.isArray(params)) {
      return params.map(p => this.normalizeParams(p));
    }
    
    const sorted: Record<string, any> = {};
    Object.keys(params).sort().forEach(key => {
      sorted[key] = this.normalizeParams(params[key]);
    });
    
    return sorted;
  }
  
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

