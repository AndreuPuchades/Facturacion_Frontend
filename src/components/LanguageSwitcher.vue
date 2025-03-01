<template>
  <button @click="toggleLanguage" class="language-button" :class="{ 'rotate': isRotating }">
    <img :src="currentFlag" :alt="currentLanguage" class="flag-icon" />
    <span class="sr-only">{{ currentLanguage }}</span>
  </button>
</template>

<script>
import FlagES from '@/assets/Flag_ES.webp'
import FlagEN from '@/assets/Flag_EN.webp'

export default {
  data() {
    return {
      languages: [
        { code: 'es', name: 'Español', flag: FlagES },
        { code: 'en', name: 'English', flag: FlagEN },
      ],
      isRotating: false,
    };
  },
  computed: {
    currentLanguage() {
      return this.languages.find(lang => lang.code === this.$i18n.locale).name;
    },
    currentFlag() {
      return this.languages.find(lang => lang.code === this.$i18n.locale).flag;
    },
  },
  methods: {
    toggleLanguage() {
      this.isRotating = true;
      setTimeout(() => {
        const currentIndex = this.languages.findIndex(lang => lang.code === this.$i18n.locale);
        const nextIndex = (currentIndex + 1) % this.languages.length;
        this.$i18n.locale = this.languages[nextIndex].code;
        this.isRotating = false;
      }, 150);
    },
  },
};
</script>

<style scoped>
.language-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  height: 24px;
  transition: transform 0.3s ease;
  margin-bottom: 8px;
}

.language-button:hover {
  opacity: 0.8;
}

.language-button.rotate {
  transform: rotate(360deg);
}

.flag-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
