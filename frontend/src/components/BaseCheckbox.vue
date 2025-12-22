<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <label class="checkbox-container">
    <div class="checkbox-wrapper">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="checkmark">
        <svg v-if="modelValue" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M5 13L9 17L19 7" stroke="white" stroke-width="3" stroke-linecap="round"
                 stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div class="content">
      <span v-if="label" class="label-text">{{ label }}</span>
      <slot/>
    </div>
  </label>
</template>

<style scoped>
.checkbox-container {
  display: flex;
  align-items: flex-start; /* Выравнивание по верху для многострочного текста */
  cursor: pointer;
  user-select: none;
  margin-bottom: 20px;
  text-align: left;
}

.checkbox-wrapper {
  position: relative;
  width: 18px; /* Чуть уменьшил размер квадратика под макет */
  height: 18px;
  margin-right: 12px;
  margin-top: 2px; /* Небольшой отступ сверху для выравнивания с текстом */
  flex-shrink: 0;
}

.checkbox-wrapper input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: transparent;
  border: 2px solid #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #1a1a1a;
  border-color: #1a1a1a;
}

.checkmark svg {
  width: 12px;
  height: 12px;
}

/* Стили текста */
.content {
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 400;
  opacity: 0.9; /* Легкая прозрачность для соответствия макету */
}

/* Глубокий селектор для слотов, чтобы текст внутри <BaseCheckbox>...</BaseCheckbox> тоже стилизовался */
.content :deep(*) {
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
