import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export interface ChatOption {
  label: string;
  command: string;
  payload?: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  options?: ChatOption[];
  command?: string;
  payload?: Record<string, any>;
}

interface UseCharOptions {
  apiUrl?: string;
  conversationId?: string;
}

export type SendMessagePayload =
  | string
  | {
      message: string;
      command?: string;
      payload?: Record<string, any>;
    };

export const useChat = (userRole: 'client' | 'admin', options: UseCharOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usa `options.apiUrl` -> `VITE_API_URL` (build) -> caminho relativo (runtime)
  const envApiUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : undefined;
  // Fallback seguro para desenvolvimento: http://localhost:4000
  const apiUrl = options.apiUrl || envApiUrl || 'http://localhost:4000';
  const endpoint = userRole === 'client' ? '/chat/client' : '/chat/admin';

  /**
   * Envia uma mensagem para a API
   */
  const sendMessage = useCallback(
    async (userMessage: SendMessagePayload) => {
      const messageText =
        typeof userMessage === 'string' ? userMessage : userMessage.message;
      const command =
        typeof userMessage === 'string' ? undefined : userMessage.command;
      const payload =
        typeof userMessage === 'string' ? undefined : userMessage.payload;

      if (!messageText.trim()) {
        setError('Mensagem não pode estar vazia');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Adiciona a mensagem do usuário ao histórico imediatamente
      const userMessageObj: Message = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        command,
        payload,
      };

      setMessages((prev) => [...prev, userMessageObj]);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const body: Record<string, any> = { message: messageText };
        if (command) {
          body.command = command;
        }
        if (payload) {
          body.payload = payload;
        }

        const response = await axios.post(`${apiUrl}${endpoint}`, body, {
          headers,
        });

        const { data } = response.data;

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
          toolsUsed: data.toolsUsed,
          options: data.options || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erro ao enviar mensagem';

        setError(errorMessage);
        setIsLoading(false);

        // Remove a mensagem do usuário em caso de erro
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessageObj.id));
      }
    },
    [userRole, apiUrl, endpoint]
  );

  /**
   * Limpa o histórico de mensagens
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Obtém o histórico de conversa do servidor
   */
  const loadHistory = useCallback(async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${apiUrl}/chat/history`, {
        headers,
        params: { limit: 50 },
      });

      const { history } = response.data.data;

      // Converte o histórico para o formato de Message
      const formattedMessages: Message[] = history.map(
        (msg: any, index: number) => ({
          id: `msg-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })
      );

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  }, [apiUrl]);

  /**
   * Scroll automático para o final das mensagens
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
    messagesEndRef,
    scrollToBottom,
  };
};
