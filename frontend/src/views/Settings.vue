<script setup>
import { API_BASE_URL } from '../config/apiBase';
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../store/auth';
import { useTranslationStore } from '../store/translation';

const auth = useAuthStore();
const transStore = useTranslationStore();
const activeTab = ref('users'); // 'users' or 'requests'

const users = ref([]);
const requests = ref([]);
const loading = ref(true);

const createModal = ref(false);
const form = ref({ name: '', email: '', password: '', role: 'EMPLOYEE' });
const formError = ref('');
const formSaving = ref(false);
const deleteConfirm = ref(null);

const fetchData = async () => {
  loading.value = true;
  const h = { Authorization: `Bearer ${auth.token}` };
  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`${API_BASE_URL}/users`, { headers: h }),
      fetch(`${API_BASE_URL}/requests`, { headers: h })
    ]);
    users.value = await uRes.json();
    requests.value = await rRes.json();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const createUser = async () => {
  formError.value = '';
  if (!form.value.name || !form.value.email || !form.value.password) {
    formError.value = transStore.t('errors.fillAll');
    return;
  }
  const emailRegex = /^[^\s@]+@snaj\.tech$/;
  if (!emailRegex.test(form.value.email)) {
    formError.value = transStore.t('errors.invalidEmail');
    return;
  }
  formSaving.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify(form.value)
    });
    if (res.ok) {
      createModal.value = false;
      form.value = { name: '', email: '', password: '', role: 'EMPLOYEE' };
      await fetchData();
    } else {
      const d = await res.json();
      formError.value = d.message || transStore.t('employee.createError');
    }
  } finally {
    formSaving.value = false;
  }
};

const deleteUser = async (id) => {
  await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  deleteConfirm.value = null;
  await fetchData();
};

