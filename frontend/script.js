const API_URL = "http://localhost:3000/api";

const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const totalIncomeElement = document.getElementById("totalIncome");
const totalExpensesElement = document.getElementById("totalExpenses");
const netSavingsElement = document.getElementById("netSavings");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

// Set today's date
dateInput.value = new Date().toLocaleDateString("en-CA");

// Format amounts in Indian rupees
function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);

        if (!response.ok) {
            throw new Error("Could not load transactions.");
        }

        const transactions = await response.json();

        transactionList.replaceChildren();

        if (transactions.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "No transactions yet.";

            row.appendChild(cell);
            transactionList.appendChild(row);
        }

        transactions.forEach((transaction) => {
            const row = document.createElement("tr");

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = transaction.description;

            const amountCell = document.createElement("td");
            amountCell.textContent = formatMoney(transaction.amount);

            const typeCell = document.createElement("td");
            typeCell.textContent = transaction.type;

            const categoryCell = document.createElement("td");
            categoryCell.textContent = transaction.category;

            const dateCell = document.createElement("td");
            dateCell.textContent = transaction.date;

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", () => {
                deleteTransaction(transaction.id);
            });

            actionCell.appendChild(deleteButton);

            row.append(
                descriptionCell,
                amountCell,
                typeCell,
                categoryCell,
                dateCell,
                actionCell
            );

            transactionList.appendChild(row);
        });
    } catch (error) {
        console.error("Transaction error:", error);
        alert("Could not load transactions. Check the backend.");
    }
}

// Load dashboard summary
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/summary`);

        if (!response.ok) {
            throw new Error("Could not load summary.");
        }

        const summary = await response.json();

        totalIncomeElement.textContent =
            formatMoney(summary.totalIncome);

        totalExpensesElement.textContent =
            formatMoney(summary.totalExpenses);

        netSavingsElement.textContent =
            formatMoney(summary.netSavings);

    } catch (error) {
        console.error("Summary error:", error);
        alert("Could not load the dashboard summary.");
    }
}

// Add transaction
transactionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description) {
        alert("Please enter a description.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter an amount greater than zero.");
        return;
    }

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const transaction = {
        description,
        amount,
        type,
        category,
        date
    };

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not add transaction.");
        }

        alert("Transaction added successfully!");

        transactionForm.reset();
        dateInput.value = new Date().toLocaleDateString("en-CA");

        await loadTransactions();
        await loadSummary();

    } catch (error) {
        console.error("Add transaction error:", error);
        alert(error.message || "Something went wrong.");
    }
});

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not delete transaction.");
        }

        await loadTransactions();
        await loadSummary();

        alert("Transaction deleted successfully!");

    } catch (error) {
        console.error("Delete transaction error:", error);
        alert(error.message || "Could not delete transaction.");
    }
}

// Initialize application
async function initializeApp() {
    await loadTransactions();
    await loadSummary();
}

initializeApp();