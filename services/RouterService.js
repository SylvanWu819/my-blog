// URL 路由服务
export class RouterService {
    constructor(onRouteChange) {
        this.onRouteChange = onRouteChange;
        this.currentRoute = this.parseRoute();
        
        // 监听浏览器前进/后退
        window.addEventListener('popstate', () => {
            this.currentRoute = this.parseRoute();
            this.onRouteChange(this.currentRoute);
        });
    }

    parseRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);
        
        if (parts.length === 0) {
            return { page: 'home', space: null, postId: null };
        }

        if (parts[0] === 'write') {
            return { page: 'write', space: null, postId: null };
        }

        if (parts[0] === 'post' && parts[1]) {
            return { page: 'detail', space: null, postId: parseInt(parts[1]) };
        }

        if (parts[0] === 'space' && parts[1]) {
            return { page: 'home', space: decodeURIComponent(parts[1]), postId: null };
        }

        return { page: 'home', space: null, postId: null };
    }

    navigate(page, params = {}) {
        let hash = '/';
        
        if (page === 'write') {
            hash = '/write';
        } else if (page === 'detail' && params.postId) {
            hash = `/post/${params.postId}`;
        } else if (page === 'home' && params.space && params.space !== '此间') {
            hash = `/space/${encodeURIComponent(params.space)}`;
        }

        window.location.hash = hash;
        this.currentRoute = this.parseRoute();
    }

    replaceRoute(page, params = {}) {
        let hash = '/';
        
        if (page === 'write') {
            hash = '/write';
        } else if (page === 'detail' && params.postId) {
            hash = `/post/${params.postId}`;
        } else if (page === 'home' && params.space && params.space !== '此间') {
            hash = `/space/${encodeURIComponent(params.space)}`;
        }

        window.history.replaceState(null, '', `#${hash}`);
        this.currentRoute = this.parseRoute();
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}
