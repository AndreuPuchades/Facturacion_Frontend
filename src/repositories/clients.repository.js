import BaseRepository from './base.repository.js';

export default class ClientsRepository extends BaseRepository {
  async getAllClients() {
    return this.fetchWithAuth('/clients');
  }

  async addClient(client) {
    return this.fetchWithAuth('/clients', {
      method: 'POST',
      body: JSON.stringify(client)
    });
  }

  async getClientById(clientId) {
    return this.fetchWithAuth(`/clients/${clientId}`);
  }

  async removeClient(clientId) {
    return this.fetchWithAuth(`/clients/${clientId}`, {
      method: 'DELETE'
    });
  }

  async updateClient(client) {
    return this.fetchWithAuth(`/clients/${client.id}`, {
      method: 'PUT',
      body: JSON.stringify(client)
    });
  }
}