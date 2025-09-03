import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container">
      <div className="home-hero-section">
        <h1>Welcome to SpendWise</h1>
        <p>Your personal finance companion to track expenses, manage budgets, and achieve your financial goals. Take control of your money today!</p>
        <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
        <Link to="/profile" className="btn btn-primary">Create Profile</Link>
      </div>

      <div className="home-features-grid">
        <div className="home-feature-box">
          <div className="icon">📊</div>
          <h3>Track Expenses</h3>
          <p>Easily log and categorize your spending to see where your money goes.</p>
        </div>
        <div className="home-feature-box">
          <div className="icon">💰</div>
          <h3>Set Budgets</h3>
          <p>Create budgets for different categories and stay on top of your financial limits.</p>
        </div>
        <div className="home-feature-box">
          <div className="icon">📜</div>
          <h3>View History</h3>
          <p>Review your expense history with powerful filtering and sorting options.</p>
        </div>
        <div className="home-feature-box">
          <div className="icon">📅</div>
          <h3>Log Past Expenses</h3>
          <p>Forgot to enter something? Use the date selector to log older expenses anytime.</p>
        </div>
        <div className="home-feature-box">
          <div className="icon">👤</div>
          <h3>Manage Profile</h3>
          <p>Personalize your experience and manage your application data securely.</p>
        </div>
        <div className="home-feature-box">
          <div className="icon">🔄</div>
          <h3>Backup & Restore</h3>
          <p>Export or import your data in a single click for peace of mind.</p>
        </div>
      </div>
    </div>
  )
}
