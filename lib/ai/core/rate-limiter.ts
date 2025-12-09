export class RateLimiter {
  private requests: number[] = [];
  private maxPerMinute: number;
  private maxPerHour: number;
  
  constructor(limits: { maxPerMinute: number; maxPerHour?: number }) {
    this.maxPerMinute = limits.maxPerMinute;
    this.maxPerHour = limits.maxPerHour || limits.maxPerMinute * 60;
  }
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Clean old requests
    this.requests = this.requests.filter(time => 
      now - time < 3600000 // Keep last hour
    );
    
    // Check minute limit
    const lastMinute = this.requests.filter(time => 
      now - time < 60000
    ).length;
    
    if (lastMinute >= this.maxPerMinute) {
      const oldestInMinute = Math.max(...this.requests.filter(time =>
        now - time < 60000
      ));
      const waitTime = 60000 - (now - oldestInMinute) + 100; // +100ms buffer
      
      await this.wait(waitTime);
    }
    
    // Check hour limit
    if (this.requests.length >= this.maxPerHour) {
      const oldestInHour = Math.min(...this.requests);
      const waitTime = 3600000 - (now - oldestInHour) + 100;
      
      await this.wait(waitTime);
    }
    
    // Record this request
    this.requests.push(Date.now());
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

