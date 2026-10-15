"use strict";

/* =========================================
   THE DEPARTMENT STORE
   Main website interactions
   ========================================= */

/*
  IMPORTANT:
  This is a front-end website.
  Orders are NOT paid for or stored on a server.
  Enquiry forms prepare an email in the visitor's
  default email application.
*/

const STORE_EMAIL = ""; // Optional: enter your real business email here.

const products = [
  {
    id: 1,
    name: "Signature Lounge Chair",
    category: "furniture",
    price: 185000,
    badge: "Featured",
    description: "A contemporary accent chair designed for comfort and character.",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 2,
    name: "Minimalist Side Table",
    category: "furniture",
    price: 95000,
    badge: "Modern",
    description: "A versatile side table with a clean, understated silhouette.",
    image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 3,
    name: "Sculptural Table Lamp",
    category: "accessories",
    price: 42000,
    badge: "Popular",
    description: "A decorative lighting piece for calm, contemporary interiors.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 4,
    name: "Contemporary Living Set",
    category: "home",
    price: 320000,
    badge: "Collection",
    description: "A coordinated living-space selection with a modern feel.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 5,
    name: "Decorative Ceramic Vase",
    category: "accessories",
    price: 18500,
    badge: "Details",
    description: "A simple decorative accent for shelves, tables, and consoles.",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 6,
    name: "Modern Accent Sofa",
    category: "furniture",
    price: 450000,
    badge: "Statement",
    description: "A welcoming centrepiece for a contemporary living space.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 7,
    name: "Soft Texture Cushion",
    category: "home",
    price: 12500,
    badge: "Everyday",
    description: "A soft furnishing accent to add warmth and texture.",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 8,
    name: "Designer Coffee Table",
    category: "furniture",
    price: 145000,
    badge: "Featured",
    description: "A functional focal point for a thoughtfully styled room.",
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=900&q=85"
  }
];

const state = {
  category: "all",
  search: "",
  sort: "featured",
  gallery: "all",
  order: loadOrder()
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

function loadOrder() {
  /*
    The order list is kept for the current page session.
    It is deliberately not saved to a server.
  */
  return [];
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}

function openDialog(dialogId) {
  const dialog = document.getElementById(dialogId);

  if (!dialog) {
    showToast("That window could not be opened.");
    return;
  }

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");
  } else {
    showToast("Your browser does not support this dialog.");
  }
}

function closeDialog(dialog) {
  if (dialog && typeof dialog.close === "function" && dialog.open) {
    dialog.close();
  }
}

/* =========================================
   PRODUCT CATALOGUE
   ========================================= */

