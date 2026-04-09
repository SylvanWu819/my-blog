// 错误监控服务
export class ErrorMonitorService {
    constructor() {
        this.sentryEnabled = false;
        this.supabaseService = null;
    }

    // 初始化 Sentry (需要你注册后获取DSN)
    initSentry(dsn) {
        if (typeof Sentry !== 'undefined' && dsn) {
            Sentry.init({
                dsn: dsn,
                integrations: [
                    new Sentry.BrowserTracing(),
                    new Sentry.Replay()
                ],
                tracesSampleRate: 1.0,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
                environment: 'production'
            });
            this.sentryEnabled = true;
            console.log('Sentry initialized');
        }
    }

    // 设置用户信息
    setUser(userId, email = null) {
        if (this.sentryEnabled && typeof Sentry !== 'undefined') {
            Sentry.setUser({
                id: userId,
                email: email
            });
        }
    }

    // 记录错误
    captureError(error, context = {}) {
        console.error('Error captured:', error, context);
        
        // 发送到 Sentry
        if (this.sentryEnabled && typeof Sentry !== 'undefined') {
            Sentry.captureException(error, {
                extra: context
            });
        }
        
        // 同时记录到 Supabase (备用方案)
        this.logToSupabase(error, context);
    }

    // 记录消息
    captureMessage(message, level = 'info', context = {}) {
        console.log(`[${level}] ${message}`, context);
        
        if (this.sentryEnabled && typeof Sentry !== 'undefined') {
            Sentry.captureMessage(message, {
                level: level,
                extra: context
            });
        }
    }

    // 记录到 Supabase (作为备用)
    async logToSupabase(error, context = {}) {
        if (!this.supabaseService) return;
        
        try {
            const errorLog = {
                error_message: error.message || String(error),
                error_stack: error.stack || '',
                context: JSON.stringify(context),
                user_agent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            };
            
            // 这里需要在 Supabase 创建 error_logs 表
            // 暂时只在控制台输出
            console.log('Error log:', errorLog);
            
        } catch(e) {
            console.error('Failed to log error to Supabase:', e);
        }
    }

    // 设置 Supabase 服务
    setSupabaseService(service) {
        this.supabaseService = service;
    }

    // 全局错误处理
    setupGlobalErrorHandlers() {
        // 捕获未处理的错误
        window.addEventListener('error', (event) => {
            this.captureError(event.error || new Error(event.message), {
                type: 'unhandled_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // 捕获未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError(
                event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
                {
                    type: 'unhandled_promise_rejection'
                }
            );
        });

        // 捕获网络错误
        window.addEventListener('offline', () => {
            this.captureMessage('User went offline', 'warning');
        });

        console.log('Global error handlers setup complete');
    }
}
