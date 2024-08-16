import { getHTTPService } from './httpService'

const status = {
	enabled: false,
	initialized: false,
}
export default defineContentScript({
	matches: ['*://*/*'],
	main() {
		storage.getItem<boolean>('local:autoEnabled').then((data) => {
			status.enabled = data === null ? true : data
			if (status.enabled) {
				setTimeout(() => {
					console.log('init')
					init()
					listenForRouteChange()
				}, 1500)
			}
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
					listenForRouteChange()
				}

				status.enabled = !status.enabled
			}
		})
	},
})

function toast(text: string, color?: string) {
	const toast = document.createElement('div')
	const bg = color || '#4CAF50'
	toast.textContent = text
	toast.style.cssText = `
						position: fixed;
						bottom: 20px;
						right: -300px;
						background-color: ${bg};
						color: white;
						padding: 16px;
						border-radius: 4px;
						z-index: 1000;
						transition: right 0.5s;
					`
	// Trigger the slide-in effect
	setTimeout(() => {
		toast.style.right = '20px'
	}, 100)

	// Set up the slide-out effect
	setTimeout(() => {
		toast.style.right = '-300px'
	}, 2500)
	document.body.appendChild(toast)
	setTimeout(() => {
		document.body.removeChild(toast)
	}, 3000)
}

function wrapTextNodes(parent: HTMLElement): DocumentFragment {
	// Create a document fragment to hold the new structure
	const fragment = document.createDocumentFragment()
	const content = parent.innerHTML

	function splitSentences(text: string): RegExpMatchArray | null {
		if (!text) return null
		// const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
		// return Array.from(segmenter.segment(text), (segment) => segment.segment)
		const regex =
			/(?=[^])(?:\P{Sentence_Terminal}|\p{Sentence_Terminal}(?!['"`\p{Close_Punctuation}\p{Final_Punctuation}\s]))*(?:\p{Sentence_Terminal}+['"`\p{Close_Punctuation}\p{Final_Punctuation}]*|$)/guy
		return text.match(regex)
	}

	const sentences = splitSentences(content)

	sentences?.forEach((sentence: string) => {
		const span = document.createElement('span')
		span.className = 'sentence'
		span.innerHTML = sentence
		parent.innerHTML = ''
		fragment.appendChild(span)
		fragment.appendChild(document.createTextNode(' ')) // Add space between sentences
	})

	return fragment
}

const mapElements = () => {
	if (status.initialized) return
	status.initialized = true
	const targets = [
		'#text',
		'A',
		'BR',
		'STRONG',
		'EM',
		'CODE',
		'IMG',
		'BLOCKQUOTE',
	]
	const list = (
		[
			...document.querySelectorAll('div,li,p,h1,h2,h3,h4,blockquote'),
		] as HTMLDivElement[]
	).filter(
		(d) =>
			d.innerText &&
			d.innerText.length > 10 &&
			// if the node is a p, it should be ignored
			(d.nodeName === 'P' ||
				![...d.childNodes].find((n) => !targets.includes(n.nodeName)))
	)
	list.forEach((d) => {
		if (document.documentElement.lang.includes('en')) {
			d.appendChild(wrapTextNodes(d))
		}
	})
}

const translateText = async (
	text: string,
	targetLanguage: string
): Promise<string> => {
	const http = getHTTPService()
	return http.translate(text, targetLanguage)
}

function init(): void {
	mapElements()
	// Add a style element to the document head for the hover effect
	const style = document.createElement('style')
	style.innerHTML = `
    .sentence {
        position: relative;
        transition: border-bottom-color 0.3s ease;
    }
    .sentence:hover {
        border-bottom: 2px solid #32CD32; /* Beautiful green */
    }
    .t-popover {
        position: fixed;
        color: black;
        background-color: #fff;
        padding: 5px 10px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateY(10px);
        display: none;
    }
    .sentence:hover .t-popover {
        display: block;
    }
`
	style.id = 'SENTENCE_STYLE_SHEET'
	document.head.appendChild(style)

	function applyListener() {
		// Apply the hover effect and translation using JavaScript
		document.querySelectorAll<HTMLElement>('.sentence').forEach((span) => {
			const greenColor = '#32CD32' // Beautiful green color

			span.addEventListener('mouseover', function (this: HTMLElement) {
				this.style.borderBottomColor = greenColor
				// Check if the popover already contains translated text
				if (span.querySelector('.t-popover')) {
					return // If it does, do nothing
				}

				// Get the original text
				const originalText = this.innerHTML
				// Create a popover element
				const popover = document.createElement('span')
				popover.className = 't-popover'
				span.appendChild(popover)

				updatePopoverPosition(span, popover)

				// update position when window is resized or scrolled
				window.addEventListener('resize', () => {
					updatePopoverPosition(span, popover)
				})
				window.addEventListener('scroll', () => {
					updatePopoverPosition(span, popover)
				})

				translateText(originalText, 'zh')
					.then((data) => {
						// Show the translated text in the popover
						popover.innerHTML = data
					})
					.catch((error) => {
						popover.innerText = 'Translation failed'
						console.error('Error:', error)
					})
			})

			span.addEventListener('mouseout', function (this: HTMLElement) {
				this.style.borderBottomColor = 'transparent'
			})
		})
	}
	applyListener()
}

function updatePopoverPosition(span: HTMLElement, popover: HTMLElement) {
	const spanRect = span.getBoundingClientRect()
	// position popover to the bottom of the span
	popover.style.top = `${spanRect.bottom}px`
	popover.style.left = `${spanRect.left}px`
	popover.style.maxWidth = `${spanRect.width}px`
}

function removeListener() {
	const styleElement = document.getElementById('SENTENCE_STYLE_SHEET')
	if (styleElement) {
		styleElement.remove()
	}
	document.querySelectorAll<HTMLElement>('.sentence').forEach((span) => {
		// Remove the popover element
		const popover = span.querySelector('.t-popover')
		if (popover) {
			span.removeChild(popover)
		}
		// // Remove all registered mouseover events
		const clonedSpan = span.cloneNode(true) as HTMLElement
		span.parentNode?.replaceChild(clonedSpan, span)
		span = clonedSpan
		// Reset the style
		// span.style.borderBottomColor = ''
	})
}

// Function to handle route changes and initialize the script
const handleRouteChange = (): void => {
	init()
}

// Call init() on initial page load

const listenForRouteChange = () => {
	// Listen for route changes in single-page applications
	if (typeof window.addEventListener === 'function') {
		window.addEventListener('popstate', handleRouteChange)
		window.addEventListener('pushState', handleRouteChange)
		window.addEventListener('replaceState', handleRouteChange)
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
		handleRouteChange()
	}

	history.replaceState = function (
		data: any,
		unused: string,
		url?: string | URL | null
	) {
		originalReplaceState.call(this, data, unused, url)
		handleRouteChange()
	}
}
