<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Wrench, Package, BarChart3, ArrowRight, ChevronRight, Activity } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import BrandLogo from '../components/BrandLogo.vue';
import { useTranslationStore } from '../store/translation';

const router = useRouter();
const transStore = useTranslationStore();

const features = computed(() => [
  { icon: Wrench, title: transStore.t('home.f1Title'), desc: transStore.t('home.f1Desc'), color: 'text-flare-red' },
  { icon: Package, title: transStore.t('home.f2Title'), desc: transStore.t('home.f2Desc'), color: 'text-flare-coral' },
  { icon: BarChart3, title: transStore.t('home.f3Title'), desc: transStore.t('home.f3Desc'), color: 'text-blue-400' },
]);
</script>

<template>
  <div class="min-h-screen bg-[#0a0c10] text-white font-sans selection:bg-flare-red/30">
    <PublicNavbar />

    <section class="relative px-8 lg:px-20 py-32 lg:py-48 overflow-hidden min-h-[90vh] flex items-center">
      <div class="absolute top-[-10%] right-[-10%] w-[800px] height-[800px] bg-flare-red/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="container mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div class="hero-text">
          <div class="flex items-center gap-4 mb-8">
            <span class="h-[1px] w-12 bg-flare-red"></span>
            <p class="text-flare-red text-[10px] font-black uppercase tracking-[0.5em]">{{ transStore.t('home.tagline') }}</p>
          </div>
          <h1 class="text-7xl lg:text-[9rem] font-black leading-[0.85] tracking-tighter mb-10" style="font-family:'Orbitron',sans-serif;">
            {{ transStore.t('home.hello') }}<span class="text-flare-red">.</span>
          </h1>
          <p class="text-white/50 text-xl lg:text-2xl font-medium leading-relaxed max-w-xl mb-12">{{ transStore.t('home.subtitle') }}</p>
          <div class="flex flex-wrap gap-6">
            <button @click="router.push('/login')" class="bg-flare-red hover:bg-[#ff5d47] text-white flex items-center gap-4 px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all rounded-xl shadow-2xl shadow-flare-red/30">
              {{ transStore.t('home.start') }} <ArrowRight :size="18"/>
            </button>
            <button @click="router.push('/fonctionnalites')" class="glass-btn flex items-center gap-4 px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all rounded-xl">
              {{ transStore.t('home.learnMore') }} <ChevronRight :size="18"/>
            </button>
          </div>
          <div class="mt-20 flex gap-12 border-t border-white/5 pt-12">
            <div class="stat">
              <p class="text-2xl font-black text-white" style="font-family:'Orbitron',sans-serif;">100%</p>
              <p class="text-[9px] uppercase tracking-widest text-white/30 font-bold">{{ transStore.t('home.reliability') }}</p>
            </div>
            <div class="stat">
              <p class="text-2xl font-black text-white" style="font-family:'Orbitron',sans-serif;">24/7</p>
              <p class="text-[9px] uppercase tracking-widest text-white/30 font-bold">{{ transStore.t('home.monitoring') }}</p>
            </div>
            <div class="stat">
              <p class="text-2xl font-black text-white" style="font-family:'Orbitron',sans-serif;">AI</p>
              <p class="text-[9px] uppercase tracking-widest text-white/30 font-bold">{{ transStore.t('home.driven') }}</p>
            </div>
          </div>
        </div>
        <div class="relative group hidden lg:block">
          <div class="visual-wrapper relative p-8">
            <div class="absolute inset-0 bg-gradient-to-tr from-flare-red/20 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
            <div class="relative z-10 glass-card p-4 rounded-3xl border border-white/10 rotate-[-2deg] group-hover:rotate-0 transition-all duration-700 shadow-2xl overflow-hidden">
              <img src="/tecktrack_hero_visual_1777749942782.png" alt="TeckTrack Premium" class="rounded-2xl w-full h-auto" />
              <div class="absolute top-10 right-10 bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl animate-float">
                <div class="flex items-center gap-4 mb-2">
                  <div class="w-2 h-2 rounded-full bg-flare-red animate-pulse"></div>
                  <span class="text-[9px] font-black uppercase tracking-widest text-flare-red">{{ transStore.t('home.stockAlert') }}</span>
                </div>
                <p class="text-sm font-bold">{{ transStore.t('home.lowStock') }}</p>
              </div>
              <div class="absolute bottom-10 left-10 bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl animate-float-delayed">
                <div class="flex items-center gap-4 mb-2">
                  <Activity color="#10b981" :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest text-green-500">{{ transStore.t('home.optimization') }}</span>
                </div>
                <p class="text-sm font-bold">{{ transStore.t('home.efficiency') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-8 lg:px-20 py-32 bg-[#0d0f14] border-t border-white/5">
      <div class="mb-20">
        <p class="text-flare-red text-[10px] font-black uppercase tracking-[0.5em] mb-4">{{ transStore.t('home.platform') }}</p>
        <h2 class="text-5xl font-black uppercase tracking-tight" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('home.threeModules') }}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="f in features" :key="f.title" class="feature-card glass p-12 transition-all cursor-pointer group" @click="router.push('/fonctionnalites')">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 mb-10 group-hover:scale-110 transition-all border border-white/5" :class="f.color">
            <component :is="f.icon" :size="32"/>
          </div>
          <h3 class="text-2xl font-black uppercase tracking-tight mb-4" style="font-family:'Orbitron',sans-serif;">{{ f.title }}</h3>
          <p class="text-white/40 text-sm leading-relaxed mb-10">{{ f.desc }}</p>
          <button class="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group transition-all" :class="f.color">
            {{ transStore.t('home.learnMore') }} <ArrowRight :size="14" class="group-hover:translate-x-2 transition-transform"/>
          </button>
        </div>
      </div>
    </section>

    <section class="px-8 lg:px-20 py-32 bg-[#0a0c10]">
      <div class="bg-gradient-to-br from-flare-red to-[#b91c1c] rounded-[2.5rem] p-16 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 group">
        <div class="absolute right-0 bottom-0 opacity-10 select-none text-[20rem] font-black translate-x-20 translate-y-20" style="font-family:'Orbitron',sans-serif;">TT</div>
        <div class="relative z-10">
          <h2 class="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6" style="font-family:'Orbitron',sans-serif;">{{ transStore.t('home.ctaTitle') }}</h2>
          <p class="text-white/80 text-lg">{{ transStore.t('home.ctaSub') }}</p>
        </div>
        <button @click="router.push('/login')" class="relative z-10 bg-white text-flare-red hover:bg-[#14171B] hover:text-white flex items-center gap-4 px-12 py-5 text-xs font-black uppercase tracking-[0.4em] transition-all rounded-2xl shadow-2xl">
          {{ transStore.t('home.ctaBtn') }} <ArrowRight :size="20"/>
        </button>
      </div>
    </section>

    <footer class="px-8 lg:px-20 py-20 bg-[#0a0c10] border-t border-white/5">
      <div class="flex flex-col lg:flex-row justify-between gap-20">
        <div>
          <BrandLogo :size="48" class="mb-8" />
          <p class="text-white/30 text-sm max-w-xs leading-relaxed">{{ transStore.t('home.footerDesc') }}</p>
        </div>
        <div class="flex gap-24">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-flare-red mb-8">{{ transStore.t('home.navigation') }}</p>
            <ul class="space-y-4 text-sm text-white/40 font-bold uppercase tracking-widest">
              <li><router-link to="/" class="hover:text-white transition-colors">{{ transStore.t('nav.home') }}</router-link></li>
              <li><router-link to="/fonctionnalites" class="hover:text-white transition-colors">{{ transStore.t('nav.features') }}</router-link></li>
              <li><router-link to="/about" class="hover:text-white transition-colors">{{ transStore.t('nav.about') }}</router-link></li>
            </ul>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-flare-red mb-8">{{ transStore.t('nav.contact') }}</p>
            <ul class="space-y-4 text-sm text-white/40 font-bold uppercase tracking-widest">
              <li>contact@snaj.tech</li>
              <li>{{ transStore.t('home.location') }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mt-20 pt-10 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
        {{ transStore.t('home.footerRights') }}
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;800&display=swap');
.glass-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); }
.glass-btn:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.2); color: #fff; }
.glass-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); }
.glass { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 2rem; }
.feature-card:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(223, 75, 55, 0.2); transform: translateY(-8px); }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(15px); } }
.animate-float { animation: float 5s ease-in-out infinite; }
.animate-float-delayed { animation: float-delayed 6s ease-in-out infinite; }
h1, h2, h3, .brand { font-family: 'Orbitron', sans-serif; }
</style>
