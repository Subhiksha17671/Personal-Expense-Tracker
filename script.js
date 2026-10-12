/* ==========================================
   MONEY BUDDY - COMPLETE JAVASCRIPT
========================================== */


/* ==========================================
   LOGIN AND LOGOUT
========================================== */

const loginPage = document.getElementById("login-page");
const mainDashboard = document.getElementById("main-dashboard");

const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const togglePassword = document.getElementById("toggle-password");
const logoutButton = document.getElementById("logout-button");

const DEMO_USERNAME = "moneybuddy";
const DEMO_PASSWORD = "fun123";


/* Show or hide password */

togglePassword.addEventListener("click", function () {

    if (loginPassword.type === "password") {

        loginPassword.type = "text";
        togglePassword.textContent = "🙈";
        togglePassword.setAttribute("aria-label", "Hide password");

    } else {

        loginPassword.type = "password";
        togglePassword.textContent = "👁️";
        togglePassword.setAttribute("aria-label", "Show password");

    }

});


/* Login validation */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (
        username === DEMO_USERNAME &&
        password === DEMO_PASSWORD
    ) {

        sessionStorage.setItem("moneyBuddyLoggedIn", "true");

        loginError.textContent = "";

        loginPage.style.display = "none";

        mainDashboard.classList.remove("dashboard-hidden");

        refreshDisplay();

    } else {

        loginError.textContent =
            "Oops! Wrong username or password. Try again! 😅";

    }

});


/* Logout */

logoutButton.addEventListener("click", function () {

    if (confirm("Are you sure you want to log out? See you soon! 💖")) {

        sessionStorage.removeItem("moneyBuddyLoggedIn");

        mainDashboard.classList.add("dashboard-hidden");

        loginPage.style.display = "flex";

        loginPassword.value = "";

        loginError.textContent = "";

        loginUsername.focus();

    }

});


/* ==========================================
   CATEGORY INFORMATION
========================================== */

const categories = {

    Food: {
        emoji: "🍕",
        color: "#ffad66"
    },

    Shopping: {
        emoji: "🛍️",
        color: "#ff6fae"
    },

    Travel: {
        emoji: "🚕",
        color: "#54b7f5"
    },

    Bills: {
        emoji: "🧾",
        color: "#7950e8"
    },

    Other: {
        emoji: "🎁",
        color: "#36c99a"
    }

};


/* ==========================================
   LOAD AND SAVE DATA
========================================== */

function loadExpenses() {

    try {

        const saved = JSON.parse(localStorage.getItem("expenses"));

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved
            .filter(function (item) {

                return (
                    item &&
                    typeof item.name === "string" &&
                    Number.isFinite(Number(item.amount))
                );

            })
            .map(function (item) {

                return {

                    id: String(
                        item.id ||
                        Date.now() + Math.random().toString(36).slice(2)
                    ),

                    name: item.name,

                    amount: Number(item.amount),

                    date: item.date || "",

                    category: categories[item.category]
                        ? item.category
                        : "Other"

                };

            });

    } catch (error) {

        console.error("Could not load expenses:", error);

        return [];

    }

}


function loadBudgets() {

    const defaults = {
        daily: 0,
        weekly: 0,
        monthly: 0
    };

    try {

        const saved = JSON.parse(
            localStorage.getItem("expenseBudgets")
        );

        if (!saved || typeof saved !== "object") {
            return defaults;
        }

        return {

            daily: validBudget(saved.daily),

            weekly: validBudget(saved.weekly),

            monthly: validBudget(saved.monthly)

        };

    } catch (error) {

        return defaults;

    }

}


function validBudget(value) {

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
        ? number
        : 0;

}


let expenses = loadExpenses();

let budgets = loadBudgets();

let categoryChart = null;

let weeklyChart = null;


function saveExpenses() {

    try {

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

    } catch (error) {

        alert("Unable to save expenses. Check your browser storage.");

        console.error(error);

    }

}


function saveBudgets() {

    try {

        localStorage.setItem(
            "expenseBudgets",
            JSON.stringify(budgets)
        );

    } catch (error) {

        alert("Unable to save your budgets.");

        console.error(error);

    }

}