function getFilteredProducts() {
  let result = products.filter(product => {
    const matchesCategory =
      state.category === "all" || product.category === state.category;

    const searchText = (
      product.name + " " +
      product.description + " " +
      product.category
    ).toLowerCase();

    const matchesSearch = searchText.includes(state.search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (state.sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === "price-low") {
    result.sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-high") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const visibleProducts = getFilteredProducts();

  if (!visibleProducts.length) {
    grid.innerHTML = `
      <div class="no-products">
        <h3>No matching products found.</h3>
        <p>Try another search or select a different category.</p>
        <button class="button button-primary" type="button" id="resetProductFilters">
          Reset filters
        </button>
      </div>
    `;

    $("#resetProductFilters")?.addEventListener("click", resetProductFilters);
    return;
  }

  grid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div
        class="product-image"
        role="button"
        tabindex="0"
        data-product-details="${product.id}"
        aria-label="View details for ${escapeHTML(product.name)}"
      >
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >
        <span class="product-badge">${escapeHTML(product.badge)}</span>
      </div>

      <div class="product-card-body">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.description)}</p>

        <div class="product-card-bottom">
          <span class="product-price">${formatCurrency(product.price)}</span>
          <button
            class="add-product"
            type="button"
            data-add-product="${product.id}"
            aria-label="Add ${escapeHTML(product.name)} to order list"
            title="Add to order list"
          >+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function resetProductFilters() {
  state.category = "all";
  state.search = "";
  state.sort = "featured";

  if ($("#productSearch")) $("#productSearch").value = "";
  if ($("#productSort")) $("#productSort").value = "featured";

  $$(".category-filters [data-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "all");
  });

  renderProducts();
}

function setCategory(category) {
  state.category = category;

  $$(".category-filters [data-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.category === category);
  });

  renderProducts();
}

/* =========================================
   PRODUCT DETAILS DIALOG
   ========================================= */

function openProductDetails(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;

  const content = $("#productDialogContent");
  if (!content) return;

  content.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-image">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
      </div>

      <div class="product-detail-copy">
        <span class="mini-label">${escapeHTML(product.category)}</span>
        <h2>${escapeHTML(product.name)}</h2>
        <p>${escapeHTML(product.description)}</p>
        <span class="product-detail-price">${formatCurrency(product.price)}</span>
        <p>Prices and availability are subject to confirmation by the store.</p>

        <button
          class="button button-primary"
          type="button"
          data-add-product="${product.id}"
          data-close-after-add="true"
        >
          Add to order list <span>↗</span>
        </button>
      </div>
    </div>
  `;

  openDialog("productDialog");
}

/* =========================================
   ORDER LIST
   ========================================= */

function addToOrder(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;

  const existing = state.order.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.order.push({
      id: product.id,
      quantity: 1
    });
  }

  renderOrder();
  showToast(`${product.name} added to your order list.`);
}

function changeQuantity(productId, change) {
  const item = state.order.find(entry => entry.id === Number(productId));
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    state.order = state.order.filter(entry => entry.id !== Number(productId));
  }

  renderOrder();
}

function removeFromOrder(productId) {
  state.order = state.order.filter(item => item.id !== Number(productId));
  renderOrder();
  showToast("Item removed from your order list.");
}

function clearOrder() {
  if (!state.order.length) {
    showToast("Your order list is already empty.");
    return;
  }

  state.order = [];
  renderOrder();
  showToast("Your order list has been cleared.");
}

function getOrderDetails() {
  const lines = state.order.map(item => {
    const product = products.find(productItem => productItem.id === item.id);

    if (!product) return null;

    return {
      ...product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity
    };
  }).filter(Boolean);

  return {
    lines,
    count: lines.reduce((total, item) => total + item.quantity, 0),
    subtotal: lines.reduce((total, item) => total + item.lineTotal, 0)
  };
}

function orderItemsHTML() {
  const order = getOrderDetails();

  if (!order.lines.length) {
    return `
      <div class="empty-order">
        <span>▦</span>
        <p>Your order list is empty.</p>
        <small>Add products from the catalogue to get started.</small>
      </div>
    `;
  }

  return order.lines.map(item => `
    <div class="order-line">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">

      <div>
        <h4>${escapeHTML(item.name)}</h4>
        <p>${formatCurrency(item.lineTotal)}</p>

        <div class="quantity-controls">
          <button type="button" data-quantity-change="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity-change="${item.id}" data-change="1" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button
        class="remove-line"
        type="button"
        data-remove-product="${item.id}"
        aria-label="Remove ${escapeHTML(item.name)}"
      >×</button>
    </div>
  `).join("");
}

function renderOrder() {
  const order = getOrderDetails();

  const count = $("#cartCount");
  const countLarge = $("#orderCountLarge");
  const subtotal = $("#orderSubtotal");
  const items = $("#orderItems");
  const dialogItems = $("#dialogCartItems");

  if (count) count.textContent = String(order.count);
  if (countLarge) countLarge.textContent =
    `${order.count} ${order.count === 1 ? "item" : "items"}`;
  if (subtotal) subtotal.textContent = formatCurrency(order.subtotal);
  if (items) items.innerHTML = orderItemsHTML();
  if (dialogItems) dialogItems.innerHTML = orderItemsHTML();

  const dialogProceed = $("#dialogProceed");
  if (dialogProceed) dialogProceed.disabled = order.count === 0;
}

function openOrderDialog() {
  renderOrder();
  openDialog("cartDialog");
}

function proceedToOrder() {
  if (!state.order.length) {
    showToast("Add a product before continuing.");
    return;
  }

  closeDialog($("#cartDialog"));
  $("#order")?.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    $("#orderForm input[name='name']")?.focus({ preventScroll: true });
  }, 500);
}

function prepareOrderMessage() {
  if (!state.order.length) {
    showToast("Your order list is empty. Add a product first.");
    return;
  }

  proceedToOrder();

  const message = $("#orderForm textarea[name='message']");
  if (message && !message.value.trim()) {
    const order = getOrderDetails();

    message.value =
      "I would like to enquire about the following products:\n\n" +
      order.lines.map(item =>
        `${item.name} — Quantity: ${item.quantity} — ${formatCurrency(item.lineTotal)}`
      ).join("\n") +
      `\n\nDemonstration subtotal: ${formatCurrency(order.subtotal)}` +
      "\nPlease confirm product availability and final pricing.";
  }
}

/* =========================================
   GALLERY FILTERS AND LIGHTBOX
   ========================================= */

function filterGallery(category) {
  state.gallery = category;

  $$("#galleryFilters [data-gallery]").forEach(button => {
    button.classList.toggle("active", button.dataset.gallery === category);
  });

  $$(".gallery-item").forEach(item => {
    const matches =
      category === "all" ||
      item.dataset.galleryCategory === category;

    item.hidden = !matches;
  });
}

function openGalleryImage(button) {
  const image = button.dataset.image;
  const title = button.dataset.title || "Gallery image";

  if (!image) return;

  const lightboxImage = $("#lightboxImage");
  const caption = $("#lightboxCaption");

  if (lightboxImage) {
    lightboxImage.src = image;
    lightboxImage.alt = title;
  }

  if (caption) caption.textContent = title;

  openDialog("lightboxDialog");
}

/* =========================================
   EMAIL AND ENQUIRY FORMS
   ========================================= */

function getEmailRecipient() {
  if (STORE_EMAIL.trim()) return STORE_EMAIL.trim();

  const recipient = window.prompt(
    "Enter the business email address that should receive this enquiry:"
  );

  if (!recipient || !recipient.trim()) {
    showToast("No email recipient entered. Your details have not been sent.");
    return "";
  }

  const email = recipient.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("That email address does not look valid. Please try again.");
    return "";
  }

  return email;
}

function openEmail(subject, body) {
  const recipient = getEmailRecipient();
  if (!recipient) return false;

  const mailto =
    `mailto:${encodeURIComponent(recipient)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  /*
    This opens the visitor's default email application.
    The visitor must review and send the email themselves.
  */
  window.location.href = mailto;
  return true;
}

function formDataToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function buildFormMessage(data, title) {
  return [
    `Enquiry type: ${title}`,
    "",
    ...Object.entries(data)
      .filter(([key, value]) => key !== "consent" && String(value).trim())
      .map(([key, value]) => `${key}: ${value}`),
    "",
    "Sent from THE DEPARTMENT STORE website."
  ].join("\n");
}

function handleEnquiryForm(form) {
  const data = formDataToObject(form);
  const title = form.dataset.formTitle || "Website enquiry";
  const status = $(".form-status", form);

  const sentToEmail = openEmail(
    `THE DEPARTMENT STORE — ${title}`,
    buildFormMessage(data, title)
  );

  if (sentToEmail && status) {
    status.textContent =
      "Your email application should open with the enquiry prepared. Review it and press Send to submit it.";
  }
}

function handleContactForm(form) {
  const data = formDataToObject(form);
  const status = $("#contactFormStatus");

  const sentToEmail = openEmail(
    `THE DEPARTMENT STORE — ${data.topic || "General enquiry"}`,
    buildFormMessage(data, "Contact enquiry")
  );

  if (sentToEmail && status) {
    status.textContent =
      "Your email application should open with the message prepared. Review it and press Send to submit it.";
  }
}

function handleOrderForm(form) {
  const data = formDataToObject(form);
  const order = getOrderDetails();
  const status = $("#orderFormStatus");

  const orderText = order.lines.length
    ? order.lines.map(item =>
        `${item.name} | Quantity: ${item.quantity} | ${formatCurrency(item.lineTotal)}`
      ).join("\n")
    : "No products selected.";

  const message = [
    "ORDER ENQUIRY",
    "",
    `Name: ${data.name || ""}`,
    `Email: ${data.email || ""}`,
    `Phone: ${data.phone || "Not provided"}`,
    `Location: ${data.location || "Not provided"}`,
    `Request type: ${data.requestType || "Product order enquiry"}`,
    "",
    "SELECTED PRODUCTS",
    orderText,
    "",
    `Demonstration subtotal: ${formatCurrency(order.subtotal)}`,
    "",
    `Additional details: ${data.message || "None provided"}`,
    "",
    "Please confirm availability, delivery options, and final pricing.",
    "",
    "Sent from THE DEPARTMENT STORE website."
  ].join("\n");

  const sentToEmail = openEmail(
    "THE DEPARTMENT STORE — Order enquiry",
    message
  );

  if (sentToEmail && status) {
    status.textContent =
      "Your email application should open with the order enquiry prepared. Review it and press Send to submit it.";
  }
}

function handleDialogForm(form) {
  const data = formDataToObject(form);
  const title = form.dataset.formTitle || "Website enquiry";
  const status = $(".form-status", form);

  const sentToEmail = openEmail(
    `THE DEPARTMENT STORE — ${title}`,
    buildFormMessage(data, title)
  );

  if (sentToEmail && status) {
    status.textContent =
      "Your email application should open with the enquiry prepared. Review it and press Send to submit it.";
  }
}

/* =========================================
   SERVICE AND CONTACT SHORTCUTS
   ========================================= */

function handleServiceRequest(service) {
  const message = $("#contactForm textarea[name='message']");
  const topic = $("#contactForm select[name='topic']");

  if (message) {
    message.value = `I would like to enquire about: ${service}.\n\nPlease provide further information about availability and next steps.`;
  }

  if (topic) {
    topic.value = service.toLowerCase().includes("delivery")
      ? "Delivery or assembly"
      : service.toLowerCase().includes("assembly")
        ? "Delivery or assembly"
        : "Product enquiry";
  }

  $("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    $("#contactForm input[name='name']")?.focus({ preventScroll: true });
  }, 500);
}

function handleContactMode(mode) {
  const labels = {
    email: "Email enquiry",
    voice: "Voice / phone contact",
    video: "Video / online meeting"
  };

  const message = $("#contactForm textarea[name='message']");
  const topic = $("#contactForm select[name='topic']");

  if (message) {
    const descriptions = {
      email: "I would like to contact the team by email. Please follow up with me.",
      voice: "I would like to discuss my enquiry by phone. Please provide the available contact number or arrange a call.",
      video: "I would like to discuss my enquiry in an online video meeting. Please let me know the available options."
    };

    message.value = descriptions[mode] || "";
  }

  if (topic && mode === "email") {
    topic.value = "General enquiry";
  }

  if (mode === "voice" || mode === "video" || mode === "email") {
    $("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      $("#contactForm input[name='name']")?.focus({ preventScroll: true });
    }, 500);
  }
}

