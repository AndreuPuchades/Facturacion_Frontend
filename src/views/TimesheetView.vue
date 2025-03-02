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
        <button
            @click="performCheckInOut"
            :disabled="isLoading"
            class="btn-check-in"
        >
          <span class="btn-text">{{ isLoading ? $t('loading') : (isCheckedIn ? $t('checkOut') : $t('checkIn')) }}</span>
        </button>
      </div>
    </div>
    <p v-if="message" :class="['status-message', { 'text-success': !error, 'text-danger': error }]">
      {{ message }}
    </p>

    <!-- Lista de registros del día -->
    <div class="today-entries">
      <h2 class="entries-title">{{ $t('todayEntries') }}</h2>
      <ul class="entries-list" v-if="todayEntries.length > 0">
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
          <span v-if="entry.type === 'check_out'" class="entry-duration">{{ formatDurationPrecise(getEntryDuration(index)) }}</span>
        </li>
      </ul>
      <p v-else class="no-entries">{{ $t('noEntriesForToday') }}</p>

      <!-- Total de horas trabajadas -->
      <div v-if="todayEntries.length > 0" class="total-hours">
        <h3>{{ $t('totalHoursWorked') }}</h3>
        <span class="total-duration">{{ formatDurationPrecise(totalHoursWorked) }}</span>
      </div>
    </div>

    <!-- Modal para el mini mapa -->
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
      isLoading: false,
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
  },
  methods: {
    initializeGeolocation() {
      if ('geolocation' in navigator) {
        this.watchId = navigator.geolocation.watchPosition(
            this.handlePositionUpdate,
            this.handleLocationError,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        this.handleLocationError({ message: 'Geolocation not supported' });
      }
    },
    handlePositionUpdate(position) {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      if (!this.showMap) {
        this.showMap = true;
        this.$nextTick(() => {
          this.initMap();
        });
      } else {
        this.updateMarkerPosition();
      }
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
        attributionControl: false
      }).setView([this.latitude, this.longitude], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(this.map);

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
        this.map.setView(newLatLng, 15, { animate: true });
      }
    },
    async performCheckInOut() {
      this.isLoading = true;
      this.message = '';
      this.error = false;

      try {
        if (this.isCheckedIn) {
          await this.timesheetRepo.checkOut(this.latitude, this.longitude);
          this.message = 'Check-out successful';
          this.isCheckedIn = false;
        } else {
          await this.timesheetRepo.checkIn(this.latitude, this.longitude);
          this.message = 'Check-in successful';
          this.isCheckedIn = true;
        }
        await this.fetchTodayEntries();
      } catch (err) {
        this.error = true;
        this.message = `Error: ${err.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchLastStatus() {
      try {
        const response = await this.timesheetRepo.getLastStatus();
        this.isCheckedIn = response.isCheckedIn;
      } catch (error) {
        console.error('Error fetching last status:', error);
      }
    },
    async fetchTodayEntries() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await this.timesheetRepo.getEntries(today);
        this.todayEntries = response.entries;
      } catch (error) {
        console.error('Error fetching today\'s entries:', error);
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
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h}h ${m}m ${s}s`;
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
        attributionControl: false
      }).setView([this.selectedEntry.latitude, this.selectedEntry.longitude], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(this.miniMap);

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
  },
  mounted() {
    this.initializeGeolocation();
    this.fetchLastStatus();
    this.fetchTodayEntries();
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

.btn-check-in {
  background-color: #3b82f6;
  color: white;
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
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-check-in:active:not(:disabled) {
  transform: translateY(0);
}

.btn-check-in:disabled {
  background-color: #94a3b8;
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
  background-color: #dcfce7;
  color: #166534;
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
  color: #166534;
  background-color: #dcfce7;
}

.check-out {
  color: #991b1b;
  background-color: #fee2e2;
}

/* .entry-type {
  font-weight: 600;
  color: #3b82f6;
  min-width: 120px;
} */

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
</style>
