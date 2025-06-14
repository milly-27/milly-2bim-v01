// Variáveis globais
let produtos = [];
let cupons = [];
let usuarios = [];
let editandoProduto = null;
let editandoCupom = null;
let editandoUsuario = null;

// Inicialização
window.onload = function() {
  carregarTodosDados();
};

// Funções de navegação entre abas
function mostrarAba(aba) {
  // Esconder todas as abas
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remover classe active de todos os botões
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar aba selecionada
  document.getElementById(aba).classList.add('active');
  
  // Ativar botão correspondente
  event.target.classList.add('active');
}

// Funções de carregamento de dados
async function carregarTodosDados() {
  await carregarProdutos();
  await carregarCupons();
  await carregarUsuarios();
}

async function carregarProdutos() {
  try {
    const response = await fetch('http://localhost:3000/produtos');
    produtos = await response.json();
    renderizarProdutos();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    alert('Erro ao carregar produtos');
  }
}

async function carregarCupons() {
  try {
    const response = await fetch('http://localhost:3000/cupons');
    cupons = await response.json();
    renderizarCupons();
  } catch (error) {
    console.error('Erro ao carregar cupons:', error);
    alert('Erro ao carregar cupons');
  }
}

async function carregarUsuarios() {
  try {
    const response = await fetch('http://localhost:3000/users');
    usuarios = await response.json();
    renderizarUsuarios();
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    alert('Erro ao carregar usuários');
  }
}

