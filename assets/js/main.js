document.addEventListener("DOMContentLoaded", () => {
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
