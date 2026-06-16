<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import AppLayout from '../components/AppLayout.vue';
import { useTranslationStore } from '../store/translation';
import api from '../services/api';
import { 
  BookOpen, Search, Download, ExternalLink, Upload, Trash2,
  FileText, Video, Image as ImageIcon, ChevronRight, X,
  Check, Loader2
} from 'lucide-vue-next';
import { API_BASE_URL } from '../config/apiBase';

const transStore = useTranslationStore();
const authStore = useAuthStore();
const search = ref('');
const resources = ref([]);
const selectedResource = ref(null);
const showModal = ref(false);
const showUploadModal = ref(false);
const route = useRoute();
const loading = ref(true);
const uploading = ref(false);
const activeFilter = ref('Tous');

// Upload form
const uploadForm = ref({
  title: '',
  machine: '',
  file: null
});

const filteredResources = computed(() => {
  let list = [...resources.value];
  if (activeFilter.value !== 'Tous') {
    list = list.filter(r => r.type === activeFilter.value);
  }
  if (search.value) {
    list = list.filter(r => 
      r.title.toLowerCase().includes(search.value.toLowerCase()) ||
      r.machine.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  return list.sort((a, b) => a.title.localeCompare(b.title));
});

const typeCounts = computed(() => {
  const counts = { Tous: resources.value.length, PDF: 0, Image: 0, 'Vidéo': 0, Doc: 0 };
  resources.value.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });
  return counts;
});

const getTypeIcon = (type) => {
  const iconMap = { 'PDF': FileText, 'Vidéo': Video, 'Image': ImageIcon, 'Doc': FileText };
  return iconMap[type] || FileText;
};

const getTypeColor = (type) => {
  const colorMap = { 'PDF': '#ef4444', 'Vidéo': '#3b82f6', 'Image': '#10b981', 'Doc': '#f59e0b' };
  return colorMap[type] || '#6b7280';
};

const isAdmin = computed(() => authStore.isAdmin);

// Charger les documents depuis l'API
const loadResources = async () => {
  try {
    loading.value = true;
    // Vider d'abord pour forcer le rechargement
    resources.value = [];
    // Ajouter un timestamp pour éviter le cache
    const response = await api.get('/library', {
      params: { t: Date.now() }
    });
    resources.value = response.data;
  } catch (error) {
    console.error('Erreur chargement ressources:', error);
    resources.value = [];
  } finally {
    loading.value = false;
  }
};

// Drag and drop states & upload
const isDragActive = ref(false);

const handleDragOver = (e) => {
  e.preventDefault();
  isDragActive.value = true;
};

const handleDragLeave = () => {
  isDragActive.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragActive.value = false;
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    uploadForm.value.file = file;
    if (!uploadForm.value.title) {
      const name = file.name;
      uploadForm.value.title = name.substring(0, name.lastIndexOf('.')) || name;
    }
  }
};

const handleFileSelect = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    uploadForm.value.file = selectedFile;
    if (!uploadForm.value.title) {
      const name = selectedFile.name;
      uploadForm.value.title = name.substring(0, name.lastIndexOf('.')) || name;
    }
  }
};

const removeSelectedFile = () => {
  uploadForm.value.file = null;
};

const getSelectedFileIcon = (file) => {
  if (!file) return FileText;
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return ImageIcon;
  if (ext === '.mp4') return Video;
  return FileText;
};

const getSelectedFileColor = (file) => {
  if (!file) return '#6b7280';
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (ext === '.pdf') return '#ef4444';
  if (ext === '.mp4') return '#3b82f6';
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return '#10b981';
  return '#f59e0b';
};

const uploadDocument = async () => {
  if (!uploadForm.value.file || !uploadForm.value.title) {
    alert('Veuillez remplir le titre et sélectionner un fichier');
    return;
  }

  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append('file', uploadForm.value.file);
    formData.append('title', uploadForm.value.title);
    formData.append('machine', uploadForm.value.machine);

    await api.post('/library', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Reset form
    uploadForm.value = { title: '', machine: '', file: null };
    showUploadModal.value = false;
    
    // Recharger les ressources
    await loadResources();
    alert('✅ Document uploadé avec succès !');
  } catch (error) {
    console.error('Erreur upload:', error);
    alert('❌ Erreur lors de l\'upload: ' + error.response?.data?.message || error.message);
  } finally {
    uploading.value = false;
  }
};

