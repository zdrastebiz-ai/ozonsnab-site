(function () {
  "use strict";

  /* ---------- Текущий год в футере ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal-анимации ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Кнопки «Запросить стоимость» -> скроллят к форме ---------- */
  var requestBtns = document.querySelectorAll(".js-request");
  var requestSection = document.getElementById("request");
  requestBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (requestSection) {
        requestSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Маска телефона ---------- */
  var phoneInput = document.getElementById("f-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      var digits = phoneInput.value.replace(/\D/g, "");
      if (digits.length > 11) digits = digits.slice(0, 11);
      if (!digits) { phoneInput.value = ""; return; }
      var d = digits.replace(/^7/, "8");
      var parts = [];
      if (d.length > 0) parts.push(d[0]);
      if (d.length > 1) parts.push(" (" + d.slice(1, 4));
      if (d.length > 4) parts.push(") " + d.slice(4, 7));
      if (d.length > 7) parts.push("-" + d.slice(7, 9));
      if (d.length > 9) parts.push("-" + d.slice(9, 11));
      phoneInput.value = parts.join("");
    });
  }

  /* ---------- Валидация и отправка формы ---------- */
  var form = document.getElementById("request-form");
  var successBox = document.getElementById("form-success");
  if (form && successBox) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      var nameInput = document.getElementById("f-name");
      var phoneInput2 = document.getElementById("f-phone");

      [nameInput, phoneInput2].forEach(function (input) {
        input.classList.remove("error");
        if (!input.value.trim()) {
          input.classList.add("error");
          valid = false;
        }
      });
      if (nameInput && nameInput.value.trim().length < 2) {
        nameInput.classList.add("error");
        valid = false;
      }
      if (phoneInput2 && phoneInput2.value.replace(/\D/g, "").length < 10) {
        phoneInput2.classList.add("error");
        valid = false;
      }

      if (!valid) {
        var firstErr = form.querySelector(".error");
        if (firstErr) firstErr.focus();
        return;
      }

      /* Собираем текст заявки */
      var g = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };
      var subject = encodeURIComponent("Заявка с сайта ozonsnab");
      var body = [
        "Новая заявка с сайта ozonsnab",
        "",
        "Имя: " + g("f-name"),
        "Телефон: " + g("f-phone"),
        "E-mail: " + (g("f-email") || "—"),
        "Город: " + (g("f-city") || "—"),
        "Детали: " + (g("f-details") || "—")
      ].join("\n");
      var bodyEnc = encodeURIComponent(body);

      /*
        Отправка заявки. По умолчанию форма открывает письмо в почтовом клиенте
        на ozonsnab@bk.ru. Чтобы заявки уходили в Telegram / CRM / на email-сервис,
        замените обработчик ниже (см. закомментированные примеры).
      */
      try {
        window.location.href = "mailto:ozonsnab@bk.ru?subject=" + subject + "&body=" + bodyEnc;
      } catch (err) {}

      /* Альтернатива — уведомление в Telegram через бота:
         fetch("https://api.telegram.org/bot<TOKEN>/sendMessage", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ chat_id: "<CHAT_ID>", text: body })
         }).catch(function () {});
      */
      /* Альтернатива — отправка на CRM-вебхук:
         fetch("https://your-crm.example.com/webhook", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ name: g("f-name"), phone: g("f-phone"), product: product })
         }).catch(function () {});
      */

      form.style.display = "none";
      successBox.classList.add("show");

      /* Цель в Яндекс.Метрике (доступна после инициализации счётчика) */
      if (window.ym) { try { ym(67534612, "reachGoal", "form_send"); } catch (e) {} }
    });
  }

  /* ---------- FAB: плавающие кнопки связи ---------- */
  var fabMain = document.getElementById("fab-main");
  var fabMenu = document.getElementById("fab-menu");
  var fabWrap = document.getElementById("fab-wrap");
  if (fabMain && fabMenu && fabWrap) {
    fabMain.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = fabMenu.classList.toggle("open");
      fabMain.classList.toggle("open", open);
      fabMain.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!fabWrap.contains(e.target)) {
        fabMenu.classList.remove("open");
        fabMain.classList.remove("open");
        fabMain.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
