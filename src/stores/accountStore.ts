import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Account } from '../types/accountTypes';

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>(JSON.parse(localStorage.getItem('accounts') || '[]'));

  watch(accounts, (newAccounts) => {
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  }, { deep: true });

  function addAccount(account: Account) {
    accounts.value.push(account);
  }

  function removeAccount(index: number) {
    accounts.value.splice(index, 1);
  }

  function updateAccount(index: number, updatedAccount: Account) {
    accounts.value[index] = updatedAccount;
  }

  return { accounts, addAccount, removeAccount, updateAccount };
});