<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';
import { useRouter, useRoute } from 'vue-router';
import { 
  LayoutDashboard, Wrench, Package, BarChart3, Users,
  ClipboardList, History, FileText, PlusCircle,
  LogOut, Bell, Shield, BookOpen, ExternalLink,
  Ticket
} from 'lucide-vue-next';
import BrandLogo from './BrandLogo.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';

const auth = useAuthStore();
const transStore = useTranslationStore();
const router = useRouter();
const route = useRoute();

const notifications = ref([]);
const pendingTickets = ref(0);
const pendingRequests = ref(0);
let interval = null;

const resources = ref([
  { id: 1, title: 'Guide Sécurité A1', machine: 'Presse' },
  { id: 2, title: 'Maintenance Robot', machine: 'Kuka' }
]);

const fetchNotifications = async () => {
    const h = { Authorization: `Bearer ${auth.token}` };
    try {
        const nRes = await fetch(`${API_BASE_URL}/notifications`, { headers: h });
        const nData = await nRes.json();
        notifications.value = Array.isArray(nData) ? nData : [];

        if (auth.isAdmin) {
            const [tRes, rRes] = await Promise.all([
                fetch(`${API_BASE_URL}/tickets`, { headers: h }),
                fetch(`${API_BASE_URL}/requests`, { headers: h })
            ]);
            const tData = await tRes.json();
            const rData = await rRes.json();
            
            const tickets = Array.isArray(tData) ? tData : [];
            const requests = Array.isArray(rData) ? rData : [];
            
            pendingTickets.value = tickets.filter(t => t.status === 'PENDING').length;
            pendingRequests.value = requests.length;
        }
    } catch (e) {
        console.error('Failed to fetch notifications', e);
    }
};

