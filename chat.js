import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Variáveis globais
let currentUser = null;
let otherUserId = null;
let chatId = null;
let productId = null;
let unsubscribeMessages = null;
let unsubscribeUser = null;

// Elementos DOM
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const formMensagem = document.getElementById('formMensagem');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userSubtitle = document.getElementById('userSubtitle');
const userProfileLink = document.getElementById('userProfileLink');
const productMiniCard = document.getElementById('productMiniCard');

// Função principal de inicialização
function initializeChat() {
  const urlParams = new URLSearchParams(window.location.search);
  otherUserId = urlParams.get('vendedor') || urlParams.get('user');
  productId = urlParams.get('produto');
  
  if (!otherUserId || otherUserId === 'undefined') {
    showError('Parâmetro de usuário ausente. Acesse o chat através de um produto ou perfil válido.');
    return;
  }

  // Verificar autenticação
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'log.html';
      return;
    }

    currentUser = user;
    
    // Verificar se não está tentando conversar consigo mesmo
    if (otherUserId === currentUser.uid) {
      showError('Não é possível conversar consigo mesmo.');
      return;
    }

    // Gerar ID da conversa
    chatId = generateChatId();
    
    // Carregar dados do outro usuário
    await loadOtherUserData();
    
    // Criar ou obter conversa
    await createOrGetConversation();
    
    // Carregar mini-card do produto se aplicável
    if (productId) {
      await loadProductMiniCard();
    }
    
    // Inicializar chat
    initializeChatListeners();
    
    // Marcar mensagens como lidas
    markMessagesAsRead();
  });
}

// Gerar ID único da conversa
function generateChatId() {
  const participants = [currentUser.uid, otherUserId].sort();
  if (productId) {
    return `${productId}_${participants.join('_')}`;
  }
  return `direct_${participants.join('_')}`;
}

