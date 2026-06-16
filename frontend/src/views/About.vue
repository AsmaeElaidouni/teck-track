<script setup>
import { computed } from 'vue';
import { Code2, Database, Key, Rocket, CheckCircle2, Shield } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import { useTranslationStore } from '../store/translation';

const transStore = useTranslationStore();

const technologies = computed(() => [
  { name: 'Vue.js 3', desc: 'Vue.js 3', icon: Code2, color: 'text-green-400' },
  { name: 'Node.js', desc: 'Node.js', icon: Shield, color: 'text-lime-400' },
  { name: 'MySQL', desc: 'MySQL', icon: Database, color: 'text-blue-400' },
  { name: 'JWT', desc: 'JWT', icon: Key, color: 'text-yellow-400' }
]);

const benefits = computed(() => [
  { title: transStore.t('about.benefit1'), desc: transStore.t('about.missionText') },
  { title: transStore.t('about.benefit2'), desc: transStore.t('about.missionText') },
  { title: transStore.t('about.benefit3'), desc: transStore.t('about.missionText') },
]);

const visionItems = computed(() => [
  { title: transStore.t('about.aiTitle'), desc: transStore.t('about.missionText') },
  { title: transStore.t('about.mobileTitle'), desc: transStore.t('about.missionText') },
  { title: transStore.t('about.reportsTitle'), desc: transStore.t('about.missionText') },
]);
</script>

<template>
  <div class="min-h-screen bg-[#0a0c10] text-white font-sans">
    <PublicNavbar />

    <header class="px-8 lg:px-20 pt-20 pb-16 border-b border-white/5 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(223,75,55,0.06),transparent_50%)]"></div>
      <div class="relative z-10">
        <p class="text-flare-red text-xs font-black uppercase tracking-[0.5em] mb-4">{{ transStore.t('about.tag') }}</p>
        <h1 class="text-5xl lg:text-7xl font-black uppercase tracking-tight mb-6" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('about.title') }}</h1>
        <p class="text-white/50 text-lg max-w-2xl">{{ transStore.t('about.subtitle') }}</p>
      </div>
    </header>

    <section class="px-8 lg:px-20 py-24 border-b border-white/5">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <p class="text-flare-red text-xs font-black uppercase tracking-widest mb-4">{{ transStore.t('about.missionTitle') }}</p>
          <h2 class="text-4xl font-black uppercase tracking-tight mb-8" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('about.missionTitle') }}</h2>
          <p class="text-white/60 text-lg leading-relaxed mb-6">{{ transStore.t('about.missionText') }}</p>
          <p class="text-white/60 text-lg leading-relaxed">{{ transStore.t('about.subtitle') }}</p>
        </div>
        <div class="space-y-6">
          <div v-for="pb in benefits" :key="pb.title" class="bg-white/3 border border-white/5 rounded-2xl p-8 hover:border-flare-red/20 transition-all">
            <CheckCircle2 class="text-flare-red mb-3" :size="20"/>
            <h3 class="font-black text-base uppercase tracking-tight mb-2">{{ pb.title }}</h3>
            <p class="text-white/40 text-sm leading-relaxed">{{ pb.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="px-8 lg:px-20 py-24 border-b border-white/5 bg-white/[0.01]">
      <div class="mb-16">
        <p class="text-flare-red text-xs font-black uppercase tracking-widest mb-4">{{ transStore.t('about.tag') }}</p>
        <h2 class="text-4xl font-black uppercase tracking-tight" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('about.title') }}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="tech in technologies" :key="tech.name" class="bg-white/3 border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all group">
          <component :is="tech.icon" class="mb-6 group-hover:scale-110 transition-transform" :class="tech.color" :size="36"/>
          <h3 class="font-black text-lg uppercase tracking-tight mb-3">{{ tech.name }}</h3>
          <p class="text-white/40 text-sm leading-relaxed">{{ tech.desc }}</p>
        </div>
      </div>
    </section>

    <section class="px-8 lg:px-20 py-24">
      <div class="max-w-3xl mx-auto text-center">
        <Rocket class="text-flare-red mx-auto mb-10 animate-bounce" :size="56"/>
        <p class="text-flare-red text-xs font-black uppercase tracking-widest mb-6">{{ transStore.t('about.visionTag') }}</p>
        <h2 class="text-4xl font-black uppercase tracking-tight mb-8" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('about.visionTag') }}</h2>
        <p class="text-white/50 text-xl leading-relaxed mb-12">{{ transStore.t('about.missionText') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div v-for="v in visionItems" :key="v.title" class="bg-white/3 border border-white/5 rounded-xl p-6">
            <h4 class="font-black text-sm uppercase tracking-tight mb-2 text-flare-red">{{ v.title }}</h4>
            <p class="text-white/40 text-xs leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
