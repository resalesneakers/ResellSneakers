# ResellSneakers

ResellSneakers é uma plataforma web para compra, venda e troca de sneakers (ténis) entre utilizadores, com foco em segurança, responsividade e experiência moderna.

## 🚀 Tecnologias Usadas
- **Frontend:** HTML, CSS, JavaScript (ES6+)
- **Backend/Serviços:** Firebase (Authentication, Firestore, Storage, Hosting)
- **Design:** Bootstrap, FontAwesome

## 📂 Estrutura do Firestore
- **usuarios**: Dados dos utilizadores (nome, email, foto, etc)
- **produtos**: Produtos publicados (nome, preço, condição, imagens, vendedorId, etc)
- **conversas**: Conversas entre utilizadores (participants, produtoId, lastMessage, ...)
  - **conversas/{chatId}/mensagens**: Mensagens de cada conversa
- **favoritos**: Produtos favoritos de cada utilizador (userId, produtoId)
- **carrinhos**: Carrinho de cada utilizador (userId, produtos[])
- **compras**: Pedidos/finalizações de compra (userId, produtos[], total, data)

## 🛠️ Como rodar localmente
1. Clone o repositório e instale um servidor local (ex: Live Server, http-server, etc).
2. Configure o arquivo `firebase-config.js` com as suas credenciais do Firebase.
3. Abra `index.html` ou `home.html` no navegador.

## 👑 Como adicionar administradores
- O UID do admin está definido em `admin.js` e `dashboard.js` na constante `UID_ADMIN`.
- Para adicionar um novo admin, obtenha o UID do utilizador no Firebase Auth e substitua/adicione na constante.
- Exemplo:
  ```js
  const UID_ADMIN = "SEU_UID_AQUI";
  ```
- Apenas utilizadores com este UID terão acesso às páginas administrativas.

## 🔒 Fluxo de permissões
- **Utilizador comum:** Pode comprar, vender, trocar, favoritar, conversar, editar perfil.
- **Admin:** Pode eliminar produtos, exportar dados, ver estatísticas globais.
- **Acesso restrito:** Páginas admin e dashboard redirecionam se o UID não for de admin.

## 🧑‍💻 Dicas de manutenção
- Sempre use o menu universal (`menu.html`) para garantir navegação consistente.
- Use apenas dados reais do Firestore/Storage/Auth, nunca simule dados.
- Para adicionar novos campos em produtos ou utilizadores, atualize o Firestore e os formulários correspondentes.
- Para suporte a notificações, utilize listeners do Firestore (onSnapshot).
- Para adicionar novas permissões, centralize a lógica nos scripts admin.

## 📞 Contato/Suporte
- Para dúvidas, sugestões ou suporte, entre em contato com o responsável pelo projeto ou abra uma issue no repositório. 