import BaseRepository from './base.repository.js';

export default class UserRepository extends BaseRepository {
  async getUserProfile() {
    return this.fetchWithAuth('/user');
  }

  async updateUserProfile(userData) {
    return this.fetchWithAuth('/user', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async updateUserPassword(passwordData) {
    return this.fetchWithAuth('/user/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  async updateProfilePhoto(photoFile) {
    const formData = new FormData();
    formData.append('profile_photo', photoFile);

    return this.fetchWithAuth('/user/profile-photo', {
      method: 'POST',
      headers: {
        'Content-Type': undefined
      },
      body: formData
    });
  }

  async getUserStats() {
    return this.fetchWithAuth('/user/stats');
  }
}