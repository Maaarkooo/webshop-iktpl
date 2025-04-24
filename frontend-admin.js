// frontend-admin.js

async function betoltFelhasznalok() {
  const lista = document.getElementById("user-list");
  lista.innerHTML = "";
  const res = await fetch("/api/users");
  const users = await res.json();
  users.forEach(username => {
    const li = document.createElement("li");
    li.textContent = username;

    const btn = document.createElement("button");
    btn.textContent = "Törlés";
    btn.onclick = async () => {
      const confirmDelete = confirm(`Biztos törölni akarod ${username} felhasználót?`);
      if (!confirmDelete) return;
      await fetch(`/api/users/${username}`, { method: "DELETE" });
      betoltFelhasznalok();
    };

    li.appendChild(document.createTextNode(" "));
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

async function betoltTermekek() {
  const lista = document.getElementById("product-list");
  if (!lista) return;
  lista.innerHTML = "";
  const res = await fetch("/api/products");
  const termekek = await res.json();
  termekek.forEach(termek => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${termek.nev}</strong> - ${termek.ar} Ft
      <button onclick="torolTermek(${termek.id})">Törlés</button>
      <button onclick="szerkesztTermek(${termek.id}, '${termek.nev}', ${termek.ar})">Szerkesztés</button>
    `;
    lista.appendChild(li);
  });
}

async function torolTermek(id) {
  const confirmDelete = confirm("Biztos törölni szeretnéd ezt a terméket?");
  if (!confirmDelete) return;
  await fetch(`/api/products/${id}`, { method: "DELETE" });
  betoltTermekek();
}

function szerkesztTermek(id, nev, ar) {
  const ujNev = prompt("Új név:", nev);
  const ujAr = prompt("Új ár:", ar);
  if (ujNev && ujAr) {
    fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nev: ujNev, ar: parseInt(ujAr) })
    }).then(() => betoltTermekek());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  betoltFelhasznalok();
  betoltTermekek();

  const form = document.getElementById("user-create-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nev = document.getElementById("uj-felhasznalo").value;
    const jelszo = document.getElementById("uj-jelszo").value;

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nev, password: jelszo })
    });

    if (res.ok) {
      form.reset();
      betoltFelhasznalok();
    } else {
      const hiba = await res.text();
      alert("Hiba: " + hiba);
    }
  });

  const termekForm = document.getElementById("admin-form");
  termekForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nev = document.getElementById("termek-nev").value;
    const ar = document.getElementById("termek-ar").value;

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nev, ar })
    });

    if (res.ok) {
      alert("Termék sikeresen hozzáadva!");
      termekForm.reset();
      betoltTermekek();
    } else {
      const hiba = await res.text();
      alert("Hiba: " + hiba);
    }
  });
});
