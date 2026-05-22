<template>
  <div class="library-manager">
    <div class="add-form">
      <input v-model="newName" placeholder="库名称" />
      <input v-model="newPath" placeholder="目录路径" />
      <button class="btn-primary" @click="addLibrary">添加</button>
    </div>
    <div class="library-list">
      <div v-for="lib in libraries" :key="lib.id" class="library-item">
        <div class="lib-info">
          <strong>{{ lib.name }}</strong>
          <span class="lib-path">{{ lib.path }}</span>
        </div>
        <div class="lib-actions">
          <button @click="scanLibrary(lib.id)">扫描</button>
          <button class="btn-danger" @click="deleteLibrary(lib.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const libraries = ref<any[]>([]);
const newName = ref('');
const newPath = ref('');

async function fetchLibraries() {
  libraries.value = await api.get('/libraries');
}

async function addLibrary() {
  if (!newName.value || !newPath.value) return;
  await api.post('/libraries', { name: newName.value, path: newPath.value });
  newName.value = '';
  newPath.value = '';
  await fetchLibraries();
}

async function scanLibrary(id: number) {
  const result = await api.post<any>(`/libraries/${id}/scan`);
  alert(`扫描完成：新增 ${result.added}，更新 ${result.updated}，移除 ${result.removed}`);
}

async function deleteLibrary(id: number) {
  if (!confirm('确定删除该漫画库？')) return;
  await api.delete(`/libraries/${id}`);
  await fetchLibraries();
}

onMounted(fetchLibraries);
</script>

<style scoped>
.add-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.library-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.library-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.lib-path {
  font-size: 12px;
  color: var(--text-secondary);
}
.lib-actions {
  display: flex;
  gap: 8px;
}
</style>
