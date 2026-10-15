# Expense Tracker

## Project Overview
Expense Tracker is a full-stack web application that helps users
manage their income and expenses and monitor their net savings.

## Technologies Used
- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- SQLite
- REST API

## Features
- Add income and expense transactions
- View transaction history
- Delete transactions
- Calculate total income
- Calculate total expenses
- Calculate net savings
- Validate transaction details
- Store transactions in an SQLite database
- Responsive user interface

## Project Structure

Expense-Tracker/
- frontend/
  - index.html
  - style.css
  - script.js
- backend/
  - server.js
  - package.json
  - expenses.db

## Installation

1. Install Node.js.
2. Open the terminal in the backend directory.
3. Install the dependencies:

   npm install

4. Start the backend:

   npm run dev

5. Open frontend/index.html using VS Code Live Server.

## API Endpoints

GET /api/transactions
- Retrieve all transactions.

POST /api/transactions
- Add a new transaction.

DELETE /api/transactions/:id
- Delete a transaction.

GET /api/summary
- Retrieve income, expenses, and net savings.

## Net Savings Calculation

Net Savings = Total Income - Total Expenses

## Database
SQLite stores the transaction records persistently.

## Author
Sahana