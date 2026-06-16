<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';

const auth = useAuthStore();
const transStore = useTranslationStore();
const route = useRoute();
const router = useRouter();

const ticket = ref(null);
const parts = ref([]);
const loading = ref(true);
const saving = ref(false);
const partForm = ref({ partId: '', quantity: 1 });
const consumeError = ref('');
const consumeSuccess = ref('');

const fetchTicket = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${route.params.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    ticket.value = await res.json();
  } catch {
    ticket.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchParts = async () => {
  const res = await fetch(`${API_BASE_URL}/parts`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  parts.value = await res.json();
};

onMounted(() => { fetchTicket(); fetchParts(); });

const updateStatus = async (newStatus) => {
  saving.value = true;
  try {
    await fetch(`${API_BASE_URL}/tickets/${route.params.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ status: newStatus })
    });
    ticket.value.status = newStatus;
  } finally {
    saving.value = false;
  }
};

const addConsumption = async () => {
  consumeError.value = '';
  consumeSuccess.value = '';
  if (!partForm.value.partId) { consumeError.value = transStore.t('errors.fillAll'); return; }
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${route.params.id}/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ partId: partForm.value.partId, quantity: partForm.value.quantity })
    });
    if (!res.ok) {
      const d = await res.json();
      consumeError.value = d.message;
    } else {
      consumeSuccess.value = transStore.t('profile.updateSuccess');
      partForm.value = { partId: '', quantity: 1 };
      fetchTicket();
    }
  } catch { consumeError.value = transStore.t('errors.networkError'); }
};

const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };

const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'long', year: 'numeric' });
</script>

<template>
  <AppLayout>
    <div class="page">
      <button @click="router.push('/mes-tickets')" class="back-btn">← {{ transStore.t('tech.myInterventions') }}</button>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>
      <div v-else-if="!ticket" class="error-msg">{{ transStore.t('tech.ticketNotFound') }}</div>

      <template v-else>
        <div class="ticket-header">
          <div class="header-main">
            <div class="ticket-meta">
              <span class="ticket-id">#{{ ticket.id }}</span>
              <span :class="['status-badge', statusClass[ticket.status]]">{{ transStore.label('status', ticket.status) }}</span>
              <span class="type-prio">{{ transStore.label('type', ticket.type) }} • {{ transStore.label('priority', ticket.priority) }}</span>
            </div>
            <h1>{{ ticket.title }}</h1>
            <p class="ticket-date"><strong>{{ ticket.creator?.name }}</strong> — {{ formatDate(ticket.createdAt) }}</p>
          </div>
        </div>

        <div class="content-grid">
          <div class="left-col">
            <!-- Problem Description -->
            <div class="card">
              <div class="card-title">
                <span class="icon">🔍</span>
                <h2>{{ transStore.t('tech.diagnostic') }}</h2>
              </div>
              <p class="description">{{ ticket.description }}</p>
              <div v-if="ticket.status === 'PENDING'" class="pending-note">
                {{ transStore.t('tech.startIntervention') }}
              </div>
            </div>

            <!-- Interventions / History -->
            <div class="card" v-if="ticket.consumptions?.length">
              <div class="card-title">
                <span class="icon">⚙️</span>
                <h2>{{ transStore.t('tech.installedParts') }}</h2>
              </div>
              <div class="parts-list">
                <div v-for="c in ticket.consumptions" :key="c.id" class="part-row">
                  <span class="part-name">{{ c.part?.name }}</span>
                  <span class="part-qty">×{{ c.quantity }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card">
              <div class="card-title">
                <span class="icon">⚡</span>
                <h2>{{ transStore.t('tech.markRepaired') }}</h2>
              </div>
              <div class="status-actions">
                <button
                  @click="updateStatus('IN_PROGRESS')"
                  :disabled="ticket.status === 'IN_PROGRESS' || ticket.status === 'REPAIRED' || saving"
                  class="btn btn-blue"
                >{{ transStore.t('tech.startIntervention') }}</button>
                <button
                  @click="updateStatus('REPAIRED')"
                  :disabled="ticket.status === 'REPAIRED' || saving"
                  class="btn btn-green"
                >{{ transStore.t('tech.markRepaired') }}</button>
              </div>
            </div>
          </div>

          <!-- Add consumption -->
          <div class="right-col">
            <div class="card stock-card">
              <div class="card-title">
                <span class="icon">📦</span>
                <h2>{{ transStore.t('tech.stockConsumption') }}</h2>
              </div>
              <p class="card-sub">{{ transStore.t('tech.stockConsumption') }}</p>
              
              <div v-if="consumeError" class="msg-error">{{ consumeError }}</div>
              <div v-if="consumeSuccess" class="msg-success">{{ consumeSuccess }}</div>
              
              <div class="form-group">
                <label>{{ transStore.t('tech.availablePart') }}</label>
                <select v-model="partForm.partId" class="form-input">
                  <option value="">-- Choisir --</option>
                  <option v-for="p in parts" :key="p.id" :value="p.id">
                    {{ p.name }} (Stock: {{ p.stock }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ transStore.t('tech.quantityUsed') }}</label>
                <input v-model.number="partForm.quantity" type="number" min="1" class="form-input" />
              </div>
              <button @click="addConsumption" class="btn btn-red full-width" :disabled="!partForm.partId">
                {{ transStore.t('tech.savePart') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.back-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 24px; transition: all 0.2s; }
.back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

.ticket-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
.ticket-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.ticket-id { font-size: 13px; color: rgba(255,255,255,0.25); font-weight: 900; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px; }
.status-badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 6px; }
.status-pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-inprogress { background: rgba(59,130,246,0.15); color: #60a5fa; }
.status-done { background: rgba(52,211,153,0.15); color: #34d399; }
.type-prio { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }

h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; font-family: 'Orbitron', sans-serif; }
.ticket-date { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0; }
.ticket-date strong { color: rgba(255,255,255,0.8); }

.content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
.card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; margin-bottom: 24px; }
.card-title { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.card-title h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.6); margin: 0; }
.icon { font-size: 18px; }

.description { color: rgba(255,255,255,0.8); line-height: 1.8; font-size: 15px; margin: 0; }
.pending-note { margin-top: 16px; padding: 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 10px; color: #fbbf24; font-size: 13px; font-weight: 600; text-align: center; }

.status-actions { display: flex; gap: 16px; }
.btn { flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 800; font-size: 13.5px; cursor: pointer; transition: all 0.2s; }
.btn:disabled { opacity: 0.2; cursor: not-allowed; }
.btn-blue { background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
.btn-blue:not(:disabled):hover { background: rgba(59,130,246,0.3); }
.btn-green { background: rgba(52,211,153,0.2); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.btn-green:not(:disabled):hover { background: rgba(52,211,153,0.3); }
.btn-red { background: #DF4B37; color: #fff; }
.btn-red:hover:not(:disabled) { background: #c43d2c; }

.parts-list { display: flex; flex-direction: column; gap: 10px; }
.part-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.05); }
.part-name { font-size: 14px; font-weight: 600; }
.part-qty { font-size: 13px; color: #60a5fa; font-weight: 900; background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: 6px; }

.stock-card { position: sticky; top: 24px; border-color: rgba(223,75,55,0.2); }
.card-sub { font-size: 12.5px; color: rgba(255,255,255,0.4); margin: -10px 0 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 14px; box-sizing: border-box; }
.form-input option { background: #1a1e24; }
.full-width { width: 100%; }

.msg-error { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
.msg-success { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }

.loading, .error-msg { text-align: center; padding: 80px; color: rgba(255,255,255,0.3); }
</style>
