# Sistema de Chat - ResellSneakers

## 📋 Visão Geral

O sistema de chat do ResellSneakers permite comunicação em tempo real entre compradores e vendedores, com suporte a conversas diretas e conversas relacionadas a produtos específicos.

## 🏗️ Estrutura do Sistema

### Arquivos Principais
- `chat.html` - Interface de chat individual
- `chat.js` - Lógica do chat individual
- `mensagens.html` - Lista de conversas
- `firestore.rules` - Regras de segurança do Firestore

### Estrutura no Firestore

#### Coleção: `conversas`
```javascript
{
  participantes: ["user1Id", "user2Id"],
  ultimaMensagem: "Texto da última mensagem",
  timestamp: serverTimestamp(),
  produtoId: "produtoId" // opcional
  naoLidas: {
    user1Id: 0,
    user2Id: 2
  }
}
```

#### Subcoleção: `conversas/{conversaId}/mensagens`
```javascript
{
  text: "Texto da mensagem",
  from: "userId",
  to: "otherUserId",
  produtoId: "produtoId", // opcional
  timestamp: serverTimestamp(),
  lida: false
}
```

## 🔐 Segurança

### Autenticação
- Todas as páginas de chat requerem autenticação
- Redirecionamento automático para `log.html` se não autenticado

### Regras do Firestore
- Usuários só podem acessar conversas onde são participantes
- Mensagens só podem ser lidas/escritas por participantes da conversa
- Produtos podem ser lidos por todos, mas só editados pelo vendedor

## 🚀 Funcionalidades

### 1. Chat Individual (`chat.html`)
- **Acesso**: Via URL com parâmetros `?vendedor=userId&produto=produtoId`
- **Funcionalidades**:
  - Mensagens em tempo real
  - Indicador de status online/offline
  - Mini-card do produto (se aplicável)
  - Marcação automática de mensagens como lidas
  - Contadores de mensagens não lidas

### 2. Lista de Conversas (`mensagens.html`)
- **Acesso**: Via menu ou link direto
- **Funcionalidades**:
  - Lista todas as conversas do usuário
  - Indicadores de status online
  - Contadores de mensagens não lidas
  - Ordenação por última mensagem
  - Chat integrado na mesma página

### 3. Integração com Produtos
- Botões "Conversar com Vendedor" em páginas de produtos
- Conversas podem ser vinculadas a produtos específicos
- Mini-cards de produtos nas conversas

## 🔗 Como Usar

### Para Compradores
1. Navegue até um produto
2. Clique em "Conversar com Vendedor"
3. Será redirecionado para o chat com o vendedor
4. Envie mensagens e receba respostas em tempo real

### Para Vendedores
1. Acesse "Mensagens" no menu
2. Veja todas as conversas ativas
3. Clique em uma conversa para responder
4. Receba notificações de novas mensagens

### URLs de Exemplo
```
// Chat direto com vendedor
chat.html?vendedor=abc123

// Chat sobre produto específico
chat.html?vendedor=abc123&produto=xyz789

// Lista de conversas
mensagens.html
```

## 🎨 Interface

### Design Responsivo
- Adaptado para desktop e mobile
- Interface moderna com Bootstrap 5
- Ícones do Bootstrap Icons e Font Awesome

### Estados Visuais
- **Carregando**: Spinner animado
- **Vazio**: Mensagens informativas
- **Online/Offline**: Indicadores coloridos
- **Mensagens não lidas**: Badges vermelhos

## 🔧 Configuração

### 1. Firebase
Certifique-se de que o `firebase-config.js` está configurado corretamente:
```javascript
const firebaseConfig = {
  // Suas configurações do Firebase
};
```

### 2. Firestore Rules
Deploy as regras do `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### 3. Estrutura de Dados
O sistema cria automaticamente:
- Coleção `conversas` para conversas
- Subcoleções `mensagens` para mensagens
- Campos `naoLidas` para contadores

## 🐛 Troubleshooting

### Problemas Comuns

1. **"Vendedor undefined"**
   - Verifique se o produto tem `vendedorId` válido
   - Confirme que o usuário existe na coleção `users`

2. **Mensagens não aparecem**
   - Verifique as regras do Firestore
   - Confirme que o usuário está autenticado
   - Verifique a conexão com a internet

3. **Erro de permissão**
   - Deploy as regras do Firestore
   - Verifique se o usuário é participante da conversa

### Logs de Debug
O sistema inclui logs detalhados no console do navegador para facilitar o debugging.

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **Firebase**: Versão 9.x ou superior

## 🔄 Atualizações Futuras

- Notificações push
- Envio de imagens
- Emojis e reações
- Busca de mensagens
- Histórico de conversas
- Bloqueio de usuários 