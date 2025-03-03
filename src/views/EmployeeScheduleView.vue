<template>
  <div class="employee-schedule-view">
    <h1 class="title">Employee Schedule</h1>
    <div class="month-navigation">
      <button @click="previousMonth" class="nav-button">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <span class="month-label">{{ currentMonthYear }}</span>
      <button @click="nextMonth" class="nav-button">
        <ChevronRightIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="select-container">
      <select
          id="employee-select"
          v-model="selectedEmployee"
          @change="fetchScheduleData"
      >
        <option value="">Select an employee</option>
        <option v-for="employee in employees" :key="employee.user.id" :value="employee.user.id">
          {{ employee.user.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>

    <div v-else class="calendar-container">
      <table>
        <thead>
        <tr>
          <th v-for="day in weekDays" :key="day" class="day-column">
            {{ day }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="week in calendarWeeks" :key="week[0].fullDate">
          <td
              v-for="day in week"
              :key="day.fullDate"
              class="calendar-cell"
              :class="{
              'current-month': day.currentMonth,
              'selected': isSelectedDate(day.fullDate),
              'has-entries': hasEntries(day.fullDate)
            }"
              @click="selectDate(day.fullDate)"
          >
            <div class="date">{{ day.date }}</div>
            <div v-if="selectedEmployee && day.currentMonth" class="hours-badge">
              {{ getEmployeeHours(selectedEmployee, day.fullDate) || '-' }}
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedDate && selectedEmployee" class="timesheet-entries">
      <div class="details-header">
        <h2 class="details-title">{{ formatDisplayDate(selectedDate) }}</h2>
        <div class="total-hours" v-if="getDayTotalHours(selectedDate)">
          <ClockIcon class="w-5 h-5" />
          <span>{{ getDayTotalHours(selectedDate) }}</span>
        </div>
      </div>

      <div v-if="isLoadingEntries" class="loading">Loading entries...</div>

      <div v-else-if="dayEntries.length > 0" class="entries-list">
        <div v-for="(entry, index) in dayEntries" :key="entry.id" class="entry-card">
          <div class="entry-header">
            <span :class="['entry-badge', entry.type]">{{ entry.type === 'check_in' ? 'Check In' : 'Check Out' }}</span>
            <span class="entry-time">{{ formatTime(entry.time) }}</span>
          </div>
          <div v-if="entry.type === 'check_out' && index > 0" class="shift-duration">
            {{ formatDuration(getShiftDuration(index)) }}
          </div>
          <div v-if="entry.notes" class="entry-notes">
            Notes: {{ entry.notes }}
          </div>
        </div>
      </div>
      <div v-else class="no-entries">
        <CalendarXIcon class="w-6 h-6" />
        <p>No entries for this day</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CalendarXIcon } from 'lucide-vue-next';
import { useCounterStore } from "@/stores/index.js";

export default {
  name: 'EmployeeScheduleView',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CalendarXIcon
  },
  data() {
    return {
      currentDate: new Date(),
      selectedEmployee: null,
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      selectedDate: null,
      dayEntries: [],
      isLoading: false,
      isLoadingEntries: false,
    };
  },
  computed: {
    ...mapState(useCounterStore, ['employees', 'employeeSchedules']),
    currentMonthYear() {
      return this.currentDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      });
    },
    calendarWeeks() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      let date = new Date(firstDay);
      date.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

      const weeks = [];
      while (date <= lastDay || weeks.length < 6) {
        const week = [];
        for (let i = 0; i < 7; i++) {
          week.push({
            date: date.getDate(),
            fullDate: this.formatDate(date),
            currentMonth: date.getMonth() === month,
          });
          date.setDate(date.getDate() + 1);
        }
        weeks.push(week);
      }
      return weeks;
    },
  },
  methods: {
    ...mapActions(useCounterStore, ['loadEmployees', 'getEmployeesMonthEntries', 'getEmployeeDayEntries']),
    async fetchScheduleData() {
      if (!this.selectedEmployee) return;
      this.isLoading = true;
      try {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1;
        await this.getEmployeesMonthEntries(year, month, this.selectedEmployee);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        this.isLoading = false;
      }
    },
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.fetchScheduleData();
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.fetchScheduleData();
    },
    getEmployeeName(employeeId) {
      const employee = this.employees.find(e => e.id === employeeId);
      return employee ? employee.user.name : 'Unknown';
    },
    getEmployeeHours(employeeId, fullDate) {
      const employeeData = this.employeeSchedules[employeeId];
      if (!employeeData) return '';

      const entry = employeeData.find(entry => entry.date === fullDate);
      return entry ? entry.total_hours : '';
    },
    formatDate(date) {
      let d = date;
      if (typeof date === 'string') {
        d = new Date(date);
      }
      if (!(d instanceof Date) || isNaN(d)) {
        console.error('Invalid date:', date);
        return 'Invalid Date';
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    formatDisplayDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.$i18n.locale === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatTime(timeString) {
      if (!timeString) return '';
      const date = new Date(timeString);

      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timeString);
        return 'Invalid Time';
      }

      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    },
    async selectDate(date) {
      this.selectedDate = this.formatDate(date);
      if (this.selectedEmployee) {
        await this.fetchDayEntries(this.selectedDate);
      }
    },
    isSelectedDate(date) {
      return this.selectedDate === date;
    },
    hasEntries(date) {
      if (!this.selectedEmployee) return false;
      const employeeData = this.employeeSchedules[this.selectedEmployee];
      if (!employeeData) return false;
      const entry = employeeData.find(entry => entry.date === date);
      return entry && entry.has_entries;
    },
    getDayTotalHours(date) {
      if (!this.selectedEmployee) return '';
      return this.getEmployeeHours(this.selectedEmployee, date);
    },
    async fetchDayEntries(date) {
      this.isLoadingEntries = true;
      try {
        this.dayEntries = await this.getEmployeeDayEntries(this.selectedEmployee, date);
      } catch (error) {
        console.error('Error fetching day entries:', error);
        this.dayEntries = [];
      } finally {
        this.isLoadingEntries = false;
      }
    },
    getShiftDuration(index) {
      if (this.dayEntries[index].type === 'check_out' && index > 0) {
        const checkOutTime = new Date(`1970-01-01T${this.dayEntries[index].time}`);
        const checkInTime = new Date(`1970-01-01T${this.dayEntries[index - 1].time}`);
        return (checkOutTime - checkInTime) / 1000;
      }
      return 0;
    },
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    },
  },
  async mounted() {
    this.isLoading = true;
    try {
      if (this.employees.length === 0) {
        await this.loadEmployees();
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      this.isLoading = false;
    }
  },
  watch: {
    currentDate: 'fetchScheduleData',
    selectedEmployee: 'fetchScheduleData',
  },
};
</script>

