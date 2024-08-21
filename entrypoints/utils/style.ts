import { popoverClass } from './const'

export function insertStyle() {
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
    .${popoverClass} {
        position: fixed;
        color: black;
        min-width: 200px;
        background-color: #fff;
        padding: 5px 10px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateY(10px);
        opacity: 0;
        transition: all 0.2s !important;
				pointer-events: none;
    }
`
	style.id = 'SENTENCE_STYLE_SHEET'
	document.head.appendChild(style)
}
export default {}
