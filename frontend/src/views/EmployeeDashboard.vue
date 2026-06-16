<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { LayoutDashboard, Clock, PenTool, CheckCircle, Plus, ChevronRight, Zap, BookOpen, Bell, Shield, Download, ExternalLink } from 'lucide-vue-next';

const auth = useAuthStore();
const transStore = useTranslationStore();
const router = useRouter();
const tickets = ref([]);
const loading = ref(true);

const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    tickets.value = await res.json();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);

// Statistiques calculées
const stats = computed(() => {
  return {
    total: tickets.value.length,
    pending: tickets.value.filter(t => t.status === 'PENDING').length,
    inProgress: tickets.value.filter(t => t.status === 'IN_PROGRESS').length,
    done: tickets.value.filter(t => t.status === 'REPAIRED').length
  };
});

const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };
const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });

// 📚 Données Mock pour la Bibliothèque
const resources = [
  { id: 1, title: 'Guide Sécurité A1', type: 'PDF', machine: 'Presse Hydraulique' },
  { id: 2, title: 'Maintenance Préventive', type: 'Vidéo', machine: 'Robot Kuka' },
  { id: 3, title: 'Schéma Électrique V4', type: 'Image', machine: 'Tapis Roulant' }
];

// 🔔 Notifications fictives
const notifications = [
  { id: 1, text: 'Réparation du ticket #39 terminée', time: 'Il y a 2h', type: 'success' },
  { id: 2, text: 'Maintenance générale prévue demain', time: 'Il y a 5h', type: 'info' }
];
</script>

<template>
  <AppLayout>
    <div class="page">
      <!-- Section Hero / Bienvenue -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>{{ transStore.t('employee.personalSpace') }}</h1>
          <p class="hero-sub">{{ transStore.t('tech.greeting') }}, {{ auth.userName }}</p>
        </div>
        <button @click="router.push('/nouvelle-demande')" class="btn-new-hero">
          <Zap :size="18" /> {{ transStore.t('employee.reportProblem') }}
        </button>
      </div>

      <!-- Cartes KPI Premium -->
      <div class="stats-grid">
        <div class="stat-card glass blue">
          <div class="stat-icon"><LayoutDashboard :size="24" color="#3b82f6" /></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">{{ transStore.t('employee.totalRequests') }}</span>
          </div>
        </div>
        <div class="stat-card glass yellow">
          <div class="stat-icon"><Clock :size="24" color="#f59e0b" /></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">{{ transStore.t('dashboard.pending') }}</span>
          </div>
        </div>
        <div class="stat-card glass orange">
          <div class="stat-icon"><PenTool :size="24" color="#ef4444" /></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.inProgress }}</span>
            <span class="stat-label">{{ transStore.t('dashboard.inProgress') }}</span>
          </div>
        </div>
        <div class="stat-card glass green">
          <div class="stat-icon"><CheckCircle :size="24" color="#10b981" /></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.done }}</span>
            <span class="stat-label">{{ transStore.t('dashboard.completed') }}</span>
          </div>
        </div>
      </div>

      <!-- Contenu Principal -->
      <div class="dashboard-content">
        <div class="section-title">
          <h2><PenTool :size="18" /> {{ transStore.t('employee.recentRequests') }}</h2>
        </div>

        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>{{ transStore.t('common.loading') }}</p>
        </div>

        <div v-else-if="tickets.length === 0" class="empty-state">
          <div class="empty-illustration">📭</div>
          <h3>{{ transStore.t('employee.noRequests') }}</h3>
          <button @click="router.push('/nouvelle-demande')" class="btn-new">➕ {{ transStore.t('employee.createTicket') }}</button>
        </div>

        <div v-else class="tickets-list">
          <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card" @click="router.push(`/mes-demandes/${ticket.id}`)">
            <div class="ticket-header">
              <span class="ticket-id">#{{ ticket.id }}</span>
              <span :class="['status-badge', statusClass[ticket.status]]">{{ transStore.label('status', ticket.status) }}</span>
            </div>
            <h3 class="ticket-title">{{ ticket.title }}</h3>
            <div class="ticket-footer">
              <span class="f-value">{{ formatDate(ticket.createdAt) }}</span>
              <span class="f-link">{{ transStore.t('common.details') }} <ChevronRight :size="14" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 40px; color: #fff; max-width: 1400px; margin: 0 auto; }

/* Hero Section */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(223, 75, 55, 0.1) 0%, rgba(30, 41, 59, 0) 100%);
  border: 1px solid rgba(223, 75, 55, 0.2);
  padding: 30px 40px;
  border-radius: 24px;
  margin-bottom: 40px;
}
.hero-section h1 { font-size: 32px; font-weight: 900; margin: 0 0 8px; font-family: 'Orbitron', sans-serif; }
.hero-sub { color: rgba(255,255,255,0.5); font-size: 15px; margin: 0; }
.btn-new-hero {
  background: #DF4B37; color: #fff; border: none; padding: 16px 28px; border-radius: 14px;
  font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 12px;
  transition: all 0.3s;
}

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
.stat-card {
  padding: 24px; border-radius: 20px; display: flex; align-items: center; gap: 20px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
}
.stat-icon { background: rgba(255,255,255,0.05); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 24px; font-weight: 800; }
.stat-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; }

/* Layout Grid */
.main-dashboard-grid { display: grid; grid-template-columns: 1fr 340px; gap: 30px; }

/* Side Cards */
.side-card { padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; background: rgba(255,255,255,0.02); }
.side-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.side-card-header h3 { font-size: 13px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 10px; margin: 0; }

/* Notifications */
.notif-list { display: flex; flex-direction: column; gap: 16px; }
.notif-item { display: flex; gap: 12px; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.notif-dot.success { background: #10b981; box-shadow: 0 0 8px #10b981; }
.notif-dot.info { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }

/* Library */
.resource-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 8px; cursor: pointer; }
.res-icon { color: #DF4B37; }
.res-info strong { display: block; font-size: 13px; }
.res-info span { font-size: 11px; color: rgba(255,255,255,0.3); }

/* Tickets */
.tickets-list { display: flex; flex-direction: column; gap: 16px; }

.ticket-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card:hover {
  border-color: #DF4B37;
  background: rgba(223, 75, 55, 0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-id {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
}

.ticket-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-align: left;
}

.ticket-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 12px;
  margin-top: 4px;
}

.f-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.f-link {
  font-size: 12px;
  color: #DF4B37;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.2s ease;
}

.ticket-card:hover .f-link {
  gap: 8px;
}

.status-badge { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
.status-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.status-inprogress { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
.status-done { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.btn-outline-small { width: 100%; background: none; border: 1px solid #DF4B37; color: #DF4B37; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 700; }
</style>

