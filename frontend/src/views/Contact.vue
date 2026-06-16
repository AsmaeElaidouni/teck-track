<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Send, Mail, MapPin, ShieldCheck, MessageSquare, User, Clock, ArrowRightLeft } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import { useTranslationStore } from '../store/translation';

const router = useRouter();
const transStore = useTranslationStore();

const form = ref({ nom: '', email: '', message: '' });
const sent = ref(false);
const isSubmitting = ref(false);

const handleSubmit = () => {
  if (form.value.nom && form.value.email && form.value.message) {
    isSubmitting.value = true;
    setTimeout(() => {
      sent.value = true;
      isSubmitting.value = false;
      form.value = { nom: '', email: '', message: '' };
    }, 1200);
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#06080c] text-white font-sans overflow-x-hidden relative">
    <!-- Ambient light orbs for premium sci-fi tech look -->
    <div class="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-flare-red/5 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none"></div>

    <PublicNavbar />

    <!-- Header Section with stunning typography and layout -->
    <header class="px-8 lg:px-24 pt-24 pb-16 border-b border-white/5 relative z-10">
      <div class="max-w-7xl mx-auto flex flex-col gap-4" :class="{ 'items-start text-left': transStore.currentLang !== 'ar', 'items-start text-right w-full': transStore.currentLang === 'ar' }">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flare-red/10 border border-flare-red/20 text-flare-red text-xs font-black uppercase tracking-[0.2em]">
          <span class="w-1.5 h-1.5 rounded-full bg-flare-red animate-ping"></span>
          {{ transStore.t('contact.reachUs') }}
        </div>
        <h1 class="text-5xl lg:text-8xl font-black uppercase tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 font-orbitron">
          {{ transStore.t('contact.title') }}
        </h1>
        <p class="text-white/50 text-base lg:text-lg max-w-2xl leading-relaxed">
          {{ transStore.t('contact.subtitle') }}
        </p>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="max-w-7xl mx-auto px-8 lg:px-24 py-20 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        <!-- Form Section (Glassmorphic Card) -->
        <div class="lg:col-span-7 card-premium-glow relative overflow-hidden">
          <!-- Internal glass reflection -->
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/2 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="mb-10 relative z-10" :class="{ 'text-right': transStore.currentLang === 'ar' }">
            <h2 class="text-2xl font-black uppercase tracking-wide mb-2 font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
              {{ transStore.t('contact.heading') }}
            </h2>
            <p class="text-white/40 text-sm">
              {{ transStore.t('contact.subheading') }}
            </p>
          </div>

          <!-- Success State -->
          <transition name="fade" mode="out-in">
            <div v-if="sent" class="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-10 text-center relative z-10 my-6">
              <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <ShieldCheck :size="32" class="animate-bounce" />
              </div>
              <h3 class="font-black text-xl uppercase tracking-wider mb-3 text-white font-orbitron">
                {{ transStore.t('contact.successTitle') }}
              </h3>
              <p class="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                {{ transStore.t('contact.successText') }}
              </p>
              <button @click="sent = false" class="mt-8 px-6 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
                {{ transStore.t('common.sendAnother') }}
              </button>
            </div>

            <!-- Form State -->
            <form v-else @submit.prevent="handleSubmit" class="space-y-8 relative z-10">
              <div class="form-group-premium">
                <label>{{ transStore.t('contact.fullName') }}</label>
                <div class="input-wrapper-premium">
                  <User :size="18" class="input-icon" />
                  <input v-model="form.nom" type="text" :placeholder="transStore.t('contact.placeholderName')" required />
                </div>
              </div>
              
              <div class="form-group-premium">
                <label>{{ transStore.t('contact.email') }}</label>
                <div class="input-wrapper-premium">
                  <Mail :size="18" class="input-icon" />
                  <input v-model="form.email" type="email" :placeholder="transStore.t('contact.placeholderEmail')" required />
                </div>
              </div>

              <div class="form-group-premium">
                <label>{{ transStore.t('contact.message') }}</label>
                <div class="input-wrapper-premium items-start">
                  <MessageSquare :size="18" class="input-icon mt-4.5" />
                  <textarea v-model="form.message" rows="5" :placeholder="transStore.t('contact.placeholderMessage')" required 
                    class="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white placeholder-white/20 text-sm focus:border-flare-red/50 focus:outline-none transition-all resize-none focus:bg-white/[0.04]"></textarea>
                </div>
              </div>

              <button type="submit" :disabled="isSubmitting"
                      class="btn-submit-premium-luxe w-full group relative overflow-hidden flex items-center justify-center">
                <span class="flex items-center justify-center gap-3 relative z-10">
                  <span v-if="isSubmitting" class="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                  <span v-else class="flex items-center gap-2.5">
                    {{ transStore.t('contact.send') }} 
                    <Send :size="16" class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </span>
                <div class="shine"></div>
              </button>
            </form>
          </transition>
        </div>

        <!-- Info Section -->
        <div class="lg:col-span-5 space-y-8">
          
          <!-- Information Block -->
          <div class="card-premium-glow flex flex-col gap-8">
            <h2 class="text-xl font-black uppercase tracking-wider font-orbitron border-b border-white/5 pb-4" :class="{ 'text-right': transStore.currentLang === 'ar' }">
              {{ transStore.t('contact.infoTitle') }}
            </h2>
            
            <div class="space-y-6">
              <!-- Email Card -->
              <div class="flex items-center gap-5 group" :class="{ 'flex-row-reverse': transStore.currentLang === 'ar' }">
                <div class="w-12 h-12 rounded-2xl bg-flare-red/10 border border-flare-red/20 flex items-center justify-center text-flare-red shrink-0 group-hover:bg-flare-red group-hover:text-white transition-all duration-300">
                  <Mail :size="20"/>
                </div>
                <div :class="{ 'text-right': transStore.currentLang === 'ar' }">
                  <p class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {{ transStore.t('contact.infoEmail') }}
                  </p>
                  <p class="text-base font-bold text-white/90 hover:text-flare-red transition-all cursor-pointer font-mono">
                    contact@tecktrack.io
                  </p>
                </div>
              </div>

              <!-- Address Card -->
              <div class="flex items-center gap-5 group" :class="{ 'flex-row-reverse': transStore.currentLang === 'ar' }">
                <div class="w-12 h-12 rounded-2xl bg-flare-red/10 border border-flare-red/20 flex items-center justify-center text-flare-red shrink-0 group-hover:bg-flare-red group-hover:text-white transition-all duration-300">
                  <MapPin :size="20"/>
                </div>
                <div :class="{ 'text-right': transStore.currentLang === 'ar' }">
                  <p class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {{ transStore.t('contact.infoAddress') }}
                  </p>
                  <p class="text-base font-bold text-white/90">
                    {{ transStore.t('contact.infoAddressVal') }}
                  </p>
                </div>
              </div>


            </div>
          </div>

          <!-- Opening Hours Block (Glassmorphic) -->
          <div class="card-premium-glow flex gap-5 items-start relative overflow-hidden" :class="{ 'flex-row-reverse text-right': transStore.currentLang === 'ar' }">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Clock :size="20" class="animate-pulse" />
            </div>
            <div class="space-y-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-blue-400">
                {{ transStore.t('contact.hoursTitle') }}
              </p>
              <div class="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                {{ transStore.t('contact.hoursVal') }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}

/* Premium Tech Card style with subtle border glows */
.card-premium-glow {
  background: rgba(12, 16, 25, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 42px;
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-premium-glow:hover {
  transform: translateY(-4px);
  border-color: rgba(223, 75, 55, 0.15);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(223, 75, 55, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.form-group-premium {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group-premium label {
  font-size: 10px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.input-wrapper-premium {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 18px;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.3s;
  pointer-events: none;
}

.input-wrapper-premium input {
  width: 100%;
  height: 58px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 0 16px 0 54px;
  font-size: 15px;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.input-wrapper-premium input:focus {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(223, 75, 55, 0.4);
  outline: none;
  box-shadow: 0 0 25px rgba(223, 75, 55, 0.1);
}

.input-wrapper-premium input:focus + .input-icon {
  color: #DF4B37;
  transform: scale(1.05);
}

/* RTL Support via logical properties / HTML dir selector */
[dir="rtl"] .input-icon {
  left: auto;
  right: 18px;
}

[dir="rtl"] .input-wrapper-premium input {
  padding-left: 16px;
  padding-right: 54px;
}

[dir="rtl"] .input-wrapper-premium textarea {
  padding-left: 16px !important;
  padding-right: 54px !important;
}

[dir="rtl"] .form-group-premium label {
  text-align: right;
}

[dir="rtl"] .input-icon.mt-4\.5 {
  margin-top: 1.1rem;
}

/* Premium submit button with sleek luxury styling */
.btn-submit-premium-luxe {
  position: relative;
  height: 62px;
  background: linear-gradient(135deg, #DF4B37, #b23223);
  color: #fff;
  border: none;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(223, 75, 55, 0.25);
}

.btn-submit-premium-luxe:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(223, 75, 55, 0.35);
  background: linear-gradient(135deg, #ff5e47, #DF4B37);
}

.btn-submit-premium-luxe:active {
  transform: translateY(0);
}

.btn-submit-premium-luxe .shine {
  position: absolute;
  top: 0; 
  left: -100%;
  width: 100%; 
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
}

.btn-submit-premium-luxe:hover .shine {
  left: 100%;
  transition: all 0.75s ease-in-out;
}

/* Vue Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