onMounted(() => {
  fetchNotifications();
  if (auth.isAdmin) {
    interval = setInterval(fetchNotifications, 15000);
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

const totalAlerts = computed(() => pendingTickets.value + pendingRequests.value);

const menuItems = computed(() => {
  const _lang = transStore.currentLang;
  if (auth.isAdmin) {
    return [
      { name: transStore.t('layout.dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { name: transStore.t('layout.maintenance'), path: '/maintenance', icon: Wrench },
      { name: transStore.t('layout.stock'), path: '/stock', icon: Package },
      { name: transStore.t('layout.analytics'), path: '/analytics', icon: BarChart3 },
      { name: transStore.t('layout.library'), path: '/library', icon: BookOpen },
      { name: transStore.t('layout.users'), path: '/settings', icon: Users },
    ];
  } else if (auth.isTech) {
    return [
      { name: transStore.t('layout.myTickets'), path: '/mes-tickets', icon: ClipboardList },
      { name: transStore.t('layout.history'), path: '/historique', icon: History },
    ];
  } else {
    return [
      { name: transStore.t('layout.myRequests'), path: '/mes-demandes', icon: FileText },
      { name: transStore.t('layout.newRequest'), path: '/nouvelle-demande', icon: PlusCircle },
    ];
  }
});

const logout = () => {
  auth.logout();
  router.push('/login');
};

const markNotificationsAsRead = async () => {
  const h = { Authorization: `Bearer ${auth.token}` };
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-as-read`, {
      method: 'PUT',
      headers: h
    });
    if (res.ok) {
      notifications.value.forEach(n => n.isRead = true);
    }
  } catch (e) {
    console.error('Failed to mark notifications as read', e);
  }
};

const formatDate = (d) => transStore.formatDate(d);
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <BrandLogo :size="40" />
      </div>

      <nav class="nav-links">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <component :is="item.icon" class="nav-icon" :size="18" />
          <span class="nav-label">{{ item.name }}</span>
        </router-link>

        <template v-if="auth.isEmployee || auth.isTech">
          <div class="sidebar-divider"></div>
          
          <div class="sidebar-extra-section">
            <h4 class="extra-title"><Bell :size="12" /> {{ transStore.t('common.notifications') }}</h4>
            <div class="mini-notif-list">
              <div v-for="n in notifications" :key="n.id" class="mini-notif" :title="n.title">
                <div class="mini-dot" :class="n.type.toLowerCase()"></div>
                <span>{{ n.message }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-extra-section">
            <h4 class="extra-title"><BookOpen :size="12" /> {{ transStore.t('common.library') }}</h4>
            <div class="mini-res-list">
              <div v-for="res in resources" :key="res.id" class="mini-res" @click="router.push({ name: 'Library', query: { open: res.id } })">
                <ExternalLink :size="12" />
                <span>{{ res.title }}</span>
              </div>
            </div>
          </div>

          <button @click="router.push('/profile')" class="sidebar-profile-btn">
            <Shield :size="14" /> {{ transStore.t('common.myAccount') }}
          </button>
        </template>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <LogOut :size="16" /> {{ transStore.t('common.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-container">
      <header class="top-header">
        <div class="header-left">
          <span class="role-chip">{{ transStore.label('roles', auth.user?.role) }}</span>
        </div>
        <div class="header-right">
          <LanguageSwitcher compact />

          <!-- Notifications -->
          <div class="relative group">
            <button class="notification-bell">
              <Bell :size="18" class="bell-icon" />
              <span v-if="notifications.some(n => !n.isRead)" class="badge"></span>
            </button>
            
            <!-- Dropdown des notifications -->
            <div class="notification-dropdown">
              <div class="notif-header">
                <h3>Notifications</h3>
                <button @click="markNotificationsAsRead" class="mark-read">Marquer tout comme lu</button>
              </div>
              <div v-if="notifications.length === 0" class="notif-empty">
                Aucune notification
              </div>
              <div v-else class="notif-list">
                <div v-for="n in notifications" :key="n.id" class="notif-item" :class="{ unread: !n.isRead }">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-msg">{{ n.message }}</p>
                  <span class="notif-time">{{ formatDate(n.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="user-info">
            <div class="user-text">
              <p class="user-name">{{ auth.user?.name }}</p>
              <p class="user-email">{{ auth.user?.email }}</p>
            </div>
            <div class="avatar">{{ auth.user?.name?.charAt(0) }}</div>
          </div>
        </div>
      </header>

      <main class="content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #0a0c10; }

/* Sidebar */
.sidebar { width: 260px; background: #0f1115; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
.logo { padding: 32px 24px; display: flex; align-items: center; gap: 14px; }
.logo-hex { width: 40px; height: 40px; background: rgba(223,75,55,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(223,75,55,0.2); }
.logo-text { display: flex; flex-direction: column; line-height: 1; }
.brand { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 18px; color: #fff; letter-spacing: 2px; }
.brand-sub { font-family: 'Orbitron', sans-serif; font-weight: 400; font-size: 10px; color: #DF4B37; letter-spacing: 4px; margin-top: 2px; }

.nav-links { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: rgba(255,255,255,0.4); text-decoration: none; font-size: 14px; font-weight: 600; transition: all 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
.nav-item.active { background: rgba(223,75,55,0.08); color: #DF4B37; border: 1px solid rgba(223,75,55,0.15); }
.nav-icon { opacity: 0.7; transition: transform 0.2s; }
.nav-item.active .nav-icon { opacity: 1; transform: scale(1.1); }

/* Sidebar Extras */
.sidebar-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 16px 12px; } /* Forced refresh cache */
.sidebar-extra-section { padding: 0 16px; margin-bottom: 24px; }
.extra-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }

.mini-notif-list, .mini-res-list { display: flex; flex-direction: column; gap: 10px; }
.mini-notif, .mini-res { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,0.5); transition: color 0.2s; cursor: pointer; }
.mini-notif:hover, .mini-res:hover { color: #fff; }
.mini-dot { width: 6px; height: 6px; border-radius: 50%; }
.mini-dot.success { background: #10b981; }
.mini-dot.info { background: #3b82f6; }

.sidebar-profile-btn { margin: 0 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
.sidebar-profile-btn:hover { background: rgba(223,75,55,0.1); border-color: rgba(223,75,55,0.3); color: #DF4B37; }

.sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
.logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); color: #f87171; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em; }
.logout-btn:hover { background: #ef4444; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.2); }

/* Main */
.main-container { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
.top-header { height: 80px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(10,12,16,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 90; }

.header-right { display: flex; align-items: center; gap: 24px; }
.notification-bell { position: relative; cursor: pointer; padding: 10px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; color: rgba(255,255,255,0.6); }
.notification-bell:hover { background: rgba(255,255,255,0.06); color: #ffbf00; transform: translateY(-2px); }
.badge { position: absolute; top: -5px; right: -5px; background: #DF4B37; color: #fff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 8px; border: 2px solid #0f1115; }

.relative { position: relative; }

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 340px;
  background: #12161f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: none;
}

.relative:hover .notification-dropdown,
.group:hover .notification-dropdown {
  display: block;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.notif-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.mark-read {
  background: none;
  border: none;
  font-size: 11px;
  color: #DF4B37;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
  transition: opacity 0.2s;
}

.mark-read:hover {
  opacity: 0.8;
}

.notif-empty {
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.notif-list {
  max-height: 280px;
  overflow-y: auto;
}

.notif-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  text-align: left;
  transition: background 0.2s;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.notif-item.unread {
  background: rgba(223, 75, 55, 0.05);
  border-left: 3px solid #DF4B37;
}

.notif-title {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.notif-msg {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.notif-time {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
}
.bell-popup p { margin: 0; font-size: 12px; color: rgba(255,255,255,0.6); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.bell-popup p:last-child { border-bottom: none; }

.role-chip { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 12px; border-radius: 20px; background: rgba(223,75,55,0.1); color: #DF4B37; border: 1px solid rgba(223,75,55,0.2); }
.user-info { display: flex; align-items: center; gap: 14px; }
.user-text { text-align: right; }
.user-name { font-size: 14px; font-weight: 700; margin: 0; color: #fff; }
.user-email { font-size: 11px; color: rgba(255,255,255,0.3); margin: 0; }
.avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #DF4B37, #ff6b6b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 16px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 10px rgba(223,75,55,0.3); }

.content { flex: 1; }
</style>
