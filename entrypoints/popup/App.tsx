import wxtLogo from '/wxt.svg'
import './App.css'

function App() {
	const [enabled, setEnabled] = useState(false)

	useEffect(() => {
		storage.getItem<boolean>('local:autoEnabled').then((data) => {
			setEnabled(data || true)
		})
	}, [])

	const clickToggle = async () => {
		setEnabled(!enabled)
		await storage.setItem('local:autoEnabled', !enabled)
	}
	return (
		<>
			<div>
				<a href='https://wxt.dev' target='_blank'>
					<img src={wxtLogo} className='logo' alt='WXT logo' />
				</a>
			</div>
			<div className='card'>Press Alt/Option + s to toggle it!</div>
			<div className='switch'>
				auto enable sentence translate on every page
				<button
					className='switch-button'
					style={{ background: enabled ? '#4CAF50' : '#FF0000' }}
					onClick={clickToggle}
				>
					{enabled ? 'ON' : 'OFF'}
				</button>
			</div>
		</>
	)
}

export default App
