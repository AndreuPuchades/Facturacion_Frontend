<template>
  <div class="language-switcher">
    <button @click="toggleLanguageDropdown" class="language-button">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span>{{ currentLanguage }}</span>
      <svg class="dropdown-icon" :class="{ 'open': isLanguageDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    <ul v-show="isLanguageDropdownOpen" class="language-dropdown">
      <li v-for="lang in availableLanguages" :key="lang.code" @click="changeLanguage(lang.code)">
        {{ lang.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLanguageDropdownOpen: false,
      availableLanguages: [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
      ],
    };
  },
  computed: {
    currentLanguage() {
      const lang = this.availableLanguages.find(lang => lang.code === this.$i18n.locale);
      return lang ? lang.name : '';
    },
  },
  methods: {
    toggleLanguageDropdown() {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    },
    changeLanguage(langCode) {
      this.$i18n.locale = langCode;
      this.isLanguageDropdownOpen = false;
    },
  },
};
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.language-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: #64748b;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.language-button:hover {
  color: #3b82f6;
  background-color: #f8fafc;
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.5;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  z-index: 10;
}

.language-dropdown li {
  padding: 0.5rem 1.25rem;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.language-dropdown li:hover {
  background-color: #eff6ff;
  color: #3b82f6;
}
</style>