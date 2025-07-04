const UI = (() => {
    // Financial Summary Display
    const updateFinancialSummary = () => {
        const income = Storage.getIncome();
        const budget = Storage.getBudget();
        const expenses = Storage.getExpenses();
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const savingsOrRemaining = income - totalExpenses; // If budget matters more, this could be budget - totalExpenses

        const incomeDisplay = document.getElementById('incomeDisplay');
        const budgetDisplay = document.getElementById('budgetDisplay');
        const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
        const savingsDisplay = document.getElementById('savingsDisplay');

        if (incomeDisplay) incomeDisplay.textContent = Utils.formatCurrency(income);
        if (budgetDisplay) budgetDisplay.textContent = Utils.formatCurrency(budget);
        if (totalExpensesDisplay) {
            totalExpensesDisplay.textContent = Utils.formatCurrency(totalExpenses);
            totalExpensesDisplay.className = totalExpenses > 0 ? 'negative' : 'neutral';
        }
        if (savingsDisplay) {
            savingsDisplay.textContent = Utils.formatCurrency(savingsOrRemaining);
            savingsDisplay.className = savingsOrRemaining >= 0 ? 'positive' : 'negative';
            if (budget > 0) { // If budget is set, compare expenses to budget for "Remaining"
                const remainingBudget = budget - totalExpenses;
                savingsDisplay.textContent = Utils.formatCurrency(remainingBudget);
                savingsDisplay.className = remainingBudget >= 0 ? 'positive' : 'negative';
                 if (document.querySelector('.summary-card h3:contains("Remaining/Savings")')) { // Check if title needs update
                    document.querySelector('.summary-card h3:contains("Remaining/Savings")').textContent = 'Remaining Budget';
                 }
            } else { // If no budget, it's savings from income
                 if (document.querySelector('.summary-card h3:contains("Remaining Budget")')) {
                    document.querySelector('.summary-card h3:contains("Remaining Budget")').textContent = 'Savings';
                 }
            }
        }
        checkAlerts(income, budget, totalExpenses);
    };

    const checkAlerts = (income, budget, totalExpenses) => {
        const budgetAlert = document.getElementById('budgetAlert');
        const incomeAlert = document.getElementById('incomeAlert');

        if (budgetAlert) {
            budgetAlert.style.display = (budget > 0 && totalExpenses > budget) ? 'block' : 'none';
            if (budget > 0 && totalExpenses > budget) {
                budgetAlert.textContent = `Budget limit of ${Utils.formatCurrency(budget)} exceeded by ${Utils.formatCurrency(totalExpenses - budget)}!`;
                budgetAlert.className = 'alert-message alert-danger';
            }
        }
        if (incomeAlert) {
           incomeAlert.style.display = (income > 0 && totalExpenses > income) ? 'block' : 'none';
           if (income > 0 && totalExpenses > income) {
                incomeAlert.textContent = `Total expenses of ${Utils.formatCurrency(totalExpenses)} exceed your income of ${Utils.formatCurrency(income)}!`;
                incomeAlert.className = 'alert-message alert-warning';
            }
        }
    };

    // Toast Notifications
    const showToast = (message, type = 'info', duration = 3000) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);

        // Trigger reflow to enable transition
        toast.offsetHeight; 

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode === container) { // Check if still child
                    container.removeChild(toast);
                }
            }, 500); // Allow fade-out transition
        }, duration);
    };

    // Modal Handling
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    };

    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    };

    // Dashboard: Expense Chart
    const renderExpenseChart = (expenses) => {
        const chartContainer = document.getElementById('categoryChart');
        const noDataMsg = document.getElementById('chartNoData');
        if (!chartContainer) return;
        chartContainer.innerHTML = ''; // Clear previous chart

        if (!expenses || expenses.length === 0) {
            if (noDataMsg) noDataMsg.style.display = 'block';
            return;
        }
        if (noDataMsg) noDataMsg.style.display = 'none';


        const expensesByCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
        }, {});

        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);
        const maxAmount = Math.max(...amounts, 0);

        if (categories.length === 0) {
             if (noDataMsg) noDataMsg.style.display = 'block';
             return;
        }


        categories.forEach(category => {
            const amount = expensesByCategory[category];
            const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            
            const labelElement = document.createElement('div');
            labelElement.className = 'chart-bar-label';
            labelElement.textContent = category;
            labelElement.title = category;

            const valueWrapper = document.createElement('div');
            valueWrapper.style.flexGrow = '1';

            const valueElement = document.createElement('div');
            valueElement.className = 'chart-bar-value';
            valueElement.style.width = `${percentage}%`;
            valueElement.textContent = Utils.formatCurrency(amount);
            
            valueWrapper.appendChild(valueElement);
            barElement.appendChild(labelElement);
            barElement.appendChild(valueWrapper);
            chartContainer.appendChild(barElement);
        });
    };

    // History: Expense Table
    const renderExpensesTable = (expenses, sortConfig = { key: 'date', order: 'desc' }) => {
        const tableBody = document.getElementById('expenseList');
        const noExpensesMessage = document.getElementById('noExpensesMessage');
        const expenseTable = document.getElementById('expenseTable');

        if (!tableBody) return;
        tableBody.innerHTML = ''; // Clear existing rows

        if (expenses.length === 0) {
            if (noExpensesMessage) noExpensesMessage.style.display = 'block';
            if (expenseTable) expenseTable.style.display = 'none';
            return;
        }
        
        if (noExpensesMessage) noExpensesMessage.style.display = 'none';
        if (expenseTable) expenseTable.style.display = 'table';

        // Sort expenses
        const sortedExpenses = [...expenses].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'amount') {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            } else if (sortConfig.key === 'date') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else { // string comparison (name, category)
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });


        sortedExpenses.forEach(expense => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${Utils.formatDate(expense.date)}</td>
                <td>${expense.name}</td>
                <td>${expense.category}</td>
                <td>${Utils.formatCurrency(expense.amount)}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="App.History.editExpense('${expense.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="App.History.deleteExpense('${expense.id}')">Delete</button>
                </td>
            `;
        });
        updateSortArrows(sortConfig);
    };

    const updateSortArrows = (sortConfig) => {
        document.querySelectorAll('#expenseTable th .sort-arrow').forEach(arrow => {
            arrow.textContent = ''; // Clear old arrows
            arrow.classList.remove('active');
        });
        const activeHeader = document.querySelector(`#expenseTable th[data-sort="${sortConfig.key}"] .sort-arrow`);
        if (activeHeader) {
            activeHeader.textContent = sortConfig.order === 'asc' ? '▲' : '▼';
            activeHeader.classList.add('active');
        }
    };


    // Profile: Picture Preview
    const loadProfilePicture = (base64Image) => {
        const preview = document.getElementById('profilePicturePreview');
        if (preview) {
            if (base64Image) {
                preview.src = base64Image;
            } else {
                preview.src = 'assets/default-avatar.png'; // Default image
            }
        }
    };
    
    // Set active navigation link
    const setActiveNavLink = () => {
        const currentPath = window.location.pathname.split("/").pop();
        const navLinks = document.querySelectorAll('.navbar .nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
         // Special case for index.html if path is "/"
        if (currentPath === "" || currentPath === "index.html") {
            const homeLink = document.querySelector('.navbar .nav-links a[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
        }
    };


    return {
        updateFinancialSummary,
        showToast,
        openModal,
        closeModal,
        renderExpenseChart,
        renderExpensesTable,
        updateSortArrows,
        loadProfilePicture,
        setActiveNavLink
    };

})();