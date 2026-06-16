<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

const emit = defineEmits(['close', 'submit']);
const form = ref({
  name: '',
  stock: 0,
  minThreshold: 5
});

const handleSubmit = () => {
  emit('submit', { ...form.value });
  form.value = { name: '', stock: 0, minThreshold: 5 };
};
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
    <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
      <button @click="$emit('close')" class="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-full transition-colors">
        <X :size="20" class="text-gray-400" />
      </button>

      <h2 class="text-3xl font-black tracking-tighter mb-2 italic">Add New Item</h2>
      <p class="text-gray-400 text-sm mb-8 font-medium">Register a new part in your Stuffus inventory.</p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Item Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="input-clean"
            placeholder="e.g. RTX 4090 GPU"
            required
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Stock Level</label>
            <input 
              v-model.number="form.stock" 
              type="number" 
              class="input-clean"
              required
            >
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Min Threshold</label>
            <input 
              v-model.number="form.minThreshold" 
              type="number" 
              class="input-clean"
              required
            >
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button type="button" @click="$emit('close')" class="flex-1 btn-outline">Cancel</button>
          <button type="submit" class="flex-1 btn-black">Add Item</button>
        </div>
      </form>
    </div>
  </div>
</template>
