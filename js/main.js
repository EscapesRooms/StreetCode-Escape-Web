"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
    siteNav.classList.toggle("is-open", !isExpanded);
    document.body.classList.toggle("menu-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) closeMenu();
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const revealElements = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const contactForm = document.querySelector("#contact-form");
if (contactForm instanceof HTMLFormElement) {
  const status = document.querySelector("#form-status");
  const result = document.querySelector("#form-result");
  const summary = document.querySelector("#request-summary");
  const copyButton = document.querySelector("#copy-request");
  const copyStatus = document.querySelector("#copy-status");
  const fields = [
    { name: "nombre", message: "Escribe tu nombre (al menos 2 caracteres)." },
    { name: "email", message: "Introduce un correo electrónico válido." },
    { name: "tipo", message: "Selecciona el tipo de experiencia." },
    { name: "mensaje", message: "Cuéntanos un poco más (al menos 10 caracteres)." }
  ];

  const getField = (name) => contactForm.elements.namedItem(name);
  const setError = (name, message) => {
    const field = getField(name);
    const error = document.querySelector(`#${name}-error`);
    if (!(field instanceof HTMLElement)) return;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  };

  const validateField = ({ name, message }) => {
    const field = getField(name);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return true;
    const valid = field.checkValidity();
    setError(name, valid ? "" : message);
    return valid;
  };

  fields.forEach(({ name, message }) => {
    const field = getField(name);
    if (field instanceof HTMLElement) {
      field.addEventListener("input", () => validateField({ name, message }));
      field.addEventListener("change", () => validateField({ name, message }));
    }
  });

  const privacy = getField("privacidad");
  if (privacy instanceof HTMLInputElement) {
    privacy.addEventListener("change", () => {
      const error = document.querySelector("#privacidad-error");
      privacy.setAttribute("aria-invalid", String(!privacy.checked));
      if (error) error.textContent = privacy.checked ? "" : "Necesitamos tu consentimiento para continuar.";
    });
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !validateField(field));
    const privacyError = document.querySelector("#privacidad-error");
    const privacyValid = privacy instanceof HTMLInputElement && privacy.checked;
    if (privacy instanceof HTMLInputElement) privacy.setAttribute("aria-invalid", String(!privacyValid));
    if (privacyError) privacyError.textContent = privacyValid ? "" : "Necesitamos tu consentimiento para continuar.";

    if (invalidFields.length || !privacyValid) {
      if (status) status.textContent = "Revisa los campos marcados antes de preparar la solicitud.";
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }

    const data = new FormData(contactForm);
    const lines = [
      "SOLICITUD DE INFORMACIÓN — STREETCODE ESCAPE",
      "",
      `Nombre: ${data.get("nombre")}`,
      `Correo: ${data.get("email")}`,
      `Tipo de experiencia: ${data.get("tipo")}`,
      `Tamaño del grupo: ${data.get("participantes") || "Por definir"}`,
      `Fecha aproximada: ${data.get("fecha") || "Por definir"}`,
      `Ciudad o zona: ${data.get("ubicacion") || "Por definir"}`,
      "",
      "IDEA:",
      String(data.get("mensaje"))
    ];

    if (summary instanceof HTMLTextAreaElement && result instanceof HTMLElement) {
      summary.value = lines.join("\n");
      result.hidden = false;
      if (status) status.textContent = "Solicitud preparada. Copia el resumen para compartirlo; este formulario aún no envía datos.";
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      summary.focus();
    }
  });

  if (copyButton instanceof HTMLButtonElement && summary instanceof HTMLTextAreaElement && copyStatus) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summary.value);
        copyStatus.textContent = "Solicitud copiada.";
      } catch (error) {
        summary.focus();
        summary.select();
        copyStatus.textContent = "No se pudo copiar automáticamente. Selecciona y copia el texto.";
      }
    });
  }
}
