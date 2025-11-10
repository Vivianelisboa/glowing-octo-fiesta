const baseUrl = "http://localhost:8080/api";

// ===== LOGIN =====
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    document.getElementById("user-name").textContent = data.user.name;
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("main-section").classList.remove("hidden");
    mostrarTela("materiais");
    carregarMateriais();
  } else {
    document.getElementById("login-error").textContent = "Login inválido.";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  document.getElementById("main-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
});

// ===== HELPER =====
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

// ===== MATERIAIS =====
async function carregarMateriais() {
  const res = await authFetch(`${baseUrl}/materiais`);
  const lista = document.getElementById("lista-materiais");
  lista.innerHTML = "";

  if (res.ok) {
    const materiais = await res.json();
    materiais.forEach((m) => {
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <b>${m.tipo}</b><br>
        ${m.descricao || "Sem descrição"}<br>
        <small>R$ ${m.preco_kg.toFixed(2)}/Kg</small><br><br>
        <button onclick="editarMaterial('${m.id_material}','${m.tipo}','${m.descricao}','${m.preco_kg}')">Editar</button>
        <button onclick="excluirMaterial('${m.id_material}')">Excluir</button>
      `;
      lista.appendChild(div);
    });
  } else lista.textContent = "Erro ao carregar materiais.";
}

document
  .getElementById("material-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id_material = document.getElementById("id_material").value;
    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value;
    const preco_kg = parseFloat(document.getElementById("preco_kg").value);

    const body = { tipo, descricao, preco_kg };
    const method = id_material ? "PUT" : "POST";
    const url = id_material
      ? `${baseUrl}/materiais/${id_material}`
      : `${baseUrl}/materiais`;

    const res = await authFetch(url, { method, body: JSON.stringify(body) });
    if (res.ok) {
      alert("Material salvo!");
      e.target.reset();
      document.getElementById("id_material").value = "";
      carregarMateriais();
    } else alert("Erro ao salvar material.");
  });

function editarMaterial(id, tipo, desc, preco) {
  document.getElementById("id_material").value = id;
  document.getElementById("tipo").value = tipo;
  document.getElementById("descricao").value = desc;
  document.getElementById("preco_kg").value = preco;
}

async function excluirMaterial(id) {
  if (!confirm("Excluir material?")) return;
  const res = await authFetch(`${baseUrl}/materiais/${id}`, { method: "DELETE" });
  if (res.ok) carregarMateriais();
}

// ===== FORNECEDORES =====
async function carregarFornecedores() {
  const res = await authFetch(`${baseUrl}/fornecedores`);
  const lista = document.getElementById("lista-fornecedores");
  lista.innerHTML = "";

  if (res.ok) {
    const fornecedores = await res.json();
    fornecedores.forEach((f) => {
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <b>${f.nome}</b><br>
        <small>${f.tipo_fornecedor}</small><br>
        <small>CPF/CNPJ: ${f.cpf_cnpj}</small><br>
        <small>Telefone: ${f.telefone || "-"}</small>
      `;
      lista.appendChild(div);
    });
  } else lista.textContent = "Erro ao carregar fornecedores.";
}

// ===== ESTOQUE =====
async function carregarEstoque() {
  const res = await authFetch(`${baseUrl}/estoque`);
  const lista = document.getElementById("lista-estoque");
  lista.innerHTML = "";

  if (res.ok) {
    const estoques = await res.json();
    estoques.forEach((e) => {
      const div = document.createElement("div");
      div.className = "item-card";
      const alerta =
        e.nivel_atual < e.nivel_minimo
          ? `<span style='color:red;'>⚠️ Abaixo do mínimo</span>`
          : "";
      div.innerHTML = `
        <b>${e.localizacao}</b><br>
        Capacidade: ${e.capacidade} Kg<br>
        Nível atual: ${e.nivel_atual} Kg<br>
        Mínimo: ${e.nivel_minimo} Kg<br>
        ${alerta}
      `;
      lista.appendChild(div);
    });
  } else lista.textContent = "Erro ao carregar estoque.";
}

// ===== TROCAR TELAS =====
function mostrarTela(nome) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.add("hidden"));
  document.getElementById(`tela-${nome}`).classList.remove("hidden");
  if (nome === "materiais") carregarMateriais();
  if (nome === "fornecedores") carregarFornecedores();
  if (nome === "estoque") carregarEstoque();
}
