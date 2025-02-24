export interface Label {
    text: string;
  }
  
  export interface Account {
    label: Label[];
    type: 'LDAP' | 'Локальная';
    login: string;
    password?: string;
  }