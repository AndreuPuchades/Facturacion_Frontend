import BaseRepository from './base.repository.js';

export default class TimesheetRepository extends BaseRepository {
  async getLastStatus() {
    return this.fetchWithAuth('/timesheet/last-status');
  }

  async checkIn(latitude, longitude, notes = '') {
    return this.fetchWithAuth('/timesheet/check-in', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, notes })
    });
  }

  async checkOut(latitude, longitude, notes = '') {
    return this.fetchWithAuth('/timesheet/check-out', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, notes })
    });
  }

  async getEntries(date) {
    return this.fetchWithAuth(`/timesheet/entries?date=${date}`);
  }

  async updateEntry(entryId, data) {
    return this.fetchWithAuth(`/timesheet/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteEntry(entryId) {
    return this.fetchWithAuth(`/timesheet/entries/${entryId}`, {
      method: 'DELETE'
    });
  }

  async getMonthEntries(year, month) {
    return this.fetchWithAuth(`/timesheet/month-entries/${year}/${month}`);
  }

  async getEmployeesMonthEntries(year, month, employeeId) {
    return await this.fetchWithAuth(`/timesheet/employees-month-entries/${year}/${month}?employee_id=${employeeId}`);
  }

  async getEmployeeDayEntries(employeeId, date) {
    return await this.fetchWithAuth(`/timesheet/employee-day-entries?employee_id=${employeeId}&date=${date}`);
  }
}