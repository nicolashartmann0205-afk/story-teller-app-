"use client";

import { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface QuotaTrackerProps {
  onQuotaWarning?: () => void;
}

export function QuotaTracker({ onQuotaWarning }: QuotaTrackerProps) {
  const [usageCount, setUsageCount] = useState(0);
  const [lastReset, setLastReset] = useState<Date>(new Date());
  
  const QUOTA_LIMIT = 20; // Free tier limit per minute
  const WARNING_THRESHOLD = 15; // Warn at 75%
  
  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('illustration_quota');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const resetTime = new Date(data.resetTime);
        const now = new Date();
        
        // Reset if more than 60 seconds have passed
        if (now.getTime() - resetTime.getTime() > 60000) {
          setUsageCount(0);
          setLastReset(now);
          localStorage.setItem('illustration_quota', JSON.stringify({
            count: 0,
            resetTime: now.toISOString()
          }));
        } else {
          setUsageCount(data.count || 0);
          setLastReset(resetTime);
        }
      } catch (e) {
        console.error('Failed to parse quota data:', e);
      }
    }
  }, []);
  
  // Listen for quota usage events
  useEffect(() => {
    const handleQuotaUsed = () => {
      setUsageCount(prev => {
        const newCount = prev + 1;
        
        // Save to localStorage
        localStorage.setItem('illustration_quota', JSON.stringify({
          count: newCount,
          resetTime: lastReset.toISOString()
        }));
        
        // Trigger warning if needed
        if (newCount >= WARNING_THRESHOLD && onQuotaWarning) {
          onQuotaWarning();
        }
        
        return newCount;
      });
    };
    
    window.addEventListener('quota-used', handleQuotaUsed);
    return () => window.removeEventListener('quota-used', handleQuotaUsed);
  }, [lastReset, onQuotaWarning]);
  
  const percentage = (usageCount / QUOTA_LIMIT) * 100;
  const remaining = Math.max(0, QUOTA_LIMIT - usageCount);
  
  // Determine status
  const getStatus = () => {
    if (usageCount >= QUOTA_LIMIT) {
      return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', icon: AlertTriangle, label: 'Quota Exceeded' };
    } else if (usageCount >= WARNING_THRESHOLD) {
      return { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', icon: AlertTriangle, label: 'Approaching Limit' };
    } else {
      return { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle, label: 'Available' };
    }
  };
  
  const status = getStatus();
  const Icon = status.icon;
  
  return (
    <div className={`p-3 rounded-lg border ${status.bgColor} border-current`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${status.color}`} />
          <span className={`text-sm font-medium ${status.color}`}>
            API Quota
          </span>
        </div>
        <span className={`text-xs font-semibold ${status.color}`}>
          {remaining}/{QUOTA_LIMIT}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            percentage >= 100 ? 'bg-red-500' :
            percentage >= 75 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
        {usageCount >= QUOTA_LIMIT 
          ? 'Quota exceeded. Using placeholders.'
          : usageCount >= WARNING_THRESHOLD
          ? `${remaining} generations left before limit`
          : 'Quota resets every minute'}
      </p>
    </div>
  );
}

// Helper function to increment quota (call from illustration panel)
export function incrementQuotaUsage() {
  window.dispatchEvent(new Event('quota-used'));
}

