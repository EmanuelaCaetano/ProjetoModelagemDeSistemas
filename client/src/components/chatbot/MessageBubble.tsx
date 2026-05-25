import React from 'react';
import './MessageBubble.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  timestamp,
  toolsUsed,
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message-bubble message-${role}`}>
      <div className="message-content">
        <p className="message-text">{content}</p>

        {toolsUsed && toolsUsed.length > 0 && (
          <div className="tools-used">
            <small>🔧 Ferramentas usadas: {toolsUsed.join(', ')}</small>
          </div>
        )}

        <span className="message-time">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};
