<template>
  <div class="tags-view">
    <h1>标签管理</h1>
    <div class="create-form">
      <input v-model="newName" placeholder="标签名称" />
      <input v-model="newColor" type="color" />
      <button class="btn-primary" @click="createTag">创建</button>
    </div>
    <div class="tag-list">
      <div v-for="tag in tagStore.tags" :key="tag.id" class="tag-item">
        <span class="tag-color" :style="{ background: tag.color }"></span>
        <span class="tag-name">{{ tag.name }}</span>
        <button class="btn-danger" @click="tagStore.deleteTag(tag.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTagStore } from '@/stores/tag';

const tagStore = useTagStore();
const newName = ref('');
const newColor = ref('#4a90d9');

async function createTag() {
  if (!newName.value) return;
  await tagStore.createTag(newName.value, newColor.value);
  newName.value = '';
}

onMounted(() => {
  tagStore.fetchTags();
});
</script>

<style scoped>
.tags-view {
  max-width: 600px;
}
.create-form {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.tag-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.tag-name {
  flex: 1;
}
</style>
