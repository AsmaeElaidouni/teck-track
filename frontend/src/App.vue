<script setup>
import { RouterView } from 'vue-router';
import { useTranslationStore } from './store/translation';

const transStore = useTranslationStore();
</script>

<template>
  <div class="min-h-screen bg-[#14171B] text-white selection:bg-flare-red selection:text-white">
    <RouterView :key="transStore.currentLang" />
  </div>
</template>

<style>
/* Global styles can go here if needed */
</style>
