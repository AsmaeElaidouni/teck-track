<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { Mail, Lock, User, ShieldCheck, ChevronRight, X, UserPlus, Info, CheckCircle2, ChevronDown, Check } from 'lucide-vue-next';
import PublicNavbar from '../components/PublicNavbar.vue';
import BrandLogo from '../components/BrandLogo.vue';
import { useTranslationStore } from '../store/translation';
import { API_BASE_URL } from '../config/apiBase';

const router = useRouter();
const auth = useAuthStore();
const transStore = useTranslationStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const modal = ref(false);
const requestForm = ref({ name: '', email: '', role: 'EMPLOYEE' });
const requestSent = ref(false);
const requestError = ref('');

const isRoleDropdownOpen = ref(false);
const roleDropdownRef = ref(null);

const selectRole = (role) => {
  requestForm.value.role = role;
  isRoleDropdownOpen.value = false;
};

const handleRoleClickOutside = (event) => {
  if (roleDropdownRef.value && !roleDropdownRef.value.contains(event.target)) {
    isRoleDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleRoleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleRoleClickOutside);
});

const login = async () => {
  error.value = '';
  
  if (!email.value || !password.value) {
    error.value = transStore.t('errors.fillAll');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    error.value = transStore.t('errors.invalidEmail');
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      auth.login(data.token, data.user);
      if (data.user.role === 'ADMIN') router.push('/dashboard');
      else if (data.user.role === 'TECHNICIAN') router.push('/mes-tickets');
      else router.push('/mes-demandes');
    } else {
      error.value = data.message || transStore.t('errors.invalidCredentials');
    }
  } catch (err) {
    error.value = transStore.t('errors.serverError');
  } finally {
    loading.value = false;
  }
};

const sendRequest = async () => {
  requestError.value = '';

  if (!requestForm.value.name || !requestForm.value.email) {
    requestError.value = transStore.t('errors.fillAll');
    return;
  }

  // Validation du nom (pas de chiffres)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(requestForm.value.name)) {
    requestError.value = transStore.t('errors.invalidName');
    return;
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@snaj\.tech$/;
  if (!emailRegex.test(requestForm.value.email)) {
    requestError.value = transStore.t('errors.invalidEmail');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestForm.value)
    });
    if (res.ok) {
      requestSent.value = true;
      setTimeout(() => { modal.value = false; requestSent.value = false; requestForm.value = { name: '', email: '', role: 'EMPLOYEE' }; }, 3000);
    } else {
      const d = await res.json();
      requestError.value = d.message;
    }
  } catch {
    requestError.value = transStore.t('errors.networkError');
  }
};
</script>

