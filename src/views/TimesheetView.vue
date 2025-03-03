<template>
  <div class="timesheet-view">
    <h1 class="timesheet-title">{{ $t('timesheet') }}</h1>

    <div class="map-container" v-show="showMap">
      <div id="map" ref="mapRef"></div>
      <div class="map-overlay">
        <div class="location-info">
          <span class="location-label">{{ $t('currentLocation') }}:</span>
          <span class="location-coordinates">{{ formattedLocation }}</span>
        </div>
        <div v-if="isCheckedIn" class="timer-container">
          <div class="timer-circle">
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle class="timer-background" cx="50" cy="50" r="45"></circle>
              <circle class="timer-progress" cx="50" cy="50" r="45" :style="timerProgressStyle"></circle>
            </svg>
            <div class="timer-content">
              <span class="timer-value">{{ formattedElapsedTime }}</span>
            </div>
          </div>
        </div>
        <button
            @click="performCheckInOut"
            :disabled="isLoading"
            class="btn-check-in"
        >
          <span v-if="isLoading" class="loading-spinner-small"></span>
          <span class="btn-text">{{ isLoading ? $t('loading') : (isCheckedIn ? $t('checkOut') : $t('checkIn')) }}</span>
        </button>
      </div>
    </div>
    <p v-if="message" :class="['status-message', { 'text-success': !error, 'text-danger': error }]">
      {{ message }}
    </p>

    <div class="today-entries">
      <h2 class="entries-title">{{ $t('todayEntries') }}</h2>
      <div v-if="isLoading" class="loading-overlay-local">
        <div class="loading-spinner"></div>
        <p>{{ $t('loading') }}</p>
      </div>
      <ul v-else class="entries-list" v-if="todayEntries.length > 0">
        <li v-for="(entry, index) in todayEntries" :key="entry.id" class="entry-item">
          <div class="entry-details">
            <span :class="['entry-type', entry.type === 'check_in' ? 'check-in' : 'check-out']">
              {{ entry.type === 'check_in' ? $t('checkIn') : $t('checkOut') }}
            </span>
            <span class="entry-time">{{ formatTime(entry.time) }}</span>
            <button @click="openMiniMap(entry)" class="btn-mini-map" :title="$t('viewLocation')">
              <MapIcon class="h-5 w-5" />
            </button>
          </div>
          <span v-if="entry.type === 'check-out'" class="entry-duration">{{ formatDurationPrecise(getEntryDuration(index)) }}</span>
        </li>
      </ul>
      <p v-if="!isLoading && todayEntries.length <= 0" class="no-entries">{{ $t('noEntriesForToday') }}</p>

      <div v-if="todayEntries.length > 0" class="total-hours">
        <h3>{{ $t('totalHoursWorked') }}</h3>
        <span class="total-duration">{{ formatDurationPrecise(totalHoursWorked) }}</span>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showMiniMap" class="mini-map-modal" @click.self="closeMiniMap">
        <div class="mini-map-container">
          <div id="miniMap" ref="miniMapRef"></div>
          <button @click="closeMiniMap" class="btn-close-mini-map">{{ $t('close') }}</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapIcon } from 'lucide-vue-next';
import TimesheetRepository from '@/repositories/timesheet.repository.js';

