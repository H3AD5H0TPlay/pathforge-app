import './App.css'
import Board from './components/Board'
import TestBoard from './components/TestBoard'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>PathForge</h1>
        <p>Job Application Tracker</p>
      </header>
      <main className="app-main">
        <Board />
      </main>
    </div>
  )
}

export default App
