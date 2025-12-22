<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
</script>

<template>
  <div class="app-wrapper">
    <Navbar/>

    <main class="main-content">
      <RouterView/>
    </main>

    <footer class="footer">
      <div class="container footer-content">
        <div class="copyright">
          © ООО «ПАВЛОВ НЕТВОРКС», 2004—2025
        </div>
        <div class="socials">
          <a href="#" class="social-icon vk">
            <!-- VK Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M13.162 18.994c.609 0 1.771-.068 1.866-1.335.043-.574.238-1.173.882-1.748.966-.862 2.508-2.607 1.838-4.21-.303-.726-2.196-.653-2.924-.627-.197.007-.272.016-.272.016s-.103-.016-.145-.16c-.342-1.183-1.07-2.525-2.022-3.618-.898-1.03-1.428-1.29-1.928-1.31-1.436-.057-2.336 1.134-2.336 1.134s1.773.13 2.062 1.352c.287 1.213-.623 2.766-1.554 3.76-.77.822-2.14 1.378-2.14 1.378s-.24-.225-.386-1.503c-.157-1.375.385-3.327 1.854-4.822.69-.702 1.458-.87 1.458-.87s-4.048-.28-6.19 2.583c-2.35 3.14-1.22 8.356 3.65 10.01 4.87 1.654 6.287.054 6.287.054z"/>
            </svg>
          </a>
          <a href="#" class="social-icon telegram">
            <!-- TG Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
            </svg>
          </a>
          <a href="#" class="social-icon whatsapp">
            <!-- WA Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a8.203 8.203 0 0 1-4.139-1.125l-.297-.176-3.076.806.821-2.998-.193-.307a8.188 8.188 0 0 1-.875-4.022c.001-4.526 3.684-8.208 8.212-8.208a8.17 8.17 0 0 1 5.814 2.409 8.173 8.173 0 0 1 2.404 5.819c-.004 4.524-3.687 8.202-8.216 8.202"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f2f2f2;
}

.main-content {
  flex: 1;
  padding-bottom: 60px; /* Отступ от футера */
}

.footer {
  padding: 30px 0;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 16px;
  color: #000;
}

.socials {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.social-icon:hover {
  opacity: 0.8;
}

.vk {
  background-color: #0077FF;
}

.telegram {
  background-color: #2CA5E0;
}

.whatsapp {
  background-color: #25D366;
}
</style>
