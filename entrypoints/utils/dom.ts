import { getHTTPService } from '../httpService'
import { popoverClass } from './const'

const translatedMap: Record<string, string> = {}

export function getElements(): HTMLDivElement[] {
	const targets = [
		'#text',
		'A',
		'BR',
		'STRONG',
		'EM',
		'CODE',
		'IMG',
		'BLOCKQUOTE',
		'FIGURE',
	]
	const list = (
		[
			...document.querySelectorAll('div,li,p,h1,h2,h3,h4,blockquote,span'),
		] as HTMLDivElement[]
	).filter(
		(d) =>
			d.innerText &&
			d.innerText.length > 10 &&
			// if the node is a p, it should be ignored
			(d.nodeName === 'P' ||
				![...d.childNodes].find((n) => !targets.includes(n.nodeName)))
	)
	return list
}

function removeAriaAndTitleAttributes(parent: HTMLElement) {
	const children = parent.querySelectorAll('*')
	children.forEach((child) => {
		child.removeAttribute('aria-label')
		child.removeAttribute('title')
	})
}

function splitSentences(text: string): RegExpMatchArray | null {
	if (!text) return null
	// const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
	// return Array.from(segmenter.segment(text), (segment) => segment.segment)
	const regex =
		/(?=[^])(?:\P{Sentence_Terminal}|\p{Sentence_Terminal}(?!['"`\p{Close_Punctuation}\p{Final_Punctuation}\s]))*(?:\p{Sentence_Terminal}+['"`\p{Close_Punctuation}\p{Final_Punctuation}]*|$)/guy
	return text.match(regex)
}

export function wrapTextNodes(parent: HTMLElement): DocumentFragment {
	// Create a document fragment to hold the new structure
	const fragment = document.createDocumentFragment()

	removeAriaAndTitleAttributes(parent)
	const content = parent.innerHTML

	const sentences = splitSentences(content)

	sentences?.forEach((sentence: string) => {
		const span = document.createElement('span')
		span.className = 'sentence'
		span.innerHTML = sentence
		span.id = Math.random().toString(36).substring(2, 15)
		parent.innerHTML = ''
		fragment.appendChild(span)
	})

	return fragment
}

export function removeListener() {
	const styleElement = document.getElementById('SENTENCE_STYLE_SHEET')
	if (styleElement) {
		styleElement.remove()
	}
	const popovers = document.getElementsByClassName(popoverClass)
	while (popovers.length > 0) {
		const popover = popovers[0]
		popover.parentNode?.removeChild(popover)
	}
	document.querySelectorAll<HTMLElement>('.sentence').forEach((span) => {
		span.replaceWith(...span.childNodes)
	})
}

const translateText = async (text: string): Promise<string> => {
	const http = getHTTPService()
	const inLanguage = (await storage.getItem<string>('local:inLanguage')) || 'en'
	const outLanguage =
		(await storage.getItem<string>('local:outLanguage')) || 'zh'
	return http.translate(text, inLanguage, outLanguage)
}

export function insertPopover() {
	// Create a popover element if not exists
	const popoverElement = document.getElementsByClassName(popoverClass)
	let popover: HTMLElement
	if (!popoverElement.length) {
		popover = document.createElement('span')
		popover.className = popoverClass
		popover.id = `${popoverClass}-init`
		document.body.appendChild(popover)
	} else {
		popover = popoverElement[0] as HTMLElement
	}
	return popover
}

export function updatePopoverPosition(span: HTMLElement, popover: HTMLElement) {
	const spanRect = span.getBoundingClientRect()
	// position popover to the bottom of the span
	popover.style.top = `${spanRect.bottom}px`
	popover.style.left = `${spanRect.left}px`
	popover.style.maxWidth = `${spanRect.width}px`
	popover.style.opacity = '1'
	popover.id = span.id
}
export function applyListener(
	popover: HTMLElement,
	showTranslateText: boolean
) {
	// Apply the hover effect and translation using JavaScript
	document.querySelectorAll<HTMLElement>('.sentence').forEach((span) => {
		const greenColor = '#32CD32' // Beautiful green color

		function listener() {
			updatePopoverPosition(span, popover)
		}
		if (showTranslateText) {
			const originalText = span.innerHTML
			translatedMap[span.id] = originalText
			translateText(originalText)
				.then((data) => {
					// Show the translated text in the popover
					span.innerHTML = data
				})
				.catch((error) => {
					popover.innerText = 'Translation failed'
					console.error('Error:', error)
				})
		}
		span.addEventListener('mouseover', function (this: HTMLElement) {
			this.style.borderBottomColor = greenColor

			updatePopoverPosition(span, popover)

			// update position when window is resized or scrolled
			window.addEventListener('resize', listener)
			window.addEventListener('scroll', listener)
			if (showTranslateText) {
				popover.innerHTML = translatedMap[span.id]
				return
			}
			// Check if the popover already contains translated text
			if (translatedMap[span.id]) {
				popover.innerHTML = translatedMap[span.id]
				return
			}

			// Get the original text
			const originalText = this.innerHTML
			translateText(originalText)
				.then((data) => {
					// Show the translated text in the popover
					popover.innerHTML = data
					translatedMap[span.id] = data
				})
				.catch((error) => {
					popover.innerText = 'Translation failed'
					console.error('Error:', error)
				})
		})

		span.addEventListener('mouseout', function (this: HTMLElement) {
			this.style.borderBottomColor = 'transparent'
			popover.style.opacity = '0'
			// remove scroll and resize listeners
			window.removeEventListener('resize', listener)
			window.removeEventListener('scroll', listener)
		})
	})
}

export function toast(text: string, color?: string) {
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

export default {}