/* ==========================================
   HELPER FUNCTIONS
========================================== */

function formatMoney(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    }).format(amount);

}


function getTodayDate() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString) {
        return "Not set";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return "Not set";
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


function getMonday(date) {

    const monday = new Date(date);

    monday.setHours(0, 0, 0, 0);

    const day = monday.getDay();

    monday.setDate(
        monday.getDate() + (day === 0 ? -6 : 1 - day)
    );

    return monday;

}


function dateToString(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function isCurrentWeek(dateString) {

    if (!dateString) {
        return false;
    }

    const monday = getMonday(new Date());

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    return (
        dateString >= dateToString(monday) &&
        dateString <= dateToString(sunday)
    );

}


function isCurrentMonth(dateString) {

    return Boolean(dateString) &&
        dateString.slice(0, 7) === getTodayDate().slice(0, 7);

}


function filterByDateCondition(condition) {

    return expenses.filter(function (expense) {

        return expense.date && condition(expense.date);

    });

}


function calculateTotal(list) {

    return list.reduce(function (total, expense) {

        return total + expense.amount;

    }, 0);

}


function getHighestExpense(list) {

    if (list.length === 0) {
        return 0;
    }

    return Math.max.apply(
        null,
        list.map(function (expense) {

            return expense.amount;

        })
    );

}


function getCategoryTotals(list) {

    const totals = {
        Food: 0,
        Shopping: 0,
        Travel: 0,
        Bills: 0,
        Other: 0
    };

    list.forEach(function (expense) {

        totals[expense.category] += expense.amount;

    });

    return totals;

}


/* ==========================================
   ADD EXPENSE
========================================== */

const expenseForm = document.getElementById("expense-form");

const expenseNameInput = document.getElementById("expense-name");

const expenseAmountInput = document.getElementById("expense-amount");

const expenseDateInput = document.getElementById("expense-date");

const expenseCategoryInput = document.getElementById("expense-category");

const expenseMessage = document.getElementById("expense-message");


expenseDateInput.value = getTodayDate();


expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = expenseNameInput.value.trim();

    const amount = Number(expenseAmountInput.value);

    const date = expenseDateInput.value;

    const category = expenseCategoryInput.value;


    if (!name || !Number.isFinite(amount) || amount <= 0 || !date) {

        alert("Please enter a valid expense name, amount, and date.");

        return;

    }


    const expense = {

        id: Date.now().toString() +
            Math.random().toString(36).slice(2),

        name: name,

        amount: amount,

        date: date,

        category: category

    };


    expenses.push(expense);

    saveExpenses();

    refreshDisplay();

    expenseForm.reset();

    expenseDateInput.value = getTodayDate();

    expenseCategoryInput.value = "Food";


    expenseMessage.textContent =
        "Expense added successfully! 🎉";


    setTimeout(function () {

        expenseMessage.textContent = "";

    }, 3000);

});


/* ==========================================
   DELETE EXPENSE
========================================== */

function deleteExpense(id) {

    const expense = expenses.find(function (item) {

        return item.id === id;

    });

    if (!expense) {
        return;
    }

    if (!confirm(`Delete "${expense.name}"?`)) {
        return;
    }

    expenses = expenses.filter(function (item) {

        return item.id !== id;

    });

    saveExpenses();

    refreshDisplay();

}


/* ==========================================
   TOTAL AND SUMMARIES
========================================== */

function updateOverallTotal() {

    document.getElementById("total-expenses").textContent =
        formatMoney(calculateTotal(expenses));

    const count = expenses.length;

    document.getElementById("total-expense-count").textContent =
        `${count} ${count === 1 ? "expense" : "expenses"} recorded`;

}


function updateSummary(period, list) {

    document.getElementById(`${period}-total`).textContent =
        formatMoney(calculateTotal(list));

    document.getElementById(`${period}-count`).textContent =
        list.length;

    document.getElementById(`${period}-highest`).textContent =
        formatMoney(getHighestExpense(list));

}