// Carregar dados do outro usuário
async function loadOtherUserData() {
  try {
    const userDoc = await getDoc(doc(db, 'users', otherUserId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Atualizar interface
      userName.textContent = userData.nome || 'Usuário';
      userPhoto.src = userData.foto || 'images/default-profile.png';
      userProfileLink.href = `perfil.html?id=${otherUserId}`;
      
      // Verificar status online
      if (userData.lastOnline) {
        const lastOnline = userData.lastOnline.toDate ? userData.lastOnline.toDate() : new Date(userData.lastOnline);
        const timeDiff = Date.now() - lastOnline.getTime();
        const isOnline = timeDiff < 2 * 60 * 1000; // 2 minutos
        userSubtitle.textContent = isOnline ? 'Online' : 'Offline';
        userSubtitle.style.color = isOnline ? '#22c55e' : '#888';
      } else {
        userSubtitle.textContent = 'Offline';
        userSubtitle.style.color = '#888';
      }
    } else {
      userName.textContent = 'Usuário';
      userPhoto.src = 'images/default-profile.png';
      userSubtitle.textContent = 'Usuário não encontrado';
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    userName.textContent = 'Usuário';
    userPhoto.src = 'images/default-profile.png';
    userSubtitle.textContent = 'Usuário não encontrado';
  }
}

// Criar ou obter conversa
async function createOrGetConversation() {
  try {
    const conversationRef = doc(db, 'conversas', chatId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      // Criar nova conversa
      await setDoc(conversationRef, {
        participantes: [currentUser.uid, otherUserId],
        ultimaMensagem: '',
        timestamp: serverTimestamp(),
        produtoId: productId || null,
        naoLidas: {
          [currentUser.uid]: 0,
          [otherUserId]: 0
        }
      });
    } else {
      // Verificar se a conversa tem a estrutura correta
      const data = conversationSnap.data();
      if (!data.participantes || !Array.isArray(data.participantes)) {
        await updateDoc(conversationRef, {
          participantes: [currentUser.uid, otherUserId],
          naoLidas: {
            [currentUser.uid]: 0,
            [otherUserId]: 0
          }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao criar/obter conversa:', error);
    showError('Erro ao inicializar conversa. Tente novamente.');
  }
}

// Carregar mini-card do produto
async function loadProductMiniCard() {
  try {
    const productDoc = await getDoc(doc(db, 'produtos', productId));
    if (productDoc.exists()) {
      const product = productDoc.data();
      const image = product.imagemPrincipal || (product.imagens && product.imagens[0]) || 'images/banner1.png';
      
      productMiniCard.innerHTML = `
        <img src="${image}" alt="${product.nome}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
        <div class="prod-info">
          <div class="prod-name">${product.nome}</div>
          <div class="prod-price">€${product.preco || '--'}</div>
        </div>
        <a href="produto-detalhe.html?id=${productId}" class="btn btn-link p-0">Ver Produto</a>
      `;
      productMiniCard.style.display = 'flex';
    }
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
  }
}

// Inicializar listeners do chat
function initializeChatListeners() {
  // Listener para mensagens em tempo real
  const messagesRef = collection(db, 'conversas', chatId, 'mensagens');
  const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
  
  unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    messagesContainer.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });
    
    // Scroll para a última mensagem
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  // Listener para envio de mensagens
  formMensagem.addEventListener('submit', handleSendMessage);
  
  // Listener para atualização de status do outro usuário
  const userRef = doc(db, 'users', otherUserId);
  unsubscribeUser = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      if (userData.lastOnline) {
        const lastOnline = userData.lastOnline.toDate ? userData.lastOnline.toDate() : new Date(userData.lastOnline);
        const timeDiff = Date.now() - lastOnline.getTime();
        const isOnline = timeDiff < 2 * 60 * 1000;
        userSubtitle.textContent = isOnline ? 'Online' : 'Offline';
        userSubtitle.style.color = isOnline ? '#22c55e' : '#888';
      }
    }
  });
}

// Criar elemento de mensagem
function createMessageElement(message) {
  const messageRow = document.createElement('div');
  messageRow.className = 'message-row';
  
  const isMe = message.from === currentUser.uid;
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isMe ? 'me' : 'other'}`;
  messageDiv.textContent = message.text;
  
  messageRow.appendChild(messageDiv);
  
  // Adicionar timestamp
  if (message.timestamp) {
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    const date = message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp);
    timestamp.textContent = date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    messageRow.appendChild(timestamp);
  }
  
  return messageRow;
}

// Enviar mensagem
async function handleSendMessage(e) {
  e.preventDefault();
  
  const text = messageInput.value.trim();
  if (!text) return;
  
  try {
    // Desabilitar botão durante envio
    sendBtn.disabled = true;
    sendBtn.textContent = 'Enviando...';
    
    // Adicionar mensagem
    const messagesRef = collection(db, 'conversas', chatId, 'mensagens');
    await addDoc(messagesRef, {
      text: text,
      from: currentUser.uid,
      to: otherUserId,
      produtoId: productId || null,
      timestamp: serverTimestamp(),
      lida: false
    });
    
    // Atualizar conversa
    const conversationRef = doc(db, 'conversas', chatId);
    await updateDoc(conversationRef, {
      ultimaMensagem: text,
      timestamp: serverTimestamp(),
      [`naoLidas.${otherUserId}`]: increment(1)
    });
    
    // Limpar input
    messageInput.value = '';
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    showError('Erro ao enviar mensagem. Tente novamente.');
  } finally {
    // Reabilitar botão
    sendBtn.disabled = false;
    sendBtn.textContent = 'Enviar';
  }
}

// Marcar mensagens como lidas
async function markMessagesAsRead() {
  try {
    // Zerar contador de não lidas para o usuário atual
    const conversationRef = doc(db, 'conversas', chatId);
    await updateDoc(conversationRef, {
      [`naoLidas.${currentUser.uid}`]: 0
    });
    
    // Marcar mensagens como lidas
    const messagesRef = collection(db, 'conversas', chatId, 'mensagens');
    const unreadQuery = query(
      messagesRef, 
      where('to', '==', currentUser.uid),
      where('lida', '==', false)
    );
    
    const unreadSnap = await getDocs(unreadQuery);
    const updatePromises = unreadSnap.docs.map(doc => 
      updateDoc(doc.ref, { lida: true })
    );
    
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
  }
}

// Mostrar erro
function showError(message) {
  const container = document.querySelector('.chat-container');
  container.innerHTML = `
    <div class="p-5 text-center">
      <div class="text-danger mb-3">
        <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
      </div>
      <h4 class="text-danger">${message}</h4>
      <button class="btn btn-primary mt-3" onclick="window.history.back()">
        <i class="bi bi-arrow-left"></i> Voltar
      </button>
    </div>
  `;
}

// Função para incremento (Firestore)
function increment(value) {
  return {
    __type: 'increment',
    value: value
  };
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
  if (unsubscribeMessages) unsubscribeMessages();
  if (unsubscribeUser) unsubscribeUser();
});

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeChat);
