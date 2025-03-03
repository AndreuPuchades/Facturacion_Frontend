import BaseRepository from './base.repository';
import {useCounterStore} from "@/stores/index.js";

export default class EmployeeRepository extends BaseRepository {
    async getAllEmployees() {
        return this.fetchWithAuth("/employees?company_id=" + useCounterStore().selectedCompany.id);
    }

    async getEmployee(id) {
        return this.fetchWithAuth(`/employees/${id}`);
    }

    async createEmployee(employeeData) {
        return this.fetchWithAuth('/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });
    }

    async updateEmployee(id, employeeData) {
        return this.fetchWithAuth(`/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });
    }

    async removeEmployee(id) {
        return this.fetchWithAuth(`/employees/${id}`, {
            method: 'DELETE',
        });
    }

    async getEmployeesByCompany(companyId, params = {}) {
        const queryParams = new URLSearchParams();

        queryParams.append('company_id', companyId);
        queryParams.append('page', params.page || 1);
        queryParams.append('per_page', params.per_page || 15);

        for (const [key, value] of Object.entries(params)) {
            if (!['page', 'per_page', 'company_id'].includes(key) && value !== '' && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        }

        const url = `/employees?${queryParams.toString()}`;
        return this.fetchWithAuth(url);
    }
}