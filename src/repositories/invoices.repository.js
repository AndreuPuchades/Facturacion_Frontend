import BaseRepository from './base.repository';

export default class InvoicesRepository extends BaseRepository {
    async getAllInvoices(params = {}) {
        const queryParams = new URLSearchParams();

        queryParams.append('page', params.page || 1);
        queryParams.append('per_page', params.per_page || 10);

        for (const [key, value] of Object.entries(params)) {
            if (key !== 'page' && key !== 'per_page' && value !== '' && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        }

        const url = `/invoices?${queryParams.toString()}`;
        return this.fetchWithAuth(url);
    }

    async getInvoice(id) {
        return this.fetchWithAuth(`/invoices/${id}`);
    }

    async createInvoice(productData) {
        return this.fetchWithAuth('/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
    }

    async updateInvoice(id, productData) {
        return this.fetchWithAuth(`/invoices/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
    }

    async removeInvoice(id) {
        return this.fetchWithAuth(`/invoices/${id}`, {
            method: 'DELETE',
        });
    }
}