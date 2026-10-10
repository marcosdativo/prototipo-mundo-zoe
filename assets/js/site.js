/* Mundo Zoe — comportamento do protótipo (JavaScript puro, sem dependências).
   Monta topo, rodapé, chamada final e botão de WhatsApp em todas as páginas
   e liga os componentes de cada página (filtros, antes/depois, galeria, formulário). */
(function () {
  "use strict";

  const MZ = window.MZ || {};
  const C = MZ.contato || {};
  const PROCS = MZ.procedimentos || [];
  // aceita o número digitado de qualquer jeito ("+55 (11) 9...") e deixa só os dígitos para o wa.me
  C.whatsapp = String(C.whatsapp || "").replace(/\D/g, "");

  /* ---------- expediente: horários exibidos, selo "aberto agora" e agenda saem daqui ---------- */
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const DIAS_LONGOS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const minutos = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
  const fmtHora = (t) => { const [h, m] = String(t).split(":").map(Number); return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`; };
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const EXP = C.expediente || null;
  const FECHADAS = new Set(C.datasFechadas || []);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  // horário do dia (ou nada, se a clínica não abre nessa data)
  const expedienteDe = (d) => (FECHADAS.has(iso(d)) ? null : EXP[d.getDay()]);
  if (EXP) {
    // agrupa dias seguidos com o mesmo horário: "Segunda a sexta · 9h às 19h"
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    const grupos = [];
    ordem.forEach((d) => {
      const h = EXP[d];
      if (!h) return;
      const ult = grupos[grupos.length - 1];
      if (ult && ult.chave === h.join("-") && ordem.indexOf(ult.fim) === ordem.indexOf(d) - 1) ult.fim = d;
      else grupos.push({ chave: h.join("-"), ini: d, fim: d, h });
    });
    C.horarios = grupos.map((g) => [
      g.ini === g.fim ? maiuscula(DIAS[g.ini]) : `${maiuscula(DIAS[g.ini])} a ${DIAS[g.fim]}`,
      `${fmtHora(g.h[0])} às ${fmtHora(g.h[1])}`
    ]);
  }
  function statusAgora(agora = new Date()) {
    if (!EXP) return null;
    const min = agora.getHours() * 60 + agora.getMinutes();
    const h = expedienteDe(agora);
    if (h && min >= minutos(h[0]) && min < minutos(h[1])) return { aberto: true, texto: `Aberto agora · até ${fmtHora(h[1])}` };
    for (let k = 0; k < 21; k++) {
      const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + k);
      const hd = expedienteDe(d);
      if (!hd || (k === 0 && min >= minutos(hd[0]))) continue;
      const quando = k === 0 ? "hoje" : k === 1 ? "amanhã" : k < 7 ? DIAS_LONGOS[d.getDay()] : `dia ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { aberto: false, texto: `Fechado agora · abre ${quando} às ${fmtHora(hd[0])}` };
    }
    return null;
  }
  const pagina = document.body.getAttribute("data-pagina") || "";
  const params = new URLSearchParams(location.search);

  /* ---------- ícones ---------- */
  const ICONES = {
    whats: '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tel: '<path d="M21.5 16.6v2.9a1.9 1.9 0 0 1-2.1 1.9 18.9 18.9 0 0 1-8.2-2.9 18.6 18.6 0 0 1-5.7-5.7A18.9 18.9 0 0 1 2.6 4.6 1.9 1.9 0 0 1 4.5 2.5h2.9a1.9 1.9 0 0 1 1.9 1.6c.1.9.4 1.8.7 2.7a1.9 1.9 0 0 1-.4 2L8.3 10a15.2 15.2 0 0 0 5.7 5.7l1.2-1.2a1.9 1.9 0 0 1 2-.4c.9.3 1.8.6 2.7.7a1.9 1.9 0 0 1 1.6 1.8z"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu: '<path d="M4 9h16M4 15h16"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
    brilho: '<path fill="currentColor" stroke="none" d="M12 1.5c.6 6.2 4.3 9.9 10.5 10.5-6.2.6-9.9 4.3-10.5 10.5C11.4 16.3 7.7 12.6 1.5 12 7.7 11.4 11.4 7.7 12 1.5z"/>',
    estrela: '<path fill="currentColor" stroke="none" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
    esquerda: '<path d="M15 6l-6 6 6 6"/>',
    direita: '<path d="M9 6l6 6-6 6"/>',
    setas: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
    lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/>',
    escudo: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12.2l2.1 2.1 4-4.1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    rosto: '<path d="M12 3.2c3.9 0 6.6 3.1 6.6 7.6 0 4.9-3.1 10-6.6 10s-6.6-5.1-6.6-10c0-4.5 2.7-7.6 6.6-7.6z"/><path d="M9.6 14.6c1.4 1 3.4 1 4.8 0"/>',
    lua: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    sol: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'
  };
  const ICONES_PROC = {
    botox: '<path d="M3 7.5c2.3-2 4.5 2 6.8 0s4.5 2 6.8 0 3.2-.9 4.4 0"/><path d="M3 12.5c2.3-1 4.5 1 6.8 0s4.5 1 6.8 0 3.2-.5 4.4 0"/><path d="M3 17.5h18"/>',
    preenchimento: '<path d="M12 3.5c3.4 4.1 5.8 7.2 5.8 10.2a5.8 5.8 0 0 1-11.6 0c0-3 2.4-6.1 5.8-10.2z"/><path d="M9.4 14.4a2.7 2.7 0 0 0 2.3 2.5"/>',
    sculptra: '<path d="M10 4.5c.5 4.1 2.6 6.2 6.7 6.7-4.1.5-6.2 2.6-6.7 6.7-.5-4.1-2.6-6.2-6.7-6.7 4.1-.5 6.2-2.6 6.7-6.7z"/><path d="M18.2 2.8c.2 1.6 1 2.4 2.6 2.6-1.6.2-2.4 1-2.6 2.6-.2-1.6-1-2.4-2.6-2.6 1.6-.2 2.4-1 2.6-2.6z"/><circle cx="18.5" cy="18.5" r="1.2"/>',
    ultraformer: '<path d="M8.6 20a3.4 3.4 0 0 1 6.8 0"/><path d="M5.2 20a6.8 6.8 0 0 1 13.6 0"/><path d="M1.8 20a10.2 10.2 0 0 1 20.4 0" opacity=".5"/><circle cx="12" cy="6" r="1.5"/>',
    endolaser: '<path d="M3.5 20.5l8.8-8.8"/><path d="M15.5 3.5c.4 3.3 1.9 4.8 5.2 5.2-3.3.4-4.8 1.9-5.2 5.2-.4-3.3-1.9-4.8-5.2-5.2 3.3-.4 4.8-1.9 5.2-5.2z"/>',
    criolipolise: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.7 4.7 12 6.6l2.3-1.9M9.7 19.3 12 17.4l2.3 1.9M3.9 10.4l2.7-.5-.9-2.6M20.1 13.6l-2.7.5.9 2.6M3.9 13.6l2.7.5-.9 2.6M20.1 10.4l-2.7-.5.9-2.6"/>',
    gluteo: '<path d="M8.5 3c-1.7 3.4-1.7 6 0 8.6s1.4 6.6-.6 9.4"/><path d="M15.5 3c1.7 3.4 1.7 6 0 8.6s-1.4 6.6.6 9.4"/>',
    vasinhos: '<path d="M12 21c0-3.5.3-6.3-1-8.6S7.6 8.3 5.5 5"/><path d="M11.2 12.6c1.9-1.2 3.9-3 4.9-6.1"/><path d="M8 9.3l-4 .5M15 9.4l3.6.9M16.1 6.5l1.6-2.6"/>'
  };
  const svg = (nome, extra = "") => `<svg class="ic${extra ? " " + extra : ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONES[nome] || ICONES_PROC[nome] || ""}</svg>`;
  const iconeProc = (p) => svg(p.icone);

  const ORBITA = (classe) => `<svg class="orbita ${classe || ""}" viewBox="0 0 640 520" fill="none" aria-hidden="true" focusable="false">
      <g class="orbita__giro">
        <ellipse cx="320" cy="260" rx="300" ry="168" transform="rotate(-16 320 260)" stroke="currentColor" stroke-width="1"/>
        <ellipse cx="320" cy="260" rx="262" ry="140" transform="rotate(-16 320 260)" stroke="currentColor" stroke-width=".6" opacity=".45"/>
        <g transform="translate(546 108)"><path class="orbita__brilho" d="M0-18C.9-5.4 5.4-.9 18 0 5.4.9.9 5.4 0 18-.9 5.4-5.4.9-18 0-5.4-.9-.9-5.4 0-18Z" fill="currentColor"/></g>
      </g>
    </svg>`;

  /* ---------- tema claro/escuro ----------
     A escolha fica salva no navegador; o <head> de cada página já aplica o tema antes de desenhar. */
  const raiz = document.documentElement;
  const temaAtual = () => (raiz.getAttribute("data-tema") === "escuro" ? "escuro" : "claro");
  const movimentoReduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function aplicarTema(tema, animar) {
    if (animar && !movimentoReduzido) {
      raiz.classList.add("trocando-tema");
      setTimeout(() => raiz.classList.remove("trocando-tema"), 450);
    }
    if (tema === "escuro") raiz.setAttribute("data-tema", "escuro");
    else raiz.removeAttribute("data-tema");
    // logos e emblemas: versão dourada no claro, versão de fundo preto no escuro
    document.querySelectorAll("img[data-escuro]").forEach((img) => {
      if (!img.dataset.claro) img.dataset.claro = img.getAttribute("src");
      const src = tema === "escuro" ? img.dataset.escuro : img.dataset.claro;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", tema === "escuro" ? "#171515" : "#F7F3EC");
    document.querySelectorAll("[data-tema-botao]").forEach((b) => {
      const escuro = tema === "escuro";
      b.setAttribute("aria-pressed", String(escuro));
      b.title = escuro ? "Voltar ao modo claro" : "Ativar modo escuro";
      b.innerHTML = svg(escuro ? "sol" : "lua");
    });
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-tema-botao]")) return;
    const novo = temaAtual() === "escuro" ? "claro" : "escuro";
    aplicarTema(novo, true);
    try { localStorage.setItem("mz-tema", novo); } catch (_) { /* navegação privada: só não lembra */ }
  });

  /* ---------- textos de WhatsApp ---------- */
  const MSG_PADRAO = "Olá! Vim pelo site e gostaria de agendar uma avaliação na Mundo Zoe.";
  const msgProc = (p) => `Olá! Vim pelo site e gostaria de agendar uma avaliação de ${p.nome} na Mundo Zoe.`;
  const linkWhats = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg || MSG_PADRAO)}`;
  const urlProc = (p) => `procedimento.html?p=${p.slug}`;
  const num = (i) => String(i + 1).padStart(2, "0");
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* procedimento da página de detalhe (definido antes de montar as listas) */
  let procAtual = null;
  if (document.querySelector("[data-detalhe]")) {
    const slug = params.get("p");
    procAtual = slug ? PROCS.find((p) => p.slug === slug) || null : PROCS[0] || null;
  }
  // na página de um procedimento, todo botão de agendar já leva o nome dele
  const MSG_PAGINA = procAtual && pagina === "procedimento" ? msgProc(procAtual) : MSG_PADRAO;

  /* ---------- topo ---------- */
  const NAV = [
    ["index.html", "Início", "inicio"],
    ["sobre.html", "A clínica", "sobre"],
    ["procedimentos.html", "Procedimentos", "procedimentos"],
    ["resultados.html", "Resultados", "resultados"],
    ["contato.html", "Contato", "contato"]
  ];
  const ativo = (chave) => (chave === pagina || (chave === "procedimentos" && pagina === "procedimento") ? ' aria-current="page"' : "");

  const topo = document.getElementById("topo");
  if (topo) {
    topo.innerHTML = `<div class="container topo__in">
        <a class="topo__logo" href="index.html" aria-label="Mundo Zoe — página inicial">
          <img src="assets/img/logo-dourado-compacto.png" data-escuro="assets/img/logo-noturno-compacto.png" alt="Mundo Zoe" width="640" height="301">
        </a>
        <nav class="nav" aria-label="Principal">
          ${NAV.map(([href, nome, chave]) => `<a href="${href}"${ativo(chave)}>${nome}</a>`).join("")}
        </nav>
        <div class="topo__acoes">
          <button class="tema-botao" type="button" data-tema-botao aria-label="Modo escuro" aria-pressed="false">${svg("lua")}</button>
          <a class="btn btn--ouro btn--p topo__cta" href="#" data-whats>Agendar avaliação</a>
          <button class="topo__menu" type="button" aria-expanded="false" aria-controls="menu-movel" aria-label="Abrir menu">${svg("menu")}</button>
        </div>
      </div>
      <div class="progresso" aria-hidden="true"><span></span></div>`;
    const barra = topo.querySelector(".progresso span");
    let pedido = false;
    const marcar = () => {
      pedido = false;
      topo.classList.toggle("rolou", window.scrollY > 8);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(marcar); } }, { passive: true });
    window.addEventListener("resize", marcar);
    marcar();
  }

  /* menu móvel */
  const menu = document.createElement("div");
  menu.className = "menu-movel";
  menu.id = "menu-movel";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Menu");
  menu.innerHTML = `<div class="menu-movel__topo">
      <img src="assets/img/logo-dourado-compacto.png" data-escuro="assets/img/logo-noturno-compacto.png" alt="Mundo Zoe" width="640" height="301">
      <button class="botao-redondo botao-redondo--claro" type="button" data-fechar-menu aria-label="Fechar menu">${svg("fechar")}</button>
    </div>
    <nav aria-label="Principal (celular)">
      ${NAV.map(([href, nome, chave]) => `<a href="${href}"${ativo(chave)}>${nome} ${svg("seta")}</a>`).join("")}
    </nav>
    <div class="menu-movel__rodape">
      <a class="btn btn--ouro" href="#" data-whats>${svg("whats")} Agendar pelo WhatsApp</a>
      <a class="btn btn--linha" href="#" data-instagram>${svg("insta")} ${esc(C.instagram || "Instagram")}</a>
      <p>${esc(C.endereco || "")}${C.cidade ? " · " + esc(C.cidade) : ""}</p>
    </div>`;
  document.body.appendChild(menu);
  const botaoMenu = topo && topo.querySelector(".topo__menu");
  // com o menu aberto, o que está atrás dele sai do alcance do Tab e do leitor de tela
  const atrasDoMenu = () => [topo, document.querySelector("main"), document.getElementById("rodape"), document.querySelector(".flutuante")].filter(Boolean);
  function abrirMenu() {
    menu.classList.add("aberto");
    document.body.classList.add("menu-aberto");
    atrasDoMenu().forEach((el) => { el.inert = true; });
    botaoMenu && botaoMenu.setAttribute("aria-expanded", "true");
    menu.querySelector("[data-fechar-menu]").focus();
  }
  function fecharMenu(devolverFoco = true) {
    if (!menu.classList.contains("aberto")) return;
    menu.classList.remove("aberto");
    document.body.classList.remove("menu-aberto");
    atrasDoMenu().forEach((el) => { el.inert = false; });
    botaoMenu && botaoMenu.setAttribute("aria-expanded", "false");
    if (devolverFoco && botaoMenu && botaoMenu.offsetParent) botaoMenu.focus();
  }
  botaoMenu && botaoMenu.addEventListener("click", abrirMenu);
  menu.querySelector("[data-fechar-menu]").addEventListener("click", () => fecharMenu());
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) fecharMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 980) fecharMenu(false); });
  window.addEventListener("pageshow", (e) => { if (e.persisted) fecharMenu(false); });

  /* ---------- chamada final ---------- */
  document.querySelectorAll("[data-chamada]").forEach((el) => {
    const contato = procAtual && pagina === "procedimento" ? `contato.html?p=${procAtual.slug}` : "contato.html";
    el.innerHTML = `${ORBITA()}
      <div class="container">
        <img class="chamada__logo revelar" src="assets/img/logo-noturno.png" alt="Mundo Zoe — Biomedicina Estética" width="900" height="576">
        <h2 class="revelar" style="--d:1">Sua melhor versão<br><em>começa com uma conversa.</em></h2>
        <p class="revelar" style="--d:2">Agende sua avaliação e conheça de perto o <strong>atendimento Mundo Zoe</strong>.</p>
        <div class="acoes revelar" style="--d:3">
          <a class="btn btn--ouro" href="#" data-whats>${svg("whats")} Agendar pelo WhatsApp</a>
          <a class="btn btn--claro" href="${contato}">Ver endereço e horários</a>
        </div>
      </div>`;
  });

  /* ---------- rodapé ---------- */
  const rodape = document.getElementById("rodape");
  if (rodape) {
    const horarios = (C.horarios || []).map(([d, h]) => `${esc(d)}: ${esc(h)}`).join("<br>");
    rodape.innerHTML = `<div class="container">
        <div class="rodape__grade">
          <div class="rodape__marca">
            <img src="assets/img/logo-noturno.png" alt="Mundo Zoe — Biomedicina Estética" width="900" height="576" loading="lazy">
            <p>Sofisticação, tecnologia e beleza, com atendimento personalizado, acolhedor e de alto padrão.</p>
            <div class="sociais">
              <a href="#" data-whats aria-label="WhatsApp">${svg("whats")}</a>
              <a href="#" data-instagram aria-label="Instagram">${svg("insta")}</a>
            </div>
          </div>
          <div>
            <h3>Navegação</h3>
            <ul>${NAV.map(([href, nome]) => `<li><a href="${href}">${nome}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h3>Procedimentos</h3>
            <ul>${PROCS.map((p) => `<li><a href="${urlProc(p)}">${esc(p.nome)}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h3>Contato</h3>
            <ul class="rodape__contato">
              <li><span></span><span class="status-aberto" data-status-aberto></span></li>
              <li>${svg("whats")}<a href="#" data-whats>${esc(C.whatsappExibicao || "WhatsApp")}</a></li>
              <li>${svg("insta")}<a href="#" data-instagram>${esc(C.instagram || "Instagram")}</a></li>
              <li>${svg("pin")}<span>${esc(C.endereco || "")}<br>${esc(C.cidade || "")}</span></li>
              <li>${svg("relogio")}<span>${horarios}</span></li>
            </ul>
          </div>
        </div>
        <div class="rodape__base">
          <span>© <span data-ano></span> Mundo Zoe · Biomedicina Estética</span>
          <span>Responsável técnica: ${esc(C.responsavel || "")} · ${esc(C.registro || "")}</span>
          <span>Resultados podem variar de pessoa para pessoa.</span>
          ${MZ.apresentacao !== false ? `<span class="selo-prototipo">Protótipo de apresentação · fotos e dados ilustrativos</span>` : ""}
        </div>
      </div>`;
  }

  /* botão flutuante */
  const flutuante = document.createElement("a");
  flutuante.className = "flutuante";
  flutuante.href = "#";
  flutuante.setAttribute("data-whats", "");
  flutuante.setAttribute("aria-label", "Agende pelo WhatsApp");
  flutuante.innerHTML = `${svg("whats")}<span>Agende pelo WhatsApp</span>`;
  document.body.appendChild(flutuante);

  /* ---------- diálogo de demonstração ---------- */
  const demo = document.createElement("dialog");
  demo.className = "demo";
  demo.setAttribute("aria-labelledby", "demo-titulo");
  demo.innerHTML = `<div class="demo__in">
      <div class="demo__topo">
        <span class="sobretitulo">Demonstração</span>
        <button class="botao-redondo botao-redondo--claro" type="button" data-fechar aria-label="Fechar">${svg("fechar")}</button>
      </div>
      <h3 id="demo-titulo"></h3>
      <p data-demo-texto></p>
      <div class="demo__chat" data-demo-chat><div class="demo__balao"><span data-demo-msg></span><span class="demo__hora">agora ✓✓</span></div></div>
      <p class="demo__nota" data-demo-nota></p>
      <button class="btn btn--ouro" type="button" data-fechar>Entendi</button>
    </div>`;
  document.body.appendChild(demo);
  demo.addEventListener("click", (e) => { if (e.target === demo || e.target.closest("[data-fechar]")) demo.close(); });

  function abrirDemo({ titulo, texto, mensagem, nota }) {
    demo.querySelector("#demo-titulo").textContent = titulo;
    demo.querySelector("[data-demo-texto]").textContent = texto;
    demo.querySelector("[data-demo-chat]").hidden = !mensagem;
    demo.querySelector("[data-demo-msg]").textContent = mensagem || "";
    demo.querySelector("[data-demo-nota]").textContent = nota || "";
    fecharMenu();
    if (typeof demo.showModal === "function") demo.showModal();
    else alert(`${titulo}\n\n${mensagem || texto}`);
  }

  function enviarWhats(msg) {
    if (C.whatsapp) {
      const url = linkWhats(msg);
      const janela = window.open(url, "_blank");
      if (janela) janela.opener = null;
      else window.location.href = url;
      return;
    }
    abrirDemo({
      titulo: "A paciente vai direto para o WhatsApp",
      texto: "Com a mensagem já escrita, sem precisar digitar nada:",
      mensagem: msg,
      nota: "No site publicado, este botão abre a conversa com o número oficial da Mundo Zoe."
    });
  }

  /* ---------- listas de procedimentos ---------- */
  function cardGrade(p, k) {
    const i = PROCS.indexOf(p);
    return `<a class="card-proc revelar" style="--d:${k % 4}" href="${urlProc(p)}" data-area="${p.areas.join(" ")}" aria-labelledby="card-${p.slug}">
        <span class="card-proc__num">${num(i)}</span>
        <span class="card-proc__icone">${iconeProc(p)}</span>
        <span class="card-proc__area">${p.areas.join(" · ")}</span>
        <h3 id="card-${p.slug}">${esc(p.nome)}</h3>
        <p>${esc(p.resumo)}</p>
        <span class="card-proc__rodape"><span class="card-proc__mais">Saiba mais ${svg("seta")}</span></span>
      </a>`;
  }
  function cardLista(p, k) {
    const i = PROCS.indexOf(p);
    return `<article class="card-proc card-proc--lista revelar" style="--d:${k % 2}" data-area="${p.areas.join(" ")}">
        <span class="card-proc__num">${num(i)}</span>
        <span class="card-proc__icone">${iconeProc(p)}</span>
        <div class="card-proc__corpo">
          <span class="card-proc__area sobretitulo">${p.areas.join(" · ")}</span>
          <h3><a href="${urlProc(p)}">${esc(p.nome)}</a></h3>
          <p>${esc(p.resumo)}</p>
          <div class="card-proc__acoes">
            <a class="link-seta" href="${urlProc(p)}">Saiba mais ${svg("seta")}</a>
            <a class="btn btn--linha btn--p" href="#" data-whats data-msg="${esc(msgProc(p))}">Agendar</a>
          </div>
        </div>
      </article>`;
  }
  document.querySelectorAll("[data-lista-procedimentos]").forEach((el) => {
    const tipo = el.getAttribute("data-lista-procedimentos");
    if (!PROCS.length) { el.innerHTML = ""; return; }
    if (tipo === "outros") {
      const base = procAtual ? PROCS.indexOf(procAtual) : 0;
      const outros = [1, 2, 3].map((k) => PROCS[(base + k) % PROCS.length]);
      el.innerHTML = outros.map(cardGrade).join("");
    } else if (tipo === "lista") {
      el.innerHTML = PROCS.map(cardLista).join("");
    } else {
      el.innerHTML = PROCS.map(cardGrade).join("");
    }
  });

  /* letreiro com os nomes dos procedimentos */
  document.querySelectorAll("[data-letreiro]").forEach((el) => {
    const itens = PROCS.map((p) => `<span class="letreiro__item">${esc(p.nome)} ${svg("brilho")}</span>`).join("");
    el.innerHTML = `<div class="letreiro__trilho">${itens}${itens}</div>`;
  });

  /* ---------- detalhe do procedimento ---------- */
  if (document.querySelector("[data-detalhe]")) {
    if (!procAtual) {
      document.querySelectorAll("[data-se-encontrado]").forEach((el) => { el.hidden = true; });
      document.querySelectorAll("[data-se-nao-encontrado]").forEach((el) => { el.hidden = false; });
    } else {
      const p = procAtual;
      document.title = `${p.nome} | Mundo Zoe Biomedicina Estética`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", `${p.nome} na Mundo Zoe: ${p.resumo}`);
      document.querySelectorAll('[data-p="nome"]').forEach((el) => { el.textContent = p.nome; });
      document.querySelectorAll('[data-p="resumo"]').forEach((el) => { el.textContent = p.resumo; });
      document.querySelectorAll('[data-p="sobre"]').forEach((el) => { el.textContent = p.sobre; });
      document.querySelectorAll('[data-p="areas"]').forEach((el) => { el.textContent = p.areas.join(" · "); });
      document.querySelectorAll("[data-p-icone]").forEach((el) => { el.innerHTML = iconeProc(p); });
      document.querySelectorAll("[data-p-legenda]").forEach((el) => { el.setAttribute("data-legenda", `Foto · ${p.nome}`); });
      document.querySelectorAll("[data-msg-proc]").forEach((el) => { el.setAttribute("data-msg", msgProc(p)); });
      document.querySelectorAll('[data-p-lista="beneficios"]').forEach((el) => {
        el.innerHTML = p.beneficios.map((b) => `<li>${svg("brilho")}<span>${esc(b)}</span></li>`).join("");
      });
    }
  }

  /* ---------- fotos ----------
     Cada .foto com data-foto ganha a imagem configurada em dados.js; sem imagem (ou sem internet),
     continua o desenho dourado de espera. */
  const FOTOS = MZ.fotos || {};
  function fotoDe(chave) {
    let f = null;
    if (chave.startsWith("proc:")) {
      const slug = chave.slice(5);
      const p = slug === "atual" ? procAtual : PROCS.find((x) => x.slug === slug);
      f = p && p.foto;
    } else {
      f = FOTOS[chave];
    }
    if (!f) return null;
    return typeof f === "string" ? { src: f } : f;
  }
  const urlFoto = (src, largura) => (/images\.unsplash\.com\//.test(src) ? `${src}?w=${largura}&q=75&auto=format&fit=crop` : src);
  function colocarFoto(el, f, largura, imediata) {
    el.querySelectorAll(":scope > .foto__img").forEach((i) => i.remove());
    el.classList.remove("foto--com-img");
    if (!f) return;
    const img = document.createElement("img");
    img.className = "foto__img";
    img.alt = "";
    img.decoding = "async";
    img.loading = imediata ? "eager" : "lazy";
    if (f.pos) img.style.objectPosition = f.pos;
    img.addEventListener("error", () => { img.remove(); el.classList.remove("foto--com-img"); });
    img.src = urlFoto(f.src, largura);
    el.prepend(img);
    el.classList.add("foto--com-img");
  }
  document.querySelectorAll("[data-foto]").forEach((el) => {
    const f = fotoDe(el.getAttribute("data-foto"));
    if (f) { el.dataset.fotoSrc = f.src; el.dataset.fotoPos = f.pos || ""; }
    colocarFoto(el, f, el.classList.contains("galeria__item") ? 900 : 1100, !!el.closest(".hero, .cab-pagina"));
  });

  /* ---------- ícones declarados no HTML: <i data-ic="nome"></i> ---------- */
  document.querySelectorAll("i[data-ic]").forEach((el) => {
    el.outerHTML = svg(el.getAttribute("data-ic"));
  });
  document.querySelectorAll("[data-orbita]").forEach((el) => {
    el.outerHTML = ORBITA(el.getAttribute("data-orbita"));
  });

  /* ---------- dados de contato espalhados nas páginas ---------- */
  document.querySelectorAll("[data-c]").forEach((el) => {
    const v = C[el.getAttribute("data-c")];
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-c-horarios]").forEach((el) => {
    el.innerHTML = (C.horarios || []).map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join("");
  });
  const status = statusAgora();
  document.querySelectorAll("[data-status-aberto]").forEach((el) => {
    if (!status) { (el.closest("li") || el).hidden = true; return; }
    el.textContent = status.texto;
    el.classList.toggle("aberto", status.aberto);
  });
  document.querySelectorAll("[data-ano]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-total-procs]").forEach((el) => { el.textContent = PROCS.length; });

  /* ---------- links: WhatsApp, Instagram, telefone, rota, Google ---------- */
  document.querySelectorAll("[data-whats]").forEach((a) => {
    if (C.whatsapp) {
      a.href = linkWhats(a.getAttribute("data-msg") || MSG_PAGINA);
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
  if (C.instagramUrl) document.querySelectorAll("[data-instagram]").forEach((a) => { a.href = C.instagramUrl; a.target = "_blank"; a.rel = "noopener"; });
  if (C.telefone) document.querySelectorAll("[data-tel]").forEach((a) => { a.href = `tel:${C.telefone}`; });
  if (C.google) document.querySelectorAll("[data-google]").forEach((a) => { a.href = C.google; a.target = "_blank"; a.rel = "noopener"; });
  if (C.mapa) document.querySelectorAll("[data-rota]").forEach((a) => {
    a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(C.mapa)}`;
    a.target = "_blank"; a.rel = "noopener";
  });

  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-whats], [data-instagram], [data-tel], [data-rota], [data-google]");
    if (!alvo) return;
    if (alvo.hasAttribute("data-whats")) {
      if (C.whatsapp && /^https:\/\/wa\.me\//.test(alvo.getAttribute("href") || "")) return; // link já montado
      e.preventDefault();
      enviarWhats(alvo.getAttribute("data-msg") || MSG_PAGINA);
    } else if (alvo.hasAttribute("data-instagram") && !C.instagramUrl) {
      e.preventDefault();
      abrirDemo({ titulo: "Instagram da clínica", texto: `No site publicado, este botão abre o perfil ${C.instagram || ""} no Instagram, onde a paciente acompanha bastidores, procedimentos e novidades.` });
    } else if (alvo.hasAttribute("data-tel") && !C.telefone) {
      e.preventDefault();
      abrirDemo({ titulo: "Ligação direta", texto: "No celular, este botão já inicia a ligação para o telefone da clínica." });
    } else if (alvo.hasAttribute("data-rota") && !C.mapa) {
      e.preventDefault();
      abrirDemo({ titulo: "Como chegar", texto: "No site publicado, este botão abre o Google Maps com a rota até a Mundo Zoe, saindo de onde a paciente estiver." });
    } else if (alvo.hasAttribute("data-google") && !C.google) {
      e.preventDefault();
      abrirDemo({ titulo: "Avaliações no Google", texto: "Com o Perfil da Empresa no Google configurado, este botão leva às avaliações reais das pacientes — e o site e o Google passam a reforçar um ao outro." });
    }
  });

  /* ---------- filtros ---------- */
  document.querySelectorAll("[data-filtros]").forEach((grupo) => {
    const alvo = document.querySelector(grupo.getAttribute("data-filtros"));
    if (!alvo) return;
    grupo.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filtro]");
      if (!b) return;
      const f = b.getAttribute("data-filtro");
      grupo.querySelectorAll("[data-filtro]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      alvo.querySelectorAll("[data-area]").forEach((item) => {
        const areas = item.getAttribute("data-area").split(" ");
        item.hidden = !(f === "todos" || areas.includes(f));
      });
      if (alvo.scrollLeft) alvo.scrollTo({ left: 0, behavior: "smooth" });
    });
  });

  /* ---------- antes e depois ---------- */
  document.querySelectorAll(".comparar").forEach((c) => {
    const r = c.querySelector('input[type="range"]');
    if (!r) return;
    const atualizar = () => c.style.setProperty("--pos", `${r.value}%`);
    r.addEventListener("input", atualizar);
    r.addEventListener("pointerdown", () => { r.dataset.mexeu = "1"; }, { once: true });
    r.addEventListener("keydown", () => { r.dataset.mexeu = "1"; }, { once: true });
    atualizar();
  });
  if (!movimentoReduzido && "IntersectionObserver" in window) {
    const pontos = [50, 32, 68, 50];
    const dica = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      dica.unobserve(en.target);
      const c = en.target;
      const r = c.querySelector('input[type="range"]');
      let t0 = null;
      const quadro = (t) => {
        if (r.dataset.mexeu) return;
        if (t0 === null) t0 = t;
        const p = Math.min(1, (t - t0) / 1800);
        const seg = p * (pontos.length - 1);
        const i = Math.min(pontos.length - 2, Math.floor(seg));
        const f = seg - i;
        const suave = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        const v = pontos[i] + (pontos[i + 1] - pontos[i]) * suave;
        r.value = v;
        c.style.setProperty("--pos", `${v}%`);
        if (p < 1) requestAnimationFrame(quadro);
      };
      setTimeout(() => requestAnimationFrame(quadro), 450);
    }), { threshold: .6 });
    document.querySelectorAll(".comparar").forEach((c) => { if (c.querySelector('input[type="range"]')) dica.observe(c); });
  }

  /* ---------- galeria com ampliação ---------- */
  const galeria = document.querySelector("[data-galeria]");
  const luz = document.getElementById("caixa-luz");
  if (galeria && luz) {
    const foto = luz.querySelector(".foto");
    const legenda = luz.querySelector("[data-legenda-texto]");
    const contador = luz.querySelector("[data-contador]");
    galeria.querySelectorAll(".galeria__item").forEach((i) => i.setAttribute("aria-label", `Ampliar: ${i.getAttribute("data-legenda")}`));
    let lista = [];
    let atual = 0;
    const mostrar = (i) => {
      atual = (i + lista.length) % lista.length;
      const item = lista[atual];
      foto.className = "foto " + [...item.classList].filter((c) => c.startsWith("foto--")).join(" ");
      foto.setAttribute("data-legenda", item.getAttribute("data-legenda"));
      colocarFoto(foto, item.dataset.fotoSrc ? { src: item.dataset.fotoSrc, pos: item.dataset.fotoPos } : null, 1800, true);
      legenda.textContent = item.getAttribute("data-legenda");
      contador.textContent = `${atual + 1} / ${lista.length}`;
    };
    galeria.addEventListener("click", (e) => {
      const item = e.target.closest(".galeria__item");
      if (!item) return;
      lista = [...galeria.querySelectorAll(".galeria__item:not([hidden])")];
      mostrar(lista.indexOf(item));
      if (typeof luz.showModal === "function") luz.showModal();
    });
    luz.addEventListener("click", (e) => {
      if (e.target === luz || e.target.closest("[data-fechar]")) luz.close();
      else if (e.target.closest("[data-anterior]")) mostrar(atual - 1);
      else if (e.target.closest("[data-proximo]")) mostrar(atual + 1);
    });
    luz.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") mostrar(atual - 1);
      if (e.key === "ArrowRight") mostrar(atual + 1);
    });
    let x0 = null;
    luz.addEventListener("pointerdown", (e) => { x0 = e.target.closest(".foto") ? e.clientX : null; });
    luz.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 45) mostrar(atual + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- mapa ---------- */
  if (C.mapa) document.querySelectorAll("[data-mapa]").forEach((m) => {
    const ilustracao = m.querySelector(".mapa__ilustracao");
    if (ilustracao) ilustracao.outerHTML = `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(C.mapa)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa com a localização da Mundo Zoe"></iframe>`;
  });

  /* ---------- formulário de agendamento (vira mensagem de WhatsApp) ---------- */
  const form = document.getElementById("form-agendamento");
  if (form) {
    const sel = form.querySelector('select[name="interesse"]');
    sel.innerHTML = `<option value="" disabled selected>Selecione</option>` +
      PROCS.map((p) => `<option value="${esc(p.nome)}">${esc(p.nome)}</option>`).join("") +
      `<option value="Ainda não sei — quero uma avaliação">Ainda não sei — quero uma avaliação</option>`;
    const pre = PROCS.find((p) => p.slug === params.get("p"));
    if (pre) sel.value = pre.nome;
    const nome = form.querySelector('input[name="nome"]');
    nome.addEventListener("input", () => nome.setCustomValidity(""));

    const diasEl = form.querySelector("[data-agenda-dias]");
    const horasEl = form.querySelector("[data-agenda-horas]");
    const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const deIso = (t) => { const [a, m, d] = t.split("-").map(Number); return new Date(a, m - 1, d); };
    if (EXP && diasEl && horasEl) {
      const agora = new Date();
      const minAgora = agora.getHours() * 60 + agora.getMinutes();
      // horários de hora em hora; hoje, só com pelo menos 1h de antecedência
      const horasDoDia = (d) => {
        const h = expedienteDe(d);
        if (!h) return [];
        const hoje = iso(d) === iso(agora);
        const lista = [];
        for (let m = minutos(h[0]); m <= minutos(h[1]) - 60; m += 60) {
          if (!hoje || m >= minAgora + 60) lista.push(`${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`);
        }
        return lista;
      };
      const dias = [];
      for (let k = 0; dias.length < 12 && k < 31; k++) {
        const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + k);
        if (horasDoDia(d).length) dias.push({ d, k });
      }
      diasEl.innerHTML = dias.map(({ d, k }, i) => `<label class="dia"><input type="radio" name="dia" value="${iso(d)}"${i === 0 ? " required" : ""}>
          <span><small>${k === 0 ? "Hoje" : k === 1 ? "Amanhã" : DIAS_CURTOS[d.getDay()]}</small><strong>${d.getDate()}</strong><em>${MESES[d.getMonth()]}</em></span></label>`).join("");
      const desenharHoras = (d) => {
        const lista = d ? horasDoDia(d) : [];
        horasEl.innerHTML = `<label class="chip"><input type="radio" name="hora" value="qualquer" checked><span>Qualquer horário</span></label>` +
          lista.map((h) => `<label class="chip"><input type="radio" name="hora" value="${h}"><span>${fmtHora(h)}</span></label>`).join("") +
          (d ? "" : `<span class="agenda-dica">Escolha um dia para ver os horários.</span>`);
      };
      desenharHoras(null);
      diasEl.addEventListener("change", (e) => { if (e.target.name === "dia") desenharHoras(deIso(e.target.value)); });
    } else {
      form.querySelectorAll("[data-agenda]").forEach((el) => { el.hidden = true; });
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      nome.setCustomValidity(nome.value.trim() ? "" : "Informe como podemos te chamar.");
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const linhas = [
        "Olá! Vim pelo site da Mundo Zoe e gostaria de agendar uma avaliação.",
        "",
        `Nome: ${String(d.get("nome")).trim()}`,
        `Interesse: ${d.get("interesse")}`
      ];
      const dia = d.get("dia");
      if (dia) {
        const dt = deIso(dia);
        const hora = d.get("hora");
        linhas.push(`Preferência: ${DIAS_LONGOS[dt.getDay()]}, ${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}` +
          (hora && hora !== "qualquer" ? `, às ${fmtHora(hora)}` : " (qualquer horário)"));
      }
      const obs = String(d.get("mensagem") || "").trim();
      if (obs) linhas.push(`Observação: ${obs}`);
      enviarWhats(linhas.join("\n"));
    });
  }

  aplicarTema(temaAtual(), false);

  window.MZsite = { svg, esc, enviarWhats, abrirDemo, fecharMenu, urlProc, msgProc, iconeProc, temaAtual, procAtual, pagina, PROCS, C };

  /* ---------- animação de entrada ---------- */
  const revelar = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revelar.forEach((el) => io.observe(el));
  } else {
    revelar.forEach((el) => el.classList.add("visivel"));
  }
})();
