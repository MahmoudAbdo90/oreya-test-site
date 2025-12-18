const CART_KEY = "oreya_cart_v1";
const SHIPPING_THRESHOLD = 60.0;
const SHIPPING_FEE = 4.90;

function euro(n){
  return (Math.round(n*100)/100).toFixed(2).replace(".", ",") + "€";
}

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function calcTotals(items){
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderOrderSummary(){
  const items = loadCart();
  const list = document.getElementById("summary-items");
  const empty = document.getElementById("empty-cart");
  const payBtn = document.getElementById("pay-btn");

  if (!list) return;

  list.innerHTML = "";

  if (items.length === 0){
    if (empty) empty.hidden = false;
    if (payBtn) payBtn.disabled = true;
    document.getElementById("sum-subtotal").textContent = euro(0);
    document.getElementById("sum-shipping").textContent = euro(0);
    document.getElementById("sum-total").textContent = euro(0);
    return;
  }

  if (empty) empty.hidden = true;
  if (payBtn) payBtn.disabled = false;

  for (const it of items){
    const row = document.createElement("div");
    row.className = "line";
    row.innerHTML = `
      <div>
        <div><strong>${it.name}</strong></div>
        <div class="small">Quantité: ${it.qty}</div>
      </div>
      <div><strong>${euro(it.price * it.qty)}</strong></div>
    `;
    list.appendChild(row);
  }

  const {subtotal, shipping, total} = calcTotals(items);
  document.getElementById("sum-subtotal").textContent = euro(subtotal);
  document.getElementById("sum-shipping").textContent = euro(shipping);
  document.getElementById("sum-total").textContent = euro(total);
}

function validateCheckout(){
  const requiredIds = ["firstName","lastName","email","address","city","zip"];
  for (const id of requiredIds){
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) return false;
  }
  return true;
}

function onSubmitCheckout(e){
  e.preventDefault();

  const items = loadCart();
  if (items.length === 0){
    alert("Votre panier est vide.");
    return;
  }

  if (!validateCheckout()){
    alert("Merci de compléter les champs requis.");
    return;
  }

  const method = document.querySelector("input[name='payment']:checked");
  if (!method){
    alert("Choisissez un moyen de paiement.");
    return;
  }

  // Mock: store an order snapshot for the success page
  const {subtotal, shipping, total} = calcTotals(items);
  const order = {
    id: "OREYA-" + Math.random().toString(16).slice(2, 10).toUpperCase(),
    createdAt: new Date().toISOString(),
    customer: {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      zip: document.getElementById("zip").value.trim(),
      country: "France",
    },
    paymentMethod: method.value,
    items,
    subtotal,
    shipping,
    total
  };

  localStorage.setItem("oreya_last_order_v1", JSON.stringify(order));

  // Clear cart (end-to-end test)
  saveCart([]);

  window.location.href = "/pages/success.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();
  const form = document.getElementById("checkout-form");
  if (form) form.addEventListener("submit", onSubmitCheckout);
});
