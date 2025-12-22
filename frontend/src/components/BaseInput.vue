<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="base-input"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  box-sizing: border-box; /* ЭТО ВАЖНО: включает паддинги в расчет ширины */
  padding: 14px 20px;
  border-radius: 30px;
  border: none;
  background-color: #ffffff;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  outline: none;
  transition: box-shadow 0.2s;
  margin-bottom: 15px;
}

.base-input::placeholder {
  color: #888;
}

.base-input:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
}
</style>
