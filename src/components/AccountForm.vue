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
        <div class="relative">
          <input
            :type="account.showPassword ? 'text' : 'password'"
            v-model="account.password"
            @blur="validatePassword(index)"
            class="w-full border-gray-300 rounded-md px-6 py-4 focus:ring-blue-500 focus:border-blue-500 text-xl"
          />
          <button 
            @click="togglePasswordVisibility(index)" 
            type="button"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                v-if="!account.showPassword"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path 
                v-if="!account.showPassword"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              <path 
                v-if="account.showPassword"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
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
import { reactive, watch } from 'vue';
import { useAccountStore } from '../stores/accountStore';
import type { Account, Label } from '../types/accountTypes'; // Импортируйте Label

const accountStore = useAccountStore();

const accounts = reactive<Account[]>(accountStore.accounts.map((acc) => ({
  ...acc,
  labelInput: acc.label.map((l) => l.text).join(';'),
  showPasswordField: acc.type === 'Локальная',
  showPassword: false,
})));

function addNewAccount() {
  const newAccount: Account = {
    label: [],
    type: 'LDAP',
    login: '',
    password: null,
    labelInput: '',
    showPasswordField: false,
    showPassword: false,
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

function togglePasswordVisibility(index: number) {
  accounts[index].showPassword = !accounts[index].showPassword;
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