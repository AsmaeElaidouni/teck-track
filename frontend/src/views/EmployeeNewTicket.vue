<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { Wrench, CheckCircle, Plus, ArrowLeft, Send } from 'lucide-vue-next';

const auth = useAuthStore();
const transStore = useTranslationStore();
const router = useRouter();
const form = ref({ 
  title: '', 
  description: '',
  priority: 'NORMAL',
  type: 'HARDWARE'
});
const loading = ref(false);
const error = ref('');
const success = ref(false);

const submit = async () => {
  error.value = '';
  if (!form.value.title.trim() || !form.value.description.trim()) {
    error.value = transStore.t('errors.fillAll');
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify(form.value)
    });
    if (res.ok) {
      success.value = true;
      setTimeout(() => router.push('/mes-demandes'), 1800);
    } else {
      const d = await res.json();
      error.value = d.message || transStore.t('employee.createError');
    }
  } catch {
    error.value = transStore.t('errors.networkError');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AppLayout>
    <div class="page">
      <button @click="router.push('/mes-demandes')" class="back-btn"><ArrowLeft :size="14" /> {{ transStore.t('employee.myRequests') }}</button>

      <div class="form-wrapper">
        <div class="form-card">
          <div class="form-icon"><Wrench :size="42" color="#DF4B37" /></div>
          <h1>{{ transStore.t('employee.newRequest') }}</h1>
          <p class="form-sub">{{ transStore.t('employee.reportProblem') }}</p>

          <div v-if="success" class="success-box">
            <div class="success-icon"><CheckCircle :size="48" color="#10b981" /></div>
            <p>{{ transStore.t('employee.requestSubmitted') }}</p>
          </div>

          <form v-else @submit.prevent="submit">
            <div v-if="error" class="error-box">{{ error }}</div>

            <div class="form-group">
              <label>{{ transStore.t('employee.ticketTitle') }}</label>
              <input v-model="form.title" type="text" :placeholder="transStore.t('employee.titlePlaceholder')" class="form-input" :disabled="loading" />
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>{{ transStore.t('maintenancePage.colType') }}</label>
                <select v-model="form.type" class="form-input" :disabled="loading">
                  <option value="HARDWARE">{{ transStore.label('type', 'HARDWARE') }}</option>
                  <option value="SOFTWARE">{{ transStore.label('type', 'SOFTWARE') }}</option>
                  <option value="NETWORK">{{ transStore.label('type', 'NETWORK') }}</option>
                  <option value="OTHER">{{ transStore.label('type', 'OTHER') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ transStore.label('priority', 'NORMAL') }}</label>
                <select v-model="form.priority" class="form-input" :disabled="loading">
                  <option value="LOW">{{ transStore.label('priority', 'LOW') }}</option>
                  <option value="NORMAL">{{ transStore.label('priority', 'NORMAL') }}</option>
                  <option value="URGENT">{{ transStore.label('priority', 'URGENT') }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>{{ transStore.t('employee.description') }}</label>
              <textarea v-model="form.description" :placeholder="transStore.t('contact.placeholderMessage')" class="form-input form-textarea" rows="5" :disabled="loading"></textarea>
            </div>

            <button type="submit" :disabled="loading" class="btn-submit">
              <span v-if="loading">{{ transStore.t('stockPage.sending') }}</span>
              <span v-else class="btn-flex"><Send :size="16" /> {{ transStore.t('employee.submitRequest') }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.btn-submit:hover:not(:disabled) { background: #c43d2c; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-flex { display: flex; align-items: center; justify-content: center; gap: 10px; }
.back-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 32px; transition: all 0.2s; }
.back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
.form-wrapper { max-width: 620px; }
.form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; }
.form-icon { font-size: 40px; margin-bottom: 16px; }
h1 { font-size: 24px; font-weight: 900; margin: 0 0 8px; font-family: 'Orbitron', sans-serif; }
.form-sub { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 32px; line-height: 1.6; }
.form-group { margin-bottom: 20px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 9px; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 13px 16px; color: #fff; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
.form-input:focus { outline: none; border-color: rgba(223,75,55,0.5); }
.form-input option { background: #1a1d23; }
.form-textarea { resize: vertical; min-height: 120px; }
.btn-submit { width: 100%; background: #DF4B37; color: #fff; border: none; padding: 15px; border-radius: 12px; font-weight: 800; font-size: 14.5px; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
.btn-submit:hover:not(:disabled) { background: #c43d2c; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.success-box { text-align: center; padding: 40px 20px; }
.success-icon { font-size: 48px; margin-bottom: 16px; }
.success-box p { color: rgba(255,255,255,0.6); font-size: 14px; }
</style>
