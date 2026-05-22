<template>
  <div class="invite-codes-view">
    <h1>授权码管理</h1>
    <div class="create-form">
      <select v-model="newRole">
        <option value="reader">读者</option>
        <option value="editor">编辑者</option>
      </select>
      <input v-model.number="newMaxUses" type="number" placeholder="使用次数" min="1" />
      <button class="btn-primary" @click="createCode">生成授权码</button>
    </div>
    <div class="code-list">
      <div v-for="code in codes" :key="code.id" class="code-item">
        <span class="code-value">{{ code.code }}</span>
        <span class="code-role">{{ code.role }}</span>
        <span class="code-uses">{{ code.used_count }}/{{ code.max_uses }}</span>
        <button class="btn-danger" @click="deleteCode(code.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const codes = ref<any[]>([]);
const newRole = ref('reader');
const newMaxUses = ref(1);

async function fetchCodes() {
  codes.value = await api.get('/invite-codes');
}

async function createCode() {
  await api.post('/invite-codes', { role: newRole.value, max_uses: newMaxUses.value });
  await fetchCodes();
}

async function deleteCode(id: number) {
  await api.delete(`/invite-codes/${id}`);
  await fetchCodes();
}

onMounted(fetchCodes);
</script>

<style scoped>
.create-form {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}
.code-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.code-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.code-value {
  font-family: monospace;
  background: var(--bg);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
