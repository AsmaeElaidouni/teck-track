<script setup>
import { useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import BrandLogo from './BrandLogo.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { useTranslationStore } from '../store/translation';

const router = useRouter();
const transStore = useTranslationStore();
</script>

<template>
  <nav class="px-8 lg:px-16 py-4 flex items-center justify-between bg-[#0a0c10]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
    <!-- Logo -->
    <BrandLogo :size="40" @click="router.push('/')" class="shrink-0 cursor-pointer" />
    
    <!-- Navigation Links -->
    <div class="hidden lg:flex gap-16 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
      <router-link to="/" class="hover:text-white transition-all" active-class="text-white">{{ transStore.t('nav.home') }}</router-link>
      <router-link to="/fonctionnalites" class="hover:text-white transition-all" active-class="text-white">{{ transStore.t('nav.features') }}</router-link>
      <router-link to="/about" class="hover:text-white transition-all" active-class="text-white">{{ transStore.t('nav.about') }}</router-link>
      <router-link to="/contact" class="hover:text-white transition-all" active-class="text-white">{{ transStore.t('nav.contact') }}</router-link>
    </div>

    <!-- Premium CTA Button + Language Selector -->
    <div class="flex items-center gap-6">
      <LanguageSwitcher />

      <!-- Se Connecter -->
      <button @click="router.push('/login')" 
              class="group relative flex items-center gap-3 bg-gradient-to-br from-flare-red to-[#b93424] text-white px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-xl shadow-lg shadow-flare-red/20 hover:shadow-flare-red/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden">
        <!-- Gloss effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        
        <LogIn :size="14" class="transition-transform group-hover:translate-x-0.5" />
        <span>{{ transStore.t('nav.login') }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  color: white !important;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Dropdown transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>

