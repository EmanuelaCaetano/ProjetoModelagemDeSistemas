import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface UseCharOptions {
  apiUrl?: string;
  conversationId?: string;
}

export const useChat = (userRole: 'client' | 'admin', options: UseCharOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = options.apiUrl || 'http://localhost:4000';
  const endpoint = userRole === 'client' ? '/chat/client' : '/chat/admin';

  /**
   * Envia uma mensagem para a API
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) {
        setError('Mensagem não pode estar vazia');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Adiciona a mensagem do usuário ao histórico imediatamente
      const userMessageObj: Message = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessageObj]);

      try {
        // Envia a mensagem para a API
        const response = await axios.post(
          `${apiUrl}${endpoint}`,
          { message: userMessage },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const { data } = response.data;

        // Adiciona a resposta do assistente
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
          toolsUsed: data.toolsUsed,
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
      const response = await axios.get(`${apiUrl}/chat/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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
