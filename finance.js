document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const monthSelector = document.getElementById('month-selector');
    const monthlyBudgetInput = document.getElementById('monthly-budget');
    const saveBudgetBtn = document.querySelector('.budget-control .save-btn');
    const remainingAmount = document.getElementById('remaining-amount');
    const categoryNameInput = document.getElementById('category-name');
    const categoryLimitInput = document.getElementById('category-limit');
    const addCategoryBtn = document.querySelector('.category-form .add-btn');
    const categoriesContainer = document.getElementById('categories-container');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionCategorySelect = document.getElementById('transaction-category');
    const transactionNoteInput = document.getElementById('transaction-note');
    const addTransactionBtn = document.querySelector('.transaction-controls .add-btn');
    const transactionsContainer = document.getElementById('transactions-container');
    const budgetAlert = document.getElementById('budget-alert');
    const searchInput = document.querySelector('.search-box input');
    const sortSelect = document.querySelector('.sort-select');

    // Initialize data
    let financeData = {
        currentMonth: new Date().toISOString().slice(0, 7),
        monthlyBudget: 0,
        categories: [],
        transactions: []
    };

    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('financeData');
        if (savedData) {
            financeData = JSON.parse(savedData);
        }
        
        // Set current month
        monthSelector.value = financeData.currentMonth;
        monthlyBudgetInput.value = financeData.monthlyBudget;
        
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
            remainingAmount.classList.add('negative');
        } else {
            remainingAmount.classList.remove('negative');
        }
    }

    // Render categories list
    function renderCategories() {
        categoriesContainer.innerHTML = '';
        
        financeData.categories.forEach((category, index) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            
            const spent = financeData.transactions
                .filter(t => t.category === category.name)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const progress = Math.min((spent / category.limit) * 100, 100);
            
            categoryElement.innerHTML = `
                <div class="category-info">
                    <span>${category.name}</span>
                    <span>${spent.toLocaleString('vi-VN')} / ${category.limit.toLocaleString('vi-VN')} VND</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <div class="category-actions">
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
        transactionCategorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
        
        financeData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            transactionCategorySelect.appendChild(option);
        });
    }

    // Render transactions list
    function renderTransactions() {
        transactionsContainer.innerHTML = '';
        
        // Filter transactions for current month
        const currentMonthTransactions = financeData.transactions
            .filter(t => t.date.startsWith(financeData.currentMonth));
        
        // Sort transactions
        if (sortSelect.value === 'Giá tăng dần') {
            currentMonthTransactions.sort((a, b) => a.amount - b.amount);
        } else if (sortSelect.value === 'Giá giảm dần') {
            currentMonthTransactions.sort((a, b) => b.amount - a.amount);
        }
        
        // Filter by search term
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTransactions = searchTerm 
            ? currentMonthTransactions.filter(t => 
                t.note.toLowerCase().includes(searchTerm) || 
                t.category.toLowerCase().includes(searchTerm))
            : currentMonthTransactions;
        
        filteredTransactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <span>${transaction.category} - ${transaction.note}: ${parseFloat(transaction.amount).toLocaleString('vi-VN')} VND</span>
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" data-id="${index}">Xóa</button>
                </div>
            `;
            
            transactionsContainer.appendChild(transactionElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.transaction-item .delete-btn').forEach(btn => {
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
        financeData.monthlyBudget = parseFloat(monthlyBudgetInput.value) || 0;
        financeData.currentMonth = monthSelector.value;
        saveData();
        updateRemainingBalance();
        renderTransactions();
    }

    function addCategory() {
        const name = categoryNameInput.value.trim();
        const limit = parseFloat(categoryLimitInput.value) || 0;
        
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
            categoryNameInput.value = '';
            categoryLimitInput.value = '';
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
        
        categoryNameInput.value = category.name;
        categoryLimitInput.value = category.limit;
        
        // Change add button to update
        addCategoryBtn.textContent = 'Cập nhật';
        addCategoryBtn.onclick = function() {
            category.name = categoryNameInput.value.trim();
            category.limit = parseFloat(categoryLimitInput.value) || 0;
            
            saveData();
            renderCategories();
            updateCategorySelect();
            checkBudgetAlerts();
            
            // Reset form
            categoryNameInput.value = '';
            categoryLimitInput.value = '';
            addCategoryBtn.textContent = 'Thêm danh mục';
            addCategoryBtn.onclick = addCategory;
        };
    }

    function addTransaction() {
        const amount = parseFloat(transactionAmountInput.value) || 0;
        const category = transactionCategorySelect.value;
        const note = transactionNoteInput.value.trim();
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
            transactionAmountInput.value = '';
            transactionNoteInput.value = '';
            transactionCategorySelect.value = '';
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

    // Event listeners
    monthSelector.addEventListener('change', saveMonthlyBudget);
    saveBudgetBtn.addEventListener('click', saveMonthlyBudget);
    addCategoryBtn.addEventListener('click', addCategory);
    addTransactionBtn.addEventListener('click', addTransaction);
    searchInput.addEventListener('input', renderTransactions);
    sortSelect.addEventListener('change', renderTransactions);

    // Initialize
    loadData();
});