<template>
  <div class="employee-schedule-view">
    <h1 class="calendar-title">{{ $t('employeeSchedule') }}</h1>
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="nav-button" @click="previousMonth">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h2 class="month-title">{{ currentMonthName }}</h2>
        <button class="nav-button" @click="nextMonth">
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="select-container">
        <select
            id="employee-select"
            v-model="selectedEmployee"
            @change="fetchScheduleData"
        >
          <option value="">{{ $t('selectEmployee') }}</option>
          <option v-for="employee in employees" :key="employee.user.id" :value="employee.user.id">
            {{ employee.user.name }}
          </option>
        </select>
      </div>

      <div v-if="isLoading" class="loading">{{ $t('loading') }}</div>

      <div v-else class="calendar-grid">
        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="days-grid">
          <button
              v-for="day in calendarDays"
              :key="day.fullDate"
              class="day-cell"
              :class="{
                'bg-day-calendar': hasEntries(day.fullDate),
                'current-month': day.currentMonth,
                'other-month': !day.currentMonth,
                'has-entries': hasEntries(day.fullDate),
                'selected': isSelectedDate(day.fullDate),
                'today': isToday(day.fullDate)
              }"
              @click="selectDate(day.fullDate)"
          >
            <span class="day-number">{{ new Date(day.fullDate).getDate() }}</span>
            <div v-if="hasEntries(day.fullDate)" class="day-total-hours">{{ getDayTotalHours(day.fullDate) }}h</div>
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedDate && selectedEmployee" class="day-details">
      <div class="details-header">
        <h2 class="details-title">{{ formatDisplayDate(selectedDate) }}</h2>
        <div class="total-hours" v-if="getDayTotalHours(selectedDate)">
          <ClockIcon class="w-5 h-5" />
          <span>{{ getDayTotalHours(selectedDate) }}</span>
        </div>
      </div>

      <div v-if="isLoadingEntries" class="loading">{{ $t('loadingEntries') }}</div>

      <div v-else-if="dayEntries.length > 0" class="entries-list">
        <div v-for="(entry, index) in dayEntries" :key="entry.id" class="entry-card">
          <div class="entry-header">
            <span :class="['entry-badge', entry.type]">{{ entry.type === 'check_in' ? $t('checkIn') : $t('checkOut') }}</span>
            <span class="entry-time">{{ formatTime(entry.time) }}</span>
          </div>
          <div v-if="entry.notes" class="entry-notes">
            {{ $t('notes') }}: {{ entry.notes }}
          </div>
        </div>
      </div>
      <div v-else class="no-entries">
        <CalendarXIcon class="w-6 h-6" />
        <p>{{ $t('noEntriesForThisDay') }}</p>
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
      weekDays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      selectedDate: null,
      dayEntries: [],
      isLoading: false,
      isLoadingEntries: false,
    };
  },
  computed: {
    ...mapState(useCounterStore, ['employees', 'employeeSchedules']),
    currentMonthName() {
      return this.currentDate.toLocaleString(this.$i18n.locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      let start = new Date(firstDay);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

      let end = new Date(lastDay);
      end.setDate(end.getDate() + (7 - end.getDay()) % 7);

      const days = [];
      const current = new Date(start);

      while (current <= end) {
        days.push({
          fullDate: this.formatDate(current),
          currentMonth: current.getMonth() === month,
        });
        current.setDate(current.getDate() + 1);
      }

      return days;
    }
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
    hasEntries(date) {
      if (!this.selectedEmployee) return false;
      const employeeData = this.employeeSchedules[this.selectedEmployee];
      if (!employeeData) return false;
      const entry = employeeData.find(entry => entry.date === date);
      return entry && entry.has_entries;
    },
    getDayTotalHours(date) {
      if (!this.selectedEmployee) return '';
      const employeeData = this.employeeSchedules[this.selectedEmployee];
      if (!employeeData) return '';
      const entry = employeeData.find(entry => entry.date === date);
      return entry ? entry.total_hours : '';
    },
    formatDate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
      return new Date(timeString).toLocaleTimeString(this.$i18n.locale === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    },
    async selectDate(date) {
      this.selectedDate = date;
      if (this.selectedEmployee) {
        await this.fetchDayEntries(date);
      }
    },
    isSelectedDate(date) {
      return this.selectedDate === date;
    },
    isToday(date) {
      const today = this.formatDate(new Date());
      return date === today;
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
}

.calendar-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.calendar-wrapper {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  text-transform: capitalize;
}

.nav-button {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background-color: #e2e8f0;
  color: #3b82f6;
}

.select-container {
  margin-bottom: 1.5rem;
}

.select-container select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #2c3e50;
  font-size: 1rem;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
}

.weekdays-header span {
  text-align: center;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background-color: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-cell:hover {
  background-color: #e2e8f0;
}

.day-cell.current-month {
  color: #1e293b;
}

.day-cell.other-month {
  color: #94a3b8;
}

.day-cell.has-entries {
  font-weight: 600;
}

.day-cell.selected {
  background-color: #3b82f6;
  color: white;
}

.day-cell.today {
  border: 2px solid #3b82f6;
}

.day-details {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
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
  color: #2c3e50;
  text-transform: capitalize;
}

.total-hours {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-weight: 600;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-card {
  background-color: #f8fafc;
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
  color: #64748b;
  font-weight: 500;
}

.shift-duration {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #3b82f6;
}

.entry-notes {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.no-entries {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
  text-align: center;
}

.day-total-hours {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.7rem;
  color: #3b82f6;
}

.bg-day-calendar {
  background-color: #dbeafe;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #3b82f6;
  font-weight: 600;
}

@media (max-width: 640px) {
  .employee-schedule-view {
    padding: 1rem;
  }

  .calendar-wrapper {
    padding: 1rem;
  }

  .month-title {
    font-size: 1.25rem;
  }

  .day-cell {
    padding: 0.25rem;
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .day-total-hours {
    display: none;
  }

  .weekdays-header span {
    font-size: 0.75rem;
  }

  .day-number {
    font-size: 0.875rem;
  }
}
</style>
