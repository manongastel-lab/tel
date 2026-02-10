
export interface Recipient {
  id: string; // Telegram Chat ID
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastTime?: string;
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'me' | 'bot' | 'user';
  timestamp: number;
}

export interface AppConfig {
  botToken: string;
  recipients: Recipient[];
}
