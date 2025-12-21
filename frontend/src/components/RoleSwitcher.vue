<script setup lang="ts">
defineProps<{
  modelValue: 'investor' | 'author';
}>();

defineEmits<{
  (e: 'update:modelValue', value: 'investor' | 'author'): void;
}>();
</script>

<template>
  <div class="switcher">
    <div
      class="option"
      :class="{ active: modelValue === 'investor' }"
      @click="$emit('update:modelValue', 'investor')"
    >
      Инвестор
    </div>
    <div
      class="option"
      :class="{ active: modelValue === 'author' }"
      @click="$emit('update:modelValue', 'author')"
    >
      Автор
    </div>
  </div>
</template>

<style scoped>
.switcher {
  display: flex;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 4px;
  margin-bottom: 25px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.option {
  padding: 6px 20px;
  border-radius: 16px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

/* Активное состояние (синяя кнопка) */
.option.active {
  background-color: #587bf2; /* Цвет активной кнопки с макета */
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
