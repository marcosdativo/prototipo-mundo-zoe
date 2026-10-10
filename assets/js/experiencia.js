/* Mundo Zoe — camada de experiência do protótipo:
   abertura com a marca, teste "Conheça as opções", balão de atendimento
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
  const logo = (nome) => `assets/img/${nome}${temaAtual() === "escuro" ? "-noturno" : ""}.webp`;

  /* ---------- abertura com a marca (só na primeira página da visita) ----------
     O <head> já cobre a página com a cor de fundo (classe com-intro) para não piscar o conteúdo.
     Se o script chegar atrasado (internet lenta), pula a abertura em vez de cobrir a página de novo. */
  if (raiz.classList.contains("com-intro")) {
    sessao.gravar("mz-intro", "1");
    if (performance.now() > 2500) {
      raiz.classList.remove("com-intro");
    } else {
      const intro = document.createElement("div");
      intro.className = "intro";
      intro.setAttribute("aria-hidden", "true");
      intro.innerHTML = `<div class="intro__logo"><img src="assets/img/logo-${temaAtual() === "escuro" ? "noturno" : "dourado"}.webp" alt=""></div>`;
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
      setTimeout(sair, Math.max(800, 4200 - performance.now())); // nunca prende a visita (conta desde a navegação)
    }
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
      bolha = document.createElement("aside");
      bolha.className = "bolha";
      bolha.setAttribute("aria-label", "Mensagem da Mundo Zoe");
      bolha.innerHTML = `<button class="bolha__fechar" type="button" aria-label="Fechar mensagem">${svg("fechar")}</button>
        <div class="bolha__topo">
          <img src="${logo("emblema")}" data-claro="assets/img/emblema.webp" data-escuro="assets/img/emblema-noturno.webp" alt="" width="40" height="40">
          <div><strong>Mundo Zoe</strong><small>Biomedicina estética</small></div>
        </div>
        <p>Olá! Quer ajuda para conhecer as opções para o que você busca?</p>
        <div class="bolha__acoes">
          <button class="btn btn--ouro" type="button" data-quiz>Fazer o teste</button>
          <a class="btn btn--linha" href="#" data-whats>WhatsApp</a>
        </div>`;
      document.body.appendChild(bolha);
      bolha.querySelector(".bolha__fechar").addEventListener("click", () => fecharBolha(true));
      bolha.addEventListener("click", (e) => { if (e.target.closest("[data-quiz], [data-whats]")) setTimeout(() => fecharBolha(true), 0); });
    }, 9000);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bolha && !document.querySelector("dialog[open]")) fecharBolha(true);
  });

  /* ---------- teste "Conheça as opções" ---------- */
  const Q = MZ.quiz;
  if (!Q) document.querySelectorAll("[data-quiz]").forEach((b) => { b.hidden = true; });
  let quiz = null;
  document.addEventListener("click", (e) => {
    const gatilho = e.target.closest("[data-quiz]");
    if (!gatilho || !Q) return;
    e.preventDefault();
    if (!quiz) quiz = criarQuiz();
    fecharMenu(false);
    fecharBolha(true);
    quiz.abrir(gatilho);
  });

  function criarQuiz() {
    const el = document.createElement("dialog");
    el.className = "quiz";
    el.setAttribute("aria-labelledby", "quiz-titulo");
    el.innerHTML = `<div class="quiz__in">
        <div class="quiz__topo">
          <span class="sobretitulo">Conheça as opções</span>
          <button class="botao-redondo botao-redondo--claro" type="button" data-quiz-fechar aria-label="Fechar o teste">${svg("fechar")}</button>
        </div>
        <div class="quiz__barra" aria-hidden="true"><span></span></div>
        <p class="quiz__etapa" data-quiz-etapa aria-live="polite"></p>
        <div class="quiz__corpo" data-quiz-corpo></div>
        <div class="quiz__acoes" data-quiz-acoes>
          <button class="btn btn--linha btn--p" type="button" data-quiz-voltar>Voltar</button>
          <button class="btn btn--ouro btn--p" type="button" data-quiz-avancar>Continuar</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    const caixa = el.querySelector(".quiz__in");
    const corpo = el.querySelector("[data-quiz-corpo]");
    const barra = el.querySelector(".quiz__barra span");
    const etapa = el.querySelector("[data-quiz-etapa]");
    const acoes = el.querySelector("[data-quiz-acoes]");
    const voltar = el.querySelector("[data-quiz-voltar]");
    const avancar = el.querySelector("[data-quiz-avancar]");
    const estado = { passo: 0, area: "", objetivos: new Set(), agulha: "" };
    let abertoEm = 0;
    let origem = null;
    let avancoAutomatico = 0;
    const AREAS = [
      { id: "rosto", rotulo: "Rosto", desc: "Linhas, volume, flacidez e qualidade da pele", ic: "rosto" },
      { id: "corpo", rotulo: "Corpo", desc: "Gordura localizada, contorno, flacidez e vasinhos", ic: "gluteo" },
      { id: "ambos", rotulo: "Rosto e corpo", desc: "Quero ver as opções para os dois", ic: "brilho" }
    ];
    const todosObjetivos = () => [...(Q.rosto || []), ...(Q.corpo || [])];
    const objetivosDaArea = () => (estado.area === "ambos" ? todosObjetivos() : Q[estado.area] || []);
    const opcao = (tipo, nome, valor, marcado, html, classe = "") =>
      `<label class="opcao ${classe}"><input type="${tipo}" name="${nome}" value="${esc(valor)}"${marcado ? " checked" : ""}><span>${html}</span></label>`;

    /* Cada objetivo marcado garante ao menos um procedimento na lista; depois completa até 3
       pela pontuação (objetivos em comum + preferência por opções sem agulha). */
    function recomendar() {
      const marcados = todosObjetivos().filter((o) => estado.objetivos.has(o.id));
      const pontos = new Map();
      marcados.forEach((o) => o.procedimentos.forEach((slug) => pontos.set(slug, (pontos.get(slug) || 0) + 1)));
      const nota = (p) => (pontos.get(p.slug) || 0) + (estado.agulha === "sem" && p.semAgulha ? 0.5 : 0);
      const ordem = (a, b) => nota(b) - nota(a) || PROCS.indexOf(a) - PROCS.indexOf(b);
      const candidatos = PROCS.filter((p) => pontos.has(p.slug)).sort(ordem);
      const escolhidos = [];
      marcados.forEach((o) => {
        const p = candidatos.find((c) => o.procedimentos.includes(c.slug) && !escolhidos.includes(c));
        if (p) escolhidos.push(p);
      });
      candidatos.forEach((p) => { if (escolhidos.length < 3 && !escolhidos.includes(p)) escolhidos.push(p); });
      return escolhidos.sort(ordem).slice(0, 5).map((p) => ({ p, n: nota(p) }));
    }

    function resultado() {
      const recs = recomendar();
      const rotulos = todosObjetivos().filter((o) => estado.objetivos.has(o.id)).map((o) => o.rotulo.toLowerCase());
      const area = { rosto: "rosto", corpo: "corpo", ambos: "rosto e corpo" }[estado.area];
      const destaque = recs.length > 1 && recs[0].n > recs[1].n;
      const semOpcaoSemAgulha = estado.agulha === "sem" && recs.length && !recs.some((r) => r.p.semAgulha);
      const msg = [
        "Olá! Fiz o teste no site da Mundo Zoe.",
        "",
        `Quero cuidar: ${area}.`,
        `Gostaria de melhorar: ${rotulos.join(", ")}.`,
        recs.length ? `Tenho interesse em conhecer: ${recs.map((r) => r.p.nome).join(", ")}.` : "Gostaria de saber quais opções combinam comigo."
      ];
      if (estado.agulha === "sem") msg.push("Prefiro opções sem agulha.");
      msg.push("", "Podemos agendar uma avaliação?");
      const lista = recs.length
        ? `<div class="quiz__recs">${recs.map((r, i) => `<a class="quiz__rec${i === 0 && destaque ? " quiz__rec--topo" : ""}" style="--i:${i}" href="${urlProc(r.p)}">
            <span class="card-proc__icone">${iconeProc(r.p)}</span>
            <span class="quiz__rec-texto">
              <small>${i === 0 && destaque ? "Mais relacionado ao que você marcou" : esc(r.p.areas.join(" · "))}</small>
              <strong>${esc(r.p.nome)}</strong>
              <span>${esc((r.p.beneficios && r.p.beneficios[0]) || r.p.resumo)}</span>
            </span>
            ${r.p.semAgulha ? `<span class="selo">Sem agulha</span>` : ""}
          </a>`).join("")}</div>`
        : `<p class="quiz__aviso">Não encontramos um procedimento ligado a essas respostas. Na avaliação, a profissional mostra os caminhos possíveis.</p>`;
      return `<h3 id="quiz-titulo" tabindex="-1">Para conversar na sua <em>avaliação</em></h3>
        <p>Procedimentos relacionados ao que você marcou, para conhecer melhor na avaliação:</p>
        ${lista}
        ${semOpcaoSemAgulha ? `<p class="quiz__aviso">Para o que você marcou, as opções envolvem agulha. Na avaliação, a profissional explica cada etapa e as alternativas.</p>` : ""}
        <p class="quiz__aviso">Este teste é só um ponto de partida: quem indica o tratamento é a avaliação individual, com a profissional.</p>
        <div class="quiz__final">
          <button class="btn btn--ouro" type="button" data-whats data-msg="${esc(msg.join("\n"))}">${svg("whats")} Conversar no WhatsApp</button>
          <button class="btn btn--linha" type="button" data-quiz-refazer>Refazer o teste</button>
          <button class="quiz__ajustar" type="button" data-quiz-ajustar>Ajustar respostas</button>
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
          <div class="quiz__opcoes quiz__opcoes--3" role="radiogroup" aria-labelledby="quiz-titulo">${AREAS.map((a) =>
            opcao("radio", "area", a.id, estado.area === a.id, `${svg(a.ic)}<strong>${a.rotulo}</strong><small>${a.desc}</small>`, "opcao--grande")).join("")}</div>`;
      } else if (p === 1) {
        corpo.innerHTML = `<h3 id="quiz-titulo" tabindex="-1">O que você gostaria de <em>melhorar</em>?</h3>
          <p>Marque uma ou mais opções.</p>
          <div class="quiz__opcoes" role="group" aria-labelledby="quiz-titulo">${objetivosDaArea().map((o) =>
            opcao("checkbox", "objetivo", o.id, estado.objetivos.has(o.id), `<span class="marca">${svg("check")}</span>${esc(o.rotulo)}`)).join("")}</div>`;
      } else if (p === 2) {
        corpo.innerHTML = `<h3 id="quiz-titulo" tabindex="-1">E como você se sente sobre <em>agulhas</em>?</h3>
          <p>Isso só ajuda a ordenar as opções.</p>
          <div class="quiz__opcoes" role="radiogroup" aria-labelledby="quiz-titulo">
            ${opcao("radio", "agulha", "sem", estado.agulha === "sem", `<span class="marca">${svg("check")}</span>Prefiro opções sem agulha`)}
            ${opcao("radio", "agulha", "tanto", estado.agulha === "tanto", `<span class="marca">${svg("check")}</span>Tanto faz, quero conhecer todas as opções`)}
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

    const paraNoTopo = () => { caixa.scrollTop = 0; el.scrollTop = 0; };
    const ir = (delta) => {
      clearTimeout(avancoAutomatico);
      estado.passo = Math.max(0, Math.min(3, estado.passo + delta));
      desenhar();
      paraNoTopo();
    };

    // a 1ª pergunta (escolha única) avança sozinha com mouse/toque; pelo teclado, e na última pergunta, usa o botão
    let ultimoToque = 0;
    corpo.addEventListener("pointerup", () => { ultimoToque = Date.now(); });
    corpo.addEventListener("change", (e) => {
      const i = e.target;
      if (i.name === "area" && estado.area !== i.value) { estado.area = i.value; estado.objetivos.clear(); }
      if (i.name === "objetivo") { if (i.checked) estado.objetivos.add(i.value); else estado.objetivos.delete(i.value); }
      if (i.name === "agulha") estado.agulha = i.value;
      atualizarBotao();
      if (i.name === "area" && Date.now() - ultimoToque < 700) {
        clearTimeout(avancoAutomatico);
        avancoAutomatico = setTimeout(() => { if (!avancar.disabled && estado.passo === 0) ir(1); }, 280);
      }
    });
    voltar.addEventListener("click", () => ir(-1));
    avancar.addEventListener("click", () => { if (!avancar.disabled) ir(1); });
    el.addEventListener("click", (e) => {
      // um segundo clique rápido no botão que abriu cai no fundo do diálogo: não fecha por isso
      if ((e.target === el && performance.now() - abertoEm > 400) || e.target.closest("[data-quiz-fechar]")) el.close();
      else if (e.target.closest("[data-quiz-refazer]")) reiniciar();
      else if (e.target.closest("[data-quiz-ajustar]")) ir(-1);
    });
    el.addEventListener("close", () => {
      clearTimeout(avancoAutomatico);
      // devolve o foco a quem abriu; se foi o balão (que some), vai para o botão de WhatsApp
      const alvo = origem && document.contains(origem) && origem.offsetParent ? origem : document.querySelector(".flutuante");
      if (alvo) setTimeout(() => alvo.focus({ preventScroll: true }), 0);
    });

    function reiniciar() {
      clearTimeout(avancoAutomatico);
      estado.passo = 0; estado.area = ""; estado.objetivos.clear(); estado.agulha = "";
      desenhar();
      paraNoTopo();
    }
    return {
      abrir(gatilho) {
        origem = gatilho || null;
        reiniciar();
        abertoEm = performance.now();
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
    const [cidade, uf] = String(C.cidade || "").split(/\s+[—–-]\s+/);
    const endereco = { "@type": "PostalAddress", streetAddress: C.endereco || "", addressLocality: cidade || "", addressCountry: "BR" };
    if (uf) endereco.addressRegion = uf;
    const dados = {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      name: "Mundo Zoe — Biomedicina Estética",
      description: (document.querySelector('meta[name="description"]') || {}).content || "",
      url: location.href.split("#")[0],
      image: url("assets/img/compartilhar.jpg"),
      logo: url("assets/img/logo-dourado.png"),
      address: endereco,
      openingHoursSpecification: Object.keys(exp).map((d) => ({
        "@type": "OpeningHoursSpecification", dayOfWeek: DIAS_EN[d], opens: exp[d][0], closes: exp[d][1]
      })),
      // datas sem atendimento (feriados): convenção do schema.org para "fechado o dia todo"
      specialOpeningHoursSpecification: (C.datasFechadas || []).map((dia) => ({
        "@type": "OpeningHoursSpecification", validFrom: dia, validThrough: dia, opens: "00:00", closes: "00:00"
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
