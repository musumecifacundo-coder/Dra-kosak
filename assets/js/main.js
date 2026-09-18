document.addEventListener("DOMContentLoaded", () => {
  const ACCESS_PASSWORD = "propuesta";
  const ACCESS_KEY = "dra-ivana-kosak-proposal-access";
  const body = document.body;

  const unlock = () => {
    body.classList.add("site-unlocked");
    body.classList.remove("site-protected");
    localStorage.setItem(ACCESS_KEY, "granted");
    document.querySelector(".access-gate")?.remove();
  };

  if (localStorage.getItem(ACCESS_KEY) !== "granted") {
    const gate = document.createElement("section");
    gate.className = "access-gate";
    gate.setAttribute("aria-labelledby", "access-title");
    gate.innerHTML = `
      <div class="access-gate__orb access-gate__orb--one" aria-hidden="true"></div>
      <div class="access-gate__orb access-gate__orb--two" aria-hidden="true"></div>
      <div class="access-card">
        <div class="access-card__mark" aria-hidden="true"><span>IK</span></div>
        <span class="access-card__eyebrow">Espacio privado · propuesta web</span>
        <h1 id="access-title">Una nueva forma de<br><em>acompañar tu salud</em></h1>
        <p class="access-card__intro">Esta página es una propuesta de diseño preparada para Ivana Kosak. El contenido todavía no está publicado ni indexado en buscadores.</p>
        <form class="access-form" novalidate>
          <label for="access-password">Contraseña de acceso</label>
          <div class="access-form__field">
            <input id="access-password" name="password" type="password" autocomplete="current-password" placeholder="Ingresá la contraseña" required>
            <button type="button" class="access-form__toggle" aria-label="Mostrar contraseña" aria-pressed="false">Mostrar</button>
          </div>
          <p class="access-form__error" role="alert" aria-live="polite"></p>
          <button class="btn btn--primario access-form__submit" type="submit">Ver propuesta <span aria-hidden="true">→</span></button>
        </form>
        <p class="access-card__note"><span aria-hidden="true">◌</span> Acceso reservado para revisión</p>
      </div>
    `;
    body.appendChild(gate);

    const form = gate.querySelector(".access-form");
    const input = gate.querySelector("#access-password");
    const error = gate.querySelector(".access-form__error");
    const toggle = gate.querySelector(".access-form__toggle");
    toggle.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      toggle.textContent = visible ? "Mostrar" : "Ocultar";
      toggle.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
      toggle.setAttribute("aria-pressed", String(!visible));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (input.value === ACCESS_PASSWORD) {
        unlock();
      } else {
        error.textContent = "La contraseña no coincide. Revisá el dato e intentá nuevamente.";
        input.select();
        gate.querySelector(".access-card").classList.remove("access-card--shake");
        requestAnimationFrame(() => gate.querySelector(".access-card").classList.add("access-card--shake"));
      }
    });
    input.focus();
  } else {
    body.classList.remove("site-protected");
  }

  // ----- menú mobile -----
  const burger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.setAttribute("aria-controls", "menu-navegacion");
    nav.setAttribute("id", "menu-navegacion");

    const close = () => {
      nav.classList.remove("nav--abierto");
      burger.classList.remove("hamburger--abierto");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    burger.addEventListener("click", () => {
      const abierto = nav.classList.toggle("nav--abierto");
      burger.classList.toggle("hamburger--abierto", abierto);
      burger.setAttribute("aria-expanded", abierto);
      document.body.style.overflow = abierto ? "hidden" : "";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("nav--abierto")) {
        close();
        burger.focus();
      }
    });

    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        close();
      })
    );
  }

  // ----- animaciones de entrada -----
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal--visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
  });
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.reveal--visible)").forEach((el) => el.classList.add("reveal--visible"));
  }, 2500);

  // ----- turnera -----
  const form = document.getElementById("agendaForm");
  if (form) {
    const fechaInput = document.getElementById("fecha");
    const horariosWrap = document.getElementById("horarios");
    const resumen = document.getElementById("resumen");
    const confirmar = document.getElementById("confirmar");
    const HORARIOS = ["08:30", "09:30", "10:30", "11:30", "14:00", "15:00", "16:00", "17:00", "18:00"];
    let horaSel = null;

    const localDateStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const parseLocal = (s) => {
      const [y, mo, d] = s.split("-");
      return new Date(Number(y), Number(mo) - 1, Number(d));
    };

    const hoy = new Date();
    fechaInput.min = localDateStr(hoy);
    fechaInput.value = localDateStr(hoy);

    HORARIOS.forEach((h) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "agenda__hora";
      b.dataset.hora = h;
      b.textContent = h;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        horariosWrap.querySelectorAll(".agenda__hora").forEach((x) => {
          x.classList.remove("agenda__hora--sel");
          x.setAttribute("aria-pressed", "false");
        });
        b.classList.add("agenda__hora--sel");
        b.setAttribute("aria-pressed", "true");
        horaSel = h;
        renderResumen();
      });
      horariosWrap.appendChild(b);
    });

    const esFinDeSemana = (d) => d.getDay() === 0 || d.getDay() === 6;
    fechaInput.addEventListener("change", () => {
      if (!fechaInput.value) return;
      if (esFinDeSemana(parseLocal(fechaInput.value))) {
        resumen.textContent = "Solo atendemos de lunes a viernes. Elegí otro día.";
        resumen.classList.add("agenda__resumen--on");
        fechaInput.value = localDateStr(hoy);
        renderResumen();
      } else {
        renderResumen();
      }
    });

    function modalidadSel() {
      const r = form.querySelector('input[name="modalidad"]:checked');
      return r ? r.value : null;
    }

    function renderResumen() {
      const m = modalidadSel();
      const f = fechaInput.value;
      if (m && f && horaSel) {
        resumen.classList.add("agenda__resumen--on");
        const [y, mo, d] = f.split("-");
        resumen.innerHTML =
          `Turno <strong>${m}</strong> el <strong>${d}/${mo}/${y}</strong> a las <strong>${horaSel}</strong> hs. ` +
          `Aguarda y presioná enviar en WhatsApp para confirmar.`;
        confirmar.disabled = false;
      } else {
        resumen.classList.remove("agenda__resumen--on");
        resumen.textContent = "";
        confirmar.disabled = true;
      }
    }
    form.querySelectorAll('input[name="modalidad"]').forEach((i) => i.addEventListener("change", renderResumen));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const m = modalidadSel();
      const f = fechaInput.value;
      if (!m || !f || !horaSel) return;
      const [y, mo, d] = f.split("-");
      const msj = encodeURIComponent(
        `Hola Ivana 👋\nQuiero reservar un turno:\n\n` +
        `\u2022 Modalidad: ${m}\n\u2022 Fecha: ${d}/${mo}/${y}\n\u2022 Horario: ${horaSel} hs`
      );
      window.open(`https://wa.me/2984216494?text=${msj}`, "_blank", "noopener");
    });
  }
});