<style scoped>
.employee-schedule-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: transparent;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: black;
  margin-bottom: 2rem;
  text-align: center;
}

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background-color: transparent;
  border-radius: 6px;
}

.nav-button {
  padding: 0.5rem;
  border: none;
  background-color: #d3e5ff;
  border-radius: 4px;
  color: #1e3a8a;
  transition: all 0.2s;
}

.nav-button:hover {
  background-color: #c3d8ff;
}

.month-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: black;
}

.select-container {
  margin-bottom: 2rem;
}

.select-container select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  background-color: #ffffff;
  color: black;
}

.calendar-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  background-color: #f1f2fa;
}

th {
  padding: 0.75rem;
  font-weight: 500;
  color: black;
  background-color: #e5f2ff;
  text-align: center;
}

.day-column {
  text-align: center;
  width: 14.28%;
}

.calendar-cell {
  padding: 0.5rem;
  text-align: center;
  color: #333333;
  background-color: #ffffff;
  position: relative;
  height: 80px;
  vertical-align: top;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-cell:hover {
  background-color: #eff6ff;
}

.calendar-cell.selected {
  background-color: #bfdbfe;
}

.calendar-cell.has-entries {
  font-weight: 600;
}

.calendar-cell:not(.current-month) {
  opacity: 0.5;
}

.date {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.hours-badge {
  font-size: 0.875rem;
  background-color: transparent;
  color: #1823ff;
  padding: 0.25rem;
  border-radius: 4px;
}

.timesheet-entries {
  background-color: transparent;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: black;
}

.total-hours {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4545ff;
  font-weight: 600;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entry-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.entry-badge.check_in {
  background-color: #d1fae5;
  color: #065f46;
}

.entry-badge.check_out {
  background-color: #fee2e2;
  color: #991b1b;
}

.entry-time {
  color: #595959;
  font-weight: 500;
}

.shift-duration {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #1e3a8a;
}

.entry-notes {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #1e3a8a;
}

.no-entries {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #1e3a8a;
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #1e3a8a;
  font-weight: 600;
}

@media (max-width: 640px) {
  .employee-schedule-view {
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .month-navigation {
    padding: 0.25rem;
  }

  .calendar-cell {
    height: 60px;
    font-size: 0.8rem;
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>