import wxtLogo from '/wxt.svg'
import './App.css'
import { LANGUAGES } from '../utils/const'

function App() {
	const [enabled, setEnabled] = useState(false)
	const [showTranslateText, setShowTranslateText] = useState(false)
	const [inLanguage, setInLanguage] = useState('en')
	const [outLanguage, setOutLanguage] = useState('zh')

	useEffect(() => {
		storage.getItem<boolean>('local:autoEnabled').then((data) => {
			setEnabled(data === null ? true : data)
		})
		storage.getItem<string>('local:inLanguage').then((data) => {
			setInLanguage(data === null ? 'en' : data)
		})
		storage.getItem<string>('local:outLanguage').then((data) => {
			setOutLanguage(data === null ? 'zh' : data)
		})
		storage.getItem<boolean>('local:showTranslateText').then((data) => {
			setShowTranslateText(data === null ? false : data)
		})
	}, [])

	const clickToggle = async () => {
		setEnabled(!enabled)
		await storage.setItem('local:autoEnabled', !enabled)
	}

	const handleInLanguageChange = (value: string) => {
		setInLanguage(value)
		storage.setItem('local:inLanguage', value)
	}

	const handleOutLanguageChange = (value: string) => {
		setOutLanguage(value)
		storage.setItem('local:outLanguage', value)
	}
	return (
		<>
			<div>
				<a href='https://wxt.dev' target='_blank'>
					<img src={wxtLogo} className='logo' alt='WXT logo' />
				</a>
			</div>
			<div className='language-selector'>
				<select
					id='inLanguage'
					onChange={(e) => handleInLanguageChange(e.target.value)}
				>
					{Object.entries(LANGUAGES).map(([key, value]) => (
						<option key={key} value={key} selected={key === inLanguage}>
							{value}
						</option>
					))}
				</select>
				<span> → </span>
				<div className='selector-group'>
					<select
						id='outLanguage'
						onChange={(e) => handleOutLanguageChange(e.target.value)}
					>
						{Object.entries(LANGUAGES).map(([key, value]) => (
							<option key={key} value={key} selected={key === outLanguage}>
								{value}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className='card'>Press Alt/Option + z to toggle it!</div>
			<ul className='switch-list'>
				<li className='switch'>
					<button
						className='switch-button'
						style={{ background: enabled ? '#4CAF50' : '#FF0000' }}
						onClick={clickToggle}
					>
						{enabled ? 'ON' : 'OFF'}
					</button>
					auto enable sentence translate on every page
				</li>
				<li className='switch'>
					<button
						className='switch-button'
						style={{ background: showTranslateText ? '#4CAF50' : '#FF0000' }}
						onClick={() => {
							setShowTranslateText(!showTranslateText)
							storage.setItem('local:showTranslateText', !showTranslateText)
						}}
					>
						{showTranslateText ? 'ON' : 'OFF'}
					</button>
					show translated text and show original text in popover
				</li>
			</ul>
		</>
	)
}

export default App
