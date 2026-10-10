/* Mundo Zoe — camada de experiência do protótipo:
   abertura com a marca, teste "Descubra o seu tratamento", balão de atendimento
   e dados estruturados para o Google. Usa o que o site.js expõe em window.MZsite. */
(function () {
  "use strict";

  const raiz = document.documentElement;
  const S = window.MZsite;
  if (!S) { raiz.classList.remove("com-intro"); return; }
  const { svg, esc, fecharMenu, urlProc, iconeProc, temaAtual, pagina, PROCS, C } = S;
  const MZ = window.MZ || {};
  const sessao = {
    ler: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    gravar: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) { /* navegação privada */ } }
  };

  /* ---------- abertura com a marca (só na primeira página da visita) ----------
     O <head> já cobre a página com a cor de fundo (classe com-intro) para não piscar o conteúdo. */
  if (raiz.classList.contains("com-intro")) {
    sessao.gravar("mz-intro", "1");
    const escuro = temaAtual() === "escuro";
    const intro = document.createElement("div");
    intro.className = "intro";
    intro.setAttribute("aria-hidden", "true");
    intro.innerHTML = `<div class="intro__logo"><img src="assets/img/${escuro ? "logo-noturno" : "logo-dourado"}.png" alt=""></div>`;
    document.body.appendChild(intro);
    raiz.classList.add("segura-revelar");
    raiz.classList.remove("com-intro");
    document.body.classList.add("travado");
    let saiu = false;
    const sair = () => {
      if (saiu) return;
      saiu = true;
      intro.classList.add("saindo");
      document.body.classList.remove("travado");
      setTimeout(() => raiz.classList.remove("segura-revelar"), 250); // o conteúdo entra enquanto a cortina sobe
      setTimeout(() => intro.remove(), 1200);
    };
    intro.addEventListener("click", sair);
    const img = intro.querySelector("img");
    const comecar = () => setTimeout(sair, 1650);
    if (img.complete) comecar();
    else { img.addEventListener("load", comecar); img.addEventListener("error", sair); }
    setTimeout(sair, 4000); // nunca prende a visita
  }

  /* ---------- balão de atendimento ---------- */
  let bolha = null;
  function fecharBolha(lembrar) {
    if (bolha) { bolha.remove(); bolha = null; }
    if (lembrar) sessao.gravar("mz-bolha", "1");
  }
  if (pagina !== "contato" && !sessao.ler("mz-bolha")) {
    setTimeout(() => {
      const ocupado = document.querySelector("dialog[open], .intro") || document.body.classList.contains("menu-aberto") || document.body.classList.contains("tour-ativo");
      if (sessao.ler("mz-bolha") || ocupado) return;
      const escuro = temaAtual() === "escuro";
      bolha = document.createElement("aside");
      bolha.className = "bolha";
      bolha.setAttribute("aria-label", "Mensagem da Mundo Zoe");
      bolha.innerHTML = `<button class="bolha__fechar" type="button" aria-label="Fechar mensagem">${svg("fechar")}</button>
        <div class="bolha__topo">
          <img src="assets/img/${escuro ? "emblema-noturno" : "emblema"}.png" data-claro="assets/img/emblema.png" data-escuro="assets/img/emblema-noturno.png" alt="" width="40" height="40">
          <div><strong>Mundo Zoe</strong><small>Biomedicina estética</small></div>
        </div>
        <p>Olá! Quer ajuda para descobrir o tratamento que combina com você?</p>
        <div class="bolha__acoes">
          <button class="btn btn--ouro" type="button" data-quiz>Fazer o teste</button>
          <a class="btn btn--linha" href="#" data-whats>WhatsApp</a>
        </div>`;
      document.body.appendChild(bolha);
      bolha.querySelector(".bolha__fechar").addEventListener("click", () => fecharBolha(true));
      bolha.addEventListener("click", (e) => { if (e.target.closest("[data-quiz], [data-whats]")) setTimeout(() => fecharBolha(true), 0); });
    }, 9000);
  }

  /* ---------- teste "Descubra o seu tratamento" ---------- */
  const Q = MZ.quiz;
  let quiz = null;
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-quiz]") || !Q) return;
    e.preventDefault();
    if (!quiz) quiz = criarQuiz();
    fecharMenu(false);
    fecharBolha(true);
    quiz.abrir();
  });

  function criarQuiz() {
    const el = document.createElement("dialog");
    el.className = "quiz";
    el.setAttribute("aria-labelledby", "quiz-titulo");
    el.innerHTML = `<div class="quiz__in">
        <div class="quiz__topo">
          <span class="sobretitulo">Descubra o seu tratamento</span>
          <button class="botao-redondo botao-redondo--claro" type="button" data-quiz-fechar aria-label="Fechar o teste">${svg("fechar")}</button>
        </div>
        <div class="quiz__barra" aria-hidden="true"><span></span></div>
        <p class="quiz__etapa" data-quiz-etapa></p>
        <div class="quiz__corpo" data-quiz-corpo></div>
        <div class="quiz__acoes" data-quiz-acoes>
          <button class="btn btn--linha btn--p" type="button" data-quiz-voltar>Voltar</button>
          <button class="btn btn--ouro btn--p" type="button" data-quiz-avancar>Continuar</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    const corpo = el.querySelector("[data-quiz-corpo]");
    const barra = el.querySelector(".quiz__barra span");
    const etapa = el.querySelector("[data-quiz-etapa]");
    const acoes = el.querySelector("[data-quiz-acoes]");
    const voltar = el.querySelector("[data-quiz-voltar]");
    const avancar = el.querySelector("[data-quiz-avancar]");
    const estado = { passo: 0, area: "", objetivos: new Set(), agulha: "" };
    const AREAS = [
      { id: "rosto", rotulo: "Rosto", desc: "Linhas, volume, flacidez e qualidade da pele", ic: "rosto" },
      { id: "corpo", rotulo: "Corpo", desc: "Gordura localizada, contorno, flacidez e vasinhos", ic: "gluteo" },
      { id: "ambos", rotulo: "Rosto e corpo", desc: "Quero ver as opções para os dois", ic: "brilho" }
    ];
    const todosObjetivos = () => [...(Q.rosto || []), ...(Q.corpo || [])];
    const objetivosDaArea = () => (estado.area === "ambos" ? todosObjetivos() : Q[estado.area] || []);
    const opcao = (tipo, nome, valor, marcado, html, classe = "") =>
      `<label class="opcao ${classe}"><input type="${tipo}" name="${nome}" value="${esc(valor)}"${marcado ? " checked" : ""}><span>${html}</span></label>`;

    function recomendar() {
      const pontos = new Map();
      estado.objetivos.forEach((id) => {
        const o = todosObjetivos().find((x) => x.id === id);
        (o ? o.procedimentos : []).forEach((slug) => pontos.set(slug, (pontos.get(slug) || 0) + 1));
      });
      return [...pontos.entries()]
        .map(([slug, n]) => {
          const p = PROCS.find((x) => x.slug === slug);
          return p && { p, n: n + (estado.agulha === "sem" && p.semAgulha ? 0.5 : 0) };
        })
        .filter(Boolean)
        .sort((a, b) => b.n - a.n || PROCS.indexOf(a.p) - PROCS.indexOf(b.p))
        .slice(0, 3);
    }

    function resultado() {
      const recs = recomendar();
      const rotulos = [...estado.objetivos].map((id) => (todosObjetivos().find((x) => x.id === id) || {}).rotulo).filter(Boolean);
      const area = { rosto: "rosto", corpo: "corpo", ambos: "rosto e corpo" }[estado.area];
      const msg = [
        "Olá! Fiz o teste no site da Mundo Zoe.",
        "",
        `Quero cuidar: ${area}.`,
        `Gostaria de melhorar: ${rotulos.join(", ").toLowerCase()}.`,
        `O teste sugeriu: ${recs.map((r) => r.p.nome).join(", ")}.`
      ];
      if (estado.agulha === "sem") msg.push("Prefiro opções sem agulha.");
      msg.push("", "Podemos agendar uma avaliação?");
      return `<h3 id="quiz-titulo" tabindex="-1">Para conversar na sua <em>avaliação</em></h3>
        <p>Pelo que você marcou, estes procedimentos combinam com o que você busca:</p>
        <div class="quiz__recs">${recs.map((r, i) => `<a class="quiz__rec${i === 0 ? " quiz__rec--topo" : ""}" style="--i:${i}" href="${urlProc(r.p)}">
            <span class="card-proc__icone">${iconeProc(r.p)}</span>
            <span class="quiz__rec-texto">
              <small>${i === 0 ? "Mais alinhado ao que você marcou" : esc(r.p.areas.join(" · "))}</small>
              <strong>${esc(r.p.nome)}</strong>
              <span>${esc(r.p.resumo)}</span>
            </span>
            ${r.p.semAgulha ? `<span class="selo">Sem agulha</span>` : ""}
          </a>`).join("")}</div>
        <p class="quiz__aviso">Este teste é só um ponto de partida: quem indica o tratamento é a avaliação individual, com a profissional.</p>
        <div class="quiz__final">
          <button class="btn btn--ouro" type="button" data-whats data-msg="${esc(msg.join("\n"))}">${svg("whats")} Conversar no WhatsApp</button>
          <button class="btn btn--linha" type="button" data-quiz-refazer>Refazer o teste</button>
        </div>`;
    }

    function atualizarBotao() {
      const p = estado.passo;
      avancar.disabled = (p === 0 && !estado.area) || (p === 1 && !estado.objetivos.size) || (p === 2 && !estado.agulha);
      avancar.textContent = p === 2 ? "Ver resultado" : "Continuar";
    }

    function desenhar() {
      const p = estado.passo;
      barra.style.width = `${[20, 50, 80, 100][p]}%`;
      etapa.textContent = p < 3 ? `Pergunta ${p + 1} de 3` : "Seu resultado";
      acoes.hidden = p === 3;
      voltar.style.visibility = p === 0 ? "hidden" : "visible";
      if (p === 0) {
        corpo.innerHTML = `<h3 id="quiz-titulo" tabindex="-1">Onde você quer <em>cuidar</em>?</h3>
          <p>Escolha uma opção para começar.</p>
          <div class="quiz__opcoes quiz__opcoes--3" role="radiogroup" aria-label="Área">${AREAS.map((a) =>
            opcao("radio", "area", a.id, estado.area === a.id, `${svg(a.ic)}<strong>${a.rotulo}</strong><small>${a.desc}</small>`, "opcao--grande")).join("")}</div>`;
      } else if (p === 1) {
        corpo.innerHTML = `<h3 id="quiz-titulo" tabindex="-1">O que você gostaria de <em>melhorar</em>?</h3>
          <p>Marque quantas opções quiser.</p>
          <div class="quiz__opcoes" role="group" aria-label="Objetivos">${objetivosDaArea().map((o) =>
            opcao("checkbox", "objetivo", o.id, estado.objetivos.has(o.id), `<span class="marca">${svg("check")}</span>${esc(o.rotulo)}`)).join("")}</div>`;
      } else if (p === 2) {
        corpo.innerHTML = `<h3 id="quiz-titulo" tabindex="-1">E como você se sente sobre <em>agulhas</em>?</h3>
          <p>Isso só ajuda a ordenar as opções.</p>
          <div class="quiz__opcoes" role="radiogroup" aria-label="Agulhas">
            ${opcao("radio", "agulha", "sem", estado.agulha === "sem", `<span class="marca">${svg("check")}</span>Prefiro opções sem agulha`)}
            ${opcao("radio", "agulha", "tanto", estado.agulha === "tanto", `<span class="marca">${svg("check")}</span>Tanto faz, quero a melhor opção para mim`)}
          </div>`;
      } else {
        corpo.innerHTML = resultado();
      }
      corpo.classList.remove("quiz__corpo--entra");
      void corpo.offsetWidth; // reinicia a animação de entrada do passo
      corpo.classList.add("quiz__corpo--entra");
      atualizarBotao();
      const titulo = corpo.querySelector("#quiz-titulo");
      if (titulo && el.open) titulo.focus({ preventScroll: true });
    }

    const ir = (delta) => {
      estado.passo = Math.max(0, Math.min(3, estado.passo + delta));
      desenhar();
      el.querySelector(".quiz__in").scrollTop = 0;
      el.scrollTop = 0;
    };

    // escolhas de opção única avançam sozinhas quando feitas com mouse/toque (pelo teclado, usa "Continuar")
    let ultimoToque = 0;
    corpo.addEventListener("pointerup", () => { ultimoToque = Date.now(); });
    corpo.addEventListener("change", (e) => {
      const i = e.target;
      if (i.name === "area" && estado.area !== i.value) { estado.area = i.value; estado.objetivos.clear(); }
      if (i.name === "objetivo") { if (i.checked) estado.objetivos.add(i.value); else estado.objetivos.delete(i.value); }
      if (i.name === "agulha") estado.agulha = i.value;
      atualizarBotao();
      if (i.type === "radio" && Date.now() - ultimoToque < 700) setTimeout(() => { if (!avancar.disabled) ir(1); }, 280);
    });
    voltar.addEventListener("click", () => ir(-1));
    avancar.addEventListener("click", () => { if (!avancar.disabled) ir(1); });
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.closest("[data-quiz-fechar]")) el.close();
      else if (e.target.closest("[data-quiz-refazer]")) { reiniciar(); }
    });

    function reiniciar() {
      estado.passo = 0; estado.area = ""; estado.objetivos.clear(); estado.agulha = "";
      desenhar();
    }
    return {
      abrir() {
        reiniciar();
        if (typeof el.showModal === "function") el.showModal(); else el.setAttribute("open", "");
        const titulo = corpo.querySelector("#quiz-titulo");
        if (titulo) titulo.focus({ preventScroll: true });
      }
    };
  }

  /* ---------- dados estruturados para o Google (negócio local) ----------
     Quando o site estiver publicado, o Google lê nome, endereço, horários e serviços daqui. */
  if (pagina === "inicio") {
    const DIAS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const exp = C.expediente || {};
    const url = (caminho) => new URL(caminho, location.href).href;
    const dados = {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      name: "Mundo Zoe — Biomedicina Estética",
      description: (document.querySelector('meta[name="description"]') || {}).content || "",
      url: location.href.split("#")[0],
      image: url("assets/img/compartilhar.jpg"),
      logo: url("assets/img/logo-dourado.png"),
      address: { "@type": "PostalAddress", streetAddress: C.endereco || "", addressLocality: C.cidade || "", addressCountry: "BR" },
      openingHoursSpecification: Object.keys(exp).map((d) => ({
        "@type": "OpeningHoursSpecification", dayOfWeek: DIAS_EN[d], opens: exp[d][0], closes: exp[d][1]
      })),
      makesOffer: PROCS.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.nome, description: p.resumo } }))
    };
    if (C.telefone) dados.telephone = C.telefone;
    const perfis = [C.instagramUrl, C.google].filter(Boolean);
    if (perfis.length) dados.sameAs = perfis;
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(dados);
    document.head.appendChild(tag);
  }
})();
