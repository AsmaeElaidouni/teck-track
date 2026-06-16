<script setup>
import { useRouter } from 'vue-router';
import { LogOut, User, Bell, Search } from 'lucide-vue-next';
import BrandLogo from './BrandLogo.vue';

const router = useRouter();
const userName = 'Admin User';
const userRole = 'Administrateur';

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<template>
  <nav class="h-20 bg-[#1a1d23] border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
    <!-- Logo Area -->
    <div class="flex items-center gap-10">
      <BrandLogo :size="34" theme="dark" />

      <!-- Search -->
      <div class="relative hidden sm:block">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-flare-gray/50" :size="16" />
        <input type="text" placeholder="Recherche..." class="bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-flare-gray/40 focus:border-flare-red/40 focus:outline-none transition-colors w-56">
      </div>
    </div>

    <!-- Right Side -->
    <div class="flex items-center gap-4">
      <!-- Notifications -->
      <button class="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-flare-gray hover:text-white transition-all border border-white/5">
        <Bell :size="18" />
        <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-flare-red rounded-full"></span>
      </button>

      <!-- User Info -->
      <div class="flex items-center gap-4 border-l border-white/5 pl-6">
        <div class="hidden md:block text-right">
          <p class="text-sm font-bold text-white">{{ userName }}</p>
          <p class="text-[10px] uppercase text-flare-gray font-bold tracking-widest">{{ userRole }}</p>
        </div>
        <div class="w-10 h-10 bg-gradient-to-br from-flare-red to-flare-coral rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-flare-red/10">
          A
        </div>
        <button @click="handleLogout" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-flare-coral/10 flex items-center justify-center text-flare-gray hover:text-flare-coral transition-all border border-white/5" title="Déconnexion">
          <LogOut :size="18" />
        </button>
      </div>
    </div>
  </nav>
</template>
