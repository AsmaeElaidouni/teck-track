<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';

const auth = useAuthStore();
const transStore = useTranslationStore();
const tickets = ref([]);
const loading = ref(true);

const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const all = await res.json();
    tickets.value = all.filter(t => t.status === 'REPAIRED');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);

const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ transStore.t('tech.historyTitle') }}</h1>
          <p class="page-sub">{{ tickets.length }}</p>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>
      <div v-else-if="tickets.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>{{ transStore.t('tech.noHistory') }}</p>
      </div>

      <div v-else class="history-table">
        <div class="table-header">
          <span>#</span>
          <span>{{ transStore.t('maintenancePage.colTitle') }}</span>
          <span>{{ transStore.t('tech.colRequester') }}</span>
          <span>{{ transStore.t('tech.colParts') }}</span>
          <span>{{ transStore.t('tech.colDate') }}</span>
        </div>
        <div v-for="ticket in tickets" :key="ticket.id" class="table-row">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <span class="ticket-title">{{ ticket.title }}</span>
          <span class="ticket-creator">{{ ticket.creator?.name || '—' }}</span>
          <span class="ticket-parts">{{ ticket.consumptions?.length || 0 }}</span>
          <span class="ticket-date">{{ formatDate(ticket.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.page-header { margin-bottom: 28px; }
h1 { font-size: 26px; font-weight: 900; margin: 0 0 4px; font-family: 'Orbitron', sans-serif; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 13.5px; margin: 0; }
.loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.4); }
.empty-state { text-align: center; padding: 80px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: rgba(255,255,255,0.4); }
.history-table { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
.table-header, .table-row { display: grid; grid-template-columns: 60px 1fr 160px 100px 120px; padding: 14px 20px; gap: 16px; align-items: center; }
.table-header { background: rgba(255,255,255,0.03); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.35); border-bottom: 1px solid rgba(255,255,255,0.06); }
.table-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; transition: background 0.2s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(255,255,255,0.03); }
.ticket-id { color: rgba(255,255,255,0.3); font-weight: 700; font-size: 12px; }
.ticket-title { font-weight: 600; color: #fff; }
.ticket-creator { color: rgba(255,255,255,0.5); }
.ticket-parts { color: #60a5fa; font-weight: 700; }
.ticket-date { color: rgba(255,255,255,0.35); font-size: 12.5px; }
</style>
