<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler,
  BarElement
} from 'chart.js';
import { Doughnut, Line, Bar } from 'vue-chartjs';
import { Brain, TrendingUp, AlertCircle, Activity, Box, Database, BarChart3, Zap, Monitor, Globe, HardDrive, Settings } from 'lucide-vue-next';

ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler,
  BarElement
);

const auth = useAuthStore();
const transStore = useTranslationStore();
const tickets = ref([]);
const stats = ref({ avgResolutionTime: 0, totalConsumption: 0 });
const loading = ref(true);

const fetchAnalytics = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    tickets.value = await res.json();
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/stats`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    stats.value = await res.json();
  } catch (err) {
    console.error("Stats error:", err);
  }
};

const predictions = ref([]);
const fetchPredictions = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/parts/predictions`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const data = await res.json();
    if (data.predictions) {
      predictions.value = data.predictions;
    }
  } catch (err) {
    console.error("Erreur IA:", err);
  }
};

onMounted(() => {
  fetchAnalytics();
  fetchStats();
  fetchPredictions();
});

const typeStats = computed(() => {
  const stats = { HARDWARE: 0, SOFTWARE: 0, NETWORK: 0, OTHER: 0 };
  tickets.value.forEach(t => {
    if (stats[t.type] !== undefined) stats[t.type]++;
    else stats.OTHER++;
  });
  return stats;
});

const priorityStats = computed(() => {
  const stats = { LOW: 0, NORMAL: 0, URGENT: 0 };
  tickets.value.forEach(t => {
    if (stats[t.priority] !== undefined) stats[t.priority]++;
  });
  return stats;
});

const total = computed(() => tickets.value.length);
const getPercent = (val) => total.value ? Math.round((val / total.value) * 100) : 0;

const doughnutData = computed(() => ({
  labels: ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER'].map((k) => transStore.label('type', k)),
  datasets: [{
    backgroundColor: ['#ff4d4d', '#3b82f6', '#10b981', '#f59e0b'],
    hoverBackgroundColor: ['#ff6666', '#60a5fa', '#34d399', '#fbbf24'],
    borderColor: 'rgba(20, 23, 27, 1)',
    borderWidth: 5,
    hoverOffset: 15,
    data: [typeStats.value.HARDWARE, typeStats.value.SOFTWARE, typeStats.value.NETWORK, typeStats.value.OTHER]
  }]
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11, weight: '600' }, padding: 25, usePointStyle: true } },
    tooltip: { backgroundColor: 'rgba(20, 23, 27, 0.9)', titleFont: { size: 14 }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 10 }
  },
  cutout: '75%'
};

const evolutionData = computed(() => {
  const _lang = transStore.currentLang;
  const dateOpts = { day: 'numeric', month: 'short' };
  const days = {};
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days[transStore.formatDate(d, dateOpts)] = 0;
  }
  tickets.value.forEach(t => {
    const dateLabel = transStore.formatDate(t.createdAt, dateOpts);
    if (days[dateLabel] !== undefined) days[dateLabel]++;
  });
  return {
    labels: Object.keys(days),
    datasets: [{
      label: 'Activity',
      backgroundColor: 'rgba(255, 77, 77, 0.1)',
      borderColor: '#ff4d4d',
      borderWidth: 3,
      pointBackgroundColor: '#ff4d4d',
      pointBorderColor: 'rgba(255,255,255,0.2)',
      pointBorderWidth: 2,
      pointRadius: 4,
      tension: 0.45,
      fill: true,
      data: Object.values(days)
    }]
  };
});

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } }
  }
};