export default {
  name: 'TimesheetView',
  components: {
    MapIcon,
  },
  data() {
    return {
      timesheetRepo: new TimesheetRepository(),
      isLoading: true,
      isPerformingAction: false,
      message: '',
      error: false,
      showMap: false,
      map: null,
      marker: null,
      watchId: null,
      latitude: null,
      longitude: null,
      isCheckedIn: false,
      todayEntries: [],
      showMiniMap: false,
      miniMap: null,
      miniMarker: null,
      selectedEntry: null,
      lastEntryTime: null,
      elapsedTime: 0,
      timerInterval: null,
    };
  },
  computed: {
    formattedLocation() {
      if (this.latitude && this.longitude) {
        return `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
      }
      return 'Location not available';
    },
    totalHoursWorked() {
      return this.todayEntries.reduce((total, entry, index) => {
        if (entry.type === 'check_out') {
          return total + this.getEntryDuration(index);
        }
        return total;
      }, 0);
    },
    formattedElapsedTime() {
      return this.formatDurationPrecise(this.elapsedTime);
    },
    timerProgressStyle() {
      const progress = (this.elapsedTime % 3600) / 3600;
      const dashArray = 2 * Math.PI * 45;
      const dashOffset = dashArray * (1 - progress);
      return {
        strokeDasharray: `${dashArray}`,
        strokeDashoffset: `${dashOffset}`,
      };
    },
  },
  methods: {
    initializeGeolocation() {
      return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.showMap = true;
                this.$nextTick(() => {
                  this.initMap();
                  this.watchPosition();
                });
                resolve();
              },
              (error) => {
                this.handleLocationError(error);
                reject(error);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else {
          const error = new Error('Geolocation not supported');
          this.handleLocationError(error);
          reject(error);
        }
      });
    },
    watchPosition() {
      this.watchId = navigator.geolocation.watchPosition(
          this.handlePositionUpdate,
          this.handleLocationError,
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    },
    handlePositionUpdate(position) {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.updateMarkerPosition();
    },
    handleLocationError(error) {
      console.error('Geolocation error:', error);
      this.message = `Location error: ${error.message}`;
    },
    initMap() {
      if (!this.$refs.mapRef) return;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map(this.$refs.mapRef, {
        zoomControl: false,
        attributionControl: false,
        dragging: !L.Browser.mobile,
        tap: !L.Browser.mobile
      }).setView([this.latitude, this.longitude], 17);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      this.map.setMinZoom(3);
      this.map.setMaxZoom(18);

      this.marker = L.circleMarker([this.latitude, this.longitude], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
        radius: 8
      }).addTo(this.map);
    },
    updateMarkerPosition() {
      if (this.marker && this.map) {
        const newLatLng = L.latLng(this.latitude, this.longitude);
        this.marker.setLatLng(newLatLng);
        this.map.setView(newLatLng, 17, { animate: true });
      }
    },
    async performCheckInOut() {
      this.isPerformingAction = true;
      this.message = '';
      this.error = false;

      try {
        if (this.isCheckedIn) {
          await this.timesheetRepo.checkOut(this.latitude, this.longitude);
          this.message = 'Check-out successful';
          this.isCheckedIn = false;
          this.stopTimer();
          this.elapsedTime = 0;
        } else {
          const response = await this.timesheetRepo.checkIn(this.latitude, this.longitude);
          this.message = 'Check-in successful';
          this.isCheckedIn = true;
          this.lastEntryTime = new Date(response.time);
          this.startTimer();
        }
        await this.fetchTodayEntries();
      } catch (err) {
        this.error = true;
        this.message = `Error: ${err.message}`;
      } finally {
        this.isPerformingAction = false;
      }
    },
    async fetchLastStatus() {
      try {
        const response = await this.timesheetRepo.getLastStatus();
        this.isCheckedIn = response.isCheckedIn;
        if (this.isCheckedIn && response.lastEntry) {
          this.lastEntryTime = new Date(response.lastEntry.time);
          this.startTimer();
        }
      } catch (error) {
        console.error('Error fetching last status:', error);
      }
    },
    async fetchTodayEntries() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await this.timesheetRepo.getEntries(today);
        this.todayEntries = response.entries;
        this.updateCheckedInStatus();
      } catch (error) {
        console.error('Error fetching today\'s entries:', error);
      }
    },
    updateCheckedInStatus() {
      if (this.todayEntries.length > 0) {
        const lastEntry = this.todayEntries[this.todayEntries.length - 1];
        this.isCheckedIn = lastEntry.type === 'check_in';
        if (this.isCheckedIn) {
          this.lastEntryTime = new Date(lastEntry.time);
          this.startTimer();
        } else {
          this.stopTimer();
          this.elapsedTime = 0;
        }
      } else {
        this.isCheckedIn = false;
        this.stopTimer();
        this.elapsedTime = 0;
      }
    },
    formatTime(time) {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    getEntryDuration(index) {
      if (this.todayEntries[index].type === 'check_out' && index > 0) {
        const checkOutTime = new Date(this.todayEntries[index].time);
        const checkInTime = new Date(this.todayEntries[index - 1].time);
        return (checkOutTime - checkInTime) / 1000; // Duration in seconds
      }
      return 0;
    },
    formatDurationPrecise(seconds) {
      if (seconds === 0) return '00:00:00';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },
    openMiniMap(entry) {
      this.selectedEntry = entry;
      this.showMiniMap = true;
      this.$nextTick(() => {
        this.initMiniMap();
      });
    },
    initMiniMap() {
      if (!this.$refs.miniMapRef) return;

      if (this.miniMap) {
        this.miniMap.remove();
      }

      this.miniMap = L.map(this.$refs.miniMapRef, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        tap: false
      }).setView([this.selectedEntry.latitude, this.selectedEntry.longitude], 17);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.miniMap);

      this.miniMap.setMinZoom(3);
      this.miniMap.setMaxZoom(18);

      this.miniMarker = L.circleMarker([this.selectedEntry.latitude, this.selectedEntry.longitude], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
        radius: 8
      }).addTo(this.miniMap);
    },
    closeMiniMap() {
      this.showMiniMap = false;
      if (this.miniMap) {
        this.miniMap.remove();
        this.miniMap = null;
      }
    },
    startTimer() {
      this.stopTimer();
      this.updateElapsedTime();
      this.timerInterval = setInterval(this.updateElapsedTime, 1000);
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    updateElapsedTime() {
      if (this.lastEntryTime) {
        this.elapsedTime = Math.floor((new Date() - this.lastEntryTime) / 1000);
      }
    },
  },
  async mounted() {
    try {
      await Promise.all([
        this.initializeGeolocation(),
        this.fetchTodayEntries()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      this.error = true;
      this.message = 'Error loading data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  },
  beforeUnmount() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
    if (this.miniMap) {
      this.miniMap.remove();
    }
    this.stopTimer();
  },
};
</script>

<style scoped>
.timesheet-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.timesheet-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.map-container {
  position: relative;
  height: 500px;
  margin-bottom: 2rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  background-color: #f8fafc;
}

#map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.map-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  z-index: 2;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.location-coordinates {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
  font-family: 'SF Mono', 'Courier New', Courier, monospace;
}

.timer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.timer-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.timer-svg {
  transform: rotate(-90deg);
}

.timer-background {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 6;
}

.timer-progress {
  fill: none;
  stroke: #a5b4fc;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
}

.btn-check-in {
  background-color: #a5b4fc;
  color: #1e293b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-check-in:hover:not(:disabled) {
  background-color: #818cf8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(165, 180, 252, 0.4);
}

.btn-check-in:active:not(:disabled) {
  transform: translateY(0);
}

.btn-check-in:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.status-message {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

.text-success {
  background-color: #d1fae5;
  color: #065f46;
}

.text-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.today-entries {
  margin-top: 2rem;
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.entries-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.entries-list {
  list-style-type: none;
  padding: 0;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: white;
}

.entry-details {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.entry-type {
  font-weight: 600;
  min-width: 120px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.check-in {
  color: #065f46;
  background-color: #d1fae5;
}

.check-out {
  color: #991b1b;
  background-color: #fee2e2;
}

.btn-mini-map {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-mini-map:hover {
  background-color: #e2e8f0;
  color: #3b82f6;
}

.entry-duration {
  font-weight: 600;
  color: #6b7280;
}

.no-entries {
  text-align: center;
  color: #64748b;
  font-style: italic;
}

.total-hours {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-hours h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.total-duration {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4b5563;
}

.mini-map-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.mini-map-container {
  background-color: white;
  border-radius: 16px;
  padding: 1rem;
  width: 90%;
  max-width: 500px;
  height: 400px;
  position: relative;
}

#miniMap {
  width: 100%;
  height: 100%;
}

.btn-close-mini-map {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: 1px solid #e2e8f0;
  color: #4b5563;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-close-mini-map:hover {
  background-color: #f1f5f9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .timesheet-view {
    padding: 1rem;
  }

  .map-container {
    height: 400px;
    border-radius: 12px;
  }

  .map-overlay {
    flex-direction: column;
    gap: 1rem;
    bottom: 16px;
    left: 16px;
    right: 16px;
    padding: 1rem;
  }

  .location-info {
    width: 100%;
    text-align: center;
  }

  .btn-check-in {
    width: 100%;
    justify-content: center;
  }

  .entry-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .entry-details {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-hours {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .total-duration {
    font-size: 1.25rem;
  }

  .mini-map-container {
    width: 95%;
    height: 350px;
  }
}

.loading-overlay-local {
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #a5b4fc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #a5b4fc;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:deep(.leaflet-control-container) {
  display: none;
}
</style>

