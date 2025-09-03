import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function History() {
  const [expenses, setExpenses] = useState([])
  const [sort, setSort] = useState({ key: 'date', order: 'desc' })
  const [filters, setFilters] = useState({ category: '', start: '', end: '' })

  const fetchExpenses = async () => {
    const list = await fetch(`${API_URL}/expenses`).then(r => r.json())
    setExpenses(list)
  }

  useEffect(() => { fetchExpenses() }, [])

  const filtered = useMemo(() => {
    let out = [...expenses]
    if (filters.category) out = out.filter(e => e.category === filters.category)
    if (filters.start) out = out.filter(e => new Date(e.date) >= new Date(filters.start))
    if (filters.end) {
      const d = new Date(filters.end); d.setHours(23,59,59,999)
      out = out.filter(e => new Date(e.date) <= d)
    }
    out.sort((a,b) => {
      let A = a[sort.key], B = b[sort.key]
      if (sort.key === 'amount') { A = Number(A); B = Number(B) }
      if (sort.key === 'date') { A = new Date(A); B = new Date(B) }
      else { A = String(A).toLowerCase(); B = String(B).toLowerCase() }
      if (A < B) return sort.order === 'asc' ? -1 : 1
      if (A > B) return sort.order === 'asc' ? 1 : -1
      return 0
    })
    return out
  }, [expenses, sort, filters])

  const remove = async (id) => {
    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
  }

  return (
    <div className="container">
      <h1>Expense History</h1>

      <div className="card">
        <h2 className="card-header">Filter Expenses</h2>
        <div className="filters-container">
          <div className="form-group">
            <label htmlFor="categoryFilter">Category</label>
            <select id="categoryFilter" value={filters.category} onChange={e=>setFilters(f=>({...f, category:e.target.value}))}>
              <option value="">All Categories</option>
              {['Food','Transport','Utilities','Entertainment','Shopping','Healthcare','Education','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input id="startDate" type="date" value={filters.start} onChange={e=>setFilters(f=>({...f, start:e.target.value}))} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input id="endDate" type="date" value={filters.end} onChange={e=>setFilters(f=>({...f, end:e.target.value}))} />
          </div>
          <button className="btn btn-secondary" onClick={()=>{ /* trigger derived calc */ }}>Filter</button>
          <button className="btn btn-outline-primary" onClick={()=>setFilters({category:'',start:'',end:''})}>Reset Filters</button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Expenses List</h2>
        <table id="expenseTable">
          <thead>
            <tr>
              {['date','name','category','amount'].map(k => (
                <th key={k} onClick={()=>setSort(s=> s.key===k ? ({...s, order: s.order==='asc'?'desc':'asc'}) : ({key:k, order:'desc'}))}>
                  {k.toUpperCase()}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5">No expenses found.</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleDateString('en-IN', {year:'numeric', month:'short', day:'numeric'})}</td>
                <td>{e.name}</td>
                <td>{e.category}</td>
                <td>₹{Number(e.amount).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={()=>remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