<template>
  <div class="split-layout flex-col">
    <PublicNavbar />
    
    <div class="flex flex-1 overflow-hidden" :class="{ 'flex-row-reverse': transStore.currentLang === 'ar' }">
      <!-- Left Side: Login Form -->
      <div class="form-section">
        <div class="form-container animate-slide-right">
          <div class="login-card-luxe">
            <div class="card-header-luxe" :class="{ 'text-right': transStore.currentLang === 'ar' }">
              <h1 style="font-family:'Orbitron',sans-serif;">{{ transStore.t('login.title') }}</h1>
              <p>{{ transStore.t('login.subtitle') }}</p>
            </div>

            <form @submit.prevent="login" class="luxe-form">
              <div v-if="error" class="error-banner" :class="{ 'flex-row-reverse': transStore.currentLang === 'ar' }">
                <Info :size="14" /> <span>{{ error }}</span>
              </div>
              
              <div class="luxe-group">
                <label :class="{ 'text-right': transStore.currentLang === 'ar' }">{{ transStore.t('login.emailLabel') }}</label>
                <div class="luxe-input">
                  <Mail :size="20" class="icon" />
                  <input v-model="email" type="email" placeholder="admin@snaj.tech" required />
                </div>
              </div>
              
              <div class="luxe-group">
                <label :class="{ 'text-right': transStore.currentLang === 'ar' }">{{ transStore.t('login.passwordLabel') }}</label>
                <div class="luxe-input">
                  <Lock :size="20" class="icon" />
                  <input v-model="password" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <button type="submit" :disabled="loading" class="btn-luxe-submit">
                <span v-if="loading" class="loader"></span>
                <span v-else class="text-[15px] tracking-[0.2em]">{{ transStore.t('login.submitBtn') }}</span>
                <ChevronRight :size="20" class="arrow" :class="{ 'rotate-180': transStore.currentLang === 'ar' }" />
                <div class="shine"></div>
              </button>
            </form>

            <div class="luxe-footer" :class="{ 'text-right': transStore.currentLang === 'ar' }">
              <p>{{ transStore.t('login.needAccess') }} 
                <button @click="modal = true">{{ transStore.t('login.requestHere') }}</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Design & Slogan -->
      <div class="design-section">
        <div class="design-overlay"></div>
        <div class="design-content animate-fade-in" :class="{ 'text-right items-end flex flex-col': transStore.currentLang === 'ar' }">
          <BrandLogo :size="80" class="mb-12 scale-110" />
          <h2 class="slogan" style="font-family:'Orbitron',sans-serif;" :class="{ 'text-right w-full': transStore.currentLang === 'ar' }">
            {{ transStore.t('login.futureOf') }} <span class="highlight">{{ transStore.t('login.maintenance') }}</span>
          </h2>
          <p class="description">
            {{ transStore.t('login.desc') }}
          </p>
          
          <div class="stats-grid w-full">
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('login.availability') }}</span>
            </div>
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('login.predictive') }}</span>
            </div>
            <div class="stat-item">
              <CheckCircle2 :size="18" class="text-flare-red" />
              <span>{{ transStore.t('login.support') }}</span>
            </div>
          </div>
        </div>
        
        <!-- Animated Orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
    </div>

    <!-- Modal remains the same premium style -->
    <Transition name="fade">
      <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
        <div class="modal-card-premium" :class="{ 'text-right': transStore.currentLang === 'ar' }">
          <button @click="modal = false" class="modal-close">
            <X :size="20" />
          </button>

          <div v-if="requestSent" class="success-screen text-center">
            <div class="success-icon-badge">
              <ShieldCheck :size="32" class="text-green-400 animate-bounce" />
            </div>
            <h3 class="success-title-premium font-orbitron">{{ transStore.t('login.requestSent') }}</h3>
            <p class="success-subtitle-premium">{{ transStore.t('login.requestSentSub') }}</p>
          </div>

          <template v-else>
            <div class="modal-header-premium text-center">
              <div class="modal-icon-badge">
                <UserPlus :size="24" />
              </div>
              <h3 class="modal-title-premium font-orbitron">{{ transStore.t('login.newAccount') }}</h3>
              <p class="modal-subtitle-premium">{{ transStore.t('login.submitRequest') }}</p>
            </div>
            
            <div v-if="requestError" class="error-msg-modal">{{ requestError }}</div>

            <div class="modal-form-luxe">
              <div class="luxe-group">
                <label :class="{ 'text-right': transStore.currentLang === 'ar' }">{{ transStore.t('login.fullName') }}</label>
                <div class="luxe-input">
                  <User :size="18" class="icon" />
                  <input v-model="requestForm.name" type="text" placeholder="Ex: Jean Dupont" />
                </div>
              </div>
              <div class="luxe-group">
                <label :class="{ 'text-right': transStore.currentLang === 'ar' }">{{ transStore.t('login.email') }}</label>
                <div class="luxe-input">
                  <Mail :size="18" class="icon" />
                  <input v-model="requestForm.email" type="email" placeholder="jean@snaj.tech" />
                </div>
              </div>
              <div class="luxe-group relative" ref="roleDropdownRef">
                <label :class="{ 'text-right': transStore.currentLang === 'ar' }">{{ transStore.t('login.role') }}</label>
                <div class="custom-select-trigger" @click="isRoleDropdownOpen = !isRoleDropdownOpen">
                  <ShieldCheck :size="18" class="icon" />
                  <span>{{ requestForm.role === 'EMPLOYEE' ? transStore.t('login.employee') : transStore.t('login.technician') }}</span>
                  <ChevronDown :size="16" class="arrow-down" :class="{ 'rotate-180': isRoleDropdownOpen }" />
                </div>
                
                <transition name="fade">
                  <div v-if="isRoleDropdownOpen" class="custom-select-dropdown animate-fade-in">
                    <button type="button" @click="selectRole('EMPLOYEE')" class="custom-select-option" :class="{ active: requestForm.role === 'EMPLOYEE' }">
                      <span class="flex items-center gap-3">
                        <span class="dot"></span>
                        <span>{{ transStore.t('login.employee') }}</span>
                      </span>
                      <Check v-if="requestForm.role === 'EMPLOYEE'" :size="14" class="text-flare-red" />
                    </button>
                    <button type="button" @click="selectRole('TECHNICIAN')" class="custom-select-option" :class="{ active: requestForm.role === 'TECHNICIAN' }">
                      <span class="flex items-center gap-3">
                        <span class="dot"></span>
                        <span>{{ transStore.t('login.technician') }}</span>
                      </span>
                      <Check v-if="requestForm.role === 'TECHNICIAN'" :size="14" class="text-flare-red" />
                    </button>
                  </div>
                </transition>
              </div>
              
              <button @click="sendRequest" class="btn-luxe-submit mt-10">
                {{ transStore.t('login.sendRequest') }}
                <div class="shine"></div>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.split-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0c10;
  overflow: hidden;
}

