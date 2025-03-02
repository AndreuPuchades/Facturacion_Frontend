<template>
  <div class="timesheet-calendar-view">
    <h1 class="calendar-title">{{ $t('timesheetCalendar') }}</h1>
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
      <div class="calendar-grid">
        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="days-grid">
          <button
              v-for="day in calendarDays"
              :key="day.date"
              class="day-cell"
              :class="{
              'bg-day-calendar': hasEntries(day.date),
              'current-month': day.currentMonth,
              'other-month': !day.currentMonth,
              'has-entries': hasEntries(day.date),
              'selected': isSelectedDate(day.date),
              'today': isToday(day.date)
            }"
              @click="onDayClick(day)"
          >
            <span class="day-number">{{ new Date(day.date).getDate() }}</span>
            <div v-if="hasEntries(day.date)" class="day-total-hours">{{ getDayTotalHours(day.date) }}h</div>
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedDate" class="day-details">
      <div class="details-header">
        <h2 class="details-title">{{ formatDate(selectedDate) }}</h2>
        <div class="total-hours" v-if="getDayTotalHours(selectedDate)">
          <ClockIcon class="w-5 h-5" />
          <span>{{ getDayTotalHours(selectedDate) }}</span>
        </div>
      </div>

      <div v-if="dayEntries.length > 0" class="entries-list">
        <div v-for="(entry, index) in dayEntries" :key="entry.id" class="entry-card">
          <div class="entry-header">
            <span :class="['entry-badge', entry.type]">{{ entry.type === 'check_in' ? $t('checkIn') : $t('checkOut') }}</span>
            <span class="entry-time">{{ formatTime(entry.time) }}</span>
          </div>
          <div v-if="entry.type === 'check_out' && index > 0" class="shift-duration" style="margin-left: 20px">
            {{ formatDuration(getShiftDuration(index)) }}
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
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CalendarXIcon } from 'lucide-vue-next';
import TimesheetRepository from '@/repositories/timesheet.repository.js';

export default {
  name: 'TimesheetCalendarView',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CalendarXIcon
  },
  data() {
    return {
      timesheetRepo: new TimesheetRepository(),
      currentDate: new Date(),
      selectedDate: null,
      dayEntries: [],
      monthEntries: {},
      weekDays: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    };
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
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
          date: new Date(current),
          currentMonth: current.getMonth() === month,
        });
        current.setDate(current.getDate() + 1);
      }

      return days;
    }
  },
  methods: {
    hasEntries(date) {
      const dateStr = this.formatDateForAPI(date);
      return this.monthEntries[dateStr]?.has_entries || false;
    },
    getDayTotalHours(date) {
      const dateStr = this.formatDateForAPI(date);
      return this.monthEntries[dateStr]?.total_hours || null;
    },
    isSelectedDate(date) {
      return this.selectedDate &&
          date.getDate() === this.selectedDate.getDate() &&
          date.getMonth() === this.selectedDate.getMonth() &&
          date.getFullYear() === this.selectedDate.getFullYear();
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
    },
    async previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
      await this.fetchMonthEntries();
    },
    async nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
      await this.fetchMonthEntries();
    },
    async fetchMonthEntries() {
      try {
        const response = await this.timesheetRepo.getMonthEntries(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1
        );
        this.monthEntries = response.entries.reduce((acc, entry) => {
          acc[entry.date] = entry;
          return acc;
        }, {});
      } catch (error) {
        console.error('Error fetching month entries:', error);
      }
    },
    async onDayClick(day) {
      const selectedDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
      this.selectedDate = selectedDate;
      await this.fetchDayEntries(selectedDate);
    },
    async fetchDayEntries(date) {
      try {
        const formattedDate = this.formatDateForAPI(date);
        const response = await this.timesheetRepo.getEntries(formattedDate);
        this.dayEntries = response.entries;
      } catch (error) {
        console.error('Error fetching day entries:', error);
        this.dayEntries = [];
      }
    },
    formatDate(date) {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatTime(time) {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    formatDateForAPI(date) {
      const dateObj = new Date(date);
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    },
    getShiftDuration(index) {
      if (this.dayEntries[index].type === 'check_out' && index > 0) {
        const checkOutTime = new Date(this.dayEntries[index].time);
        const checkInTime = new Date(this.dayEntries[index - 1].time);
        return (checkOutTime - checkInTime) / 1000;
      }
      return 0;
    },
    getTotalDayHours() {
      return this.dayEntries.reduce((total, entry, index) => {
        return total + this.getShiftDuration(index);
      }, 0);
    },
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    },
  },
  mounted() {
    this.fetchMonthEntries();
  }
};
</script>

<style scoped>
.timesheet-calendar-view {
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

.entry-badge.total {
  background-color: #e0f2fe;
  color: #0369a1;
}

.entry-time {
  color: #64748b;
  font-weight: 500;
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
  color: #000000;
}

.bg-day-calendar {
  background-color: #b0c9fc;
}

@media (max-width: 640px) {
  .timesheet-calendar-view {
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