function updateAllSummaries() {

    const today = getTodayDate();

    const daily = expenses.filter(function (expense) {

        return expense.date === today;

    });

    const weekly = filterByDateCondition(isCurrentWeek);

    const monthly = filterByDateCondition(isCurrentMonth);


    updateSummary("daily", daily);

    updateSummary("weekly", weekly);

    updateSummary("monthly", monthly);


    renderCategoryBreakdown(
        "daily-category-breakdown",
        daily,
        "No expenses recorded today."
    );

    renderCategoryBreakdown(
        "weekly-category-breakdown",
        weekly,
        "No expenses recorded this week."
    );

    renderCategoryBreakdown(
        "monthly-category-breakdown",
        monthly,
        "No expenses recorded this month."
    );

}


/* ==========================================
   CATEGORY BREAKDOWN
========================================== */

function renderCategoryBreakdown(elementId, list, emptyMessage) {

    const container = document.getElementById(elementId);

    container.innerHTML = "";


    if (list.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = emptyMessage;

        container.appendChild(message);

        return;

    }


    const totals = getCategoryTotals(list);

    const overallTotal = calculateTotal(list);


    Object.keys(categories).forEach(function (category) {

        const amount = totals[category];

        if (amount === 0) {
            return;
        }


        const percentage = overallTotal > 0
            ? (amount / overallTotal) * 100
            : 0;


        const item = document.createElement("div");

        item.className = "category-item";


        const left = document.createElement("div");

        left.className = "category-item-left";


        const dot = document.createElement("span");

        dot.className = "category-dot";

        dot.style.backgroundColor = categories[category].color;


        const details = document.createElement("div");


        const name = document.createElement("div");

        name.className = "category-item-name";

        name.textContent = `${categories[category].emoji} ${category}`;


        const percentageText = document.createElement("small");

        percentageText.textContent = `${percentage.toFixed(1)}% of spending`;


        details.appendChild(name);

        details.appendChild(percentageText);


        left.appendChild(dot);

        left.appendChild(details);


        const amountElement = document.createElement("div");

        amountElement.className = "category-item-amount";

        amountElement.textContent = formatMoney(amount);


        item.appendChild(left);

        item.appendChild(amountElement);

        container.appendChild(item);

    });

}


/* ==========================================
   SEARCH, FILTER, AND HISTORY
========================================== */

const searchInput = document.getElementById("search-expense");

const filterCategoryInput = document.getElementById("filter-category");

const filterDateInput = document.getElementById("filter-date");

const clearFiltersButton = document.getElementById("clear-filters");


searchInput.addEventListener("input", renderExpenseHistory);

filterCategoryInput.addEventListener("change", renderExpenseHistory);

filterDateInput.addEventListener("change", renderExpenseHistory);


clearFiltersButton.addEventListener("click", function () {

    searchInput.value = "";

    filterCategoryInput.value = "All";

    filterDateInput.value = "";

    renderExpenseHistory();

});


