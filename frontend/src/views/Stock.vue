<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';

const auth = useAuthStore();
const transStore = useTranslationStore();
const parts = ref([]);
const loading = ref(true);
const modal = ref(false);
const form = ref({ name: '', stock: 0, minThreshold: 5 });
const saving = ref(false);

const fetchParts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/parts`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    parts.value = await res.json();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchParts);

const savePart = async () => {
  saving.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify(form.value)
    });
    if (res.ok) {
      modal.value = false;
      form.value = { name: '', stock: 0, minThreshold: 5 };
      await fetchParts();
    }
  } finally {
    saving.value = false;
  }
};

const deletePart = async (id) => {
  if (!confirm(transStore.t('stockPage.deleteConfirm'))) return;
  await fetch(`${API_BASE_URL}/parts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  await fetchParts();
};

const counts = computed(() => ({
  total: parts.value.length,
  critical: parts.value.filter(p => p.stock < p.minThreshold).length
}));
</script>

<template>
  <AppLayout>
    <div class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ transStore.t('stockPage.tag') }}</p>
          <h1>{{ transStore.t('stockPage.title') }}</h1>
          <p class="sub">{{ transStore.t('stockPage.subtitle') }}</p>
        </div>
        <button @click="modal = true" class="btn-create">➕ {{ transStore.t('stockPage.newPart') }}</button>
      </header>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">{{ counts.total }}</span>
          <span class="stat-lbl">{{ transStore.t('stockPage.partsCount') }}</span>
        </div>
        <div class="stat-card" :class="{ 'card-warning': counts.critical > 0 }">
          <span class="stat-num">{{ counts.critical }}</span>
          <span class="stat-lbl">{{ transStore.t('stockPage.stockAlerts') }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>

      <div v-else class="table-wrapper">
        <div class="table-header">
          <span>ID</span>
          <span>{{ transStore.t('stockPage.partName') }}</span>
          <span>{{ transStore.t('stockPage.currentStock') }}</span>
          <span>{{ transStore.t('stockPage.minThreshold') }}</span>
          <span>{{ transStore.t('stockPage.statusCol') }}</span>
          <span>{{ transStore.t('common.action') }}</span>
        </div>
        <div v-for="part in parts" :key="part.id" class="table-row">
          <span class="cell-id">#{{ part.id }}</span>
          <span class="cell-name">{{ part.name }}</span>
          <span class="cell-stock" :class="{ 'low': part.stock < part.minThreshold }">{{ part.stock }}</span>
          <span class="cell-min">{{ part.minThreshold }}</span>
          <span>
            <span :class="['status-badge', part.stock < part.minThreshold ? 'st-crit' : 'st-ok']">
              {{ part.stock < part.minThreshold ? transStore.t('stockPage.critical') : transStore.t('stockPage.ok') }}
            </span>
          </span>
          <span>
            <button @click="deletePart(part.id)" class="btn-delete">🗑️</button>
          </span>
        </div>
      </div>

      <!-- Add Modal -->
      <div v-if="modal" class="modal-overlay" @click.self="modal = false">
        <div class="modal">
          <h3>{{ transStore.t('stockPage.newPart') }}</h3>
          <div class="form-group">
            <label>{{ transStore.t('stockPage.partName') }}</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="ex: RAM 8GB" />
          </div>
          <div class="form-group">
            <label>{{ transStore.t('stockPage.initialStock') }}</label>
            <input v-model.number="form.stock" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ transStore.t('stockPage.alertThreshold') }}</label>
            <input v-model.number="form.minThreshold" type="number" class="form-input" />
          </div>
          <div class="modal-actions">
            <button @click="modal = false" class="btn-cancel">{{ transStore.t('common.cancel') }}</button>
            <button @click="savePart" :disabled="saving" class="btn-confirm">
              {{ saving ? transStore.t('stockPage.sending') : transStore.t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.eyebrow { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4em; color: #DF4B37; margin-bottom: 8px; }
h1 { font-size: 36px; font-weight: 900; font-family: 'Orbitron', sans-serif; text-transform: uppercase; margin: 0 0 6px; }
.stroke { color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.7); }
.sub { color: rgba(255,255,255,0.35); font-size: 14px; }

.btn-create { background: #DF4B37; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.btn-create:hover { background: #c43d2c; }

.stats-row { display: flex; gap: 20px; margin-bottom: 32px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 32px; text-align: left; flex: 1; max-width: 240px; }
.stat-num { display: block; font-size: 32px; font-weight: 900; margin-bottom: 4px; }
.stat-lbl { font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
.card-warning { border-color: rgba(223,75,55,0.3); background: rgba(223,75,55,0.05); }
.card-warning .stat-num { color: #DF4B37; }

.table-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }
.table-header, .table-row { display: grid; grid-template-columns: 80px 1fr 120px 120px 150px 100px; padding: 16px 24px; gap: 20px; align-items: center; }
.table-header { background: rgba(255,255,255,0.03); font-size: 11px; font-weight: 900; text-transform: uppercase; color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); letter-spacing: 0.1em; }
.table-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
.table-row:last-child { border-bottom: none; }
.cell-id { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 700; }
.cell-name { font-weight: 700; font-size: 16px; }
.cell-stock { font-size: 18px; font-weight: 900; font-family: 'Orbitron', sans-serif; }
.cell-stock.low { color: #DF4B37; }
.cell-min { color: rgba(255,255,255,0.4); font-weight: 600; }

.status-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; }
.st-ok { background: rgba(52,211,153,0.1); color: #34d399; }
.st-crit { background: rgba(223,75,55,0.1); color: #DF4B37; animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.btn-delete { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.3; transition: opacity 0.2s; }
.btn-delete:hover { opacity: 1; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1a1e24; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 400px; }
.modal h3 { font-size: 20px; font-weight: 900; margin: 0 0 24px; font-family: 'Orbitron', sans-serif; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; color: #fff; font-size: 14px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn-cancel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; }
.btn-confirm { background: #DF4B37; border: none; color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; }

.loading { text-align: center; padding: 120px; color: rgba(255,255,255,0.3); font-style: italic; }
</style>
