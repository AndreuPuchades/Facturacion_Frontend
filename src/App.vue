<script>
import MenuItem from "@/components/MenuItem.vue";
import FooterView from "@/components/FooterView.vue";
import {mapState} from "pinia";
import {useAuthStore} from "@/stores/auth.js";
import {useCounterStore} from "@/stores/index.js";

export default {
  components: {FooterView, MenuItem},
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated']),
  }
}
</script>

<template>
  <div v-if="isAuthenticated" class="app-container">
    <MenuItem />
    <main class="main-content">
      <RouterView />
    </main>
    <main class="footer">
      <FooterView />
    </main>
  </div>

  <div v-else class="app-container">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}
.footer {
  flex-grow: 1;
  padding: 2rem;
  margin-left: 110px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  .footer {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>

