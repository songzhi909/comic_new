import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

interface Comic {
  id: number;
  library_id: number;
  title: string;
  path: string;
  type: 'single' | 'series';
  page_count: number;
  episode_count: number;
  status: string;
}

interface ComicsResponse {
  comics: Comic[];
  total: number;
  page: number;
  limit: number;
}

export const useComicStore = defineStore('comic', () => {
  const comics = ref<Comic[]>([]);
  const total = ref(0);
  const currentComic = ref<any>(null);

  async function fetchComics(params?: { library_id?: number; status?: string; search?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.library_id) query.set('library_id', String(params.library_id));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));

    const result = await api.get<ComicsResponse>(`/comics?${query}`);
    comics.value = result.comics;
    total.value = result.total;
  }

  async function fetchComic(id: number) {
    currentComic.value = await api.get(`/comics/${id}`);
  }

  async function toggleFavorite(id: number) {
    await api.put(`/comics/${id}/favorite`);
  }

  return { comics, total, currentComic, fetchComics, fetchComic, toggleFavorite };
});
