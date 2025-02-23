import BaseRepository from './base.repository';

export default class ProjectsRepository extends BaseRepository {
    async getAllProjects(params = {}) {
        const queryParams = new URLSearchParams();

        queryParams.append('page', params.page || 1);
        queryParams.append('per_page', params.per_page || 15);

        for (const [key, value] of Object.entries(params)) {
            if (key !== 'page' && key !== 'per_page' && value !== '' && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        }

        const url = `/projects?${queryParams.toString()}`;
        return this.fetchWithAuth(url);
    }
    async getProject(id) {
        return this.fetchWithAuth(`/projects/${id}`);
    }

    async createProject(projectData) {
        return this.fetchWithAuth('/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });
    }

    async updateProject(id, projectData) {
        return this.fetchWithAuth(`/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });
    }

    async removeProject(id) {
        return this.fetchWithAuth(`/projects/${id}`, {
            method: 'DELETE',
        });
    }
}