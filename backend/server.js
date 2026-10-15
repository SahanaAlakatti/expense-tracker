const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new Database("expenses.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category TEXT NOT NULL,
        date TEXT NOT NULL
    )
`);

const insertTransaction = db.prepare(`
    INSERT INTO transactions
    (description, amount, type, category, date)
    VALUES (?, ?, ?, ?, ?)
`);

function validDate(date) {
    if (typeof date !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
}

// Get all transactions
app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare(`
        SELECT * FROM transactions
        ORDER BY date DESC, id DESC
    `).all();

    res.json(transactions);
});

// Add a transaction
app.post("/api/transactions", (req, res) => {
    const { description, amount, type, category, date } = req.body;

    if (
        typeof description !== "string" ||
        !description.trim() ||
        description.trim().length > 100
    ) {
        return res.status(400).json({
            error: "Enter a valid description (maximum 100 characters)."
        });
    }

    const numericAmount = amount;

    if (
        typeof numericAmount !== "number" ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0 ||
        numericAmount > 1000000000
    ) {
        return res.status(400).json({
            error: "Amount must be a valid positive number."
        });
    }

    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            error: "Invalid transaction type."
        });
    }

    if (
        typeof category !== "string" ||
        !["Salary", "Food", "Travel", "Education", "Shopping", "Other"]
            .includes(category)
    ) {
        return res.status(400).json({
            error: "Invalid category."
        });
    }

    if (!validDate(date)) {
        return res.status(400).json({
            error: "Enter a valid date."
        });
    }

    try {
        const result = insertTransaction.run(
            description.trim(),
            numericAmount,
            type,
            category,
            date
        );

        const transaction = db.prepare(`
            SELECT * FROM transactions WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not save the transaction."
        });
    }
});

// Delete a transaction
app.delete("/api/transactions/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid transaction ID."
        });
    }

    const result = db.prepare(`
        DELETE FROM transactions WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Transaction not found."
        });
    }

    res.json({
        message: "Transaction deleted successfully."
    });
});

// Calculate totals on the server
app.get("/api/summary", (req, res) => {
    const summary = db.prepare(`
        SELECT
            COALESCE(
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
                0
            ) AS totalIncome,

            COALESCE(
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
                0
            ) AS totalExpenses

        FROM transactions
    `).get();

    res.json({
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netSavings: summary.totalIncome - summary.totalExpenses
    });
});

app.listen(PORT, () => {
    console.log(`Expense Tracker backend running at http://localhost:${PORT}`);
});