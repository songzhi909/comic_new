<template>
  <div class="login-page">
    <div class="login-card">
      <h1>漫画阅读器</h1>
      <h2>注册</h2>
      <form @submit.prevent="handleRegister">
        <input v-model="username" placeholder="用户名" required />
        <input v-model="password" type="password" placeholder="密码" required />
        <input v-model="inviteCode" placeholder="授权码" required />
        <button type="submit" class="btn-primary">注册</button>
      </form>
      <p class="link">已有账号？<router-link to="/login">登录</router-link></p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const inviteCode = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function handleRegister() {
  try {
    await authStore.register(username.value, password.value, inviteCode.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.message;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.login-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
h1 { text-align: center; margin-bottom: 8px; color: var(--primary); }
h2 { text-align: center; margin-bottom: 24px; color: var(--text-secondary); font-weight: normal; }
form { display: flex; flex-direction: column; gap: 12px; }
input { width: 100%; }
button { width: 100%; }
.link { text-align: center; margin-top: 16px; }
.error { color: var(--danger); text-align: center; margin-top: 12px; }
</style>
