// 错误监控服务
export class ErrorMonitorService {
    constructor() {
        this.sentryEnabled = false;
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

    setUser(userId, email = null) {
        if (this.sentryEnabled && typeof Sentry !== 'undefined') {
            Sentry.setUser({ id: userId, email: email });
        }
    }

    captureError(error, context = {}) {
        console.error('Error captured:', error, context);
        if (this.sentryEnabled && typeof Sentry !== 'undefined') {
            Sentry.captureException(error, { extra: context });
        }
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

    setSupabaseService(_service) {
        // 保留接口兼容性，暂不使用
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