function renderExpenseHistory() {

    const tableBody = document.getElementById("expense-list");

    const countElement = document.getElementById("history-count");


    const searchText = searchInput.value.trim().toLowerCase();

    const selectedCategory = filterCategoryInput.value;

    const selectedDate = filterDateInput.value;


    const filtered = expenses.filter(function (expense) {

        const nameMatches = expense.name.toLowerCase().includes(searchText);

        const categoryMatches =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        const dateMatches =
            !selectedDate ||
            expense.date === selectedDate;

        return nameMatches && categoryMatches && dateMatches;

    });


    filtered.sort(function (a, b) {

        if (a.date !== b.date) {
            return (b.date || "").localeCompare(a.date || "");
        }

        return b.id.localeCompare(a.id);

    });


    tableBody.innerHTML = "";


    if (filtered.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.className = "empty-table-message";

        cell.textContent = expenses.length === 0
            ? "No expenses yet. Add your first expense! 💖"
            : "No expenses match your filters. Try clearing them! 🔍";


        row.appendChild(cell);

        tableBody.appendChild(row);


        countElement.textContent =
            `Showing 0 of ${expenses.length} expenses`;

        return;

    }


    filtered.forEach(function (expense, index) {

        const row = document.createElement("tr");


        const numberCell = document.createElement("td");

        numberCell.textContent = index + 1;


        const nameCell = document.createElement("td");

        nameCell.className = "expense-name-cell";

        nameCell.textContent = expense.name;


        const amountCell = document.createElement("td");

        amountCell.className = "amount-cell";

        amountCell.textContent = formatMoney(expense.amount);


        const dateCell = document.createElement("td");

        dateCell.textContent = formatDate(expense.date);


        const categoryCell = document.createElement("td");

        const badge = document.createElement("span");

        badge.className =
            "category-badge category-" + expense.category.toLowerCase();

        badge.textContent =
            `${categories[expense.category].emoji} ${expense.category}`;

        categoryCell.appendChild(badge);


        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "delete-button";

        deleteButton.textContent = "Delete 🗑️";

        deleteButton.addEventListener("click", function () {

            deleteExpense(expense.id);

        });


        actionCell.appendChild(deleteButton);


        row.appendChild(numberCell);

        row.appendChild(nameCell);

        row.appendChild(amountCell);

        row.appendChild(dateCell);

        row.appendChild(categoryCell);

        row.appendChild(actionCell);


        tableBody.appendChild(row);

    });


    countElement.textContent =
        `Showing ${filtered.length} of ${expenses.length} expenses`;

}


/* ==========================================
   CHARTS
========================================== */

function updateCharts() {

    if (typeof Chart === "undefined") {
        console.warn("Chart.js did not load. Check your internet connection.");
        return;
    }

    updateCategoryChart();

    updateWeeklyChart();

}


function updateCategoryChart() {

    const canvas = document.getElementById("category-chart");

    const totals = getCategoryTotals(expenses);


    const labels = Object.keys(categories).filter(function (category) {

        return totals[category] > 0;

    });


    const values = labels.map(function (category) {

        return totals[category];

    });


    const colors = labels.map(function (category) {

        return categories[category].color;

    });


    if (categoryChart) {
        categoryChart.destroy();
    }


    categoryChart = new Chart(canvas, {

        type: "pie",

        data: {

            labels: labels.length ? labels : ["No expenses yet"],

            datasets: [{

                data: labels.length ? values : [1],

                backgroundColor: labels.length ? colors : ["#eee7f7"],

                borderColor: "#ffffff",

                borderWidth: 3

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom"
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            if (!labels.length) {
                                return "No expenses recorded";
                            }

                            return context.label + ": " +
                                formatMoney(context.raw);

                        }

                    }

                }

            }

        }

    });

}


function updateWeeklyChart() {

    const canvas = document.getElementById("weekly-chart");

    const monday = getMonday(new Date());

    const labels = [];

    const values = [];


    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);

        date.setDate(monday.getDate() + i);

        const dateString = dateToString(date);


        labels.push(date.toLocaleDateString("en-IN", {
            weekday: "short"
        }));


        values.push(calculateTotal(

            expenses.filter(function (expense) {

                return expense.date === dateString;

            })

        ));

    }


    if (weeklyChart) {
        weeklyChart.destroy();
    }


    weeklyChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Money Spent (₹)",

                data: values,

                backgroundColor: [
                    "#ffad66",
                    "#ff6fae",
                    "#54b7f5",
                    "#7950e8",
                    "#36c99a",
                    "#ffd166",
                    "#a78bfa"
                ],

                borderRadius: 8,

                maxBarThickness: 45

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {
                    beginAtZero: true
                }

            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return formatMoney(context.raw);

                        }

                    }

                }

            }

        }

    });

}


/* ==========================================
   BUDGET MANAGER
========================================== */

const budgetInputs = {

    daily: document.getElementById("daily-budget-input"),

    weekly: document.getElementById("weekly-budget-input"),

    monthly: document.getElementById("monthly-budget-input")

};


const budgetSpentElements = {

    daily: document.getElementById("daily-spent"),

    weekly: document.getElementById("weekly-spent"),

    monthly: document.getElementById("monthly-spent")

};


