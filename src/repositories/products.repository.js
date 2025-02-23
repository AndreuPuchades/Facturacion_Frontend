import BaseRepository from './base.repository';

export default class ProductsRepository extends BaseRepository {
    async getAllProducts(params = {}) {
        const queryParams = new URLSearchParams(params);

        for (const [key, value] of queryParams.entries()) {
            if (value === '' || value === null || value === undefined) {
                queryParams.delete(key);
            }
        }

        const url = `/products?${queryParams.toString()}`;
        return this.fetchWithAuth(url);
    }

    async getAllProductCategories() {
        return this.fetchWithAuth('/product-categories');
    }

    async getAllTaxes() {
        return this.fetchWithAuth('/taxes');
    }

    async getProduct(id) {
        return this.fetchWithAuth(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.fetchWithAuth('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(id, productData) {
        return this.fetchWithAuth(`/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
    }

    async removeProduct(id) {
        return this.fetchWithAuth(`/products/${id}`, {
            method: 'DELETE',
        });
    }
}