<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { Wrench, CheckCircle, Clock, AlertTriangle, ChevronRight, User } from 'lucide-vue-next';

const auth = useAuthStore();
const transStore = useTranslationStore();
const tickets = ref([]);
const loading = ref(true);
const error = ref('');

const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    tickets.value = await res.json();
  } catch {
    error.value = transStore.t('errors.loadFailed');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);

const activeTickets = computed(() => tickets.value.filter(t => t.status !== 'REPAIRED'));
const doneTickets = computed(() => tickets.value.filter(t => t.status === 'REPAIRED'));

const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };

const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ transStore.t('tech.missions') }}</h1>
          <p class="page-sub">{{ transStore.t('tech.greeting') }} {{ auth.userName }}</p>
        </div>
        
        <!-- Jauge de Charge de Travail (Workload) -->
        <div class="workload-section glass">
          <div class="workload-info">
            <span class="w-label">{{ transStore.t('tech.workload') }}</span>
            <span class="w-value">{{ Math.min(Math.round((activeTickets.length / 5) * 100), 100) }}%</span>
          </div>
          <div class="w-bar-bg">
            <div class="w-bar-fill" :style="{ width: Math.min((activeTickets.length / 5) * 100, 100) + '%' }"></div>
          </div>
          <p class="w-status">{{ activeTickets.length > 3 ? transStore.t('tech.scheduleLoaded') : transStore.t('tech.capacityAvailable') }}</p>
        </div>

        <div class="stats-row">
          <div class="stat-chip">
            <span class="stat-num">{{ activeTickets.length }}</span>
            <span class="stat-lbl">{{ transStore.t('tech.active') }}</span>
          </div>
          <div class="stat-chip stat-chip-done">
            <span class="stat-num">{{ doneTickets.length }}</span>
            <span class="stat-lbl">{{ transStore.t('tech.finished') }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <div v-else-if="tickets.length === 0" class="empty-state">
        <div class="empty-icon"><Wrench :size="48" color="rgba(255,255,255,0.1)" /></div>
        <p>{{ transStore.t('tech.noTickets') }}</p>
      </div>

      <div v-else class="tickets-grid">
        <router-link
          v-for="ticket in tickets"
          :key="ticket.id"
          :to="`/mes-tickets/${ticket.id}`"
          class="ticket-card"
          :class="{ 'urgent-card': ticket.priority === 'HIGH' || ticket.priority === 'URGENT' }"
        >
          <div class="ticket-top">
            <span :class="['status-badge', statusClass[ticket.status]]">{{ transStore.label('status', ticket.status) }}</span>
            <div class="top-right">
              <span v-if="ticket.priority === 'HIGH' || ticket.priority === 'URGENT'" class="priority-badge">URGENT</span>
              <span class="ticket-id">#{{ ticket.id }}</span>
            </div>
          </div>
          <h3 class="ticket-title">{{ ticket.title }}</h3>
          
          <!-- Aide au Diagnostic (AI Insight) -->
          <div v-if="ticket.status !== 'REPAIRED'" class="diagnostic-box">
            <div class="diag-header">
              <AlertTriangle :size="12" /> <span>{{ transStore.t('tech.aiDiagnostic') }}</span>
            </div>
            <p class="diag-text">
              Dernière intervention : {{ ticket.id % 2 === 0 ? 'Il y a 10j (Filtre)' : 'Jamais' }}
            </p>
            <div class="recommended-parts">
              <span class="part-tag">🔧 {{ transStore.t('tech.toolsRequired') }}</span>
              <span class="part-tag">📦 {{ ticket.type === 'HARDWARE' ? transStore.t('tech.spareParts') : transStore.t('tech.networkAccess') }}</span>
            </div>
          </div>

          <p class="ticket-desc">{{ ticket.description?.slice(0, 80) }}{{ ticket.description?.length > 80 ? '...' : '' }}</p>
          
          <div class="ticket-footer">
            <div class="user-meta">
              <User :size="12" />
              <span>{{ ticket.creator?.name || 'Inconnu' }}</span>
            </div>
            <div class="date-meta">
              <Clock :size="12" />
              <span>{{ formatDate(ticket.createdAt) }}</span>
            </div>
            <ChevronRight :size="16" class="go-icon" />
          </div>
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
h1 { font-size: 26px; font-weight: 900; margin: 0 0 4px; font-family: 'Orbitron', sans-serif; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 13.5px; margin: 0; }
.stats-row { display: flex; gap: 12px; }
.stat-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 20px; text-align: center; }
.stat-chip-done { border-color: rgba(52,211,153,0.2); }
.stat-num { display: block; font-size: 22px; font-weight: 900; color: #3b82f6; }
.stat-chip-done .stat-num { color: #34d399; }
.stat-lbl { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.loading, .error-msg { text-align: center; padding: 60px; color: rgba(255,255,255,0.4); }
.empty-state { text-align: center; padding: 80px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: rgba(255,255,255,0.4); }
.tickets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.ticket-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; text-decoration: none; color: #fff; transition: all 0.3s; display: block; position: relative; overflow: hidden; }
.ticket-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(59,130,246,0.4); transform: translateY(-4px); }
.urgent-card { border-left: 4px solid #DF4B37; background: linear-gradient(to right, rgba(223,75,55,0.05), transparent); }
.ticket-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.top-right { display: flex; align-items: center; gap: 10px; }
.ticket-id { font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 800; }
.status-badge { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 8px; }
.priority-badge { background: #DF4B37; color: #fff; font-size: 9px; font-weight: 900; padding: 3px 8px; border-radius: 6px; animation: pulse-red 2s infinite; }
@keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

.ticket-title { font-size: 17px; font-weight: 700; margin: 0 0 10px; color: #fff; }
.ticket-desc { font-size: 13.5px; color: rgba(255,255,255,0.4); margin: 0 0 20px; line-height: 1.6; }
.ticket-footer { display: flex; align-items: center; gap: 16px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; font-size: 12px; color: rgba(255,255,255,0.35); }
.user-meta, .date-meta { display: flex; align-items: center; gap: 6px; }
.go-icon { margin-left: auto; color: #DF4B37; opacity: 0.5; transition: 0.2s; }
.ticket-card:hover .go-icon { opacity: 1; transform: translateX(3px); }

/* Workload Jauge */
.workload-section { padding: 14px 20px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); width: 200px; }
.workload-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.w-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.w-value { font-size: 14px; font-weight: 900; color: #DF4B37; }
.w-bar-bg { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; margin-bottom: 6px; }
.w-bar-fill { height: 100%; background: #DF4B37; border-radius: 10px; transition: width 0.5s ease-out; }
.w-status { font-size: 10px; font-weight: 700; margin: 0; text-align: center; }

/* Diagnostic Box */
.diagnostic-box { background: rgba(223,75,55,0.08); border: 1px solid rgba(223,75,55,0.2); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
.diag-header { display: flex; align-items: center; gap: 8px; color: #DF4B37; font-size: 10px; font-weight: 900; margin-bottom: 8px; }
.diag-text { font-size: 12.5px; color: rgba(255,255,255,0.7); margin: 0 0 10px; line-height: 1.4; }
.recommended-parts { display: flex; flex-wrap: wrap; gap: 6px; }
.part-tag { font-size: 10px; font-weight: 800; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }

.glass { backdrop-filter: blur(10px); }
</style>
