<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">FacturaApp</h3>
        <p class="footer-description">Simplifica tu facturación y gestión empresarial</p>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">Enlaces rápidos</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/dashboard')">Dashboard</a></li>
          <li><a href="#" @click.prevent="navigateTo('/clientes')">Clientes</a></li>
          <li><a href="#" @click.prevent="navigateTo('/facturas')">Facturas</a></li>
          <li><a href="#" @click.prevent="navigateTo('/productos')">Productos</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">Soporte</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/ayuda')">Centro de ayuda</a></li>
          <li><a href="#" @click.prevent="navigateTo('/contacto')">Contacto</a></li>
          <li><a href="#" @click.prevent="navigateTo('/faq')">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">Legal</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/terminos')">Términos de servicio</a></li>
          <li><a href="#" @click.prevent="navigateTo('/privacidad')">Política de privacidad</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} FacturaApp. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const currentYear = computed(() => new Date().getFullYear());

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.footer {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  margin-bottom: 1.5rem;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.footer-description {
  font-size: 0.875rem;
  color: #64748b;
}

.footer-subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #3b82f6;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.footer-bottom p {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }

  .footer-section {
    margin-bottom: 2rem;
  }
}
</style>