const budgetProgressElements = {

    daily: document.getElementById("daily-progress"),

    weekly: document.getElementById("weekly-progress"),

    monthly: document.getElementById("monthly-progress")

};


const budgetStatusElements = {

    daily: document.getElementById("daily-budget-status"),

    weekly: document.getElementById("weekly-budget-status"),

    monthly: document.getElementById("monthly-budget-status")

};


function loadBudgetInputs() {

    budgetInputs.daily.value = budgets.daily || "";

    budgetInputs.weekly.value = budgets.weekly || "";

    budgetInputs.monthly.value = budgets.monthly || "";

}


document.querySelectorAll(".save-budget-button").forEach(function (button) {

    button.addEventListener("click", function () {

        const type = button.dataset.budget;

        const inputValue = budgetInputs[type].value.trim();


        if (inputValue === "") {

            budgets[type] = 0;

        } else {

            const amount = Number(inputValue);


            if (!Number.isFinite(amount) || amount < 0) {

                alert("Please enter a valid budget.");

                return;

            }


            budgets[type] = amount;

        }


        saveBudgets();

        updateBudgetDisplay();


        button.textContent = "Saved! ✓";


        setTimeout(function () {

            button.textContent = "Save";

        }, 1500);

    });

});


function getSpendingForBudget(type) {

    if (type === "daily") {

        const today = getTodayDate();

        return calculateTotal(

            expenses.filter(function (expense) {

                return expense.date === today;

            })

        );

    }


    if (type === "weekly") {

        return calculateTotal(

            filterByDateCondition(isCurrentWeek)

        );

    }


    if (type === "monthly") {

        return calculateTotal(

            filterByDateCondition(isCurrentMonth)

        );

    }


    return 0;

}


function updateBudgetDisplay() {

    ["daily", "weekly", "monthly"].forEach(function (type) {

        const budget = budgets[type];

        const spent = getSpendingForBudget(type);


        budgetSpentElements[type].textContent = formatMoney(spent);


        const progress = budgetProgressElements[type];

        const status = budgetStatusElements[type];


        status.className = "budget-status";


        if (budget <= 0) {

            progress.style.width = "0%";

            progress.style.backgroundColor = "#36c99a";

            status.textContent =
                "Set a budget to start tracking your spending! 🎯";

            return;

        }


        const percentage = (spent / budget) * 100;

        progress.style.width = Math.min(percentage, 100) + "%";


        if (percentage >= 100) {

            progress.style.backgroundColor = "#ff4d6d";

            status.classList.add("exceeded");

            status.textContent =
                `🚨 Budget exceeded by ${formatMoney(spent - budget)}!`;

        } else if (percentage >= 80) {

            progress.style.backgroundColor = "#ffad33";

            status.classList.add("warning");

            status.textContent =
                `⚠️ ${percentage.toFixed(0)}% used! ${formatMoney(budget - spent)} left.`;

        } else {

            progress.style.backgroundColor = "#36c99a";

            status.classList.add("safe");

            status.textContent =
                `🎉 ${formatMoney(budget - spent)} remaining.`;

        }

    });

}


/* ==========================================
   REFRESH DASHBOARD
========================================== */

function refreshDisplay() {

    updateOverallTotal();

    updateAllSummaries();

    renderCategoryBreakdown(
        "category-summary",
        expenses,
        "Add expenses to see your category summary."
    );

    renderExpenseHistory();

    updateBudgetDisplay();

    updateCharts();

}


/* ==========================================
   INITIALIZE
========================================== */

expenseDateInput.value = getTodayDate();

loadBudgetInputs();


/* Keep the dashboard hidden unless logged in */

if (sessionStorage.getItem("moneyBuddyLoggedIn") === "true") {

    loginPage.style.display = "none";

    mainDashboard.classList.remove("dashboard-hidden");

} else {

    loginPage.style.display = "flex";

    mainDashboard.classList.add("dashboard-hidden");

}


/* Initialize the data */

refreshDisplay();