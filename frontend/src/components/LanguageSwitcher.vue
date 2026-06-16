<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Globe, Check } from 'lucide-vue-next';
import { useTranslationStore } from '../store/translation';

const props = defineProps({
  compact: { type: Boolean, default: false },
});

const transStore = useTranslationStore();
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
];

const selectLanguage = (code) => {
  transStore.setLanguage(code);
  isDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isDropdownOpen = !isDropdownOpen"
      class="lang-trigger"
      :class="{ compact }"
      type="button"
    >
      <Globe :size="14" class="text-flare-red" />
      <span class="uppercase font-mono tracking-wider">{{ transStore.currentLang }}</span>
    </button>

    <transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="lang-menu"
        :class="transStore.currentLang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          class="lang-option"
          :class="[
            transStore.currentLang === 'ar' ? 'text-right flex-row-reverse' : 'text-left',
            transStore.currentLang === lang.code ? 'active' : '',
          ]"
          type="button"
        >
          <span class="flex items-center gap-2.5" :class="{ 'flex-row-reverse': transStore.currentLang === 'ar' }">
            <span class="text-base leading-none">{{ lang.flag }}</span>
            <span>{{ lang.label }}</span>
          </span>
          <Check v-if="transStore.currentLang === lang.code" :size="14" class="text-flare-red" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.lang-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}
.lang-trigger.compact {
  padding: 8px 12px;
  font-size: 11px;
}
.lang-menu {
  position: absolute;
  margin-top: 8px;
  width: 176px;
  background: #0c0e12f2;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 200;
  backdrop-filter: blur(24px);
}
.lang-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.lang-option:hover,
.lang-option.active {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
