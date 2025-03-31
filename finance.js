document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    let financeData = {
        currentMonth: new Date().toISOString().slice(0, 7),
        monthlyBudget: 0,
        categories: [],
        transactions: []
    };

    // DOM elements
    const logoutBtn = document.getElementById('logoutBtn');
    const monthSelector = document.getElementById('month-selector');
    const monthlyBudget = document.getElementById('monthly-budget');
    const saveBudgetBtn = document.getElementById('save-budget');
    const remainingAmount = document.getElementById('remaining-amount');
    const categoryName = document.getElementById('category-name');
    const categoryLimit = document.getElementById('category-limit');
    const addCategoryBtn = document.getElementById('add-category');
    const categoriesContainer = document.getElementById('categories-container');
    const transactionAmount = document.getElementById('transaction-amount');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionNote = document.getElementById('transaction-note');
    const addTransactionBtn = document.getElementById('add-transaction');
    const transactionsContainer = document.getElementById('transactions-container');
    const searchTransactions = document.getElementById('search-transactions');
    const sortTransactions = document.getElementById('sort-transactions');
    const budgetAlert = document.getElementById('budget-alert');

    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('financeData');
        if (savedData) {
            financeData = JSON.parse(savedData);
        }
        
        // Set current month
        monthSelector.value = financeData.currentMonth;
        monthlyBudget.value = financeData.monthlyBudget;
        
        // Update UI
        updateRemainingBalance();
        renderCategories();
        renderTransactions();
        updateCategorySelect();
        checkBudgetAlerts();
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('financeData', JSON.stringify(financeData));
    }

    // Update remaining balance
    function updateRemainingBalance() {
        const totalSpent = financeData.transactions.reduce((sum, transaction) => {
            return sum + parseFloat(transaction.amount);
        }, 0);
        
        const remaining = financeData.monthlyBudget - totalSpent;
        remainingAmount.textContent = remaining.toLocaleString('vi-VN') + ' VND';
        
        if (remaining < 0) {
            remainingAmount.style.color = '#ef4444';
        } else {
            remainingAmount.style.color = '#4338CA';
        }
    }

    // Render categories list
    function renderCategories() {
        categoriesContainer.innerHTML = '';
        
        financeData.categories.forEach((category, index) => {
            const spent = financeData.transactions
                .filter(t => t.category === category.name)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const categoryElement = document.createElement('div');
            categoryElement.className = 'content2';
            categoryElement.innerHTML = `
                <div class="item">${category.name}-Giới hạn: ${category.limit.toLocaleString('vi-VN')}</div>
                <div class="item_button">
                    <button class="edit-btn" data-id="${index}">Sửa</button>
                    <button class="delete-btn" data-id="${index}">Xóa</button>
                </div>
            `;
            
            categoriesContainer.appendChild(categoryElement);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteCategory);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editCategory);
        });
    }

    // Update category select for transactions
    function updateCategorySelect() {
        transactionCategory.innerHTML = '<option value="">Chọn danh mục</option>';
        
        financeData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            transactionCategory.appendChild(option);
        });
    }

    // Render transactions list
    function renderTransactions() {
        transactionsContainer.innerHTML = '';
        
        // Filter transactions for current month
        const currentMonthTransactions = financeData.transactions
            .filter(t => t.date.startsWith(financeData.currentMonth));
        
        // Sort transactions
        if (sortTransactions.value === 'Giá tăng dần') {
            currentMonthTransactions.sort((a, b) => a.amount - b.amount);
        } else if (sortTransactions.value === 'Giá giảm dần') {
            currentMonthTransactions.sort((a, b) => b.amount - a.amount);
        }
        
        // Filter by search term
        const searchTerm = searchTransactions.value.toLowerCase();
        const filteredTransactions = searchTerm 
            ? currentMonthTransactions.filter(t => 
                t.note.toLowerCase().includes(searchTerm) || 
                t.category.toLowerCase().includes(searchTerm))
            : currentMonthTransactions;
        
        filteredTransactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'content2';
            transactionElement.innerHTML = `
                <div class="item">${transaction.category}-${transaction.note}: ${parseFloat(transaction.amount).toLocaleString('vi-VN')}</div>
                <div class="item_button">
                    <button class="delete-btn" data-id="${index}">Xóa</button>
                </div>
            `;
            
            transactionsContainer.appendChild(transactionElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.content2 .delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTransaction);
        });
    }

    // Check for budget alerts
    function checkBudgetAlerts() {
        let alertMessage = '';
        
        financeData.categories.forEach(category => {
            const spent = financeData.transactions
                .filter(t => t.category === category.name)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            if (spent > category.limit) {
                alertMessage += `Danh mục "${category.name}" đã vượt giới hạn: ${spent.toLocaleString('vi-VN')} / ${category.limit.toLocaleString('vi-VN')} VND<br>`;
            }
        });
        
        if (alertMessage) {
            budgetAlert.innerHTML = alertMessage;
            budgetAlert.style.display = 'block';
        } else {
            budgetAlert.style.display = 'none';
        }
    }

    // Event handlers
    function saveMonthlyBudget() {
        financeData.monthlyBudget = parseFloat(monthlyBudget.value) || 0;
        financeData.currentMonth = monthSelector.value;
        saveData();
        updateRemainingBalance();
        renderTransactions();
    }

    function addCategory() {
        const name = categoryName.value.trim();
        const limit = parseFloat(categoryLimit.value) || 0;
        
        if (name && limit > 0) {
            financeData.categories.push({
                name,
                limit
            });
            
            saveData();
            renderCategories();
            updateCategorySelect();
            checkBudgetAlerts();
            
            // Clear inputs
            categoryName.value = '';
            categoryLimit.value = '';
        }
    }

    function deleteCategory(e) {
        const index = e.target.dataset.id;
        financeData.categories.splice(index, 1);
        saveData();
        renderCategories();
        updateCategorySelect();
        checkBudgetAlerts();
    }

    function editCategory(e) {
        const index = e.target.dataset.id;
        const category = financeData.categories[index];
        
        categoryName.value = category.name;
        categoryLimit.value = category.limit;
        
        // Change add button to update
        addCategoryBtn.textContent = 'Cập nhật';
        addCategoryBtn.onclick = function() {
            category.name = categoryName.value.trim();
            category.limit = parseFloat(categoryLimit.value) || 0;
            
            saveData();
            renderCategories();
            updateCategorySelect();
            checkBudgetAlerts();
            
            // Reset form
            categoryName.value = '';
            categoryLimit.value = '';
            addCategoryBtn.textContent = 'Thêm danh mục';
            addCategoryBtn.onclick = addCategory;
        };
    }

    function addTransaction() {
        const amount = parseFloat(transactionAmount.value) || 0;
        const category = transactionCategory.value;
        const note = transactionNote.value.trim();
        const date = new Date().toISOString().slice(0, 10);
        
        if (amount > 0 && category && note) {
            financeData.transactions.push({
                amount,
                category,
                note,
                date
            });
            
            saveData();
            renderTransactions();
            updateRemainingBalance();
            checkBudgetAlerts();
            
            // Clear inputs
            transactionAmount.value = '';
            transactionNote.value = '';
            transactionCategory.value = '';
        }
    }

    function deleteTransaction(e) {
        const index = e.target.dataset.id;
        financeData.transactions.splice(index, 1);
        saveData();
        renderTransactions();
        updateRemainingBalance();
        checkBudgetAlerts();
    }

    function logout() {
        localStorage.removeItem('loggedIn');
        window.location.href = 'login.html';
    }

    // Event listeners
    logoutBtn.addEventListener('click', logout);
    monthSelector.addEventListener('change', saveMonthlyBudget);
    saveBudgetBtn.addEventListener('click', saveMonthlyBudget);
    addCategoryBtn.addEventListener('click', addCategory);
    addTransactionBtn.addEventListener('click', addTransaction);
    searchTransactions.addEventListener('input', renderTransactions);
    sortTransactions.addEventListener('change', renderTransactions);

    // Initialize
    loadData();
});