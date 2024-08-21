export function listenForRouteChange(fn: () => void) {
	// Listen for route changes in single-page applications
	if (typeof window.addEventListener === 'function') {
		window.addEventListener('popstate', fn)
		window.addEventListener('pushState', fn)
		window.addEventListener('replaceState', fn)
	}

	// Monkey patch history methods for better SPA support
	const originalPushState = history.pushState
	const originalReplaceState = history.replaceState

	history.pushState = function (
		data: any,
		unused: string,
		url?: string | URL | null
	) {
		originalPushState.call(this, data, unused, url)
		fn()
	}

	history.replaceState = function (
		data: any,
		unused: string,
		url?: string | URL | null
	) {
		originalReplaceState.call(this, data, unused, url)
		fn()
	}
}
export default {}
