<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Wrench, Package, BarChart3, CheckCircle2, ArrowRight } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import { useTranslationStore } from '../store/translation';

const router = useRouter();
const transStore = useTranslationStore();

const modules = computed(() => [
  {
    icon: Wrench,
    colorClass: 'text-flare-red',
    bgClass: 'bg-flare-red/10 border-flare-red/20 text-flare-red',
    hoverClass: 'hover:border-flare-red/30',
    checkClass: 'text-flare-red',
    tag: 'Module 01',
    title: transStore.t('features.maintenance'),
    desc: transStore.t('home.f1Desc'),
  },
  {
    icon: Package,
    colorClass: 'text-flare-coral',
    bgClass: 'bg-flare-coral/10 border-flare-coral/20 text-flare-coral',
    hoverClass: 'hover:border-flare-coral/30',
    checkClass: 'text-flare-coral',
    tag: 'Module 02',
    title: transStore.t('features.stock'),
    desc: transStore.t('home.f2Desc'),
  },
  {
    icon: BarChart3,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    hoverClass: 'hover:border-blue-500/30',
    checkClass: 'text-blue-400',
    tag: 'Module 03',
    title: transStore.t('features.analytics'),
    desc: transStore.t('home.f3Desc'),
  },
]);
</script>

<template>
  <div class="min-h-screen bg-[#0a0c10] text-white font-sans">
    <PublicNavbar />

    <header class="px-8 lg:px-20 pt-20 pb-16 border-b border-white/5 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(223,75,55,0.06),transparent_50%)]"></div>
      <div class="relative z-10">
        <p class="text-flare-red text-xs font-black uppercase tracking-[0.5em] mb-4">{{ transStore.t('features.tag') }}</p>
        <h1 class="text-5xl lg:text-7xl font-black uppercase tracking-tight mb-6" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('features.title') }}</h1>
        <p class="text-white/50 text-lg max-w-2xl">{{ transStore.t('features.subtitle') }}</p>
      </div>
    </header>

    <section
      v-for="(mod, idx) in modules"
      :key="mod.title"
      class="px-8 lg:px-20 py-24 border-b border-white/5"
      :class="{ 'bg-white/[0.01]': idx === 1 }"
    >
      <div class="flex flex-col lg:flex-row gap-20 items-start">
        <div class="lg:w-1/3 shrink-0">
          <div :class="['w-16 h-16 rounded-2xl border flex items-center justify-center mb-8', mod.bgClass]">
            <component :is="mod.icon" :size="32" :class="mod.colorClass"/>
          </div>
          <p :class="['text-xs font-black uppercase tracking-widest mb-3', mod.colorClass]">{{ mod.tag }}</p>
          <h2 class="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6" style="font-family:'Orbitron',sans-serif;">{{ mod.title }}</h2>
          <p class="text-white/50 leading-relaxed">{{ mod.desc }}</p>
        </div>
        <div class="flex-1">
          <div :class="['bg-white/3 border border-white/5 rounded-2xl p-8 transition-all', mod.hoverClass]">
            <CheckCircle2 :class="['mb-4', mod.checkClass]" :size="20"/>
            <p class="text-white/40 text-sm leading-relaxed">{{ mod.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="px-8 lg:px-20 py-20 text-center">
      <h2 class="text-3xl font-black uppercase tracking-tight mb-6" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('features.ctaTitle') }}</h2>
      <button @click="router.push('/login')" class="bg-flare-red hover:bg-white hover:text-[#14171B] text-white flex items-center gap-3 px-12 py-5 text-sm font-black uppercase tracking-[0.3em] transition-all rounded-sm mx-auto">
        {{ transStore.t('features.ctaBtn') }} <ArrowRight :size="18"/>
      </button>
    </section>
  </div>
</template>
