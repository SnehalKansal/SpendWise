const Storage = (() => {
    const INCOME_KEY = 'spendwise_income';
    const BUDGET_KEY = 'spendwise_budget';
    const EXPENSES_KEY = 'spendwise_expenses';
    const PROFILE_KEY = 'spendwise_profile';

    // General Get/Set
    const getItem = (key) => {
        const item = localStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error(`Error parsing localStorage item ${key}:`, e);
            return null;
        }
    };

    const setItem = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error setting localStorage item ${key}:`, e);
            // Potentially handle quota exceeded error
            if (e.name === 'QuotaExceededError') {
                UI.showToast('Storage limit exceeded. Please clear some data or backup and reset.', 'error', 7000);
            }
        }
    };

    // Income
    const getIncome = () => parseFloat(getItem(INCOME_KEY)) || 0;
    const setIncome = (income) => setItem(INCOME_KEY, parseFloat(income) || 0);

    // Budget
    const getBudget = () => parseFloat(getItem(BUDGET_KEY)) || 0;
    const setBudget = (budget) => setItem(BUDGET_KEY, parseFloat(budget) || 0);

    // Expenses
    const getExpenses = () => getItem(EXPENSES_KEY) || [];
    const setExpenses = (expenses) => setItem(EXPENSES_KEY, expenses);
    
    const addExpense = (expense) => {
        const expenses = getExpenses();
        expenses.push(expense);
        setExpenses(expenses);
    };

    const updateExpense = (updatedExpense) => {
        let expenses = getExpenses();
        expenses = expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp);
        setExpenses(expenses);
    };

    const deleteExpense = (expenseId) => {
        let expenses = getExpenses();
        expenses = expenses.filter(exp => exp.id !== expenseId);
        setExpenses(expenses);
    };

    // Profile
    const getProfile = () => getItem(PROFILE_KEY) || {};
    const setProfile = (profileData) => setItem(PROFILE_KEY, profileData);

    // Data Management
    const getAllData = () => {
        return {
            income: getIncome(),
            budget: getBudget(),
            expenses: getExpenses(),
            profile: getProfile()
        };
    };

    const restoreAllData = (data) => {
        if (data.income !== undefined) setIncome(data.income);
        if (data.budget !== undefined) setBudget(data.budget);
        if (data.expenses !== undefined) setExpenses(data.expenses);
        if (data.profile !== undefined) setProfile(data.profile);
    };
    
    const clearAllData = () => {
        localStorage.removeItem(INCOME_KEY);
        localStorage.removeItem(BUDGET_KEY);
        localStorage.removeItem(EXPENSES_KEY);
        localStorage.removeItem(PROFILE_KEY);
        // Also clear any other keys you might introduce
    };

    return {
        getIncome,
        setIncome,
        getBudget,
        setBudget,
        getExpenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getProfile,
        setProfile,
        getAllData,
        restoreAllData,
        clearAllData
    };
})();