const App = (() => {

    // --- GENERAL APP INITIALIZATION ---
    // This is a placeholder for any tasks that might be needed on EVERY page load.
    const init = () => {};

    const setActiveNavLink = () => {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split("/").pop();
        const navLinks = document.querySelectorAll('.navbar .nav-links a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split("/").pop();
            link.classList.remove('active');
            if ((currentPage === 'index.html' || currentPage === '') && (linkPage === 'index.html' || linkPage === '')) {
                link.classList.add('active');
            } else if (currentPage === linkPage && currentPage !== '' && currentPage !== 'index.html') {
                link.classList.add('active');
            }
        });
    };

    // --- PAGE-SPECIFIC MODULES ---

    // --- Dashboard Page Logic ---
    const Dashboard = (() => {
        const init = () => {
            const addExpenseForm = document.getElementById('addExpenseForm');
            const updateIncomeBtn = document.getElementById('updateIncomeBtn');
            const updateBudgetBtn = document.getElementById('updateBudgetBtn');
            const incomeInput = document.getElementById('income');
            const budgetInput = document.getElementById('budgetLimit');
            const expenseDateInput = document.getElementById('expenseDate');

            // --- Attach Event Listeners ---
            if (addExpenseForm) {
                addExpenseForm.addEventListener('submit', handleAddExpense);
            }
            if (updateIncomeBtn) {
                updateIncomeBtn.addEventListener('click', () => {
                    const newIncome = parseFloat(incomeInput.value) || 0;
                    Storage.setIncome(newIncome);
                    UI.updateFinancialSummary();
                    UI.showToast('Income updated!', 'success');
                });
            }
            if (updateBudgetBtn) {
                updateBudgetBtn.addEventListener('click', () => {
                    const newBudget = parseFloat(budgetInput.value) || 0;
                    Storage.setBudget(newBudget);
                    UI.updateFinancialSummary();
                    UI.showToast('Budget updated!', 'success');
                });
            }
            
            // --- Load Initial Data ---
            incomeInput.value = Storage.getIncome() || '';
            budgetInput.value = Storage.getBudget() || '';
            if (expenseDateInput) {
                expenseDateInput.value = Utils.formatDateForInput(new Date());
            }

            // --- Initial UI Render ---
            UI.updateFinancialSummary();
            UI.renderExpenseChart(Storage.getExpenses());
        };

        const handleAddExpense = (event) => {
            event.preventDefault();
            const form = event.target;
            Utils.clearValidationErrors(form);

            const nameInput = document.getElementById('expenseName');
            const categoryInput = document.getElementById('expenseCategory');
            const amountInput = document.getElementById('expenseAmount');
            const dateInput = document.getElementById('expenseDate');

            let isValid = true;
            isValid &= Utils.validateField(nameInput, val => val.length > 0, 'Expense name is required.');
            isValid &= Utils.validateField(categoryInput, val => val !== '', 'Please select a category.');
            isValid &= Utils.validateField(amountInput, val => parseFloat(val) > 0, 'Amount must be greater than 0.');
            isValid &= Utils.validateField(dateInput, val => val !== '', 'Date is required.');

            if (!isValid) {
                UI.showToast('Please correct the errors in the form.', 'error');
                return;
            }
            
            const newExpense = {
                id: Utils.generateUniqueId(),
                name: nameInput.value.trim(),
                category: categoryInput.value,
                amount: parseFloat(amountInput.value),
                date: new Date(dateInput.value).toISOString()
            };

            Storage.addExpense(newExpense);
            UI.updateFinancialSummary();
            UI.renderExpenseChart(Storage.getExpenses());
            UI.showToast('Expense added!', 'success');
            form.reset();
            dateInput.value = Utils.formatDateForInput(new Date());
        };

        return { init };
    })();
    
    // --- History Page Logic ---
     const History = (() => {
        let currentSortConfig = { key: 'date', order: 'desc' };
        let allExpenses = [];

        const init = () => {
            allExpenses = Storage.getExpenses();
            UI.updateFinancialSummary();
            UI.renderExpensesTable(allExpenses, currentSortConfig);
            addSortEventListeners();
            document.getElementById('editExpenseForm').addEventListener('submit', handleSaveEditedExpense);
        };

        const addSortEventListeners = () => {
            document.querySelectorAll('#expenseTable th[data-sort]').forEach(header => {
                header.addEventListener('click', () => {
                    const sortKey = header.dataset.sort;
                    if (currentSortConfig.key === sortKey) {
                        currentSortConfig.order = currentSortConfig.order === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortConfig.key = sortKey;
                        currentSortConfig.order = 'desc'; // Default to desc for new column
                    }
                    applyFilters(); // Re-render with new sort
                });
            });
        };
        
        const applyFilters = () => {
            const categoryFilter = document.getElementById('categoryFilter').value;
            const startDateInput = document.getElementById('startDate').value;
            const endDateInput = document.getElementById('endDate').value;
            
            let filteredExpenses = [...allExpenses]; // Work with a copy of all stored expenses

            if (categoryFilter) {
                filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
            }
            if (startDateInput) {
                const startDate = new Date(startDateInput);
                startDate.setHours(0, 0, 0, 0);
                filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) >= startDate);
            }
            if (endDateInput) {
                const endDate = new Date(endDateInput);
                endDate.setHours(23, 59, 59, 999);
                filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) <= endDate);
            }
            
            UI.renderExpensesTable(filteredExpenses, currentSortConfig);
        };

        const resetFilters = () => {
            document.getElementById('categoryFilter').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            currentSortConfig = { key: 'date', order: 'desc' }; // Reset sort as well
            UI.renderExpensesTable(allExpenses, currentSortConfig); // Display all expenses
        };

        const deleteExpense = (expenseId) => {
            if (confirm('Are you sure you want to delete this expense?')) {
                Storage.deleteExpense(expenseId);
                allExpenses = Storage.getExpenses(); // Refresh local copy
                applyFilters(); // Re-render filtered list
                UI.updateFinancialSummary(); // Update summary as expense is deleted
                App.Dashboard.loadDashboardData(); // Refresh dashboard chart if on dashboard
                UI.showToast('Expense deleted successfully!', 'success');
            }
        };

        const editExpense = (expenseId) => {
            const expense = allExpenses.find(exp => exp.id === expenseId);
            if (expense) {
                document.getElementById('editExpenseId').value = expense.id;
                document.getElementById('editExpenseName').value = expense.name;
                document.getElementById('editExpenseCategory').value = expense.category;
                document.getElementById('editExpenseAmount').value = expense.amount;
                document.getElementById('editExpenseDate').value = Utils.formatDateForInput(expense.date);
                UI.openModal('editExpenseModal');
            }
        };

        const handleSaveEditedExpense = (event) => {
            event.preventDefault();
            const updatedExpense = {
                id: document.getElementById('editExpenseId').value,
                name: document.getElementById('editExpenseName').value.trim(),
                category: document.getElementById('editExpenseCategory').value,
                amount: parseFloat(document.getElementById('editExpenseAmount').value),
                date: new Date(document.getElementById('editExpenseDate').value).toISOString()
            };

            // Basic validation (can be expanded)
            if (!updatedExpense.name || updatedExpense.amount <= 0 || !updatedExpense.date) {
                UI.showToast('Please fill in all fields correctly.', 'error');
                return;
            }

            Storage.updateExpense(updatedExpense);
            allExpenses = Storage.getExpenses(); // Refresh local copy
            applyFilters(); // Re-render
            UI.updateFinancialSummary(); // Update summary
            App.Dashboard.loadDashboardData(); // Refresh dashboard chart
            UI.closeModal('editExpenseModal');
            UI.showToast('Expense updated successfully!', 'success');
        };

        return { init, deleteExpense, editExpense, applyFilters, resetFilters };
    })();

    // --- Profile Page Logic ---
    const Profile = (() => {
        let currentProfilePictureBase64 = null;

        const init = () => {
            loadProfileData();
            document.getElementById('userProfileForm').addEventListener('submit', handleSaveProfile);
            document.getElementById('profilePicture').addEventListener('change', handlePreviewImage);
            document.querySelector('.btn-warning').addEventListener('click', backupData);
            document.querySelector('.btn-info').addEventListener('click', () => document.getElementById('restoreFile').click());
            document.getElementById('restoreFile').addEventListener('change', handleRestoreFile);
            document.querySelector('.btn-danger').addEventListener('click', resetAllData);
        };

        const loadProfileData = () => {
            const profile = Storage.getProfile();
            document.getElementById('fullName').value = profile.fullName || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('phoneNumber').value = profile.phoneNumber || '';
            document.getElementById('dateOfBirth').value = profile.dateOfBirth || '';
            document.getElementById('gender').value = profile.gender || '';
            currentProfilePictureBase64 = profile.profilePicture || null;
            UI.loadProfilePicture(currentProfilePictureBase64);
        };

        const handlePreviewImage = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                currentProfilePictureBase64 = e.target.result;
                UI.loadProfilePicture(currentProfilePictureBase64);
            };
            reader.readAsDataURL(file);
        };

        const handleSaveProfile = (event) => {
            event.preventDefault();
            // Add validation if needed
            const profileData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                dateOfBirth: document.getElementById('dateOfBirth').value,
                gender: document.getElementById('gender').value,
                profilePicture: currentProfilePictureBase64 
            };
            Storage.setProfile(profileData);
            UI.showToast('Profile saved successfully!', 'success');
        };

        const resetAllData = () => {
            if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
                Storage.clearAllData();
                UI.showToast('All application data has been reset.', 'success', 4000);
                setTimeout(() => window.location.href = 'index.html', 1500);
            }
        };

        const backupData = () => {
            const allData = Storage.getAllData();
            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spendwise_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UI.showToast('Data backup downloaded!', 'success');
        };

        const handleRestoreFile = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const restoredData = JSON.parse(e.target.result);
                    if (confirm('Restoring will overwrite current data. Proceed?')) {
                        Storage.restoreAllData(restoredData);
                        UI.showToast('Data restored! Reloading...', 'success', 3000);
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } catch (err) {
                    UI.showToast('Error: Invalid backup file.', 'error');
                }
            };
            reader.readAsText(file);
        };

        return { init };
    })();
    

    // --- EXPORT THE PUBLIC MODULES ---
    return {
        init,
        setActiveNavLink,
        Dashboard,
        History,
        Profile
    };

})();

// --- SCRIPT EXECUTION STARTS HERE ---
document.addEventListener('DOMContentLoaded', () => {
    // This is the router. It checks which page we're on and calls the correct init function.
    const path = window.location.pathname.split("/").pop();

    // Call global functions needed on every page
    App.setActiveNavLink();
    
    // Call page-specific init function based on the current HTML file
    switch (path) {
        case 'dashboard.html':
            App.Dashboard.init();
            break;
        case 'history.html':
            App.History.init();
            break;
        case 'profile.html':
            App.Profile.init();
            break;
            break;
        case 'index.html':
        case '': // For root path
            App.init(); // General init for home page
            break;
    }
});