(function () {
  var STORAGE_KEY = "aielement-locale";
  var DESKTOP_BREAKPOINT = 1024;
  var DEFAULT_CONFIG = {
    contact: {
      telegramUrl: "https://t.me/Ai_Element_Bot",
      whatsappUrl: "https://wa.me/79990000000",
      phone: "+79990000000",
      email: "hello@example.com"
    },
    leadForm: {
      endpoint: "/api/lead",
      debounceMs: 1200,
      timeoutMs: 10000
    },
    integrations: {
      analytics: {
        provider: "auto"
      }
    }
  };
  var MENU_LABELS = {
    ru: {
      open: "Открыть меню",
      close: "Закрыть меню"
    },
    en: {
      open: "Open menu",
      close: "Close menu"
    }
  };
  var FORM_COPY = {
    ru: {
      requiredName: "Укажите имя.",
      requiredContact: "Добавьте контакт для связи.",
      invalidContact: "Контакт выглядит слишком коротким. Укажите телефон, Telegram или WhatsApp.",
      validationError: "Проверьте обязательные поля формы.",
      submitIdle: "Отправить заявку",
      submitLoading: "Отправляем...",
      success: "Спасибо. Мы получили заявку и уже передали её в рабочий канал команды.",
      error: "Не удалось отправить заявку. Напишите нам напрямую в Telegram, WhatsApp, по телефону или email.",
      configError: "Форма временно не настроена на сервере. Напишите нам напрямую через Telegram, WhatsApp, телефон или email."
    },
    en: {
      requiredName: "Please enter your name.",
      requiredContact: "Please add a contact method.",
      invalidContact: "This contact looks too short. Please share a phone number, Telegram, or WhatsApp.",
      validationError: "Please review the required form fields.",
      submitIdle: "Send request",
      submitLoading: "Sending...",
      success: "Thank you. We received your lead and sent it to the team channel.",
      error: "We could not send the form right now. Please contact us directly via Telegram, WhatsApp, phone, or email.",
      configError: "The form is not configured on the server yet. Please contact us directly via Telegram, WhatsApp, phone, or email."
    }
  };

  function mergeConfig(base, override) {
    var result = Array.isArray(base) ? base.slice() : {};
    var source = override || {};
    Object.keys(base).forEach(function (key) {
      var baseValue = base[key];
      var overrideValue = source[key];
      if (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)) {
        result[key] = mergeConfig(baseValue, overrideValue && typeof overrideValue === "object" ? overrideValue : {});
      } else if (overrideValue !== undefined) {
        result[key] = overrideValue;
      } else {
        result[key] = baseValue;
      }
    });
    Object.keys(source).forEach(function (key) {
      if (result[key] === undefined) {
        result[key] = source[key];
      }
    });
    return result;
  }

  var APP_CONFIG = mergeConfig(DEFAULT_CONFIG, window.AiElementConfig || {});

  function getPageTranslations() {
    var page = document.body ? document.body.dataset.page : "";
    if (!page || !window.aielementTranslations) {
      return null;
    }
    return window.aielementTranslations[page] || null;
  }

  function getValue(object, path) {
    return path.split(".").reduce(function (acc, key) {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return null;
    }, object);
  }

  function trimValue(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function sanitizePhone(value) {
    return (value || "").replace(/[^\d+]/g, "");
  }

  function captureDefaults(cache) {
    cache.text.forEach(function (node) {
      if (node.dataset.defaultText === undefined) {
        node.dataset.defaultText = node.textContent;
      }
    });
    cache.html.forEach(function (node) {
      if (node.dataset.defaultHtml === undefined) {
        node.dataset.defaultHtml = node.innerHTML;
      }
    });
    cache.placeholder.forEach(function (node) {
      if (node.dataset.defaultPlaceholder === undefined) {
        node.dataset.defaultPlaceholder = node.getAttribute("placeholder") || "";
      }
    });
    cache.title.forEach(function (node) {
      if (node.dataset.defaultTitleAttr === undefined) {
        node.dataset.defaultTitleAttr = node.getAttribute("title") || "";
      }
    });
    if (document.documentElement.dataset.defaultTitle === undefined) {
      document.documentElement.dataset.defaultTitle = document.title;
    }
    if (cache.metaDescription && cache.metaDescription.dataset.defaultDescription === undefined) {
      cache.metaDescription.dataset.defaultDescription = cache.metaDescription.getAttribute("content") || "";
    }
  }

  function restoreDefaults(cache) {
    cache.text.forEach(function (node) {
      if (node.dataset.defaultText !== undefined) {
        node.textContent = node.dataset.defaultText;
      }
    });
    cache.html.forEach(function (node) {
      if (node.dataset.defaultHtml !== undefined) {
        node.innerHTML = node.dataset.defaultHtml;
      }
    });
    cache.placeholder.forEach(function (node) {
      if (node.dataset.defaultPlaceholder !== undefined) {
        node.setAttribute("placeholder", node.dataset.defaultPlaceholder);
      }
    });
    cache.title.forEach(function (node) {
      if (node.dataset.defaultTitleAttr !== undefined) {
        node.setAttribute("title", node.dataset.defaultTitleAttr);
      }
    });
    if (document.documentElement.dataset.defaultTitle) {
      document.title = document.documentElement.dataset.defaultTitle;
    }
    if (cache.metaDescription && cache.metaDescription.dataset.defaultDescription !== undefined) {
      cache.metaDescription.setAttribute("content", cache.metaDescription.dataset.defaultDescription);
    }
  }

  function applyTranslations(locale, cache) {
    captureDefaults(cache);
    if (locale === "ru") {
      document.documentElement.lang = "ru";
      restoreDefaults(cache);
      return null;
    }

    var translations = getPageTranslations();
    if (!translations) {
      document.documentElement.lang = locale;
      return null;
    }

    var dictionary = translations[locale] || translations.en || translations || {};
    document.documentElement.lang = locale;

    cache.text.forEach(function (node) {
      var value = getValue(dictionary, node.dataset.i18n);
      if (value !== null) {
        node.textContent = value;
      }
    });
    cache.html.forEach(function (node) {
      var value = getValue(dictionary, node.dataset.i18nHtml);
      if (value !== null) {
        node.innerHTML = value;
      }
    });
    cache.placeholder.forEach(function (node) {
      var value = getValue(dictionary, node.dataset.i18nPlaceholder);
      if (value !== null) {
        node.setAttribute("placeholder", value);
      }
    });
    cache.title.forEach(function (node) {
      var value = getValue(dictionary, node.dataset.i18nTitle);
      if (value !== null) {
        node.setAttribute("title", value);
      }
    });

    var title = getValue(dictionary, "meta.title");
    if (title) {
      document.title = title;
    }
    var description = getValue(dictionary, "meta.description");
    if (description && cache.metaDescription) {
      cache.metaDescription.setAttribute("content", description);
    }
    return dictionary;
  }

  function lockBodyScroll() {
    var body = document.body;
    if (!body || body.classList.contains("menu-open")) {
      return;
    }
    var scrollY = window.scrollY || window.pageYOffset || 0;
    body.dataset.menuScrollY = String(scrollY);
    body.style.top = "-" + scrollY + "px";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.classList.add("menu-open");
  }

  function unlockBodyScroll() {
    var body = document.body;
    if (!body || !body.classList.contains("menu-open")) {
      return;
    }
    var savedScrollY = parseInt(body.dataset.menuScrollY || "0", 10) || 0;
    body.classList.remove("menu-open");
    body.style.top = "";
    body.style.position = "";
    body.style.width = "";
    delete body.dataset.menuScrollY;
    window.scrollTo(0, savedScrollY);
  }

  function trackEvent(name, payload) {
    var data = payload || {};
    if (typeof window.gtag === "function") {
      window.gtag("event", name, data);
    }
    if (typeof window.plausible === "function") {
      window.plausible(name, Object.keys(data).length ? { props: data } : undefined);
    }
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timerId = null;
    var requestOptions = options || {};
    if (controller) {
      requestOptions.signal = controller.signal;
      timerId = window.setTimeout(function () {
        controller.abort();
      }, timeoutMs);
    }
    return fetch(url, requestOptions).then(function (response) {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      return response;
    }, function (error) {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      throw error;
    });
  }

  function postJson(url, payload, authToken) {
    var headers = {
      "Content-Type": "application/json"
    };
    if (authToken) {
      headers["X-Api-Key"] = authToken;
    }
    return fetchWithTimeout(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    }, APP_CONFIG.leadForm.timeoutMs).then(function (response) {
      return response.text().then(function (text) {
        var data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (error) {
            data = { error: text };
          }
        }
        if (!response.ok) {
          throw new Error(data.error || "Request failed with status " + response.status);
        }
        return data;
      });
    });
  }

  function buildLeadPayload(formState, locale) {
    return {
      name: trimValue(formState.fields.name.value),
      contact: trimValue(formState.fields.contact.value),
      message: trimValue(formState.fields.message.value),
      page: document.body ? document.body.dataset.page || "unknown" : "unknown",
      locale: locale,
      source: window.location.href,
      website: formState.honeypot ? trimValue(formState.honeypot.value) : ""
    };
  }

  function createLeadFormState(form) {
    return {
      form: form,
      fields: {
        name: form.querySelector('[name="name"]'),
        contact: form.querySelector('[name="contact"]'),
        message: form.querySelector('[name="message"]')
      },
      honeypot: form.querySelector("[data-lead-honeypot]"),
      feedback: form.querySelector("[data-form-feedback]"),
      success: form.parentNode ? form.parentNode.querySelector("[data-form-success]") : null,
      submitButton: form.querySelector("[data-submit-button]"),
      submitLabel: form.querySelector("[data-submit-label]"),
      fieldErrors: {
        name: form.querySelector('[data-field-error="name"]'),
        contact: form.querySelector('[data-field-error="contact"]')
      },
      lastSubmittedAt: 0,
      submitting: false
    };
  }

  function createApp() {
    var cache = {
      text: Array.prototype.slice.call(document.querySelectorAll("[data-i18n]")),
      html: Array.prototype.slice.call(document.querySelectorAll("[data-i18n-html]")),
      placeholder: Array.prototype.slice.call(document.querySelectorAll("[data-i18n-placeholder]")),
      title: Array.prototype.slice.call(document.querySelectorAll("[data-i18n-title]")),
      metaDescription: document.querySelector('meta[name="description"]'),
      year: Array.prototype.slice.call(document.querySelectorAll("[data-year]")),
      menuToggles: Array.prototype.slice.call(document.querySelectorAll("[data-menu-toggle]")),
      menuCloseButtons: Array.prototype.slice.call(document.querySelectorAll("[data-menu-close]")),
      backdrop: document.querySelector("[data-menu-backdrop]"),
      panel: document.querySelector("[data-mobile-menu]"),
      languageButtons: Array.prototype.slice.call(document.querySelectorAll("[data-language-switch] [data-lang]")),
      leadForms: Array.prototype.slice.call(document.querySelectorAll("[data-lead-form]")).map(createLeadFormState),
      contactLinks: Array.prototype.slice.call(document.querySelectorAll("[data-contact-link]")),
      contactValues: Array.prototype.slice.call(document.querySelectorAll("[data-contact-value]"))
    };

    var state = {
      locale: "ru",
      mobileOpen: false,
      currentDictionary: null
    };

    function getCopy(key) {
      var dictionary = FORM_COPY[state.locale] || FORM_COPY.ru;
      return dictionary[key] || FORM_COPY.ru[key] || "";
    }

    function updateYear() {
      var year = String(new Date().getFullYear());
      cache.year.forEach(function (node) {
        node.textContent = year;
      });
    }

    function syncLanguageControls() {
      cache.languageButtons.forEach(function (button) {
        var isActive = button.dataset.lang === state.locale;
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("text-slate-400", !isActive);
        button.classList.toggle("text-black", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function syncMenuLabels() {
      var labels = MENU_LABELS[state.locale] || MENU_LABELS.ru;
      cache.menuToggles.forEach(function (button) {
        button.setAttribute("aria-label", labels.open);
      });
      cache.menuCloseButtons.forEach(function (button) {
        button.setAttribute("aria-label", labels.close);
      });
    }

    function syncMenu() {
      var isOpen = state.mobileOpen;
      cache.menuToggles.forEach(function (button) {
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      if (cache.backdrop) {
        cache.backdrop.hidden = !isOpen;
        cache.backdrop.classList.toggle("is-open", isOpen);
      }
      if (cache.panel) {
        cache.panel.hidden = !isOpen;
        cache.panel.classList.toggle("is-open", isOpen);
        cache.panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      }
      if (isOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll();
      }
    }

    function buildContactMap() {
      var phone = trimValue(APP_CONFIG.contact.phone);
      var whatsappUrl = trimValue(APP_CONFIG.contact.whatsappUrl);
      var phoneHref = phone ? "tel:" + sanitizePhone(phone) : "";
      return {
        telegram: {
          href: trimValue(APP_CONFIG.contact.telegramUrl),
          text: "@Ai_Element_Bot"
        },
        whatsapp: {
          href: whatsappUrl,
          text: whatsappUrl ? phone : ""
        },
        phone: {
          href: phoneHref,
          text: phone
        },
        email: {
          href: APP_CONFIG.contact.email ? "mailto:" + APP_CONFIG.contact.email : "",
          text: trimValue(APP_CONFIG.contact.email)
        }
      };
    }

    function populateContactLinks() {
      var contactMap = buildContactMap();
      cache.contactLinks.forEach(function (link) {
        var type = link.dataset.contactLink;
        var config = contactMap[type];
        if (!config || !config.href) {
          link.hidden = true;
          return;
        }
        link.hidden = false;
        link.setAttribute("href", config.href);
        if (type === "telegram" || type === "whatsapp") {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noreferrer");
        } else {
          link.removeAttribute("target");
        }
      });
      cache.contactValues.forEach(function (node) {
        var config = contactMap[node.dataset.contactValue];
        if (config && config.text) {
          node.textContent = config.text;
        }
      });
    }

    function setLanguage(locale) {
      state.locale = locale === "en" ? "en" : "ru";
      localStorage.setItem(STORAGE_KEY, state.locale);
      state.currentDictionary = applyTranslations(state.locale, cache);
      syncLanguageControls();
      syncMenuLabels();
      syncLeadForms();
    }

    function closeMenu() {
      if (!state.mobileOpen) {
        return;
      }
      state.mobileOpen = false;
      syncMenu();
    }

    function openMenu() {
      if (state.mobileOpen) {
        return;
      }
      state.mobileOpen = true;
      syncMenu();
    }

    function toggleMenu() {
      if (state.mobileOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function clearFieldError(formState, fieldName) {
      var field = formState.fields[fieldName];
      var error = formState.fieldErrors[fieldName];
      if (field) {
        field.classList.remove("is-invalid");
      }
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    }

    function clearFormErrors(formState) {
      clearFieldError(formState, "name");
      clearFieldError(formState, "contact");
    }

    function hideLeadSuccess(formState) {
      if (formState.success) {
        formState.success.hidden = true;
      }
    }

    function showFieldError(formState, fieldName, message) {
      var field = formState.fields[fieldName];
      var error = formState.fieldErrors[fieldName];
      if (field) {
        field.classList.add("is-invalid");
      }
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
    }

    function renderFeedback(formState, type, message) {
      if (!formState.feedback) {
        return;
      }
      if (!message) {
        formState.feedback.hidden = true;
        formState.feedback.textContent = "";
        formState.feedback.classList.remove("is-success");
        formState.feedback.classList.remove("is-error");
        return;
      }
      formState.feedback.hidden = false;
      formState.feedback.textContent = message;
      formState.feedback.classList.toggle("is-success", type === "success");
      formState.feedback.classList.toggle("is-error", type === "error");
    }

    function setSubmitting(formState, isSubmitting) {
      formState.submitting = isSubmitting;
      if (formState.submitButton) {
        formState.submitButton.disabled = isSubmitting;
        formState.submitButton.classList.toggle("is-loading", isSubmitting);
      }
      if (formState.submitLabel) {
        formState.submitLabel.textContent = isSubmitting ? getCopy("submitLoading") : getCopy("submitIdle");
      }
    }

    function syncLeadForms() {
      cache.leadForms.forEach(function (formState) {
        setSubmitting(formState, false);
      });
    }

    function validateLead(formState) {
      var name = trimValue(formState.fields.name ? formState.fields.name.value : "");
      var contact = trimValue(formState.fields.contact ? formState.fields.contact.value : "");
      var valid = true;

      clearFormErrors(formState);
      renderFeedback(formState, "", "");

      if (!name) {
        showFieldError(formState, "name", getCopy("requiredName"));
        valid = false;
      }
      if (!contact) {
        showFieldError(formState, "contact", getCopy("requiredContact"));
        valid = false;
      } else if (contact.length < 4) {
        showFieldError(formState, "contact", getCopy("invalidContact"));
        valid = false;
      }
      return valid;
    }

    function sendLead(payload) {
      if (!APP_CONFIG.leadForm.endpoint) {
        return Promise.reject(new Error(getCopy("configError")));
      }
      return postJson(APP_CONFIG.leadForm.endpoint, payload);
    }

    function submitLead(formState) {
      var now = Date.now();
      if (formState.submitting || now - formState.lastSubmittedAt < APP_CONFIG.leadForm.debounceMs) {
        return;
      }
      formState.lastSubmittedAt = now;

      if (formState.honeypot && trimValue(formState.honeypot.value)) {
        return;
      }

      hideLeadSuccess(formState);
      if (!validateLead(formState)) {
        renderFeedback(formState, "error", getCopy("validationError"));
        return;
      }

      var payload = buildLeadPayload(formState, state.locale);
      setSubmitting(formState, true);

      sendLead(payload)
        .then(function () {
          formState.form.reset();
          clearFormErrors(formState);
          renderFeedback(formState, "success", getCopy("success"));
          if (formState.success) {
            formState.success.hidden = false;
          }
          trackEvent("form_submit_success", {
            page: payload.page,
            locale: payload.locale
          });
        })
        .catch(function (error) {
          console.error("AiElement lead form error:", error);
          renderFeedback(formState, "error", error && error.message ? error.message : getCopy("error"));
        })
        .finally(function () {
          setSubmitting(formState, false);
        });
    }

    function handleFormSubmit(event) {
      var form = event.target.closest("[data-lead-form]");
      if (!form) {
        return;
      }
      event.preventDefault();
      var formState = cache.leadForms.find(function (item) {
        return item.form === form;
      });
      if (formState) {
        submitLead(formState);
      }
    }

    function handleFormInput(event) {
      var form = event.target.closest("[data-lead-form]");
      if (!form) {
        return;
      }
      var formState = cache.leadForms.find(function (item) {
        return item.form === form;
      });
      if (!formState) {
        return;
      }
      hideLeadSuccess(formState);
      if (event.target.name === "name" || event.target.name === "contact") {
        clearFieldError(formState, event.target.name);
      }
      renderFeedback(formState, "", "");
    }

    function handleClick(event) {
      var contactLink = event.target.closest("[data-contact-channel]");
      if (contactLink) {
        trackEvent("contact_click", {
          channel: contactLink.dataset.contactChannel,
          page: document.body ? document.body.dataset.page || "unknown" : "unknown"
        });
      }

      var languageButton = event.target.closest("[data-language-switch] [data-lang]");
      if (languageButton) {
        setLanguage(languageButton.dataset.lang);
        return;
      }
      if (event.target.closest("[data-menu-toggle]")) {
        toggleMenu();
        return;
      }
      if (
        event.target.closest("[data-menu-close]") ||
        event.target.closest("[data-menu-backdrop]") ||
        event.target.closest("[data-mobile-menu] a[href]")
      ) {
        closeMenu();
      }
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    function handleResize() {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        closeMenu();
      }
    }

    function init() {
      updateYear();
      populateContactLinks();
      state.locale = localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ru";
      state.currentDictionary = applyTranslations(state.locale, cache);
      syncLanguageControls();
      syncMenuLabels();
      syncMenu();
      syncLeadForms();

      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("submit", handleFormSubmit);
      document.addEventListener("input", handleFormInput);
      window.addEventListener("resize", handleResize);
    }

    return {
      init: init
    };
  }

  function start() {
    createApp().init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
