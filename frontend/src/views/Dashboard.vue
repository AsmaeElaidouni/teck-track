<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { useRouter } from 'vue-router';
import { 
  Ticket, Clock, Wrench, CheckCircle, 
  Package, AlertTriangle, UserCheck, Users,
  TrendingDown, Zap
} from 'lucide-vue-next';

const auth = useAuthStore();
const transStore = useTranslationStore();
const router = useRouter();
const tickets = ref([]);
const parts = ref([]);
const users = ref([]);
const loading = ref(true);

const fetchAll = async () => {
  const h = { Authorization: `Bearer ${auth.token}` };
  try {
    const [tRes, pRes, uRes] = await Promise.all([
      fetch(`${API_BASE_URL}/tickets`, { headers: h }),
      fetch(`${API_BASE_URL}/parts`, { headers: h }),
      fetch(`${API_BASE_URL}/users`, { headers: h }),
    ]);
    tickets.value = await tRes.json();
    parts.value = await pRes.json();
    users.value = await uRes.json();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAll);

const stats = computed(() => {
  const _lang = transStore.currentLang;
  return [
  { label: transStore.t('dashboard.totalTickets'), value: tickets.value.length, color: '#DF4B37', icon: Ticket, link: '/maintenance' },
  { label: transStore.t('dashboard.pending'), value: tickets.value.filter(t => t.status === 'PENDING').length, color: '#fbbf24', icon: Clock, link: '/maintenance' },
  { label: transStore.t('dashboard.inProgress'), value: tickets.value.filter(t => t.status === 'IN_PROGRESS').length, color: '#60a5fa', icon: Wrench, link: '/maintenance' },
  { label: transStore.t('dashboard.completed'), value: tickets.value.filter(t => t.status === 'REPAIRED').length, color: '#34d399', icon: CheckCircle, link: '/maintenance' },
  { label: transStore.t('dashboard.partsInStock'), value: parts.value.reduce((a, p) => a + p.stock, 0), color: '#a78bfa', icon: Package, link: '/stock' },
  { label: transStore.t('dashboard.stockAlerts'), value: parts.value.filter(p => p.stock < p.minThreshold).length, color: '#fb923c', icon: AlertTriangle, link: '/stock' },
  { label: transStore.t('dashboard.technicians'), value: users.value.filter(u => u.role === 'TECHNICIAN').length, color: '#22d3ee', icon: UserCheck, link: '/settings' },
  { label: transStore.t('dashboard.employees'), value: users.value.filter(u => u.role === 'EMPLOYEE').length, color: '#4ade80', icon: Users, link: '/settings' },
];
});

// Smart Analysis Logic
const topPart = computed(() => {
  const counts = {};
  tickets.value.forEach(t => {
    t.consumptions?.forEach(c => {
      counts[c.part?.name] = (counts[c.part?.name] || 0) + c.quantity;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
});

const recentTickets = computed(() => [...tickets.value].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
const lowStockParts = computed(() => parts.value.filter(p => p.stock < p.minThreshold));
const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };
const formatDate = (d) => transStore.formatDate(d);
</script>

<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <p class="page-eyebrow">{{ transStore.t('dashboard.title') }}</p>
          <h1>COMMAND <span class="stroke">CENTER</span></h1>
          <p class="page-sub">{{ transStore.t('dashboard.subtitle') }}</p>
        </div>
        <div class="live-badge">
          <span class="live-dot"></span>
          {{ transStore.t('common.live') }}
        </div>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>

      <template v-else>
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stat-card" @click="router.push(s.link)">
            <div class="stat-header">
              <component :is="s.icon" class="stat-icon" :style="{ color: s.color }" :size="20" />
              <div class="stat-lbl">{{ s.label }}</div>
            </div>
            <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="left-col">
            <!-- Recent Tickets -->
            <div class="card mb-20">
              <div class="card-header">
                <h2><Ticket :size="16" class="inline-icon" /> {{ transStore.t('dashboard.recentTickets') }}</h2>
                <button @click="router.push('/maintenance')" class="see-all">{{ transStore.t('common.details') }} →</button>
              </div>
              <div v-if="recentTickets.length === 0" class="empty-card">{{ transStore.t('dashboard.noTickets') }}</div>
              <div v-for="t in recentTickets" :key="t.id" class="ticket-row" @click="router.push('/maintenance')">
                <div class="tr-left">
                  <span class="tr-id">#{{ t.id }}</span>
                  <div>
                    <p class="tr-title">{{ t.title }}</p>
                    <p class="tr-date">{{ formatDate(t.createdAt) }} — {{ t.creator?.name || '?' }}</p>
                  </div>
                </div>
                <span :class="['status-badge', statusClass[t.status]]">{{ transStore.label('status', t.status) }}</span>
              </div>
            </div>

            <!-- Smart Analysis Section -->
            <div class="card analysis-card">
              <div class="card-header">
                <h2><Zap :size="16" class="inline-icon" /> {{ transStore.t('dashboard.smartAnalysis') }}</h2>
                <span class="ai-chip">AUTO-DETECT</span>
              </div>
              <div v-if="topPart" class="analysis-box">
                <div class="analysis-icon"><TrendingDown :size="24" color="#DF4B37" /></div>
                <div class="analysis-text">
                  <p class="analysis-title"><strong>{{ topPart.name }}</strong> — {{ transStore.t('dashboard.smartAnalysis') }}</p>
                  <p class="analysis-sub">{{ transStore.t('analyticsPage.aiAnalyzing') }}</p>
                </div>
              </div>
              <div v-else class="empty-analysis">
                {{ transStore.t('analyticsPage.noPredictions') }}
              </div>
            </div>
          </div>

          <div class="right-col">
            <!-- Stock Alerts -->
            <div class="card">
              <div class="card-header">
                <h2><AlertTriangle :size="16" class="inline-icon" /> {{ transStore.t('dashboard.stockAlertsTitle') }}</h2>
                <button @click="router.push('/stock')" class="see-all">{{ transStore.t('common.details') }} →</button>
              </div>
              <div v-if="lowStockParts.length === 0" class="empty-card ok-state">✓ {{ transStore.t('dashboard.noAlerts') }}</div>
              <div v-for="p in lowStockParts" :key="p.id" class="alert-row" @click="router.push('/stock')">
                <div>
                  <p class="alert-name">{{ p.name }}</p>
                  <p class="alert-sub">{{ transStore.t('dashboard.minUnits', { n: p.minThreshold }) }}</p>
                </div>
                <div class="alert-stock" :class="p.stock === 0 ? 'stock-zero' : 'stock-low'">
                  {{ p.stock }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.page-eyebrow { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4em; color: #DF4B37; margin: 0 0 6px; }
h1 { font-size: 36px; font-weight: 900; font-family: 'Orbitron', sans-serif; margin: 0 0 6px; text-transform: uppercase; }
.stroke { color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.7); }
.page-sub { color: rgba(255,255,255,0.35); font-size: 13px; margin: 0; }
.live-badge { display: flex; align-items: center; gap: 8px; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25); border-radius: 20px; padding: 10px 18px; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; color: #34d399; margin-top: 8px; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.loading { text-align: center; padding: 80px; color: rgba(255,255,255,0.4); }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 14px; padding: 20px; transition: all 0.2s; cursor: pointer; }
.stat-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
.stat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.stat-icon { opacity: 0.8; }
.stat-num { font-size: 30px; font-weight: 900; margin-bottom: 4px; }
.stat-lbl { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; }

.content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; transition: border-color 0.2s; }
.card:hover { border-color: rgba(255,255,255,0.12); }
.mb-20 { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.card-header h2 { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.6); margin: 0; }
.inline-icon { opacity: 0.5; }
.see-all { background: none; border: none; color: rgba(255,255,255,0.3); font-size: 11px; font-weight: 800; cursor: pointer; transition: color 0.2s; text-transform: uppercase; letter-spacing: 0.05em; }
.see-all:hover { color: #DF4B37; }

.empty-card { text-align: center; padding: 30px; color: rgba(255,255,255,0.25); font-size: 12px; font-style: italic; }
.ok-state { color: #34d399 !important; font-weight: 700; }
.ticket-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; transition: background 0.2s; }
.ticket-row:hover { background: rgba(255,255,255,0.02); }
.ticket-row:last-child { border-bottom: none; }
.tr-left { display: flex; align-items: center; gap: 12px; }
.tr-id { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 700; min-width: 32px; }
.tr-title { font-size: 13.5px; font-weight: 600; margin: 0 0 2px; }
.tr-date { font-size: 11.5px; color: rgba(255,255,255,0.35); margin: 0; }
.status-badge { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 6px; flex-shrink: 0; }
.status-pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.status-inprogress { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
.status-done { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }

.alert-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.alert-row:hover { background: rgba(251,146,60,0.05); border-color: rgba(251,146,60,0.2); }
.alert-name { font-size: 13.5px; font-weight: 600; margin: 0 0 2px; }
.alert-sub { font-size: 11.5px; color: rgba(255,255,255,0.35); margin: 0; }
.alert-stock { font-size: 12px; font-weight: 900; padding: 4px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
.stock-low { background: rgba(251,146,60,0.1); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
.stock-zero { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

.analysis-card { background: linear-gradient(135deg, rgba(223,75,55,0.08) 0%, rgba(20,23,27,1) 100%); border-color: rgba(223,75,55,0.25); }
.ai-chip { background: #DF4B37; color: #fff; font-size: 9px; font-weight: 900; padding: 3px 10px; border-radius: 6px; letter-spacing: 0.1em; }
.analysis-box { display: flex; gap: 18px; align-items: center; padding: 8px; }
.analysis-icon { background: rgba(223,75,55,0.12); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0; border: 1px solid rgba(223,75,55,0.2); }
.analysis-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; line-height: 1.5; color: rgba(255,255,255,0.9); }
.analysis-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }
.empty-analysis { color: rgba(255,255,255,0.25); font-size: 12px; text-align: center; padding: 15px; font-style: italic; }
</style>
