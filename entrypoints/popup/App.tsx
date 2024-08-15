import { useState } from 'react'
import reactLogo from '@/assets/react.svg'
import wxtLogo from '/wxt.svg'
import './App.css'

function App() {
	return (
		<>
			<div>
				<a href='https://wxt.dev' target='_blank'>
					<img src={wxtLogo} className='logo' alt='WXT logo' />
				</a>
			</div>
			<div className='card'>Press Alt/Option + s to toggle it!</div>
		</>
	)
}

export default App
