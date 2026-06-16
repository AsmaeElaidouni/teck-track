<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Info, CheckCircle2 } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import { useTranslationStore } from '../store/translation';

const router = useRouter();
const transStore = useTranslationStore();
const form = ref({ name: '', email: '', password: '', confirm: '' });
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  error.value = '';
  
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = transStore.t('errors.fillAll');
    return;
  }

  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(form.value.name)) {
    error.value = transStore.t('errors.invalidName');
    return;
  }

  const emailRegex = /^[^\s@]+@snaj\.tech$/;
  if (!emailRegex.test(form.value.email)) {
    error.value = transStore.t('errors.invalidEmail');
    return;
  }

  if (form.value.password.length < 6) {
    error.value = transStore.t('errors.passwordMin');
    return;
  }

  if (form.value.password !== form.value.confirm) {
    error.value = transStore.t('errors.passwordMismatch');
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.value.name, email: form.value.email, password: form.value.password })
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/login');
    } else {
      error.value = data.message || transStore.t('errors.registerFailed');
    }
  } catch {
    error.value = transStore.t('errors.cannotReachServer');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="split-layout flex-col">
    <PublicNavbar />
    
    <div class="flex flex-1 overflow-hidden">
      <div class="form-section">
        <div class="form-container animate-slide-right">
          <div class="login-card-luxe">
            <div class="card-header-luxe text-left">
              <h1 style="font-family:'Orbitron',sans-serif;">{{ transStore.t('register.title') }}</h1>
              <p>{{ transStore.t('register.subtitle') }}</p>
            </div>

            <form @submit.prevent="handleRegister" class="luxe-form">
              <div v-if="error" class="error-banner">
                <Info :size="14" /> <span>{{ error }}</span>
              </div>
              
              <div class="luxe-group">
                <label>{{ transStore.t('register.fullName') }}</label>
                <div class="luxe-input">
                  <User :size="20" class="icon" />
                  <input v-model="form.name" type="text" placeholder="Ex: Jean Dupont" required />
                </div>
              </div>

              <div class="luxe-group">
                <label>{{ transStore.t('register.email') }}</label>
                <div class="luxe-input">
                  <Mail :size="20" class="icon" />
                  <input v-model="form.email" type="email" placeholder="contact@tecktrack.io" required />
                </div>
              </div>
              
              <div class="luxe-group">
                <label>{{ transStore.t('register.password') }}</label>
                <div class="luxe-input">
                  <Lock :size="20" class="icon" />
                  <input v-model="form.password" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <div class="luxe-group">
                <label>{{ transStore.t('register.confirmPassword') }}</label>
                <div class="luxe-input">
                  <Lock :size="20" class="icon" />
                  <input v-model="form.confirm" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <button type="submit" :disabled="loading" class="btn-luxe-submit">
                <span v-if="loading" class="loader"></span>
                <span v-else>{{ transStore.t('register.submit') }}</span>
                <ArrowRight :size="20" class="arrow" />
                <div class="shine"></div>
              </button>
            </form>

            <div class="luxe-footer">
              <p>{{ transStore.t('register.alreadyMember') }} 
                <router-link to="/login" class="font-black text-flare-red underline ml-2">{{ transStore.t('register.signIn') }}</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="design-section">
        <div class="design-overlay"></div>
        <div class="design-content animate-fade-in">
          <div class="mb-12 flex justify-center">
              <div class="w-24 h-24 rounded-3xl bg-flare-red/10 border border-flare-red/20 flex items-center justify-center animate-pulse">
                  <ShieldCheck :size="48" class="text-flare-red" />
              </div>
          </div>
          <h2 class="slogan" style="font-family:'Orbitron',sans-serif;">
            {{ transStore.t('register.panelTitle') }}
          </h2>
          <p class="description">
            {{ transStore.t('register.panelDesc') }}
          </p>
          
          <div class="stats-grid">
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('register.security') }}</span>
            </div>
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('register.multiRoles') }}</span>
            </div>
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('register.tracking') }}</span>
            </div>
          </div>
        </div>
        
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles from Login.vue for perfect consistency */
.split-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0c10;
  overflow: hidden;
}

.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  background: #0a0c10;
}

.form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card-luxe {
  width: 100%;
  max-width: 440px;
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-header-luxe h1 {
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.card-header-luxe p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 40px;
  font-weight: 500;
}

.luxe-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.luxe-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.luxe-group label {
  font-size: 10px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.luxe-input {
  position: relative;
  display: flex;
  align-items: center;
}

.luxe-input .icon {
  position: absolute;
  left: 18px;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.3s;
}

.luxe-input input {
  width: 100%;
  height: 56px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 0 20px 0 56px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s;
}

.luxe-input input:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: #DF4B37;
  outline: none;
  box-shadow: 0 0 30px rgba(223, 75, 55, 0.1);
}

.luxe-input input:focus + .icon {
  color: #DF4B37;
}

.btn-luxe-submit {
  position: relative;
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #DF4B37, #9b2e21);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(223, 75, 55, 0.2);
  margin-top: 10px;
}

.btn-luxe-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(223, 75, 55, 0.4);
  background: linear-gradient(135deg, #ff5d47, #DF4B37);
}

.btn-luxe-submit:hover .arrow { transform: translateX(5px); }

.btn-luxe-submit .shine {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.6s;
}

.btn-luxe-submit:hover .shine { left: 100%; }

.luxe-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

/* --- Right Section --- */
.design-section {
  flex: 1.2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d1117;
}

.design-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 60% 40%, rgba(223, 75, 55, 0.1), transparent 70%);
}

.design-content {
  position: relative;
  z-index: 10;
  max-width: 500px;
  text-align: center;
}

.slogan {
  font-size: 56px;
  font-weight: 950;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: -2px;
}

.highlight { color: #DF4B37; display: block; }
.description { font-size: 18px; color: rgba(255, 255, 255, 0.5); line-height: 1.6; margin-bottom: 48px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
}

.orb { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 1; }
.orb-1 { width: 300px; height: 300px; background: rgba(223, 75, 55, 0.15); top: 10%; right: 10%; animation: float 10s infinite alternate; }
.orb-2 { width: 250px; height: 250px; background: rgba(59, 130, 246, 0.1); bottom: 10%; left: 10%; animation: float 8s infinite alternate-reverse; }

@keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, 40px); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.animate-slide-right { animation: slideRight 1s cubic-bezier(0.4, 0, 0.2, 1); }
.animate-fade-in { animation: fadeIn 1.2s ease-out; }

.loader {
  width: 20px; height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%; border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .design-section { display: none; }
}
</style>
