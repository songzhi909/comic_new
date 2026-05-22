import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/utils/api';

interface User {
  id: number;
  username: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(username: string, password: string) {
    const result = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem('token', result.token);
  }

  async function register(username: string, password: string, inviteCode: string) {
    const result = await api.post<{ token: string; user: User }>('/auth/register', {
      username,
      password,
      invite_code: inviteCode,
    });
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem('token', result.token);
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const result = await api.get<{ user: User }>('/auth/me');
      user.value = result.user;
    } catch {
      token.value = '';
      localStorage.removeItem('token');
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isAuthenticated, login, register, fetchUser, logout };
});
