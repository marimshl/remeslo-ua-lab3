// RemesloUA — клієнтські сценарії: мобільне меню, валідація форм, фільтр каталогу, галерея

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initForms();
  initCatalogFilter();
  initGallery();
});

// Кнопка «Меню» на мобільних екранах
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Миттєва валідація форм із повідомленнями українською мовою
const messages = {
  valueMissing: "Це поле є обов’язковим.",
  typeMismatch: "Перевірте правильність формату.",
  tooShort: (el) => `Мінімальна довжина — ${el.minLength} символів.`,
  patternMismatch: "Значення не відповідає формату.",
  rangeUnderflow: (el) => `Мінімальне значення — ${el.min}.`,
  rangeOverflow: (el) => `Максимальне значення — ${el.max}.`,
};

function getMessage(el) {
  for (const key of Object.keys(messages)) {
    if (el.validity[key]) {
      const msg = messages[key];
      return typeof msg === "function" ? msg(el) : msg;
    }
  }
  return "";
}

function validateField(el) {
  const errorBox = document.getElementById(`${el.id}-error`);
  let message = getMessage(el);

  if (!message && el.dataset.match) {
    const other = document.getElementById(el.dataset.match);
    if (other && other.value !== el.value) message = "Паролі не збігаються.";
  }

  el.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorBox) errorBox.textContent = message;
  return !message;
}

function initForms() {
  document.querySelectorAll("form[data-validate]").forEach((form) => {
    const fields = form.querySelectorAll("input, textarea, select");

    fields.forEach((el) => {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => {
        if (el.getAttribute("aria-invalid") === "true") validateField(el);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const allValid = [...fields].map(validateField).every(Boolean);
      const status = form.querySelector(".form-status");

      if (!allValid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (status) {
        status.textContent = form.dataset.success || "Дякуємо! Дані надіслано.";
        status.className = "form-status form-success";
      }
      form.reset();
    });
  });
}

// Фільтрація та сортування товарів у каталозі (без перезавантаження сторінки)
function initCatalogFilter() {
  const form = document.getElementById("filters");
  const list = document.getElementById("product-list");
  if (!form || !list) return;

  const counter = document.getElementById("product-count");
  const sort = document.getElementById("sort");
  const items = [...list.querySelectorAll("[data-category]")];

  function apply() {
    const categories = [...form.querySelectorAll('input[name="category"]:checked')].map((i) => i.value);
    const maxPrice = Number(form.elements["max-price"].value) || Infinity;
    const region = form.elements.region.value;
    let visible = 0;

    items.forEach((item) => {
      const matches =
        (categories.length === 0 || categories.includes(item.dataset.category)) &&
        Number(item.dataset.price) <= maxPrice &&
        (region === "" || item.dataset.region === region);
      item.hidden = !matches;
      if (matches) visible++;
    });

    if (sort) {
      const sorted = [...items].sort((a, b) => {
        if (sort.value === "price-asc") return a.dataset.price - b.dataset.price;
        if (sort.value === "price-desc") return b.dataset.price - a.dataset.price;
        return a.dataset.order - b.dataset.order;
      });
      sorted.forEach((item) => list.appendChild(item));
    }

    if (counter) counter.textContent = visible;
  }

  form.addEventListener("input", apply);
  form.addEventListener("reset", () => setTimeout(apply));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
  });
  if (sort) sort.addEventListener("change", apply);
}

// Перемикання фото в галереї товару
function initGallery() {
  const main = document.querySelector(".gallery-main");
  if (!main) return;

  document.querySelectorAll(".gallery-thumbs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      main.src = img.src;
      main.alt = img.alt;
    });
  });
}
