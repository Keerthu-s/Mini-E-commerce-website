// --- data: sample products ---
const products = [
  { id: "p1", name: "Blue Hoodie", price: 799, img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop" },
  { id: "p2", name: "Sneakers", price: 1499, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" },
  { id: "p3", name: "Backpack", price: 999, img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop" },
  { id: "p4", name: "Headphones", price: 1299, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" }
];

// --- cache DOM elements ---
const productsEl = document.getElementById("products");
const cartToggleBtn = document.getElementById("cart-toggle");
const cartEl = document.getElementById("cart");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");

// --- cart state object: { productId: { product, qty } } ---
let cart = {};

// --- localStorage key ---
const STORAGE_KEY = "miniShopCart_v1";

/* ---------- Render product cards ---------- */
function renderProducts() {
  productsEl.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₹${p.price.toFixed(2)}</p>
      <button class="btn primary add-to-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join("");
}

/* ---------- Cart helpers ---------- */
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  cart = raw ? JSON.parse(raw) : {};
  updateCartUI();
}

/* return total items count */
function cartItemCount() {
  return Object.values(cart).reduce((s, it) => s + it.qty, 0);
}

/* return total price */
function cartTotal() {
  return Object.values(cart).reduce((s, it) => s + it.qty * it.product.price, 0);
}

/* ---------- Cart operations ---------- */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  if (!cart[id]) cart[id] = { product, qty: 0 };
  cart[id].qty += 1;
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCartUI();
  }
}

/* ---------- Render cart contents ---------- */
function renderCartItems() {
  const items = Object.values(cart);
  if (items.length === 0) {
    cartItemsEl.innerHTML = `<li style="padding:8px; color:${'#666'}">Cart is empty</li>`;
    return;
  }

  cartItemsEl.innerHTML = items.map(it => `
    <li class="cart-item" data-id="${it.product.id}">
      <img src="${it.product.img}" alt="${it.product.name}">
      <div>
        <div>${it.product.name}</div>
        <div style="color:#666">₹${it.product.price.toFixed(2)}</div>
      </div>
      <div class="qty-controls">
        <button class="btn qty-decrease" data-id="${it.product.id}">-</button>
        <span>${it.qty}</span>
        <button class="btn qty-increase" data-id="${it.product.id}">+</button>
        <button class="btn" style="margin-left:8px" data-id="${it.product.id}" aria-label="remove">Remove</button>
      </div>
    </li>
  `).join("");
}

/* ---------- Update cart UI (count + items + total) ---------- */
function updateCartUI() {
  cartCountEl.textContent = cartItemCount();
  cartTotalEl.textContent = cartTotal().toFixed(2);
  renderCartItems();
}

/* ---------- Event listeners ---------- */
document.addEventListener("click", (e) => {
  // Add to cart button (from product cards)
  if (e.target.matches(".add-to-cart")) {
    const id = e.target.dataset.id;
    addToCart(id);
  }

  // Toggle cart visibility
  if (e.target.id === "cart-toggle") {
    cartEl.classList.toggle("hidden");
  }

  // quantity change (delegated)
  if (e.target.matches(".qty-decrease")) {
    changeQty(e.target.dataset.id, -1);
  }
  if (e.target.matches(".qty-increase")) {
    changeQty(e.target.dataset.id, +1);
  }
  // remove button
  if (e.target.matches(".cart-item .btn[aria-label='remove']")) {
    removeFromCart(e.target.dataset.id);
  }
});

// Clear cart
clearCartBtn.addEventListener("click", () => {
  cart = {};
  saveCart();
  updateCartUI();
});

// initialize app
renderProducts();
loadCart();
