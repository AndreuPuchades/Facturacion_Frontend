import BaseRepository from './base.repository.js';

export default class ExpensesRepository extends BaseRepository {
  async getAllExpenses(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.fetchWithAuth(`/expenses?${queryParams}`);
  }

  async getAllExpensesCategories() {
    return this.fetchWithAuth('/expense-categories');
  }

  async addExpense(expense) {
    return this.fetchWithAuth('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  }

  async getExpenseById(expenseId) {
    return this.fetchWithAuth(`/expenses/${expenseId}`);
  }

  async removeExpense(expenseId) {
    return this.fetchWithAuth(`/expenses/${expenseId}`, {
      method: 'DELETE'
    });
  }

  async updateExpense(expense) {
    return this.fetchWithAuth(`/expenses/${expense.id}`, {
      method: 'PUT',
      body: JSON.stringify(expense)
    });
  }
}