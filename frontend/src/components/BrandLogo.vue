<script setup>
import { Shield } from 'lucide-vue-next';

defineProps({
  size: {
    type: [Number, String],
    default: 44
  },
  hideText: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="flex items-center gap-4 group cursor-pointer">
    <div class="bg-flare-red/10 rounded-xl flex items-center justify-center border border-flare-red/20 group-hover:border-flare-red/50 transition-all shadow-lg shadow-flare-red/5"
         :style="{ width: size + 'px', height: size + 'px' }">
      <Shield color="#DF4B37" :size="parseInt(size) * 0.45" fill="rgba(223,75,55,0.2)" />
    </div>
    
    <div v-if="!hideText" class="flex flex-col leading-none">
      <span class="font-black tracking-[0.15em] uppercase text-white" 
            style="font-family: 'Orbitron', sans-serif;"
            :style="{ fontSize: (parseInt(size) * 0.45) + 'px' }">
        TECK
      </span>
      <span class="font-normal tracking-[0.4em] text-flare-red uppercase" 
            style="font-family: 'Orbitron', sans-serif; margin-top: 2px;"
            :style="{ fontSize: (parseInt(size) * 0.2) + 'px' }">
        TRACK
      </span>
    </div>
  </div>
</template>