const priorityChartData = computed(() => {
  return {
    labels: ['LOW', 'NORMAL', 'URGENT'].map((k) => transStore.label('priority', k)),
    datasets: [{
      label: transStore.t('analyticsPage.totalReports') || 'Tickets',
      backgroundColor: [
        'rgba(16, 185, 129, 0.25)',
        'rgba(59, 130, 246, 0.25)',
        'rgba(255, 77, 77, 0.25)'
      ],
      borderColor: ['#10b981', '#3b82f6', '#ff4d4d'],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: [
        'rgba(16, 185, 129, 0.45)',
        'rgba(59, 130, 246, 0.45)',
        'rgba(255, 77, 77, 0.45)'
      ],
      data: [priorityStats.value.LOW, priorityStats.value.NORMAL, priorityStats.value.URGENT]
    }]
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(20, 23, 27, 0.9)',
      titleFont: { size: 14, weight: '700' },
      bodyFont: { size: 13 },
      padding: 12,
      borderRadius: 10,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1
    }
  },
  scales: {
    y: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: '600' } }
    },
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11, weight: '600' } }
    }
  }
};

// 🤖 IA : Calcul du Score de Santé des Machines
const healthScores = computed(() => {
  const categories = [
    { type: 'HARDWARE', icon: Monitor },
    { type: 'NETWORK', icon: Globe },
    { type: 'SOFTWARE', icon: HardDrive },
    { type: 'OTHER', icon: Settings }
  ];

  return categories.map(cat => {
    // On commence à 100%
    // On enlève 20% par ticket URGENT non résolu
    // On enlève 10% par ticket NORMAL non résolu
    const activeTickets = tickets.value.filter(t => t.type === cat.type && t.status !== 'REPAIRED');
    const penalty = activeTickets.reduce((acc, t) => {
      return acc + (t.priority === 'HIGH' || t.priority === 'URGENT' ? 25 : 10);
    }, 0);

    const score = Math.max(5, 100 - penalty);
    return {
      ...cat,
      label: transStore.label('type', cat.type),
      score,
      tickets: activeTickets.length
    };
  });
});

const getHealthColor = (score) => {
  if (score > 75) return '#10b981';
  if (score > 40) return '#f59e0b';
  return '#ff4d4d';
};

const getHealthStatus = (score) => {
  if (score > 75) return transStore.t('analyticsPage.optimal');
  if (score > 40) return transStore.t('analyticsPage.degraded');
  return transStore.t('analyticsPage.critical');
};
</script>

