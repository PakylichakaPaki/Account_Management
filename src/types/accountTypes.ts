export interface Label {
    text: string;
  }
  
  export interface Account {
    label: { text: string }[];
    type: "LDAP" | "Локальная";
    login: string;
    password?: string | null;
    labelInput?: string;
    showPasswordField?: boolean;
    showPassword?: boolean;
  }