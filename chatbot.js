// Widget de Chatbot/Suporte ao Vivo para ResellSneakers
(function() {
  // Cria botão flutuante
  const btn = document.createElement('button');
  btn.id = 'rs-chatbot-btn';
  btn.innerHTML = '<i class="fa fa-comments"></i>';
  btn.style.position = 'fixed';
  btn.style.bottom = '24px';
  btn.style.right = '24px';
  btn.style.zIndex = '9999';
  btn.style.background = '#222';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '50%';
  btn.style.width = '56px';
  btn.style.height = '56px';
  btn.style.fontSize = '2rem';
  btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  btn.style.cursor = 'pointer';
  btn.title = 'Suporte ao Vivo';

  // Cria janela de chat
  const chat = document.createElement('div');
  chat.id = 'rs-chatbot-window';
  chat.style.position = 'fixed';
  chat.style.bottom = '90px';
  chat.style.right = '24px';
  chat.style.width = '340px';
  chat.style.maxWidth = '95vw';
  chat.style.height = '420px';
  chat.style.background = '#fff';
  chat.style.borderRadius = '16px';
  chat.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  chat.style.display = 'none';
  chat.style.flexDirection = 'column';
  chat.style.overflow = 'hidden';
  chat.style.zIndex = '10000';

  chat.innerHTML = `
    <div style="background:#222;color:#fff;padding:1rem;display:flex;align-items:center;justify-content:space-between;">
      <span><i class="fa fa-robot"></i> Suporte ResellSneakers</span>
      <button id="rs-chatbot-close" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;">&times;</button>
    </div>
    <div id="rs-chatbot-messages" style="flex:1;overflow-y:auto;padding:1rem;background:#fafbfc;"></div>
    <form id="rs-chatbot-form" style="display:flex;padding:0.5rem;border-top:1px solid #eee;background:#fff;">
      <input id="rs-chatbot-input" type="text" placeholder="Digite sua dúvida..." style="flex:1;border:none;padding:0.5rem;font-size:1rem;outline:none;">
      <button type="submit" style="background:#222;color:#fff;border:none;padding:0.5rem 1rem;margin-left:0.5rem;border-radius:6px;">Enviar</button>
    </form>
    <div style="padding:0.5rem 1rem;font-size:0.9rem;color:#888;text-align:center;">Respostas automáticas. Precisa de ajuda humana? <a href='mailto:suporte@resellsneakers.com'>Fale conosco</a></div>
  `;

  // Adiciona ao body
  document.body.appendChild(btn);
  document.body.appendChild(chat);

  // Abrir/fechar chat
  btn.onclick = () => { chat.style.display = chat.style.display === 'none' ? 'flex' : 'none'; };
  chat.querySelector('#rs-chatbot-close').onclick = () => { chat.style.display = 'none'; };

  // Respostas automáticas (FAQ simples)
  const faqs = [
    { q: 'esqueci minha senha', a: 'Clique em "Entrar" > "Esqueci minha senha" para redefinir.' },
    { q: 'formas de pagamento', a: 'Aceitamos cartão de crédito, PayPal e saldo na carteira.' },
    { q: 'como vender', a: 'Clique em "Vender" no menu e preencha os dados do produto.' },
    { q: 'envio', a: 'O vendedor envia o produto após a compra. O rastreio fica disponível no painel.' },
    { q: 'suporte', a: 'Você pode falar conosco pelo chat ou e-mail: suporte@resellsneakers.com' },
    { q: 'segurança', a: 'Usamos criptografia e práticas modernas de segurança.' },
  ];

  function addMessage(text, from) {
    const msg = document.createElement('div');
    msg.style.margin = '0.5rem 0';
    msg.style.textAlign = from === 'user' ? 'right' : 'left';
    msg.innerHTML = `<span style="display:inline-block;max-width:80%;padding:0.5rem 1rem;border-radius:12px;${from==='user'?'background:#222;color:#fff;':'background:#f1f1f1;color:#222;'}">${text}</span>`;
    chat.querySelector('#rs-chatbot-messages').appendChild(msg);
    chat.querySelector('#rs-chatbot-messages').scrollTop = 9999;
  }

  // Mensagem de boas-vindas
  addMessage('Olá! Sou o assistente do ResellSneakers. Como posso ajudar?', 'bot');

  // Envio de mensagem
  chat.querySelector('#rs-chatbot-form').onsubmit = function(e) {
    e.preventDefault();
    const input = chat.querySelector('#rs-chatbot-input');
    const val = input.value.trim();
    if (!val) return;
    addMessage(val, 'user');
    input.value = '';
    // Busca resposta automática
    const found = faqs.find(f => val.toLowerCase().includes(f.q));
    setTimeout(() => {
      if (found) {
        addMessage(found.a, 'bot');
      } else {
        addMessage('Não encontrei uma resposta automática. Por favor, consulte a <a href="faq.html">Central de Ajuda</a> ou <a href="mailto:suporte@resellsneakers.com">fale conosco</a>.', 'bot');
      }
    }, 600);
  };
})(); 