import React, { useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { OptionButton } from './OptionButton';
import { useChat } from './useChat';
import './ChatWindow.css';
import './OptionButton.css';

interface ChatWindowProps {
  userRole: 'client' | 'admin';
  title?: string;
  onClose?: () => void;
  apiUrl?: string;
}

const clientQuickReplies = [
  {
    label: 'Agendar Consulta',
    message: 'Agendar Consulta',
    command: 'BOOK_APPOINTMENT',
  },
  {
    label: 'Ver Minhas Consultas',
    message: 'Ver Minhas Consultas',
    command: 'VIEW_APPOINTMENTS',
  },
  {
    label: 'Cancelar Consulta',
    message: 'Cancelar Consulta',
    command: 'CANCEL_APPOINTMENT',
  },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  userRole,
  title = 'Assistente de Clínica Veterinária',
  onClose,
  apiUrl,
}) => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
    messagesEndRef,
    scrollToBottom,
  } = useChat(userRole, { apiUrl });

  const handleQuickReply = (reply: {
    label: string;
    message: string;
    command: string;
    payload?: Record<string, any>;
  }) => {
    sendMessage({ message: reply.message, command: reply.command, payload: reply.payload });
  };

  // Carrega histórico ao montar o componente
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <h2 className="chat-title">
            {title}
            {userRole === 'admin' && ' (Admin)'}
            {userRole === 'client' && ' (Cliente)'}
          </h2>
          <p className="header-subtitle">Assistente inteligente da clínica</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-clear"
            onClick={clearMessages}
            title="Limpar chat"
            aria-label="Limpar histórico de chat"
          >
            🗑️
          </button>
          {onClose && (
            <button
              className="btn-close"
              onClick={onClose}
              title="Fechar chat"
              aria-label="Fechar janela de chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      {userRole === 'client' && (
        <div className="quick-replies">
          <span className="quick-replies-label">Sugestões de pergunta:</span>
          <div className="quick-replies-list">
            {clientQuickReplies.map((reply) => (
              <button
                key={reply.command}
                className="quick-reply-button"
                type="button"
                onClick={() => handleQuickReply(reply)}
                disabled={isLoading}
                title={`Enviar comando ${reply.command}`}
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Bem-vindo ao Assistente!</h3>
            <p>
              {userRole === 'client'
                ? 'Inicie uma conversa para marcar consultas, consultar horários disponíveis ou visualizar seus agendamentos.'
                : 'Inicie uma conversa para consultar agendamentos, visualizar estatísticas e monitorar a clínica.'}
            </p>
          </div>
        )}

        {/* Mensagens */}
        {messages.map((msg) => (
          <div key={msg.id} className="message-with-options">
            <MessageBubble
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              toolsUsed={msg.toolsUsed}
            />
            {msg.options && msg.options.length > 0 && (
              <div className="message-options">
                {msg.options.map((option) => (
                  <OptionButton
                    key={`${msg.id}-${option.command}-${option.label}`}
                    label={option.label}
                    onClick={() => handleQuickReply({ message: option.label, command: option.command, payload: option.payload })}
                    disabled={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de carregamento */}
        {isLoading && (
          <div className="loading-indicator">
            <span className="spinner">●●●</span>
            <span>Processando sua solicitação...</span>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        )}

        {/* Ref para scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
};
