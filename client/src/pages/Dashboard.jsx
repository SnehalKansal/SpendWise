import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [income, setIncome] = useState('')
  const [budget, setBudget] = useState('')
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ name: '', category: '', amount: '', date: '' })

  const fetchSummary = async () => {
    const [settingsRes, expensesRes] = await Promise.all([
      fetch(`${API_URL}/settings`).then(r => r.json()),
      fetch(`${API_URL}/expenses`).then(r => r.json()),
    ])
    setIncome(settingsRes.income ?? 0)
    setBudget(settingsRes.budget ?? 0)
    setExpenses(expensesRes)
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const updateIncome = async () => {
    await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income: parseFloat(income) || 0, budget: parseFloat(budget) || 0 }),
    })
    fetchSummary()
  }

  const updateBudget = async () => {
    await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income: parseFloat(income) || 0, budget: parseFloat(budget) || 0 }),
    })
    fetchSummary()
  }

  const addExpense = async (e) => {
    e.preventDefault()
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name: form.name.trim(),
        category: form.category,
        amount: parseFloat(form.amount),
        date: new Date(form.date || new Date()).toISOString(),
      }),
    })
    setForm({ name: '', category: '', amount: '', date: '' })
    fetchSummary()
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const remaining = (budget || 0) > 0 ? budget - totalExpenses : (income || 0) - totalExpenses

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div className="financial-summary">
        <div className="summary-card"><h3>Total Income</h3><p id="incomeDisplay">₹{Number(income).toFixed(2)}</p></div>
        <div className="summary-card"><h3>Budget Limit</h3><p id="budgetDisplay">₹{Number(budget).toFixed(2)}</p></div>
        <div className="summary-card"><h3>Total Expenses</h3><p id="totalExpensesDisplay">₹{totalExpenses.toFixed(2)}</p></div>
        <div className="summary-card"><h3>Remaining</h3><p id="savingsDisplay">₹{remaining.toFixed(2)}</p></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-header">Manage Finances</h2>
          
          <div className="finance-section">
            <div className="form-group">
              <label htmlFor="income">Update Income</label>
              <input id="income" type="number" value={income} onChange={e => setIncome(e.target.value)} />
            </div>
            <button id="updateIncomeBtn" className="btn btn-primary" onClick={updateIncome}>Update Income</button>
          </div>

          <div className="finance-section">
            <div className="form-group">
              <label htmlFor="budgetLimit">Set Budget Limit</label>
              <input id="budgetLimit" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <button id="updateBudgetBtn" className="btn btn-primary" onClick={updateBudget}>Set Budget</button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-header">Add New Expense</h2>
          <form onSubmit={addExpense}>
            <div className="form-group">
              <label htmlFor="expenseName">Expense Name</label>
              <input id="expenseName" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="expenseCategory">Category</label>
              <select id="expenseCategory" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="" disabled>Choose Category</option>
                {['Food','Transport','Utilities','Entertainment','Shopping','Healthcare','Education','Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="expenseAmount">Amount (₹)</label>
              <input id="expenseAmount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="expenseDate">Date</label>
              <input id="expenseDate" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-success">Add Expense</button>
          </form>
        </div>
      </div>
    </div>
  )
}