/* --- Left Section --- */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  background: #0a0c10;
}

.navbar-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 50;
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
  margin-bottom: 48px;
  font-weight: 500;
}

.luxe-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.luxe-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.luxe-group label {
  font-size: 10px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 6px; /* Spacing between label and input box */
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

.luxe-input input, .luxe-input select {
  width: 100%;
  height: 60px;
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
}

.btn-luxe-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(223, 75, 55, 0.4);
  background: linear-gradient(135deg, #ff5d47, #DF4B37);
}

.btn-luxe-submit:hover .arrow {
  transform: translateX(5px);
}

.btn-luxe-submit .shine {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.6s;
}

.btn-luxe-submit:hover .shine { left: 100%; }

.luxe-footer {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.luxe-footer button {
  color: #DF4B37;
  font-weight: 900;
  margin-left: 8px;
  text-decoration: underline;
  transition: color 0.3s;
}

.luxe-footer button:hover { color: #fff; }

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

.highlight {
  color: #DF4B37;
  display: block;
}

.description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin-bottom: 48px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

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

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.orb-1 {
  width: 300px; height: 300px;
  background: rgba(223, 75, 55, 0.15);
  top: 10%; right: 10%;
  animation: float 10s infinite alternate;
}

.orb-2 {
  width: 250px; height: 250px;
  background: rgba(59, 130, 246, 0.1);
  bottom: 10%; left: 10%;
  animation: float 8s infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card-premium {
  background: #0d0f13;
  width: 100%;
  max-width: 460px;
  padding: 48px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 50px rgba(223, 75, 55, 0.08);
  transition: all 0.3s ease;
}

/* Custom Select trigger styling */
.custom-select-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 0 20px 0 56px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.custom-select-trigger:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(223, 75, 55, 0.3);
}

.custom-select-trigger .icon {
  position: absolute;
  left: 18px;
  color: rgba(255, 255, 255, 0.25);
  transition: color 0.3s;
}

.custom-select-trigger:hover .icon {
  color: #DF4B37;
}

.arrow-down {
  color: rgba(255, 255, 255, 0.4);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Custom Dropdown list */
.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #090b0e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(223, 75, 55, 0.05);
  z-index: 100;
  backdrop-filter: blur(25px);
}

.custom-select-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-select-option:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}

.custom-select-option.active {
  background: rgba(223, 75, 55, 0.08);
  color: #fff;
  font-weight: 700;
}

.custom-select-option .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s;
}

.custom-select-option:hover .dot {
  background: #DF4B37;
}

.custom-select-option.active .dot {
  background: #DF4B37;
  box-shadow: 0 0 10px #DF4B37;
}

.modal-close {
  position: absolute;
  top: 24px; right: 24px;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  z-index: 50;
}

.modal-close:hover { color: #fff; }

/* Modal Header Premium Redesign */
.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}

.modal-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(223, 75, 55, 0.1), rgba(223, 75, 55, 0.02));
  border: 1px solid rgba(223, 75, 55, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #DF4B37;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 25px rgba(223, 75, 55, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modal-title-premium {
  font-size: 26px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ffffff 40%, rgba(255, 255, 255, 0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-subtitle-premium {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 12px;
}

/* Spacing between access request form fields */
.modal-form-luxe {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 32px;
}

/* Success screen design upgrade */
.success-icon-badge {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02));
  border: 1px solid rgba(16, 185, 129, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15);
}

.success-title-premium {
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #fff;
  margin-bottom: 12px;
}

.success-subtitle-premium {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
}

/* Animations */
.animate-slide-right { animation: slideRight 1s cubic-bezier(0.4, 0, 0.2, 1); }
.animate-fade-in { animation: fadeIn 1.2s ease-out; }

@keyframes slideRight {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .design-section { display: none; }
}
</style>