/* =========================================
   NAVIGATION, SCROLL AND REVEAL ANIMATIONS
   ========================================= */

function closeMobileMenu() {
  const nav = $("#mainNav");
  const toggle = $("#menuToggle");

  nav?.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Open navigation");
}

function toggleMobileMenu() {
  const nav = $("#mainNav");
  const toggle = $("#menuToggle");

  if (!nav || !toggle) return;

  const isOpen = nav.classList.toggle("open");

  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
}

function handleScroll() {
  const header = $(".site-header");
  const backToTop = $("#backToTop");

  header?.classList.toggle("scrolled", window.scrollY > 20);
  backToTop?.classList.toggle("visible", window.scrollY > 500);
}

function setupRevealAnimations() {
  const elements = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  elements.forEach(element => observer.observe(element));
}

/* =========================================
   EVENT LISTENERS
   ========================================= */

function setupEventListeners() {
  $("#menuToggle")?.addEventListener("click", toggleMobileMenu);

  $$("#mainNav a").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  $("#openCart")?.addEventListener("click", openOrderDialog);
  $("#openCartTop")?.addEventListener("click", openOrderDialog);

  $("#dialogProceed")?.addEventListener("click", proceedToOrder);
  $("#prepareOrder")?.addEventListener("click", prepareOrderMessage);
  $("#clearOrder")?.addEventListener("click", clearOrder);

  $("#productSearch")?.addEventListener("input", event => {
    state.search = event.target.value;
    renderProducts();
  });

  $("#productSort")?.addEventListener("change", event => {
    state.sort = event.target.value;
    renderProducts();
  });

  $$("#categoryFilters [data-category]").forEach(button => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.category);
    });
  });

  $$("#galleryFilters [data-gallery]").forEach(button => {
    button.addEventListener("click", () => {
      filterGallery(button.dataset.gallery);
    });
  });

  $("#productGrid")?.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-product]");
    const detailTarget = event.target.closest("[data-product-details]");

    if (addButton) {
      addToOrder(addButton.dataset.addProduct);
      return;
    }

    if (detailTarget) {
      openProductDetails(detailTarget.dataset.productDetails);
    }
  });

  $("#productGrid")?.addEventListener("keydown", event => {
    const detailTarget = event.target.closest("[data-product-details]");

    if (
      detailTarget &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      openProductDetails(detailTarget.dataset.productDetails);
    }
  });

  document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-product]");

    if (addButton && !$("#productGrid")?.contains(addButton)) {
      addToOrder(addButton.dataset.addProduct);

      if (addButton.dataset.closeAfterAdd === "true") {
        closeDialog($("#productDialog"));
      }
    }

    const quantityButton = event.target.closest("[data-quantity-change]");

    if (quantityButton) {
      changeQuantity(
        quantityButton.dataset.quantityChange,
        Number(quantityButton.dataset.change)
      );
    }

    const removeButton = event.target.closest("[data-remove-product]");

    if (removeButton) {
      removeFromOrder(removeButton.dataset.removeProduct);
    }

    const openButton = event.target.closest("[data-open-dialog]");

    if (openButton) {
      openDialog(openButton.dataset.openDialog);
    }

    const closeButton = event.target.closest("[data-close-dialog]");

    if (closeButton) {
      closeDialog(closeButton.closest("dialog"));
    }

    const serviceButton = event.target.closest("[data-service]");

    if (serviceButton) {
      handleServiceRequest(serviceButton.dataset.service);
    }

    const contactButton = event.target.closest("[data-contact-mode]");

    if (contactButton) {
      const mode = contactButton.dataset.contactMode;

      if (contactButton.tagName === "A") {
        event.preventDefault();
      }

      handleContactMode(mode);
    }

    const galleryButton = event.target.closest(".gallery-item");

    if (galleryButton && !galleryButton.hidden) {
      openGalleryImage(galleryButton);
    }
  });

  $$("#orderItems, #dialogCartItems").forEach(container => {
    container.addEventListener("click", event => {
      const quantityButton = event.target.closest("[data-quantity-change]");
      const removeButton = event.target.closest("[data-remove-product]");

      if (quantityButton) {
        changeQuantity(
          quantityButton.dataset.quantityChange,
          Number(quantityButton.dataset.change)
        );
      }

      if (removeButton) {
        removeFromOrder(removeButton.dataset.removeProduct);
      }
    });
  });

  $("#orderForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    handleOrderForm(form);
  });

  $("#contactForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    handleContactForm(form);
  });

  $$("form[data-enquiry-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      handleDialogForm(form);
    });
  });

  $("#backToTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMobileMenu();
  });

  $$("dialog").forEach(dialog => {
    dialog.addEventListener("close", () => {
      if (!$("dialog[open]")) {
        document.body.classList.remove("dialog-open");
      }
    });

    dialog.addEventListener("click", event => {
      if (event.target === dialog) {
        closeDialog(dialog);
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });
}

/* =========================================
   INITIALISE WEBSITE
   ========================================= */

function initialiseWebsite() {
  const year = $("#currentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  renderProducts();
  renderOrder();
  setupEventListeners();
  setupRevealAnimations();
  handleScroll();

  const loader = $("#pageLoader");

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      loader?.classList.add("is-hidden");
    }, 250);
  });

  /*
    Fallback in case the load event already fired
    before the listener was registered.
  */
  if (document.readyState === "complete") {
    window.setTimeout(() => {
      loader?.classList.add("is-hidden");
    }, 250);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseWebsite);
} else {
  initialiseWebsite();
}