const approveRequest = async (id) => {
  await fetch(`${API_BASE_URL}/requests/${id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  await fetchData();
};

const rejectRequest = async (id) => {
  await fetch(`${API_BASE_URL}/requests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  await fetchData();
};

const roleClass = { ADMIN: 'badge-admin', TECHNICIAN: 'badge-tech', EMPLOYEE: 'badge-employee' };
const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ transStore.t('settingsPage.title') }}</h1>
          <p class="page-sub">{{ transStore.t('settingsPage.title') }}</p>
        </div>
        <button v-if="activeTab === 'users'" @click="createModal = true" class="btn-create">➕ {{ transStore.t('settingsPage.createAccount') }}</button>
      </div>

      <div class="tabs">
        <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">{{ transStore.t('settingsPage.usersTab') }} ({{ users.length }})</button>
        <button @click="activeTab = 'requests'" :class="{ active: activeTab === 'requests' }">
          {{ transStore.t('settingsPage.requestsTab') }}
          <span v-if="requests.length > 0" class="req-count">{{ requests.length }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>

      <div v-else>
        <!-- Tab: Users -->
        <div v-if="activeTab === 'users'" class="table-wrapper">
          <div class="table-header">
            <span>#</span>
            <span>{{ transStore.t('settingsPage.colName') }}</span>
            <span>{{ transStore.t('settingsPage.colEmail') }}</span>
            <span>{{ transStore.t('settingsPage.colRole') }}</span>
            <span>{{ transStore.t('settingsPage.colCreated') }}</span>
            <span>{{ transStore.t('common.action') }}</span>
          </div>
          <div v-for="user in users" :key="user.id" class="table-row">
            <span class="cell-id">{{ user.id }}</span>
            <span class="cell-name">
              <div class="user-avatar-sm">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
              {{ user.name }}
            </span>
            <span class="cell-email">{{ user.email }}</span>
            <span><span :class="['role-badge', roleClass[user.role]]">{{ transStore.label('roles', user.role) }}</span></span>
            <span class="cell-date">{{ formatDate(user.createdAt) }}</span>
            <span>
              <button
                v-if="user.role !== 'ADMIN'"
                @click="deleteConfirm = user"
                class="btn-delete"
              >🗑</button>
            </span>
          </div>
        </div>

        <!-- Tab: Access Requests -->
        <div v-if="activeTab === 'requests'" class="requests-grid">
          <div v-if="requests.length === 0" class="empty-state">{{ transStore.t('employee.noRequests') }}</div>
          <div v-for="req in requests" :key="req.id" class="request-card">
            <div class="req-header">
              <div class="user-avatar-lg">{{ req.name?.charAt(0) }}</div>
              <div class="req-meta">
                <h3>{{ req.name }}</h3>
                <p>{{ req.email }}</p>
              </div>
            </div>
            <div class="req-info">
              <span class="label">{{ transStore.t('settingsPage.requestedRole') }}</span>
              <span :class="['role-badge', roleClass[req.role]]">{{ transStore.label('roles', req.role) }}</span>
            </div>
            <div class="req-actions">
              <button @click="rejectRequest(req.id)" class="btn-refuse">{{ transStore.t('settingsPage.reject') }}</button>
              <button @click="approveRequest(req.id)" class="btn-approve">{{ transStore.t('settingsPage.approve') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal (Original) -->
      <div v-if="createModal" class="modal-overlay" @click.self="createModal = false">
        <div class="modal">
          <h3>{{ transStore.t('settingsPage.createAccount') }}</h3>
          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="form-group">
            <label>{{ transStore.t('register.fullName') }}</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="Prénom Nom" />
          </div>
          <div class="form-group">
            <label>{{ transStore.t('settingsPage.colEmail') }}</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="exemple@snaj.tech" />
          </div>
          <div class="form-group">
            <label>{{ transStore.t('register.password') }}</label>
            <input v-model="form.password" type="password" class="form-input" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>{{ transStore.t('settingsPage.colRole') }}</label>
            <select v-model="form.role" class="form-input">
              <option value="EMPLOYEE">{{ transStore.label('roles', 'EMPLOYEE') }}</option>
              <option value="TECHNICIAN">{{ transStore.label('roles', 'TECHNICIAN') }}</option>
            </select>
          </div>

          <div class="modal-actions">
            <button @click="createModal = false" class="btn-cancel">{{ transStore.t('common.cancel') }}</button>
            <button @click="createUser" :disabled="formSaving" class="btn-confirm">
              {{ formSaving ? transStore.t('common.loading') : transStore.t('settingsPage.createAccount') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirm (Original) -->
      <div v-if="deleteConfirm" class="modal-overlay" @click.self="deleteConfirm = null">
        <div class="modal">
          <h3>{{ transStore.t('settingsPage.deleteUser') }}</h3>
          <p class="modal-sub">{{ transStore.t('settingsPage.deleteConfirm') }} <strong>{{ deleteConfirm.name }}</strong> ?</p>
          <div class="modal-actions">
            <button @click="deleteConfirm = null" class="btn-cancel">{{ transStore.t('common.cancel') }}</button>
            <button @click="deleteUser(deleteConfirm.id)" class="btn-danger">{{ transStore.t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page { padding: 36px 40px; color: #fff; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
h1 { font-size: 26px; font-weight: 900; margin: 0 0 4px; font-family: 'Orbitron', sans-serif; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 13.5px; margin: 0; }
.btn-create { background: #DF4B37; color: #fff; border: none; padding: 11px 22px; border-radius: 11px; font-weight: 800; font-size: 13.5px; cursor: pointer; }

/* Tabs */
.tabs { display: flex; gap: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 32px; }
.tabs button { background: none; border: none; font-size: 14px; font-weight: 800; padding: 12px 4px; color: rgba(255,255,255,0.4); cursor: pointer; position: relative; }
.tabs button.active { color: #DF4B37; }
.tabs button.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #DF4B37; }
.req-count { margin-left: 8px; background: #DF4B37; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 6px; }

.loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.4); }

/* Table Style (Original) */
.table-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
.table-header, .table-row { display: grid; grid-template-columns: 50px 1fr 1fr 120px 120px 60px; padding: 13px 20px; gap: 12px; align-items: center; }
.table-header { background: rgba(255,255,255,0.03); font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); }
.table-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; }
.table-row:hover { background: rgba(255,255,255,0.02); }
.cell-name { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.user-avatar-sm { width: 30px; height: 30px; border-radius: 8px; background: rgba(223,75,55,0.15); border: 1px solid rgba(223,75,55,0.25); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #DF4B37; flex-shrink: 0; }
.role-badge { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 6px; }
.badge-admin { background: rgba(223,75,55,0.15); color: #DF4B37; }
.badge-tech { background: rgba(59,130,246,0.15); color: #60a5fa; }
.badge-employee { background: rgba(52,211,153,0.15); color: #34d399; }
.btn-delete { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; }

/* Requests Cards */
.requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.request-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; }
.req-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.user-avatar-lg { width: 50px; height: 50px; border-radius: 14px; background: #DF4B37; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; }
.req-meta h3 { font-size: 16px; margin: 0 0 4px; }
.req-meta p { font-size: 12.5px; color: rgba(255,255,255,0.4); margin: 0; }
.req-info { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; margin-bottom: 24px; }
.req-info .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.3); }
.req-actions { display: flex; gap: 12px; }
.btn-refuse { flex: 1; background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.btn-refuse:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.2); }
.btn-approve { flex: 1.5; background: #DF4B37; color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 13px; }

/* Modals (Original) */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1a1e24; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 400px; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 14px; box-sizing: border-box; }
.btn-danger { background: rgba(239,68,68,0.8); border: none; color: #fff; padding: 10px 22px; border-radius: 10px; font-weight: 800; cursor: pointer; }
</style>