<template>
  <AppLayout>
    <div class="analytics-container">
      <div class="bg-glow"></div>
      
      <header class="hero-header">
        <div class="header-content">
          <div class="badge-row">
            <span class="live-tag"><Activity :size="10" /> {{ transStore.t('analyticsPage.tag') }}</span>
            <span class="version-tag">{{ transStore.t('analyticsPage.version') }}</span>
          </div>
          <h1 class="hero-title">{{ transStore.t('analyticsPage.title') }}</h1>
          <p class="header-desc">{{ transStore.t('analyticsPage.subtitle') }}</p>
        </div>
      </header>

      <div v-if="loading" class="loader-wrap">
        <div class="orbit-loader"></div>
        <p>{{ transStore.t('analyticsPage.syncing') }}</p>
      </div>

      <template v-else>
        <!-- Hero KPI Cards (Style Dribbble) -->
        <div class="hero-kpi-row">
          <div class="hero-card violet-gradient">
            <div class="hero-card-content">
              <span class="hero-lbl">{{ transStore.t('analyticsPage.avgResolution') }}</span>
              <h2 class="hero-val">{{ stats.avgResolutionTime }}<small>h</small> 15<small>m</small></h2>
              <div class="hero-icon"><Zap :size="40" /></div>
            </div>
            <div class="hero-wave"></div>
          </div>
          <div class="hero-card cyan-gradient">
            <div class="hero-card-content">
              <span class="hero-lbl">{{ transStore.t('analyticsPage.totalConsumption') }}</span>
              <h2 class="hero-val">{{ stats.totalConsumption }}<small> units</small></h2>
              <div class="hero-icon"><Box :size="40" /></div>
            </div>
            <div class="hero-wave"></div>
          </div>
        </div>

        <!-- KPI Row -->
        <div class="kpi-grid">
          <div class="kpi-card glass">
            <div class="kpi-icon-wrap"><BarChart3 color="#ff4d4d" :size="20" /></div>
            <div class="kpi-data">
              <span class="kpi-val">{{ total }}</span>
              <span class="kpi-lbl">{{ transStore.t('analyticsPage.totalReports') }}</span>
            </div>
          </div>
          <div class="kpi-card glass">
            <div class="kpi-icon-wrap"><TrendingUp color="#10b981" :size="20" /></div>
            <div class="kpi-data">
              <span class="kpi-val ok">{{ getPercent(tickets.filter(t => t.status === 'REPAIRED').length) }}%</span>
              <span class="kpi-lbl">{{ transStore.t('analyticsPage.resolveRate') }}</span>
            </div>
          </div>
        </div>

        <!-- 🤖 NOUVEAU : État de Santé du Parc Industriel (IA) -->
        <div class="health-section glass-premium">
          <div class="card-head">
            <h3><Activity :size="14" /> {{ transStore.t('analyticsPage.healthTitle') }}</h3>
            <span class="ia-badge">PREDICTIVE MODE</span>
          </div>
          
          <div class="health-grid">
            <div v-for="machine in healthScores" :key="machine.type" class="health-item">
              <div class="health-info">
                <span class="h-icon">
                  <component :is="machine.icon" :size="20" :color="getHealthColor(machine.score)" />
                </span>
                <div class="h-text">
                  <strong>{{ machine.label }}</strong>
                  <p>{{ machine.tickets }} incident(s) actifs</p>
                </div>
                <div class="h-score" :style="{ color: getHealthColor(machine.score) }">
                  {{ machine.score }}%
                </div>
              </div>
              <div class="h-gauge-bg">
                <div class="h-gauge-fill" :style="{ width: machine.score + '%', backgroundColor: getHealthColor(machine.score), boxShadow: `0 0 10px ${getHealthColor(machine.score)}` }"></div>
              </div>
              <div class="h-status-label" :style="{ color: getHealthColor(machine.score) }">
                {{ getHealthStatus(machine.score) }}
              </div>
            </div>
          </div>
        </div>


        <div class="main-viz-grid">
          <!-- Incident DNA -->
          <div class="viz-card glass-premium main-viz">
            <div class="card-head">
              <h3><Database :size="14" /> {{ transStore.t('analyticsPage.incidentDist') }}</h3>
            </div>
            <div class="chart-box">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Trend Analysis -->
          <div class="viz-card glass-premium side-viz">
            <div class="card-head">
              <h3><Activity :size="14" /> {{ transStore.t('analyticsPage.volumeTrend') }}</h3>
            </div>
            <div class="chart-box">
              <Line :data="evolutionData" :options="lineOptions" />
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="viz-card glass-premium priority-viz">
            <div class="card-head">
              <h3><BarChart3 :size="14" /> {{ transStore.t('analyticsPage.priorityDist') }}</h3>
            </div>
            <div class="chart-box">
              <Bar :data="priorityChartData" :options="barOptions" />
            </div>
          </div>

          <!-- AI Intelligence -->
          <div class="viz-card glass-premium ai-terminal">
            <div class="ai-header">
              <div class="ai-title-wrap">
                <div class="ai-icon-pulse"><Brain :size="24" /></div>
                <div>
                  <h4>{{ transStore.t('analyticsPage.predictive') }}</h4>
                  <p>AI Stock Forecasting</p>
                </div>
              </div>
              <div class="ai-status">ACTIVE</div>
            </div>
            <div class="ai-content">
              <div v-if="predictions.length === 0">
                <p class="ai-message" style="color: #60a5fa">{{ transStore.t('analyticsPage.aiAnalyzing') }}</p>
              </div>
              <div v-else class="predictions-list">
                <div v-for="(pred, idx) in predictions" :key="idx" :class="['ai-pred-card', pred.status.toLowerCase()]">
                  <div class="pred-head">
                    <strong>{{ pred.partName }}</strong>
                    <span class="pred-badge">{{ pred.status }}</span>
                  </div>
                  <p>{{ pred.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert Feed -->
          <div class="viz-card glass-premium alerts-terminal">
            <div class="card-head">
              <h3>{{ transStore.t('analyticsPage.criticalFeed') }}</h3>
            </div>
            <div class="alert-feed">
              <div v-for="t in tickets.filter(t => t.priority === 'URGENT').slice(0, 3)" :key="t.id" class="alert-item">
                <div class="alert-mark"></div>
                <div class="alert-info">
                  <p>{{ t.title }}</p>
                  <small>{{ t.creator?.name }} • {{ t.type }}</small>
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;800&display=swap');

.analytics-container {
  padding: 40px 50px;
  background: #0a0c10;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 77, 77, 0.08) 0%, rgba(255, 77, 77, 0) 70%);
  filter: blur(80px);
  pointer-events: none;
}

.hero-header { margin-bottom: 40px; position: relative; z-index: 10; }
.badge-row { display: flex; gap: 10px; margin-bottom: 12px; }
.live-tag { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 4px; display: flex; align-items: center; gap: 6px; letter-spacing: 0.1em; border: 1px solid rgba(255, 77, 77, 0.2); }
.version-tag { background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.4); font-size: 9px; font-weight: 800; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1); }

