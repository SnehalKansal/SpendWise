import { Outlet, Link } from 'react-router-dom'
import './App.css'

export default function App() {
  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">SpendWise</Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/history">Expense History</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
      </nav>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}
