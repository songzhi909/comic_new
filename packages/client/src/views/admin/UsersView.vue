<template>
  <div class="users-view">
    <h1>用户管理</h1>
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>角色</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>
            <select :value="user.role" @change="updateRole(user.id, $event)">
              <option value="admin">管理员</option>
              <option value="editor">编辑者</option>
              <option value="reader">读者</option>
            </select>
          </td>
          <td>
            <button class="btn-danger" @click="deleteUser(user.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const users = ref<any[]>([]);

async function fetchUsers() {
  users.value = await api.get('/users');
}

async function updateRole(id: number, event: Event) {
  const role = (event.target as HTMLSelectElement).value;
  await api.put(`/users/${id}/role`, { role });
  await fetchUsers();
}

async function deleteUser(id: number) {
  if (!confirm('确定删除该用户？')) return;
  await api.delete(`/users/${id}`);
  await fetchUsers();
}

onMounted(fetchUsers);
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.user-table th, .user-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
</style>
