interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  metadata?: any;
}

interface FinancialActionLog {
  action: 'VIEW_DASHBOARD' | 'ADD_TRANSACTION' | 'UPDATE_GOAL' | 'VIEW_REPORTS' | 'SYNC_DATA';
  component: string;
  userId?: string;
  data?: any;
  timestamp: Date;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  component: string;
  timestamp: Date;
}

interface ErrorLog {
  error: Error;
  component: string;
  action?: string;
  userId?: string;
  timestamp: Date;
  stack?: string;
  metadata?: any;
}

class FrontendLogger {
  private sessionId: string;
  private userId: string | null = null;
  private logBuffer: LogEntry[] = [];
  private performanceBuffer: PerformanceMetric[] = [];
  private errorBuffer: ErrorLog[] = [];
  private isOnline = navigator.onLine;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineOfflineHandlers();
    this.setupPerformanceObserver();
    this.setupErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushBuffers();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.logPerformance('PAGE_LOAD', entry.duration, 'ms', 'Navigation');
          } else if (entry.entryType === 'measure') {
            this.logPerformance(entry.name, entry.duration, 'ms', 'Custom');
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });
    }
  }

  private setupErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), 'Global', 'UNHANDLED_ERROR', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), 'Global', 'UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason
      });
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.log('User logged in', 'INFO', 'Authentication', { userId });
  }

  log(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO', component: string = 'Unknown', metadata?: any) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        component,
        ...metadata
      }
    };

    console.log(`[${level}] ${component}: ${message}`, metadata);
    
    this.logBuffer.push(logEntry);
    
    if (this.isOnline && this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  logFinancialAction(action: FinancialActionLog['action'], component: string, data?: any) {
    const actionLog: FinancialActionLog = {
      action,
      component,
      userId: this.userId || undefined,
      data,
      timestamp: new Date()
    };

    this.log(`Financial action: ${action}`, 'INFO', component, {
      financialAction: actionLog,
      sensitive: true
    });

    // Track specific financial metrics
    if (action === 'ADD_TRANSACTION' && data?.amount) {
      this.logPerformance('TRANSACTION_AMOUNT', data.amount, 'ZAR', 'Financial');
    }
  }

  logUserInteraction(element: string, action: string, component: string, data?: any) {
    this.log(`User interaction: ${action} on ${element}`, 'INFO', component, {
      interaction: {
        element,
        action,
        data,
        timestamp: new Date()
      }
    });
  }

  logPageView(pageName: string, loadTime?: number) {
    this.log(`Page view: ${pageName}`, 'INFO', 'Navigation', {
      pageView: {
        pageName,
        loadTime,
        url: window.location.href,
        referrer: document.referrer
      }
    });

    if (loadTime) {
      this.logPerformance('PAGE_VIEW_TIME', loadTime, 'ms', 'Navigation');
    }
  }

  logAPICall(endpoint: string, method: string, duration: number, status: number, component: string = 'API') {
    const level = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'INFO';
    
    this.log(`API call: ${method} ${endpoint}`, level, component, {
      api: {
        endpoint,
        method,
        duration,
        status,
        timestamp: new Date()
      }
    });

    this.logPerformance(`API_${method}_${endpoint.replace(/\//g, '_')}`, duration, 'ms', 'API');
  }

  logWebSocketEvent(event: string, data?: any, component: string = 'WebSocket') {
    this.log(`WebSocket event: ${event}`, 'INFO', component, {
      websocket: {
        event,
        data,
        timestamp: new Date()
      }
    });
  }

  logError(error: Error, component: string, action?: string, metadata?: any) {
    const errorLog: ErrorLog = {
      error,
      component,
      action,
      userId: this.userId || undefined,
      timestamp: new Date(),
      stack: error.stack,
      metadata
    };

    console.error(`[ERROR] ${component}:`, error, metadata);
    
    this.errorBuffer.push(errorLog);
    
    this.log(`Error in ${component}: ${error.message}`, 'ERROR', component, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        action,
        ...metadata
      }
    });

    if (this.isOnline) {
      this.flushErrorBuffer();
    }
  }

  logPerformance(metric: string, value: number, unit: string, component: string) {
    const performanceMetric: PerformanceMetric = {
      metric,
      value,
      unit,
      component,
      timestamp: new Date()
    };

    this.performanceBuffer.push(performanceMetric);

    // Log slow operations
    if ((unit === 'ms' && value > 3000) || (metric.includes('SLOW'))) {
      this.log(`Slow operation: ${metric} took ${value}${unit}`, 'WARN', component, {
        performance: performanceMetric
      });
    }

    if (this.isOnline && this.performanceBuffer.length >= 20) {
      this.flushPerformanceBuffer();
    }
  }

  logFormSubmission(formName: string, fields: string[], component: string, success: boolean, validationErrors?: string[]) {
    this.log(`Form submission: ${formName}`, success ? 'INFO' : 'WARN', component, {
      form: {
        formName,
        fields,
        success,
        validationErrors,
        timestamp: new Date()
      }
    });
  }

  logChartInteraction(chartType: string, interaction: string, data?: any, component: string = 'Charts') {
    this.log(`Chart interaction: ${interaction} on ${chartType}`, 'INFO', component, {
      chart: {
        chartType,
        interaction,
        data,
        timestamp: new Date()
      }
    });
  }

  logNetWorthUpdate(previousValue: number, newValue: number, changePercent: number) {
    this.logFinancialAction('UPDATE_GOAL', 'NetWorth', {
      previousValue,
      newValue,
      changePercent,
      goalProgress: (newValue / 1800000) * 100
    });

    this.logPerformance('NET_WORTH_VALUE', newValue, 'ZAR', 'Financial');
  }

  log43V3RRevenue(amount: number, source: string) {
    this.logFinancialAction('ADD_TRANSACTION', '43V3R', {
      amount,
      source,
      type: 'BUSINESS_REVENUE',
      dailyTarget: 4881,
      achievementPercent: (amount / 4881) * 100
    });

    this.logPerformance('43V3R_DAILY_REVENUE', amount, 'ZAR', 'Business');
  }

  private async flushBuffers() {
    await Promise.all([
      this.flushLogBuffer(),
      this.flushPerformanceBuffer(),
      this.flushErrorBuffer()
    ]);
  }

  private async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    // Skip server logging in development
    if (window.location.hostname === 'localhost') {
      return;
    }

    try {
      await fetch('/api/logs/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error('Failed to send logs to server:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logs);
    }
  }

  private async flushPerformanceBuffer() {
    if (this.performanceBuffer.length === 0) return;

    const metrics = [...this.performanceBuffer];
    this.performanceBuffer = [];

    // Skip server logging in development
    if (window.location.hostname === 'localhost') {
      return;
    }

    try {
      await fetch('/api/logs/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics to server:', error);
      // Re-add metrics to buffer for retry
      this.performanceBuffer.unshift(...metrics);
    }
  }

  private async flushErrorBuffer() {
    if (this.errorBuffer.length === 0) return;

    const errors = [...this.errorBuffer];
    this.errorBuffer = [];

    // Skip server logging in development
    if (window.location.hostname === 'localhost') {
      return;
    }

    try {
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: errors.map(e => ({
          ...e,
          error: {
            name: e.error.name,
            message: e.error.message,
            stack: e.error.stack
          }
        })) }),
      });
    } catch (error) {
      console.error('Failed to send error logs to server:', error);
      // Re-add errors to buffer for retry
      this.errorBuffer.unshift(...errors);
    }
  }

  // Utility methods
  startPerformanceTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.logPerformance(name, duration, 'ms', 'Timer');
    };
  }

  measureComponentRender(componentName: string): () => void {
    return this.startPerformanceTimer(`COMPONENT_RENDER_${componentName}`);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getBufferSizes(): { logs: number; performance: number; errors: number } {
    return {
      logs: this.logBuffer.length,
      performance: this.performanceBuffer.length,
      errors: this.errorBuffer.length
    };
  }
}

export const logger = new FrontendLogger();
export default logger;