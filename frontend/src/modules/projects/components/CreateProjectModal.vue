<script setup lang="ts">
import {ref} from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import type {BaseProjectData} from '@/api/types';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', data: BaseProjectData): void;
}>();

const form = ref<BaseProjectData>({
  title: '',
  description: '',
  goal_amount: 0,
  project_type: '',
  start_date: '',
  end_date: ''
});

const handleSubmit = () => {
  // Валидацию можно добавить здесь
  emit('create', form.value);
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Создание проекта</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Название</label>
          <BaseInput v-model="form.title" placeholder="Введите название"/>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea
            v-model="form.description"
            class="base-textarea"
            placeholder="Опишите ваш проект..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Сумма сбора (₽)</label>
          <BaseInput v-model="form.goal_amount" type="number" placeholder="100000"/>
        </div>

        <div class="form-group">
          <label>Категория</label>
          <BaseInput v-model="form.project_type" placeholder="Например: Музыка"/>
        </div>

        <div class="dates-row">
          <div class="form-group">
            <label>Дата начала</label>
            <BaseInput v-model="form.start_date" type="date"/>
          </div>
          <div class="form-group">
            <label>Дата окончания</label>
            <BaseInput v-model="form.end_date" type="date"/>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn cancel-btn" @click="$emit('close')">Отмена</button>
          <button type="submit" class="btn create-btn">Создать</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-left: 10px;
}

/* Стили для textarea, аналогичные BaseInput */
.base-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 20px;
  border-radius: 20px;
  border: none;
  background-color: #f5f5f5;
  color: #333;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  resize: vertical;
  margin-bottom: 15px;
}

.base-textarea:focus {
  box-shadow: 0 0 0 2px rgba(88, 123, 242, 0.2);
}

.dates-row {
  display: flex;
  gap: 20px;
}

.dates-row .form-group {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border-radius: 30px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.create-btn {
  background: #587bf2;
  color: white;
}
</style>
