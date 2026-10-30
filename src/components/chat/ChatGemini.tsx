import { useState, useEffect, useRef } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

type Status = 'conectando' | 'conectado' | 'desconectado' | 'erro';

const WS_URL = 'wss://api.joaogustavo.feliz.web.ufersa.dev.br';
/** Tempo máximo esperando a resposta da Lambda/Gemini antes de avisar o usuário. */
const TIMEOUT_RESPOSTA_MS = 30000;

const STATUS_LABEL: Record<Status, string> = {
  conectando: 'Conectando...',
  conectado: 'Online',
  desconectado: 'Desconectado',
  erro: 'Erro de conexão',
};

/**
 * Chat com o Gemini via WebSocket do API Gateway, exibido como uma bolha flutuante.
 * A conexão só é aberta quando o chat está aberto.
 */
export default function ChatGemini() {
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState<Status>('desconectado');
  const [aguardando, setAguardando] = useState(false);
  const [mensagens, setMensagens] = useState<{ autor: string; texto: string }[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const limparTimeout = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => {
    if (!aberto) return;
    let cancelado = false;

    async function conectarWebSocket() {
      setStatus('conectando');
      try {
        const { tokens } = await fetchAuthSession();
        const token = tokens?.accessToken?.toString();
        if (cancelado) return;

        const socket = new WebSocket(`${WS_URL}?token=${token}`);
        ws.current = socket;

        socket.onopen = () => {
          console.log('Conexão WebSocket estabelecida');
          setStatus('conectado');
        };

        socket.onmessage = (event) => {
          limparTimeout();
          setAguardando(false);
          let texto: string;
          try {
            const resposta = JSON.parse(event.data);
            // A Lambda atual envia { resposta }, versões antigas enviavam { reply }
            texto = resposta.resposta ?? resposta.reply ?? resposta.message ?? event.data;
          } catch {
            texto = event.data;
          }
          setMensagens(prev => [...prev, { autor: 'Gemini', texto }]);
        };

        socket.onerror = (error) => {
          console.error('Erro no WebSocket:', error);
          setStatus('erro');
        };

        socket.onclose = () => {
          limparTimeout();
          setAguardando(false);
          setStatus(s => (s === 'erro' ? s : 'desconectado'));
        };
      } catch (error) {
        console.error('Erro de autenticação:', error);
        if (!cancelado) setStatus('erro');
      }
    }

    conectarWebSocket();
    return () => {
      cancelado = true;
      limparTimeout();
      ws.current?.close();
      ws.current = null;
    };
  }, [aberto]);

  // Rola para a última mensagem
  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensagens, aguardando]);

  const enviarMensagem = () => {
    const texto = input.trim();
    if (ws.current && ws.current.readyState === WebSocket.OPEN && texto !== '' && !aguardando) {
      const payload = JSON.stringify({ action: '$default', message: texto });
      ws.current.send(payload);
      setMensagens(prev => [...prev, { autor: 'Você', texto }]);
      setInput('');
      setAguardando(true);

      // A Lambda não responde em caso de erro; evita ficar "digitando" para sempre.
      limparTimeout();
      timeoutRef.current = window.setTimeout(() => {
        setAguardando(false);
        setMensagens(prev => [
          ...prev,
          { autor: 'Gemini', texto: 'Não recebi resposta. Tente novamente.' },
        ]);
      }, TIMEOUT_RESPOSTA_MS);
    }
  };

  return (
    <>
      {/* Bolha flutuante */}
      {!aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir chat com IA"
          className="fixed right-4 bottom-[70px] z-[110] w-14 h-14 rounded-full bg-[#314863] text-[#9FB7D6] shadow-lg flex items-center justify-center hover:brightness-110"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </button>
      )}

      {/* Janela do chat */}
      {aberto && (
        <div className="fixed right-4 bottom-[70px] z-[110] w-[calc(100%-2rem)] max-w-[360px] h-[480px] max-h-[calc(100vh-90px)] flex flex-col rounded-[12px] overflow-hidden shadow-2xl border border-[#40493D] bg-[#000F1E]">
          <header className="flex items-center justify-between px-4 py-3 bg-[#314863]">
            <div>
              <p className="text-white text-[14px] font-semibold">Chat com Gemini</p>
              <p className="text-[#9FB7D6] text-[11px]">{STATUS_LABEL[status]}</p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="text-[#BFCABA] text-[22px] leading-none px-2"
            >
              ×
            </button>
          </header>

          <div ref={listaRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#102A43]">
            {mensagens.length === 0 && (
              <p className="text-[#9FB7D6] text-[13px] text-center mt-4">
                Escreva a sua pergunta para o Gemini.
              </p>
            )}
            {mensagens.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] px-3 py-2 rounded-[10px] text-[14px] whitespace-pre-wrap break-words ${
                  msg.autor === 'Você'
                    ? 'self-end bg-[#314863] text-white'
                    : 'self-start bg-[#000F1E] text-[#E6EEF7]'
                }`}
              >
                {msg.texto}
              </div>
            ))}
            {aguardando && (
              <div className="self-start px-3 py-2 rounded-[10px] text-[13px] bg-[#000F1E] text-[#9FB7D6]">
                Gemini está digitando...
              </div>
            )}
          </div>

          <div className="flex gap-2 p-2 border-t border-[#40493D]">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviarMensagem()}
              disabled={status !== 'conectado'}
              placeholder={status === 'conectado' ? 'Escreva a sua pergunta...' : STATUS_LABEL[status]}
              className="flex-1 rounded-[8px] px-3 py-2 text-[14px] bg-[#102A43] text-white placeholder-[#9FB7D6] outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={enviarMensagem}
              disabled={status !== 'conectado' || !input.trim() || aguardando}
              className="px-4 rounded-[8px] bg-[#314863] text-white text-[14px] disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
