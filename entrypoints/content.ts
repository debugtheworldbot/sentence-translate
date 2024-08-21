import {
	applyListener,
	getElements,
	insertPopover,
	removeListener,
	toast,
	wrapTextNodes,
} from './utils/dom'
import { listenForRouteChange } from './utils/history'
import { insertStyle } from './utils/style'

const status = {
	enabled: false,
	showTranslateText: false,
}

export default defineContentScript({
	matches: ['*://*/*'],
	main() {
		storage.getItem<boolean>('local:autoEnabled').then((data) => {
			status.enabled = data === null ? true : data
			storage.getItem<boolean>('local:showTranslateText').then((data) => {
				status.showTranslateText = data === null ? false : data
				if (status.enabled) {
					setTimeout(() => {
						console.log('init')
						init()
						listenForRouteChange(init)
					}, 1500)
				}
			})
		})
		document.addEventListener('keydown', (event) => {
			// Detect keybinding for Option+S (Alt+S)
			if (event.altKey && event.code === 'KeyZ') {
				if (status.enabled) {
					toast('Sentence translation disabled', '#FF0000')
					removeListener()

					// setTimeout(() => {
					// 	location.reload()
					// }, 1000)
				} else {
					toast('Sentence translation enabled')
					init()
					listenForRouteChange(init)
				}

				status.enabled = !status.enabled
			}
		})
	},
})

async function init(): Promise<void> {
	mapElements()
	insertStyle()
	const popover = insertPopover()
	applyListener(popover, status.showTranslateText)
}

function mapElements() {
	const list = getElements()
	list.forEach((d) => {
		if (document.documentElement.lang.includes('en')) {
			d.appendChild(wrapTextNodes(d))
		}
	})
}