// Supprimer document
const deleteDocument = async (docId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
  
  try {
    await api.delete(`/library/${docId}`);
    await loadResources();
    alert('✅ Document supprimé');
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('❌ Erreur: ' + error.message);
  }
};

// Télécharger fichier
const downloadDocument = async (filename) => {
  try {
    const response = await api.get(`/library/${filename}/download`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert('❌ Erreur: ' + error.message);
  }
};

const openResource = (res) => {
  // API_BASE_URL inclut /api, donc on doit enlever ça pour le static
  const staticBaseUrl = API_BASE_URL.replace('/api', '');
  const fileUrl = `${staticBaseUrl}/uploads/library/${res.filename}`;
  
  if (res.type === 'PDF' || res.type === 'Image') {
    window.open(fileUrl, '_blank');
  } else {
    // Pour les autres types, on télécharge
    downloadDocument(res.filename);
  }
};

const checkQuery = () => {
  if (route.query.open) {
    const res = resources.value.find(r => r.id === parseInt(route.query.open));
    if (res) openResource(res);
  }
};

onMounted(() => {
  loadResources();
  checkQuery();
});

watch(() => route.query.open, checkQuery);

const closeModal = () => {
  showModal.value = false;
  selectedResource.value = null;
};
</script>

<template>
  <AppLayout>
    <div class="library-container">
      <div class="header-section">
        <div class="header-top">
          <div>
            <h1>{{ transStore.t('library.title') }}</h1>
            <p>{{ transStore.t('common.library') }}</p>
          </div>
          <!-- Bouton Upload Admin Only -->
          <button 
            v-if="isAdmin"
            class="btn-upload-main"
            @click="showUploadModal = true"
          >
            <Upload :size="18" /> Uploader un Document
          </button>
        </div>
      </div>

      <div class="search-box glass">
        <Search :size="20" class="search-icon" />
        <input v-model="search" type="text" placeholder="Rechercher par titre ou machine..." />
      </div>

      <!-- Filtres par type -->
      <div class="type-filters">
        <button
          v-for="filter in ['Tous', 'PDF', 'Image', 'Vidéo', 'Doc']" 
          :key="filter"
          class="filter-btn"
          :class="{ active: activeFilter === filter }"
          @click="activeFilter = filter"
        >
          <span class="filter-icon">
            <FileText v-if="filter === 'PDF' || filter === 'Doc'" :size="14" />
            <ImageIcon v-else-if="filter === 'Image'" :size="14" />
            <Video v-else-if="filter === 'Vidéo'" :size="14" />
            <BookOpen v-else :size="14" />
          </span>
          {{ filter }}
          <span class="filter-count">{{ typeCounts[filter] }}</span>
        </button>
      </div>

      <!-- Liste des Ressources -->
      <div v-if="!loading" class="resource-grid">
        <div 
          v-for="res in filteredResources" 
          :key="res.id" 
          class="res-card glass"
          @click="openResource(res)"
        >
          <div class="res-icon-box" :style="{ backgroundColor: getTypeColor(res.type) + '15', color: getTypeColor(res.type) }">
            <component :is="getTypeIcon(res.type)" :size="24" />
          </div>
          <div class="res-info">
            <h3>{{ res.title }}</h3>
            <p class="res-machine">{{ res.machine }}</p>
            <div class="res-meta">
              <span class="res-type">{{ res.type }}</span>
              <span class="res-size">{{ res.size }}</span>
            </div>
          </div>
          <div class="res-actions">
            <button 
              v-if="isAdmin"
              class="btn-delete"
              @click.stop="deleteDocument(res.id)"
              title="Supprimer"
            >
              <Trash2 :size="16" />
            </button>
            <ExternalLink :size="18" class="res-action" />
          </div>
        </div>

        <div v-if="filteredResources.length === 0" class="empty-state">
          <BookOpen :size="48" />
          <p>Aucun document trouvé</p>
          <p v-if="activeFilter !== 'Tous'" style="margin-top: 10px; color: rgba(255,255,255,0.55);">Aucun fichier de type "{{ activeFilter }}" dans la bibliothèque.</p>
          <p v-else-if="isAdmin" style="margin-top: 10px; color: rgba(255,255,255,0.55);">Cliquez sur "Uploader un Document" pour ajouter des ressources techniques.</p>
          <p v-else style="margin-top: 10px; color: rgba(255,255,255,0.55);">Contactez votre administrateur pour ajouter des documents à la bibliothèque.</p>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des ressources...</p>
      </div>

      <!-- Modal Upload (Admin) -->
      <div v-if="showUploadModal && isAdmin" class="modal-overlay" @click.self="showUploadModal = false">
        <div class="modal-content glass upload-modal">
          <div class="modal-header">
            <div class="m-title">
              <Upload :size="20" style="color: #DF4B37;" />
              <h2>Uploader un Document Technique</h2>
            </div>
            <button class="btn-close" @click="showUploadModal = false">×</button>
          </div>
          <div class="modal-body upload-body">
            <div class="form-group">
              <label>Titre du document *</label>
              <input 
                v-model="uploadForm.title" 
                type="text" 
                placeholder="Ex: Manuel Maintenance A1"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Machine/Système</label>
              <input 
                v-model="uploadForm.machine" 
                type="text" 
                placeholder="Ex: Presse Hydraulique"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Fichier (PDF, Doc, Image, Vidéo) *</label>
              <div 
                class="file-input-wrapper"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <input 
                  id="file-upload"
                  type="file" 
                  @change="handleFileSelect"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4"
                  class="file-input"
                />
                <label 
                  for="file-upload" 
                  class="file-input-label"
                  :class="{ 'drag-active': isDragActive, 'has-file': uploadForm.file }"
                >
                  <div v-if="!uploadForm.file" class="upload-prompt">
                    <Upload :size="28" class="upload-icon" />
                    <span>Cliquez pour sélectionner ou glissez un fichier</span>
                    <span class="file-formats">Formats acceptés : PDF, PNG, JPG, MP4, DOCX</span>
                  </div>
                  <div v-else class="file-selected-preview" @click.prevent>
                    <div class="preview-icon-box" :style="{ backgroundColor: getSelectedFileColor(uploadForm.file) + '15', color: getSelectedFileColor(uploadForm.file) }">
                      <component :is="getSelectedFileIcon(uploadForm.file)" :size="28" />
                    </div>
                    <div class="preview-details">
                      <span class="file-name">{{ uploadForm.file.name }}</span>
                      <span class="file-size">{{ (uploadForm.file.size / 1024 / 1024).toFixed(2) }} MB</span>
                    </div>
                    <button class="btn-remove-file" @click.stop="removeSelectedFile" title="Retirer le fichier">
                      <X :size="16" />
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-cancel" @click="showUploadModal = false">Annuler</button>
              <button 
                class="btn-submit" 
                @click="uploadDocument"
                :disabled="uploading"
                style="display: flex; align-items: center; gap: 8px; justify-content: center;"
              >
                <Loader2 v-if="uploading" :size="18" style="animation: spin 1s linear infinite;" />
                <Check v-else :size="18" />
                <span>{{ uploading ? 'Upload en cours...' : 'Uploader' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Visionneuse (Modal) -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass">
          <div class="modal-header">
            <div class="m-title">
              <component :is="getTypeIcon(selectedResource.type)" :size="20" :color="getTypeColor(selectedResource.type)" />
              <div>
                <h2>{{ selectedResource.title }}</h2>
                <p class="modal-machine">{{ selectedResource.machine }}</p>
              </div>
            </div>
            <button class="btn-close" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div class="viewer-info">
              <div class="info-item">
                <span class="label">Type:</span>
                <span class="value">{{ selectedResource.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">Taille:</span>
                <span class="value">{{ selectedResource.size }}</span>
              </div>
              <div class="info-item">
                <span class="label">Uploadé:</span>
                <span class="value">{{ new Date(selectedResource.uploadedAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              class="btn-download" 
              @click="downloadDocument(selectedResource.filename)"
            >
              <Download :size="16" /> Télécharger ({{ selectedResource.size }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.library-container { padding: 40px; color: #fff; max-width: 1200px; margin: 0 auto; }

.header-section { margin-bottom: 40px; }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.header-section h1 { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; margin: 0; }
.header-section p { color: rgba(255,255,255,0.4); margin-top: 8px; }

.btn-upload-main { 
  background: linear-gradient(135deg, #DF4B37 0%, #ff6b54 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(223, 75, 55, 0.3);
}
.btn-upload-main:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(223, 75, 55, 0.4); }

.glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }

.search-box { display: flex; align-items: center; padding: 15px 25px; margin-bottom: 20px; gap: 15px; }
.search-icon { color: rgba(255,255,255,0.2); }
.search-box input { background: none; border: none; color: #fff; font-size: 16px; width: 100%; outline: none; }
.search-box input::placeholder { color: rgba(255,255,255,0.3); }

/* Type filter buttons */
.type-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  border-color: rgba(255,255,255,0.15);
}
.filter-btn.active {
  background: rgba(223,75,55,0.15);
  border-color: rgba(223,75,55,0.4);
  color: #DF4B37;
}
.filter-icon { display: flex; align-items: center; }
.filter-count {
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}
.filter-btn.active .filter-count {
  background: rgba(223,75,55,0.2);
  color: #DF4B37;
}

.resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.res-card { display: flex; align-items: center; padding: 20px; cursor: pointer; transition: 0.3s; position: relative; }
.res-card:hover { border-color: #DF4B37; background: rgba(223,75,55,0.05); transform: translateY(-5px); }

.res-icon-box { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; }
.res-info { flex: 1; }
.res-info h3 { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
.res-machine { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
.res-meta { display: flex; gap: 12px; }
.res-type { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; background: rgba(255,255,255,0.05); border-radius: 4px; color: rgba(255,255,255,0.6); }
.res-size { font-size: 11px; color: rgba(255,255,255,0.2); }

.res-actions { display: flex; align-items: center; gap: 12px; }
.res-action { color: rgba(255,255,255,0.2); transition: 0.2s; }
.res-card:hover .res-action { color: #DF4B37; }

.btn-delete { 
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-delete:hover { background: rgba(239, 68, 68, 0.4); }

.empty-state { 
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.4);
}
.empty-state svg { margin-bottom: 20px; opacity: 0.4; }

.loading-state { text-align: center; padding: 60px 20px; }
.spinner { 
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top-color: #DF4B37;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-content { width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
.m-title { display: flex; align-items: center; gap: 15px; flex: 1; }
.m-title h2 { font-size: 18px; font-weight: 700; margin: 0; }
.modal-machine { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }
.btn-close { background: none; border: none; color: #fff; font-size: 30px; cursor: pointer; opacity: 0.5; transition: 0.2s; }
.btn-close:hover { opacity: 1; }

.modal-body { flex: 1; overflow-y: auto; padding: 30px; }
.viewer-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.info-item { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; }
.info-item .label { display: block; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 5px; }
.info-item .value { display: block; font-size: 14px; font-weight: 600; }

.modal-footer { padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 10px; }

.btn-download { 
  background: linear-gradient(135deg, #DF4B37 0%, #ff6b54 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}
.btn-download:hover { transform: translateY(-2px); }

/* Upload Modal Styles */
.upload-modal { max-width: 500px; }
.upload-body { padding: 30px; }

.form-group { margin-bottom: 25px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: rgba(255,255,255,0.8); }
.form-input { 
  width: 100%;
  padding: 12px 15px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: 0.3s;
}
.form-input:focus { 
  background: rgba(255,255,255,0.08);
  border-color: #DF4B37;
}
.form-input::placeholder { color: rgba(255,255,255,0.3); }

.file-input-wrapper { position: relative; width: 100%; }
.file-input { display: none; }
.file-input-label { 
  padding: 24px;
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  background: rgba(255,255,255,0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.file-input-label:hover { 
  border-color: #DF4B37;
  background: rgba(223,75,55,0.04);
  color: #fff;
}
.file-input-label.drag-active {
  border-color: #DF4B37;
  background: rgba(223,75,55,0.08);
  box-shadow: 0 0 25px rgba(223, 75, 55, 0.15);
  transform: scale(1.02);
}
.file-input-label.has-file {
  border-style: solid;
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
}
.file-input-label.has-file:hover {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.04);
}
.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-icon {
  color: rgba(255, 255, 255, 0.3);
  transition: transform 0.3s;
}
.file-input-label:hover .upload-icon {
  transform: translateY(-4px) scale(1.05);
  color: #DF4B37;
}
.file-formats {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 4px;
}
.file-selected-preview {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16px;
  text-align: left;
}
.preview-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.preview-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.preview-details .file-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.preview-details .file-size {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.btn-remove-file {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-remove-file:hover {
  background: #ef4444;
  color: #fff;
  transform: scale(1.1);
}

.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-cancel { 
  padding: 12px 24px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.btn-cancel:hover { background: rgba(255,255,255,0.15); }

.btn-submit { 
  padding: 12px 24px;
  background: linear-gradient(135deg, #DF4B37 0%, #ff6b54 100%);
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
