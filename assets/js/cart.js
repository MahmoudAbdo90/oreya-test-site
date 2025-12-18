const CART_KEY = "oreya_cart_v1";
const SHIPPING_THRESHOLD = 60.0;
const SHIPPING_FEE = 4.90;

function euro(n){ return (Math.round(n*100)/100).toFixed(2).replace(".", ",") + "€"; }

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCartCount();
}
function renderCartCount(){
  const count = loadCart().reduce((acc, it) => acc + it.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

function addToCart(name, price, sku){
  const items = loadCart();
  const id = sku || name;
  const existing = items.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else items.push({ id, name, price, qty: 1 });
  saveCart(items);
  openCart();
}

function calcTotals(items){
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function openCart(){
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return alert("Panier indisponible sur cette page.");
  drawer.hidden = false;
  renderCart();
}
function closeCart(){
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;
  drawer.hidden = true;
}

function changeQty(id, delta){
  const items = loadCart();
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0){
    const idx = items.findIndex(i => i.id === id);
    items.splice(idx, 1);
  }
  saveCart(items);
  renderCart();
}

function renderCart(){
  const items = loadCart();
  const list = document.getElementById("cart-items");
  if (!list) return;
  list.innerHTML = "";

  if (items.length === 0){
    list.innerHTML = `<p class="small">Votre panier est vide.</p>`;
  } else {
    for (const it of items){
      const line = document.createElement("div");
      line.className = "line";
      line.innerHTML = `
        <div>
          <div><strong>${it.name}</strong></div>
          <div class="small">${euro(it.price)} · ${it.id}</div>
          <div class="qty" style="margin-top:8px">
            <button type="button" onclick="changeQty('${it.id}',-1)">−</button>
            <span>${it.qty}</span>
            <button type="button" onclick="changeQty('${it.id}',1)">+</button>
          </div>
        </div>
        <div><strong>${euro(it.price * it.qty)}</strong></div>
      `;
      list.appendChild(line);
    }
  }

  const {subtotal, shipping, total} = calcTotals(items);
  const subEl = document.getElementById("cart-subtotal");
  const shipEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");
  if (subEl) subEl.textContent = euro(subtotal);
  if (shipEl) shipEl.textContent = euro(shipping);
  if (totalEl) totalEl.textContent = euro(total);
}

function proceedToCheckout(){
  // If empty cart, keep user on page
  const items = loadCart();
  if (items.length === 0){
    alert("Ajoute un produit avant de passer au paiement.");
    return false;
  }
  closeCart();
  return true;
}

// Expose functions for inline handlers
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.proceedToCheckout = proceedToCheckout;

document.addEventListener("DOMContentLoaded", renderCartCount);