// Funções de renderização
function renderizarProdutos() {
  const tbody = document.getElementById('lista-produtos');
  tbody.innerHTML = '';
  
  produtos.forEach(produto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${produto.name}</td>
      <td>R$ ${produto.price.toFixed(2)}</td>
      <td>${produto.category}</td>
      <td>${produto.image ? '<img src="' + produto.image + '" alt="' + produto.name + '" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">' : 'Sem imagem'}</td>
      <td>
        <button class="btn-editar" onclick="editarProduto('${produto.name}')">Editar</button>
        <button class="btn-excluir" onclick="excluirProduto('${produto.name}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarCupons() {
  const tbody = document.getElementById('lista-cupons');
  tbody.innerHTML = '';
  
  cupons.forEach(cupom => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cupom.code}</td>
      <td>${(cupom.discount * 100).toFixed(0)}%</td>
      <td>
        <button class="btn-editar" onclick="editarCupom('${cupom.code}')">Editar</button>
        <button class="btn-excluir" onclick="excluirCupom('${cupom.code}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarUsuarios() {
  const tbody = document.getElementById('lista-usuarios');
  tbody.innerHTML = '';
  
  usuarios.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.username}</td>
      <td>${usuario.email}</td>
      <td>${usuario.password}</td>
      <td>${usuario.tipo}</td>
      <td>
        <button class="btn-editar" onclick="editarUsuario('${usuario.email}')">Editar</button>
        <button class="btn-excluir" onclick="excluirUsuario('${usuario.email}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Funções de modal
function abrirModalProduto() {
  editandoProduto = null;
  document.getElementById('titulo-modal-produto').textContent = 'Adicionar Produto';
  document.getElementById('form-produto').reset();
  document.getElementById('modal-produto').style.display = 'block';
}

function abrirModalCupom() {
  editandoCupom = null;
  document.getElementById('titulo-modal-cupom').textContent = 'Adicionar Cupom';
  document.getElementById('form-cupom').reset();
  document.getElementById('modal-cupom').style.display = 'block';
}

function abrirModalUsuario() {
  editandoUsuario = null;
  document.getElementById('titulo-modal-usuario').textContent = 'Adicionar Usuário';
  document.getElementById('form-usuario').reset();
  document.getElementById('modal-usuario').style.display = 'block';
}

function fecharModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Funções de edição
function editarProduto(nome) {
  const produto = produtos.find(p => p.name === nome);
  if (!produto) return;
  
  editandoProduto = nome;
  document.getElementById('titulo-modal-produto').textContent = 'Editar Produto';
  document.getElementById('nome-produto').value = produto.name;
  document.getElementById('preco-produto').value = produto.price;
  document.getElementById('categoria-produto').value = produto.category;
  document.getElementById('imagem-produto').value = produto.image || '';
  document.getElementById('modal-produto').style.display = 'block';
}

function editarCupom(codigo) {
  const cupom = cupons.find(c => c.code === codigo);
  if (!cupom) return;
  
  editandoCupom = codigo;
  document.getElementById('titulo-modal-cupom').textContent = 'Editar Cupom';
  document.getElementById('codigo-cupom').value = cupom.code;
  document.getElementById('desconto-cupom').value = cupom.discount * 100;
  document.getElementById('modal-cupom').style.display = 'block';
}

function editarUsuario(email) {
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return;
  
  editandoUsuario = email;
  document.getElementById('titulo-modal-usuario').textContent = 'Editar Usuário';
  document.getElementById('username-usuario').value = usuario.username;
  document.getElementById('email-usuario').value = usuario.email;
  document.getElementById('senha-usuario').value = usuario.password;
  document.getElementById('tipo-usuario').value = usuario.tipo;
  document.getElementById('modal-usuario').style.display = 'block';
}

// Funções de exclusão
async function excluirProduto(nome) {
  if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return;
  
  try {
    const response = await fetch(`http://localhost:3000/produtos/${encodeURIComponent(nome)}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await carregarProdutos();
      alert('Produto excluído com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro ao excluir produto: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    alert('Erro ao excluir produto');
  }
}

async function excluirCupom(codigo) {
  if (!confirm(`Tem certeza que deseja excluir o cupom "${codigo}"?`)) return;
  
  try {
    const response = await fetch(`http://localhost:3000/cupons/${encodeURIComponent(codigo)}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await carregarCupons();
      alert('Cupom excluído com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro ao excluir cupom: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao excluir cupom:', error);
    alert('Erro ao excluir cupom');
  }
}

async function excluirUsuario(email) {
  if (!confirm(`Tem certeza que deseja excluir o usuário "${email}"?`)) return;
  
  try {
    const response = await fetch(`http://localhost:3000/users/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await carregarUsuarios();
      alert('Usuário excluído com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro ao excluir usuário: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    alert('Erro ao excluir usuário');
  }
}

// Event listeners para formulários
document.getElementById('form-produto').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const dados = {
    name: document.getElementById('nome-produto').value,
    price: parseFloat(document.getElementById('preco-produto').value),
    category: document.getElementById('categoria-produto').value,
    image: document.getElementById('imagem-produto').value
  };
  
  try {
    let response;
    if (editandoProduto) {
      // Editar produto existente
      response = await fetch(`http://localhost:3000/produtos/${encodeURIComponent(editandoProduto)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    } else {
      // Adicionar novo produto
      response = await fetch('http://localhost:3000/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    }
    
    if (response.ok) {
      await carregarProdutos();
      fecharModal('modal-produto');
      alert(editandoProduto ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto');
  }
});

document.getElementById('form-cupom').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const dados = {
    code: document.getElementById('codigo-cupom').value.toUpperCase(),
    discount: parseFloat(document.getElementById('desconto-cupom').value) / 100
  };
  
  try {
    let response;
    if (editandoCupom) {
      // Editar cupom existente
      response = await fetch(`http://localhost:3000/cupons/${encodeURIComponent(editandoCupom)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    } else {
      // Adicionar novo cupom
      response = await fetch('http://localhost:3000/cupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    }
    
    if (response.ok) {
      await carregarCupons();
      fecharModal('modal-cupom');
      alert(editandoCupom ? 'Cupom atualizado com sucesso!' : 'Cupom adicionado com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao salvar cupom:', error);
    alert('Erro ao salvar cupom');
  }
});

document.getElementById('form-usuario').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const dados = {
    username: document.getElementById('username-usuario').value,
    email: document.getElementById('email-usuario').value,
    password: document.getElementById('senha-usuario').value,
    tipo: document.getElementById('tipo-usuario').value
  };
  
  try {
    let response;
    if (editandoUsuario) {
      // Editar usuário existente
      response = await fetch(`http://localhost:3000/users/${encodeURIComponent(editandoUsuario)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    } else {
      // Adicionar novo usuário
      response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
    }
    
    if (response.ok) {
      await carregarUsuarios();
      fecharModal('modal-usuario');
      alert(editandoUsuario ? 'Usuário atualizado com sucesso!' : 'Usuário adicionado com sucesso!');
    } else {
      const error = await response.json();
      alert('Erro: ' + error.message);
    }
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    alert('Erro ao salvar usuário');
  }
});

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};
function filtrarTabela(inputId, tabelaId) {
  const filtro = document.getElementById(inputId).value.toLowerCase();
  const linhas = document.querySelectorAll(`#${tabelaId} tbody tr`);

  linhas.forEach(linha => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(filtro) ? '' : 'none';
  });
}


// Função para upload de imagem
async function uploadImagem() {
  const fileInput = document.getElementById('upload-imagem-produto');
  const urlInput = document.getElementById('imagem-produto');
  
  if (!fileInput.files[0]) {
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    // Mostrar loading
    urlInput.value = 'Enviando imagem...';
    
    const response = await fetch('/upload-image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      urlInput.value = data.imageUrl;
      alert('Imagem enviada com sucesso!');
    } else {
      alert('Erro ao enviar imagem: ' + data.message);
      urlInput.value = '';
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    alert('Erro ao enviar imagem. Tente novamente.');
    urlInput.value = '';
  }
}


// Funções de autenticação
function verificarUsuarioLogado() {
  const currentUser = localStorage.getItem('currentUser');
  const userInfoDiv = document.getElementById('user-info');
  const userNameSpan = document.getElementById('user-name');

  if (currentUser) {
    const user = JSON.parse(currentUser);
    userNameSpan.textContent = user.username;
    userInfoDiv.style.display = 'block';
    
    // Verificar se o usuário é gerente
    if (user.tipo !== 'gerente') {
      alert('Acesso negado! Apenas gerentes podem acessar esta página.');
      window.location.href = '../principal/index.html';
      return null;
    }
    
    return user;
  } else {
    alert('Você precisa fazer login como gerente para acessar esta página.');
    window.location.href = '../login/login.html';
    return null;
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  alert('Logout realizado com sucesso!');
  window.location.href = '../login/login.html';
}

// Verificar status do usuário quando a página carrega
window.addEventListener('DOMContentLoaded', function() {
  verificarUsuarioLogado();
});

