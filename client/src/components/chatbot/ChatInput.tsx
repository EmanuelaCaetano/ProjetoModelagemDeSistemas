import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-ajusta altura do textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(
        window.getComputedStyle(textareaRef.current).lineHeight
      );
      const newRows = Math.max(1, Math.floor(scrollHeight / lineHeight));
      setRows(Math.min(newRows, 5)); // Máximo de 5 linhas
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || isLoading || disabled) {
      return;
    }

    onSendMessage(message.trim());
    setMessage('');
    setRows(1);

    // Focus de volta no input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || disabled}
          rows={rows}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || isLoading || disabled}
          title="Enviar mensagem"
        >
          {isLoading ? (
            <span className="spinner">●●●</span>
          ) : (
            <span className="send-icon">➤</span>
          )}
        </button>
      </div>
    </form>
  );
};
