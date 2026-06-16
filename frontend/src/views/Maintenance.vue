<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';

const auth = useAuthStore();
const transStore = useTranslationStore();
const tickets = ref([]);
const technicians = ref([]);
const loading = ref(true);
const assignModal = ref(null);
const assignTechId = ref('');
const assignSaving = ref(false);
const filterStatus = ref('ALL');

const fetchAll = async () => {
  const token = auth.token;
  const headers = { Authorization: `Bearer ${token}` };
  const [tRes, uRes] = await Promise.all([
    fetch(`${API_BASE_URL}/tickets`, { headers }),
    fetch(`${API_BASE_URL}/users/technicians`, { headers })
  ]);
  tickets.value = await tRes.json();
  technicians.value = await uRes.json();
  loading.value = false;
};

onMounted(fetchAll);

const filteredTickets = computed(() => {
  if (filterStatus.value === 'ALL') return tickets.value;
  return tickets.value.filter(t => t.status === filterStatus.value);
});

const openAssign = (ticket) => {
  assignModal.value = ticket;
  assignTechId.value = ticket.technicianId || '';
};

const doAssign = async () => {
  if (!assignTechId.value) return;
  assignSaving.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${assignModal.value.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ technicianId: assignTechId.value })
    });
    if (res.ok) {
      assignModal.value = null;
      await fetchAll();
    }
  } finally {
    assignSaving.value = false;
  }
};

const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };

const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });

const counts = computed(() => ({
  total: tickets.value.length,
  pending: tickets.value.filter(t => t.status === 'PENDING').length,
  inprogress: tickets.value.filter(t => t.status === 'IN_PROGRESS').length,
  done: tickets.value.filter(t => t.status === 'REPAIRED').length,
}));
</script>