.hero-title { font-family: 'Orbitron', sans-serif; font-size: 40px; font-weight: 900; letter-spacing: 2px; margin: 0 0 8px; }
.glow-text { color: #fff; text-shadow: 0 0 20px rgba(255, 77, 77, 0.5); }
.header-desc { color: rgba(255, 255, 255, 0.4); font-size: 15px; max-width: 600px; line-height: 1.6; }

.hero-kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.hero-card { position: relative; height: 160px; border-radius: 24px; overflow: hidden; color: #fff; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.hero-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
.hero-card-content { position: relative; z-index: 5; padding: 30px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.violet-gradient { background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); }
.cyan-gradient { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); }
.hero-lbl { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.hero-val { font-size: 40px; font-weight: 900; font-family: 'Orbitron', sans-serif; margin: 0; }
.hero-val small { font-size: 16px; opacity: 0.6; font-weight: 400; font-family: 'Inter', sans-serif; }
.hero-icon { position: absolute; top: 30px; right: 30px; opacity: 0.2; transform: rotate(-10deg); transition: 0.3s; }
.hero-card:hover .hero-icon { opacity: 0.5; transform: rotate(0deg) scale(1.1); }
.hero-wave { position: absolute; bottom: 0; right: 0; width: 100%; height: 60px; background: rgba(255,255,255,0.1); clip-path: polygon(0 65%, 15% 55%, 35% 75%, 65% 35%, 85% 65%, 100% 45%, 100% 100%, 0 100%); }

.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
.kpi-card { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px; transition: all 0.3s; }
.kpi-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.04); }
.kpi-icon-wrap { width: 48px; height: 48px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.05); }
.kpi-data { display: flex; flex-direction: column; }
.kpi-val { font-size: 28px; font-weight: 800; font-family: 'Orbitron', sans-serif; }
.kpi-val.urgent { color: #fb923c; }
.kpi-val.ok { color: #10b981; }
.kpi-lbl { font-size: 11px; text-transform: uppercase; font-weight: 700; color: rgba(255, 255, 255, 0.3); letter-spacing: 0.1em; margin-top: 2px; }

.main-viz-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
.viz-card { border-radius: 24px; padding: 30px; }
.glass { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); backdrop-filter: blur(10px); }
.glass-premium { background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(15px); }
.priority-viz {
  grid-column: span 2;
  background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(20,23,27,0.4) 100%);
}

@media (max-width: 1024px) {
  .main-viz-grid {
    grid-template-columns: 1fr !important;
  }
  .priority-viz {
    grid-column: span 1 !important;
  }
}

