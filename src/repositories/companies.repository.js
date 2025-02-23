import BaseRepository from './base.repository.js';

export default class CompaniesRepository extends BaseRepository {
  async getAllCompanies() {
    return this.fetchWithAuth('/companies');
  }

  async addCompany(company) {
    return this.fetchWithAuth('/companies', {
      method: 'POST',
      body: JSON.stringify(company)
    });
  }

  async getCompanyById(companyId) {
    return this.fetchWithAuth(`/companies/${companyId}`);
  }

  async removeCompany(companyId) {
    return this.fetchWithAuth(`/companies/${companyId}`, {
      method: 'DELETE'
    });
  }

  async updateCompany(company) {
    return this.fetchWithAuth(`/companies/${company.id}`, {
      method: 'PUT',
      body: JSON.stringify(company)
    });
  }
}