<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ transStore.t('maintenancePage.title') }}</h1>
          <p class="page-sub">{{ transStore.t('maintenancePage.subtitle') }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card" @click="filterStatus = 'ALL'" :class="{ active: filterStatus === 'ALL' }">
          <span class="stat-num">{{ counts.total }}</span>
          <span class="stat-lbl">{{ transStore.t('maintenancePage.total') }}</span>
        </div>
        <div class="stat-card stat-yellow" @click="filterStatus = 'PENDING'" :class="{ active: filterStatus === 'PENDING' }">
          <span class="stat-num">{{ counts.pending }}</span>
          <span class="stat-lbl">{{ transStore.t('dashboard.pending') }}</span>
          <span v-if="counts.pending > 0" class="new-indicator">{{ transStore.t('common.new') }}</span>
        </div>
        <div class="stat-card stat-blue" @click="filterStatus = 'IN_PROGRESS'" :class="{ active: filterStatus === 'IN_PROGRESS' }">
          <span class="stat-num">{{ counts.inprogress }}</span>
          <span class="stat-lbl">{{ transStore.t('dashboard.inProgress') }}</span>
        </div>
        <div class="stat-card stat-green" @click="filterStatus = 'REPAIRED'" :class="{ active: filterStatus === 'REPAIRED' }">
          <span class="stat-num">{{ counts.done }}</span>
          <span class="stat-lbl">{{ transStore.t('dashboard.completed') }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>

      <div v-else class="table-wrapper">
        <div class="table-header">
          <span>{{ transStore.t('maintenancePage.colId') }}</span>
          <span>{{ transStore.t('maintenancePage.colTitle') }}</span>
          <span>{{ transStore.t('maintenancePage.colType') }}</span>
          <span>{{ transStore.t('maintenancePage.colCreator') }}</span>
          <span>{{ transStore.t('maintenancePage.colStatus') }}</span>
          <span>{{ transStore.t('maintenancePage.colTechnician') }}</span>
          <span>{{ transStore.t('common.action') }}</span>
        </div>
        <div v-for="ticket in filteredTickets" :key="ticket.id" class="table-row">
          <span class="cell-id">#{{ ticket.id }}</span>
          <span class="cell-title">{{ ticket.title }}</span>
          <span class="cell-type">
            <span class="type-txt">{{ transStore.label('type', ticket.type) || ticket.type }}</span>
            <span :class="['prio-txt', ticket.priority]">{{ transStore.label('priority', ticket.priority) }}</span>
          </span>
          <span class="cell-user">{{ ticket.creator?.name || '—' }}</span>
          <span><span :class="['status-badge', statusClass[ticket.status]]">{{ transStore.label('status', ticket.status) }}</span></span>
          <span class="cell-tech">{{ ticket.technician?.name || '—' }}</span>
          <span>
            <button @click="openAssign(ticket)" class="btn-assign">
               {{ ticket.technicianId ? transStore.t('maintenancePage.reassign') : transStore.t('maintenancePage.assign') }}
            </button>
          </span>
        </div>
        <div v-if="filteredTickets.length === 0" class="no-data">{{ transStore.t('dashboard.noTickets') }}</div>
      </div>

      <!-- Modal -->
      <div v-if="assignModal" class="modal-overlay" @click.self="assignModal = null">
        <div class="modal">
          <h3>{{ transStore.t('maintenancePage.assignTech') }}</h3>
          <p class="modal-sub">{{ transStore.t('maintenancePage.ticketLabel') }} : <strong>{{ assignModal.title }}</strong></p>
          <div class="form-group">
            <label>{{ transStore.t('maintenancePage.chooseTech') }}</label>
            <select v-model="assignTechId" class="form-input">
              <option value="">-- Sélectionner --</option>
              <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button @click="assignModal = null" class="btn-cancel">{{ transStore.t('common.cancel') }}</button>
            <button @click="doAssign" :disabled="!assignTechId || assignSaving" class="btn-confirm">
              {{ assignSaving ? transStore.t('maintenancePage.saving') : transStore.t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.page-header { margin-bottom: 24px; }
h1 { font-size: 26px; font-weight: 900; margin: 0 0 4px; font-family: 'Orbitron', sans-serif; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 13.5px; margin: 0; }
.stats-row { display: flex; gap: 14px; margin-bottom: 28px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 24px; cursor: pointer; transition: all 0.2s; text-align: center; position: relative; min-width: 100px; }
.stat-card:hover, .stat-card.active { background: rgba(255,255,255,0.06); border-color: rgba(223,75,55,0.4); }
.new-indicator { position: absolute; top: -8px; right: -8px; background: #DF4B37; color: #fff; font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 10px; border: 2px solid #14171B; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.stat-num { display: block; font-size: 28px; font-weight: 900; color: #fff; }
.stat-yellow .stat-num { color: #fbbf24; }
.stat-blue .stat-num { color: #60a5fa; }
.stat-green .stat-num { color: #34d399; }
.stat-lbl { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.07em; }
.table-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
.table-header, .table-row { display: grid; grid-template-columns: 50px 1.5fr 150px 130px 120px 130px 110px; padding: 13px 20px; gap: 12px; align-items: center; }
.table-header { background: rgba(255,255,255,0.03); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); }
.table-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; }
.table-row:last-child { border-bottom: none; }
.cell-id { color: rgba(255,255,255,0.3); font-weight: 700; font-size: 12px; }
.cell-title { font-weight: 600; }
.cell-type { display: flex; flex-direction: column; gap: 3px; }
.type-txt { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase; }
.prio-txt { font-size: 12px; font-weight: 800; }
.prio-txt.URGENT { color: #f87171; }
.cell-user, .cell-tech { color: rgba(255,255,255,0.55); font-size: 13px; }
.status-badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; padding: 3px 10px; border-radius: 6px; }
.status-pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-inprogress { background: rgba(59,130,246,0.15); color: #60a5fa; }
.status-done { background: rgba(52,211,153,0.15); color: #34d399; }
.btn-assign { background: rgba(223,75,55,0.12); border: 1px solid rgba(223,75,55,0.25); color: #DF4B37; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.btn-assign:hover { background: rgba(223,75,55,0.22); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1a1e24; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 380px; }
.modal h3 { font-size: 18px; font-weight: 900; margin: 0 0 6px; }
.modal-sub { color: rgba(255,255,255,0.45); font-size: 13px; margin: 0 0 22px; }
.form-group label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.4); margin-bottom: 7px; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 14px; box-sizing: border-box; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-cancel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-confirm { background: #DF4B37; border: none; color: #fff; padding: 10px 22px; border-radius: 10px; font-weight: 800; cursor: pointer; }
</style>
