import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

interface Tag {
  id: number;
  name: string;
  color: string;
}

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([]);

  async function fetchTags() {
    tags.value = await api.get<Tag[]>('/tags');
  }

  async function createTag(name: string, color: string) {
    await api.post('/tags', { name, color });
    await fetchTags();
  }

  async function updateTag(id: number, name: string, color: string) {
    await api.put(`/tags/${id}`, { name, color });
    await fetchTags();
  }

  async function deleteTag(id: number) {
    await api.delete(`/tags/${id}`);
    await fetchTags();
  }

  return { tags, fetchTags, createTag, updateTag, deleteTag };
});
