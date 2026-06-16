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
const loading = ref(true);
const comment = ref('');
const commentSaving = ref(false);
const commentMsg = ref('');

const fetchTicket = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${route.params.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    ticket.value = await res.json();
    if (ticket.value.comment) comment.value = ticket.value.comment;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTicket);

const saveComment = async () => {
  commentSaving.value = true;
  commentMsg.value = '';
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${route.params.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ comment: comment.value })
    });
    if (res.ok) commentMsg.value = transStore.t('profile.updateSuccess');
    else commentMsg.value = transStore.t('profile.updateError');
  } catch { commentMsg.value = transStore.t('errors.networkError'); }
  finally { commentSaving.value = false; }
};

const statusClass = { PENDING: 'status-pending', IN_PROGRESS: 'status-inprogress', REPAIRED: 'status-done' };
const formatDate = (d) => transStore.formatDate(d, { day: '2-digit', month: 'long', year: 'numeric' });
</script>

<template>
  <AppLayout>
    <div class="page">
      <button @click="router.push('/mes-demandes')" class="back-btn">← {{ transStore.t('employee.myRequests') }}</button>

      <div v-if="loading" class="loading">{{ transStore.t('common.loading') }}</div>
      <div v-else-if="!ticket || ticket.message" class="error-msg">{{ transStore.t('tech.ticketNotFound') }}</div>

      <template v-else>
        <div class="ticket-header">
          <div class="ticket-meta">
            <span class="ticket-id">#{{ ticket.id }}</span>
            <span :class="['status-badge', statusClass[ticket.status]]">{{ transStore.label('status', ticket.status) }}</span>
          </div>
          <h1>{{ ticket.title }}</h1>
          <p class="ticket-date">{{ formatDate(ticket.createdAt) }}</p>
        </div>

        <div class="content-grid">
          <div class="left-col">
            <div class="card">
              <h2>📋 {{ transStore.t('employee.yourRequest') }}</h2>
              <p class="description">{{ ticket.description }}</p>
            </div>

            <!-- Progress tracker -->
            <div class="card">
              <h2>📍 {{ transStore.t('employee.followUp') }}</h2>
              <div class="progress-steps">
                <div class="step" :class="{ done: true }">
                  <div class="step-dot done-dot">✓</div>
                  <div class="step-text">
                    <p class="step-title">{{ transStore.t('employee.requestSubmitted') }}</p>
                    <p class="step-date">{{ formatDate(ticket.createdAt) }}</p>
                  </div>
                </div>
                <div class="step-line" :class="{ active: ticket.status !== 'PENDING' }"></div>
                <div class="step" :class="{ done: ticket.status !== 'PENDING' }">
                  <div class="step-dot" :class="ticket.status !== 'PENDING' ? 'done-dot' : 'pending-dot'">
                    {{ ticket.status !== 'PENDING' ? '✓' : '2' }}
                  </div>
                  <div class="step-text">
                    <p class="step-title">{{ transStore.t('employee.techAssigned') }}</p>
                    <p class="step-date">{{ ticket.technician?.name || transStore.t('employee.notAssigned') }}</p>
                  </div>
                </div>
                <div class="step-line" :class="{ active: ticket.status === 'REPAIRED' }"></div>
                <div class="step" :class="{ done: ticket.status === 'REPAIRED' }">
                  <div class="step-dot" :class="ticket.status === 'REPAIRED' ? 'done-dot' : 'pending-dot'">
                    {{ ticket.status === 'REPAIRED' ? '✓' : '3' }}
                  </div>
                  <div class="step-text">
                    <p class="step-title">{{ transStore.t('employee.repairDone') }}</p>
                    <p class="step-date">{{ ticket.status === 'REPAIRED' ? formatDate(ticket.updatedAt) : transStore.t('dashboard.inProgress') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="right-col">
            <div class="card">
              <h2>👨‍🔧 {{ transStore.t('employee.technician') }}</h2>
              <div v-if="ticket.technician" class="tech-box">
                <div class="tech-avatar">{{ ticket.technician.name?.charAt(0)?.toUpperCase() }}</div>
                <span>{{ ticket.technician.name }}</span>
              </div>
              <p v-else class="no-tech">{{ transStore.t('employee.notAssigned') }}</p>
            </div>

            <div class="card">
              <h2>💬 {{ transStore.t('employee.yourComment') }}</h2>
              <textarea v-model="comment" class="form-input form-textarea" rows="4" :placeholder="transStore.t('contact.placeholderMessage')"></textarea>
              <p v-if="commentMsg" class="comment-msg">{{ commentMsg }}</p>
              <button @click="saveComment" :disabled="commentSaving" class="btn-comment">
                {{ commentSaving ? transStore.t('common.loading') : transStore.t('common.save') }}
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
.ticket-header { margin-bottom: 28px; }
.ticket-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.ticket-id { font-size: 13px; color: rgba(255,255,255,0.3); font-weight: 700; }
h1 { font-size: 24px; font-weight: 900; margin: 0 0 6px; font-family: 'Orbitron', sans-serif; }
.ticket-date { font-size: 13px; color: rgba(255,255,255,0.35); margin: 0; }
.status-badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; padding: 3px 10px; border-radius: 6px; }
.status-pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-inprogress { background: rgba(59,130,246,0.15); color: #60a5fa; }
.status-done { background: rgba(52,211,153,0.15); color: #34d399; }
.content-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; margin-bottom: 16px; }
.card h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.45); margin: 0 0 16px; }
.description { color: rgba(255,255,255,0.7); line-height: 1.7; font-size: 14.5px; margin: 0; }
.progress-steps { display: flex; flex-direction: column; gap: 0; }
.step { display: flex; align-items: flex-start; gap: 14px; }
.step-line { width: 2px; height: 28px; background: rgba(255,255,255,0.08); margin-left: 15px; transition: background 0.3s; }
.step-line.active { background: #34d399; }
.step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0; }
.done-dot { background: rgba(52,211,153,0.2); border: 2px solid #34d399; color: #34d399; }
.pending-dot { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.35); }
.step.done .step-dot { background: rgba(52,211,153,0.2); border-color: #34d399; color: #34d399; }
.step-text { padding-top: 4px; }
.step-title { font-size: 13.5px; font-weight: 700; margin: 0 0 2px; }
.step-date { font-size: 12px; color: rgba(255,255,255,0.35); margin: 0; }
.tech-box { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
.tech-avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; color: #60a5fa; }
.no-tech { color: rgba(255,255,255,0.4); font-size: 13.5px; margin: 0; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 14px; box-sizing: border-box; font-family: inherit; }
.form-input:focus { outline: none; border-color: rgba(223,75,55,0.4); }
.form-textarea { resize: vertical; min-height: 90px; display: block; margin-bottom: 12px; }
.btn-comment { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 11px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-comment:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
.comment-msg { font-size: 12.5px; color: #34d399; margin: 0 0 10px; }
.loading, .error-msg { text-align: center; padding: 60px; color: rgba(255,255,255,0.4); }
</style>
