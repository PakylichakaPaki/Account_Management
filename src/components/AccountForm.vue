<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
    <h1 class="text-4xl font-bold mb-8 text-gray-800">Управление учетными записями</h1>
    <button @click="addNewAccount" class="bg-green-500 text-white px-6 py-3 rounded-full mb-6 hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <div v-for="(account, index) in accounts" :key="index" class="w-full max-w-4xl bg-white rounded-lg shadow-lg mb-8 p-10 flex items-center transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-xl animate-fade-in">
      <!-- Метка -->
      <div class="flex-1 mr-8">
        <label class="block text-xl font-medium text-gray-700 mb-3">Метка:</label>
        <input
          v-model="account.labelInput"
          @blur="updateLabel(index)"
          placeholder="Введите метки через ;"
          class="w-full border-gray-300 rounded-md px-6 py-4 focus:ring-blue-500 focus:border-blue-500 text-xl"
        />
        <span v-if="!isValidLabel(account)" class="text-red-500 text-lg mt-3">Неверный формат метки</span>
      </div>

      <!-- Тип записи -->
      <div class="flex-1 mr-8">
        <label class="block text-xl font-medium text-gray-700 mb-3">Тип записи:</label>
        <select
          v-model="account.type"
          @change="togglePasswordField(index)"
          class="w-full border-gray-300 rounded-md px-6 py-4 focus:ring-blue-500 focus:border-blue-500 text-xl"
        >
          <option value="LDAP">LDAP</option>
          <option value="Локальная">Локальная</option>
        </select>
      </div>

      <!-- Логин -->
      <div class="flex-1 mr-8">
        <label class="block text-xl font-medium text-gray-700 mb-3">Логин:</label>
        <input
          v-model="account.login"
          @blur="validateLogin(index)"
          class="w-full border-gray-300 rounded-md px-6 py-4 focus:ring-blue-500 focus:border-blue-500 text-xl"
        />
        <span v-if="!isValidLogin(account)" class="text-red-500 text-lg mt-3">Логин обязателен</span>
      </div>

      <!-- Пароль (только для "Локальная") -->
      <div v-if="account.showPasswordField" class="flex-1 mr-8">
        <label class="block text-xl font-medium text-gray-700 mb-3">Пароль:</label>
        <input
          v-model="account.password"
          @blur="validatePassword(index)"
          class="w-full border-gray-300 rounded-md px-6 py-4 focus:ring-blue-500 focus:border-blue-500 text-xl"
        />
        <span v-if="!isValidPassword(account)" class="text-red-500 text-lg mt-3">Пароль обязателен</span>
      </div>

      <!-- Кнопка удаления -->
      <button @click="removeAccount(index)" class="ml-8 bg-red-500 text-white px-6 py-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out text-xl">
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import type { Account } from '@/types/accountTypes';

const accountStore = useAccountStore();

const accounts = reactive<Account[]>(accountStore.accounts.map((acc) => ({
  ...acc,
  labelInput: acc.label.map((l) => l.text).join(';'),
  showPasswordField: acc.type === 'Локальная',
})));

function addNewAccount() {
  const newAccount: Account = {
    label: [],
    type: 'LDAP',
    login: '',
    password: null,
    labelInput: '',
    showPasswordField: false,
  };
  accounts.push(newAccount);
}

function removeAccount(index: number) {
  accounts.splice(index, 1);
  accountStore.removeAccount(index);
}

function parseLabel(input: string): Label[] {
  return input.split(';').map((text) => ({ text: text.trim() })).filter((l) => l.text !== '');
}

function updateLabel(index: number) {
  const account = accounts[index];
  account.label = parseLabel(account.labelInput || '');
  validateLabel(account);
}

function isValidLabel(account: Account): boolean {
  return account.label.every((l) => l.text.length <= 50);
}

function isValidLogin(account: Account): boolean {
  return account.login.length > 0 && account.login.length <= 100;
}

function isValidPassword(account: Account): boolean {
  if (account.type === 'Локальная') {
    return !!account.password && account.password.length <= 100;
  }
  return true;
}

function validateAccount(index: number) {
  const account = accounts[index];
  const valid =
    isValidLabel(account) &&
    isValidLogin(account) &&
    (account.type === 'Локальная' ? isValidPassword(account) : true);

  if (valid) {
    accountStore.updateAccount(index, {
      label: account.label,
      type: account.type,
      login: account.login,
      password: account.type === 'LDAP' ? null : account.password,
    });
  }
}

function validateLabel(account: Account) {
  if (!isValidLabel(account)) {
    console.error('Ошибка валидации метки');
  }
}

function validateLogin(index: number) {
  const account = accounts[index];
  if (!isValidLogin(account)) {
    console.error('Ошибка валидации логина');
  }
  validateAccount(index);
}

function validatePassword(index: number) {
  const account = accounts[index];
  if (!isValidPassword(account)) {
    console.error('Ошибка валидации пароля');
  }
  validateAccount(index);
}

function togglePasswordField(index: number) {
  const account = accounts[index];
  account.showPasswordField = account.type === 'Локальная';
  validateAccount(index);
}

watch(
  () => accountStore.accounts,
  (newAccounts) => {
    accounts.forEach((acc, i) => {
      acc.labelInput = newAccounts[i].label.map((l) => l.text).join(';');
      acc.showPasswordField = newAccounts[i].type === 'Локальная';
    });
  },
  { deep: true }
);
</script>