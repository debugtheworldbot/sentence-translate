import { defineProxyService } from '@webext-core/proxy-service'

// 1. Define your service
class HTTPService {
	async translate(text: string, targetLanguage: string): Promise<string> {
		try {
			const url = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
				text
			)}&format=html`
			const response = await fetch(url, {
				method: 'POST',
			})
			const data = await response.json()
			return data[0]
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error)
			throw error
		}
	}
}
export const [registerHTTPService, getHTTPService] = defineProxyService(
	'HTTPService',
	() => new HTTPService()
)

export default {}
