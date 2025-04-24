// app.js (frontend logika)

let kosar = [];

async function betoltTermekek() {
  const res = await fetch("/api/products");
  const termekek = await res.json();
  const listaElem = document.querySelector(".product-list");
  listaElem.innerHTML = "";
  termekek.forEach(termek => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <h3>${termek.nev}</h3>
      <p>${termek.ar} Ft</p>
      <button onclick="hozzaadKosarhoz(${termek.id})">Kosárba</button>
    `;
    listaElem.appendChild(div);
  });
}

function hozzaadKosarhoz(id) {
  fetch("/api/products")
    .then(res => res.json())
    .then(termekek => {
      const termek = termekek.find(t => t.id === id);
      if (termek) {
        kosar.push(termek);
        frissitKosar();
      }
    });
}

function frissitKosar() {
  const kosarElem = document.querySelector(".cart-items");
  kosarElem.innerHTML = "";

  if (kosar.length === 0) {
    kosarElem.innerHTML = '<p>A kosár üres.</p>';
    return;
  }

  kosar.forEach((termek, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      ${termek.nev} - ${termek.ar} Ft
      <button onclick="torolTermek(${index})">Eltávolítás</button>
    `;
    kosarElem.appendChild(div);
  });

  const osszeg = kosar.reduce((acc, t) => acc + t.ar, 0);
  const osszegElem = document.createElement("p");
  osszegElem.innerHTML = `<strong>Összesen: ${osszeg} Ft</strong>`;
  kosarElem.appendChild(osszegElem);
}

function torolTermek(index) {
  kosar.splice(index, 1);
  frissitKosar();
}

function initRendelesForm() {
  const form = document.querySelector(".order-form form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (kosar.length === 0) {
      alert("A kosár üres!");
      return;
    }
    alert("Rendelés sikeresen leadva! Köszönjük a vásárlást.");
    kosar = [];
    frissitKosar();
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  betoltTermekek();
  frissitKosar();
  initRendelesForm();
});
