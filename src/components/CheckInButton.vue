<template>
  <div>
    <button @click="startTracking" :disabled="isLoading || isTracking" class="btn btn-primary mb-3" v-if="!showMap">
      {{ $t('startTracking') }}
    </button>
    <div v-if="showMap" class="mb-3">
      <div id="map" style="height: 300px;"></div>
      <button @click="stopTrackingAndCheckIn" :disabled="isLoading" class="btn btn-success mt-3">
        {{ isLoading ? $t('loading') : $t('stopAndCheckIn') }}
      </button>
      <button @click="cancelTracking" class="btn btn-secondary mt-3 ml-2">
        {{ $t('cancel') }}
      </button>
    </div>
    <p v-if="message" :class="{ 'text-success': !error, 'text-danger': error }">
      {{ message }}
    </p>
  </div>
</template>

<script>
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'CheckInButton',
  data() {
    return {
      isLoading: false,
      isTracking: false,
      message: '',
      error: false,
      showMap: false,
      map: null,
      marker: null,
      watchId: null,
      latitude: null,
      longitude: null,
    };
  },
  methods: {
    startTracking() {
      this.isLoading = true;
      this.isTracking = true;
      this.message = '';
      this.error = false;

      if ('geolocation' in navigator) {
        this.watchId = navigator.geolocation.watchPosition(
            this.handlePositionUpdate,
            this.handleLocationError,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        this.handleLocationError({ message: this.$t('geolocationNotSupported') });
      }
    },
    handlePositionUpdate(position) {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      if (!this.showMap) {
        this.showMap = true;
        this.isLoading = false;
        this.$nextTick(() => {
          this.initMap();
        });
      } else {
        this.updateMarkerPosition();
      }
    },
    handleLocationError(error) {
      this.isLoading = false;
      this.isTracking = false;
      this.error = true;
      this.message = this.$t('locationError', { error: error.message });
    },
    initMap() {
      this.map = L.map('map').setView([this.latitude, this.longitude], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
      this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map);
    },
    updateMarkerPosition() {
      if (this.marker && this.map) {
        const newLatLng = L.latLng(this.latitude, this.longitude);
        this.marker.setLatLng(newLatLng);
        this.map.setView(newLatLng);
      }
    },
    async stopTrackingAndCheckIn() {
      this.isLoading = true;
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.isTracking = false;

      try {
        const response = await axios.post('/api/timesheet/check-in', {
          latitude: this.latitude,
          longitude: this.longitude,
        });
        this.message = this.$t('checkInSuccess');
        this.$emit('check-in-success', response.data);
        this.showMap = false;
      } catch (error) {
        this.error = true;
        this.message = this.$t('checkInError', { error: error.response?.data?.message || error.message });
      } finally {
        this.isLoading = false;
      }
    },
    cancelTracking() {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.isTracking = false;
      this.showMap = false;
      this.message = '';
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    },
  },
  beforeUnmount() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
</style>