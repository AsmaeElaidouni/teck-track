<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { Shield, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next';

const auth = useAuthStore();
const transStore = useTranslationStore();
const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const loading = ref(false);
const error = ref('');
const success = ref('');

const updatePassword = async () => {
  error.value = '';
  success.value = '';

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = transStore.t('errors.passwordMismatch');
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/users/update-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}` 
      },
      body: JSON.stringify({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword
      })
    });

    const data = await res.json();
    if (res.ok) {
      success.value = data.message;
      form.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } else {
      error.value = data.message || transStore.t('profile.updateError');
    }
  } catch (err) {
    error.value = transStore.t('errors.networkError');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AppLayout>
    <div class="profile-container">
      <div class="header-section">
        <h1>{{ transStore.t('profile.title') }}</h1>
        <p>{{ transStore.t('profile.security') }}</p>
      </div>

      <div class="profile-grid">
        <!-- Informations Utilisateur -->
        <div class="info-card glass">
          <div class="avatar-large">{{ auth.user?.name?.charAt(0) }}</div>
          <div class="info-details">
            <h2>{{ auth.user?.name }}</h2>
            <p class="role-badge">{{ transStore.label('roles', auth.user?.role) }}</p>
            <p class="email-text">{{ auth.user?.email }}</p>
          </div>
          <div class="account-status">
            <CheckCircle :size="14" color="#10b981" /> {{ transStore.t('profile.verified') }}
          </div>
        </div>

        <!-- Changement de Mot de Passe -->
        <div class="password-card glass">
          <div class="card-header">
            <h3><Shield :size="18" /> {{ transStore.t('profile.security') }}</h3>
          </div>
          
          <form @submit.prevent="updatePassword" class="password-form">
            <div v-if="success" class="alert success">
              <CheckCircle :size="16" /> {{ success }}
            </div>
            <div v-if="error" class="alert error">
              <AlertCircle :size="16" /> {{ error }}
            </div>

            <div class="form-group">
              <label>{{ transStore.t('profile.currentPassword') }}</label>
              <div class="input-wrap">
                <Key class="input-icon" :size="16" />
                <input v-model="form.currentPassword" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <div class="form-group">
              <label>{{ transStore.t('profile.newPassword') }}</label>
              <div class="input-wrap">
                <Key class="input-icon" :size="16" />
                <input v-model="form.newPassword" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <div class="form-group">
              <label>{{ transStore.t('profile.confirmPassword') }}</label>
              <div class="input-wrap">
                <Key class="input-icon" :size="16" />
                <input v-model="form.confirmPassword" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" class="btn-update" :disabled="loading">
              <Loader2 v-if="loading" class="spin" :size="16" />
              {{ loading ? transStore.t('common.loading') : transStore.t('profile.updatePassword') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.profile-container { padding: 40px; color: #fff; max-width: 1000px; margin: 0 auto; }
.header-section { margin-bottom: 40px; }
.header-section h1 { font-family: 'Orbitron', sans-serif; font-size: 32px; margin-bottom: 8px; }
.accent { color: #DF4B37; }
.header-section p { color: rgba(255,255,255,0.4); }

.profile-grid { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }

.glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 30px; }

/* Info Card */
.info-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
.avatar-large { width: 100px; height: 100px; background: linear-gradient(135deg, #DF4B37, #ff6b6b); border-radius: 30px; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 900; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(223,75,55,0.3); }
.info-details h2 { margin-bottom: 10px; font-family: 'Space Grotesk', sans-serif; }
.role-badge { background: rgba(223,75,55,0.1); color: #DF4B37; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; display: inline-block; margin-bottom: 12px; }
.email-text { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 30px; }
.account-status { font-size: 12px; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px; padding: 10px; background: rgba(16,185,129,0.05); border-radius: 12px; width: 100%; justify-content: center; }

/* Password Card */
.card-header h3 { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.7); margin-bottom: 24px; font-family: 'Space Grotesk', sans-serif; }

.password-form { display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); margin-bottom: 10px; text-transform: uppercase; }
.input-wrap { position: relative; }
.input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.2); }
.input-wrap input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px 14px 14px 45px; color: #fff; font-size: 15px; transition: 0.3s; }
.input-wrap input:focus { border-color: #DF4B37; background: rgba(223,75,55,0.05); outline: none; }

.btn-update { background: #DF4B37; color: #fff; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; }
.btn-update:hover:not(:disabled) { background: #ff523b; transform: translateY(-2px); }
.btn-update:disabled { opacity: 0.5; cursor: not-allowed; }

.alert { padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
.alert.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.alert.error { /* rouge + petit via index.css */ }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
