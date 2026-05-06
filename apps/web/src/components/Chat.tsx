'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: '/api/chat' });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>🛡️</span>
        <div>
          <h1 style={styles.title}>Onsse</h1>
          <p style={styles.subtitle}>Votre bouclier temporel</p>
        </div>
      </header>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <p>Bonjour ! Je suis Onsse, votre assistant de suivi du temps.</p>
            <p>Dites-moi par exemple :</p>
            <ul style={styles.suggestions}>
              <li>
                &ldquo;Je commence ma journée&rdquo;
              </li>
              <li>&#34;Pause déjeuner&#34;</li>
              <li>&#34;Je reprends&#34;</li>
              <li>&#34;Quel est mon solde ?&#34;</li>
              <li>&#34;Je pars pour aujourd&#39;hui&#34;</li>
            </ul>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}
          >
            {msg.role === 'user' ? (
              <div style={styles.bubble}>{msg.content}</div>
            ) : (
              <div>
                {msg.parts?.map((part, i) => {
                  if (part.type === 'text' && part.text.trim()) {
                    return (
                      <div key={i} style={styles.bubble}>
                        {part.text}
                      </div>
                    );
                  }
                  return null;
                }) ?? <div style={styles.bubble}>{msg.content}</div>}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={styles.assistantMsg}>
            <div style={{ ...styles.bubble, ...styles.loading }}>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Écrivez votre message…"
          style={styles.input}
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading || !input.trim()} style={styles.button}>
          Envoyer
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    maxWidth: '680px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#111827',
    color: '#fff',
    flexShrink: 0,
  },
  logo: { fontSize: '28px' },
  title: { margin: 0, fontSize: '18px', fontWeight: 700 },
  subtitle: { margin: 0, fontSize: '12px', color: '#9ca3af' },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '32px 16px',
    lineHeight: 1.6,
  },
  suggestions: {
    listStyle: 'none',
    padding: 0,
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userMsg: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  assistantMsg: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: '10px 14px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  loading: {
    display: 'flex',
    gap: '4px',
    color: '#9ca3af',
    fontSize: '20px',
  },
  form: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '24px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  button: {
    padding: '10px 18px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#111827',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  },
};
