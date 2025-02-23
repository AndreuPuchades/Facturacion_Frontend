import BaseRepository from './base.repository.js';

export default class IncomesRepository extends BaseRepository {
  async getAllIncomes(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.fetchWithAuth(`/incomes?${queryParams}`);
  }

  async getAllIncomesCategories() {
    return this.fetchWithAuth('/income-categories');
  }

  async addIncome(income) {
    return this.fetchWithAuth('/incomes', {
      method: 'POST',
      body: JSON.stringify(income)
    });
  }

  async getIncomeById(incomeId) {
    return this.fetchWithAuth(`/incomes/${incomeId}`);
  }

  async removeIncome(incomeId) {
    return this.fetchWithAuth(`/incomes/${incomeId}`, {
      method: 'DELETE'
    });
  }

  async updateIncome(income) {
    return this.fetchWithAuth(`/incomes/${income.id}`, {
      method: 'PUT',
      body: JSON.stringify(income)
    });
  }
}