.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.card-head h3 { font-size: 12px; font-weight: 800; color: rgba(255, 255, 255, 0.5); letter-spacing: 0.15em; display: flex; align-items: center; gap: 10px; }

.chart-box { height: 260px; position: relative; }

.ai-terminal { background: linear-gradient(135deg, rgba(255, 77, 77, 0.08) 0%, rgba(10, 12, 16, 1) 100%); border-color: rgba(255, 77, 77, 0.25); }
.ai-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.ai-title-wrap { display: flex; gap: 16px; align-items: center; }
.ai-icon-pulse { color: #ff4d4d; filter: drop-shadow(0 0 8px #ff4d4d); animation: ai-pulse 2s infinite; }
@keyframes ai-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
.ai-title-wrap h4 { font-family: 'Orbitron', sans-serif; font-size: 15px; margin: 0; color: #fff; }
.ai-title-wrap p { font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 2px 0 0; }
.ai-status { font-size: 9px; font-weight: 900; color: #10b981; border: 1px solid #10b981; padding: 2px 8px; border-radius: 4px; }

.ai-content { display: flex; flex-direction: column; gap: 20px; }
.ai-message { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); }
.highlight { color: #ff4d4d; font-weight: 800; }
.ai-pred-card { padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid transparent; background: rgba(0,0,0,0.2); }
.ai-pred-card p { font-size: 13px; margin: 4px 0 0; color: rgba(255,255,255,0.7); }
.pred-head { display: flex; justify-content: space-between; align-items: center; }
.pred-head strong { font-size: 14px; font-family: 'Orbitron', sans-serif; }
.pred-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
.ai-pred-card.critical { border-left-color: #ff4d4d; }
.ai-pred-card.critical .pred-badge { background: rgba(255,77,77,0.2); color: #ff4d4d; }
.ai-pred-card.warning { border-left-color: #fbbf24; }
.ai-pred-card.warning .pred-badge { background: rgba(251,191,36,0.2); color: #fbbf24; }
.ai-pred-card.safe { border-left-color: #10b981; }
.ai-pred-card.safe .pred-badge { background: rgba(16,185,129,0.2); color: #10b981; }
.predictions-list { max-height: 200px; overflow-y: auto; padding-right: 5px; }

.alert-feed { display: flex; flex-direction: column; gap: 14px; }
.alert-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); }
.alert-mark { width: 6px; height: 6px; border-radius: 50%; background: #ff4d4d; box-shadow: 0 0 10px #ff4d4d; }
.alert-info p { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
.alert-info small { font-size: 11px; color: rgba(255, 255, 255, 0.3); }

.loader-wrap { padding: 100px; text-align: center; }
.orbit-loader { width: 40px; height: 40px; border: 3px solid rgba(255, 77, 77, 0.1); border-top-color: #ff4d4d; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 🤖 NOUVEAU : Styles Section Santé IA */
.health-section {
  padding: 30px;
  border-radius: 24px;
  margin-bottom: 32px;
  background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(10,12,16,1) 100%);
}
.ia-badge {
  font-size: 9px;
  background: #ff4d4d;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 900;
  letter-spacing: 1px;
}
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 20px;
}
.health-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 16px;
  transition: 0.3s;
}
.health-item:hover {
  background: rgba(255,255,255,0.04);
  transform: translateY(-5px);
}
.health-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}
.h-icon {
  font-size: 24px;
  background: rgba(255,255,255,0.03);
  padding: 10px;
  border-radius: 12px;
}
.h-text { flex: 1; }
.h-text strong { display: block; font-size: 14px; font-family: 'Orbitron', sans-serif; }
.h-text p { font-size: 11px; color: rgba(255,255,255,0.4); margin: 2px 0 0; }
.h-score { font-size: 18px; font-weight: 900; font-family: 'Orbitron', sans-serif; }

.h-gauge-bg {
  height: 6px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}
.h-gauge-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.h-status-label {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
  text-align: right;
}
</style>

