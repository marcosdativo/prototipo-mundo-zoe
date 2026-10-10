/* Mundo Zoe — tour guiado do protótipo (modo apresentação).
   Destaca cada recurso na tela, explica o que ele faz pela clínica e convida a experimentar.
   Passa por várias páginas sozinho. Liga/desliga em dados.js (apresentacao) e pode ser
   removido do site final sem afetar o resto. */
(function () {
  "use strict";

  const S = window.MZsite;
  const MZ = window.MZ || {};
  if (!S || MZ.apresentacao === false) return;
  const { svg, temaAtual, pagina } = S;
  const sessao = {
    ler: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    gravar: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) { /* navegação privada */ } },
    apagar: (k) => { try { sessionStorage.removeItem(k); } catch (_) { /* idem */ } }
  };
  const reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ENDERECOS = { inicio: "index.html", procedimento: "procedimento.html?p=botox", contato: "contato.html" };
  const PASSOS = [
    {
      pagina: "inicio", centro: true,
      titulo: "Bem-vindo ao protótipo da Mundo Zoe",
      texto: "Este é o site funcionando de verdade: dá para navegar, clicar e testar tudo. Em 2 minutos, mostramos o que ele faz pela clínica."
    },
    {
      pagina: "inicio", alvo: ".hero__texto",
      titulo: "Primeira impressão",
      texto: "Em segundos a paciente entende quem é a Mundo Zoe: a identidade dourada, títulos que entregam a promessa e a logo como marca d'água na foto."
    },
    {
      pagina: "inicio", alvo: ".hero .acoes .btn--ouro",
      titulo: "Agendar em um toque",
      texto: "Todo botão de agendar abre o WhatsApp da clínica com a mensagem já escrita. Como o número ainda não foi configurado, aparece uma demonstração.",
      acao: { rotulo: "abrir o agendamento", alvo: ".hero .acoes .btn--ouro" }
    },
    {
      pagina: "inicio", alvo: ".hero__teste",
      titulo: "Teste: descubra o seu tratamento",
      texto: "Em 3 perguntas o site sugere os procedimentos que combinam com a paciente e já leva as respostas para o WhatsApp. A conversa começa pronta.",
      acao: { rotulo: "fazer o teste", alvo: ".hero__teste" }
    },
    {
      pagina: "inicio", alvo: "[data-tema-botao]",
      titulo: "Modo escuro",
      texto: "Um toque e o site muda para a versão noturna da marca: preto e dourado, como a logo de perfil. A escolha fica salva.",
      acao: { rotulo: () => (temaAtual() === "escuro" ? "voltar ao claro" : "ver no escuro"), alvo: "[data-tema-botao]", fica: true }
    },
    {
      pagina: "inicio", alvo: "#grade-home",
      titulo: "Procedimentos organizados",
      texto: "Os 8 procedimentos da clínica, com filtro facial e corporal. Cada um tem página própria, com explicação, benefícios e agendamento direto."
    },
    {
      pagina: "inicio", alvo: ".comparar",
      titulo: "Antes e depois",
      texto: "A paciente arrasta a linha para comparar. As fotos reais entram aqui, sempre com autorização por escrito da paciente."
    },
    {
      pagina: "inicio", alvo: ".avaliacoes",
      titulo: "Avaliações do Google",
      texto: "Espaço para as avaliações reais do Perfil da Empresa no Google: o site e o Google passam a reforçar um ao outro."
    },
    {
      pagina: "procedimento", alvo: ".cab-pagina .acoes .btn--ouro",
      titulo: "Uma página para cada procedimento",
      texto: "Aqui o botão de agendar já leva o nome do procedimento para o WhatsApp: a equipe sabe do que a paciente quer falar antes mesmo de responder.",
      acao: { rotulo: "agendar este procedimento", alvo: ".cab-pagina .acoes .btn--ouro" }
    },
    {
      pagina: "contato", alvo: "[data-agenda]",
      titulo: "Agenda pelo expediente",
      texto: "A paciente escolhe o dia e o horário dentro do atendimento da clínica. Domingos e feriados já ficam de fora; a equipe só confirma."
    },
    {
      pagina: "contato", alvo: ".cartao-info .status-aberto",
      titulo: "Aberto agora?",
      texto: "O site mostra se a clínica está aberta naquele momento e quando abre de novo. Logo abaixo ficam WhatsApp, telefone, Instagram, endereço e horários."
    },
    {
      pagina: "contato", centro: true, final: true,
      titulo: "Agora é com você",
      texto: "Navegue à vontade e teste também no celular: o menu vira ☰, os cards deslizam e o teste ocupa a tela inteira. Para rever este tour, use o botão “Tour guiado” no canto da tela."
    }
  ];

  /* ---------- estrutura ---------- */
  const raiz = document.createElement("div");
  raiz.className = "tour";
  raiz.hidden = true;
  raiz.innerHTML = `<div class="tour__bloqueio"></div>
    <div class="tour__buraco" aria-hidden="true"></div>
    <div class="tour__cartao" role="dialog" aria-modal="false" aria-labelledby="tour-titulo" aria-describedby="tour-texto"></div>`;
  document.body.appendChild(raiz);
  const buraco = raiz.querySelector(".tour__buraco");
  const cartao = raiz.querySelector(".tour__cartao");

  const lancador = document.createElement("button");
  lancador.type = "button";
  lancador.className = "tour-lancador";
  lancador.innerHTML = `${svg("brilho")}<span>Tour guiado</span>`;
  lancador.setAttribute("aria-label", "Abrir o tour guiado do protótipo");
  lancador.hidden = true;
  document.body.appendChild(lancador);

  let indice = -1;
  let alvo = null;
  let pausado = false;
  let quadro = 0;

  const visivel = (el) => !!el && el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0;

  function rolarAte(el) {
    if (el.closest(".topo, .flutuante")) return; // já está fixo na tela
    const r = el.getBoundingClientRect();
    const topoH = (document.getElementById("topo") || {}).offsetHeight || 0;
    const celular = window.innerWidth <= 640;
    const folga = celular ? topoH + 16 : Math.max(topoH + 24, (window.innerHeight - r.height) / 2 - 70);
    window.scrollTo({ top: Math.max(0, window.scrollY + r.top - folga), behavior: reduzido ? "auto" : "smooth" });
  }

  /* acompanha o alvo enquanto a página rola, as fotos carregam e as animações terminam */
  function acompanhar() {
    quadro = requestAnimationFrame(acompanhar);
    if (pausado || raiz.hidden) return;
    const celular = window.innerWidth <= 640;
    if (alvo) {
      const r = alvo.getBoundingClientRect();
      const pad = 8;
      const raio = parseFloat(getComputedStyle(alvo).borderTopLeftRadius) || 12;
      buraco.style.top = `${r.top - pad}px`;
      buraco.style.left = `${r.left - pad}px`;
      buraco.style.width = `${r.width + pad * 2}px`;
      buraco.style.height = `${r.height + pad * 2}px`;
      buraco.style.borderRadius = `${Math.min(raio + pad, 40)}px`;
      if (!celular) {
        const w = cartao.offsetWidth, h = cartao.offsetHeight;
        const abaixo = window.innerHeight - r.bottom - pad;
        const acima = r.top - pad;
        let top;
        if (abaixo >= h + 24) top = r.bottom + pad + 14;
        else if (acima >= h + 24) top = r.top - pad - 14 - h;
        else top = window.innerHeight - h - 20;
        const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 16), window.innerWidth - w - 16);
        cartao.style.transform = `translate(${Math.round(left)}px, ${Math.round(Math.max(16, top))}px)`;
      }
    } else {
      buraco.style.top = "50%";
      buraco.style.left = "50%";
      buraco.style.width = "0px";
      buraco.style.height = "0px";
      if (!celular) {
        const w = cartao.offsetWidth, h = cartao.offsetHeight;
        cartao.style.transform = `translate(${Math.round((window.innerWidth - w) / 2)}px, ${Math.round((window.innerHeight - h) / 2)}px)`;
      }
    }
  }

  function desenhar() {
    const p = PASSOS[indice];
    const rotulo = p.acao ? (typeof p.acao.rotulo === "function" ? p.acao.rotulo() : p.acao.rotulo) : "";
    const esquerda = indice === 0
      ? `<button class="tour__texto-botao" type="button" data-tour-sair>Explorar sozinho</button>`
      : p.final
        ? `<button class="tour__texto-botao" type="button" data-tour-recomecar>Recomeçar</button>`
        : `<button class="tour__texto-botao" type="button" data-tour-voltar>Voltar</button>`;
    cartao.innerHTML = `<div class="tour__conteudo">
        <div class="tour__topo">
          <span class="tour__etapa">Tour do protótipo · ${indice + 1} de ${PASSOS.length}</span>
          <button class="tour__fechar" type="button" data-tour-sair aria-label="Encerrar o tour">${svg("fechar")}</button>
        </div>
        <h3 id="tour-titulo">${p.titulo}</h3>
        <p id="tour-texto">${p.texto}</p>
        ${p.acao ? `<button class="tour__experimente" type="button" data-tour-acao>${svg("brilho")}<span>Experimente: <strong>${rotulo}</strong></span>${svg("seta")}</button>` : ""}
        <div class="tour__pontos" aria-hidden="true">${PASSOS.map((_, k) => `<span class="${k === indice ? "atual" : k < indice ? "feito" : ""}"></span>`).join("")}</div>
        <div class="tour__acoes">
          ${esquerda}
          <span class="tour__espaco"></span>
          <button class="btn btn--ouro btn--p" type="button" data-tour-proximo>${indice === 0 ? "Começar o tour" : p.final ? "Concluir" : "Próximo"}</button>
        </div>
      </div>`;
    raiz.classList.toggle("tour--centro", !alvo);
    const principal = cartao.querySelector("[data-tour-proximo]");
    if (principal) principal.focus({ preventScroll: true });
  }

  function ir(i) {
    const p = PASSOS[i];
    if (!p) { encerrar(); return; }
    if (p.pagina !== pagina) {
      // o próximo passo é em outra página: guarda onde parou e segue para lá
      sessao.gravar("mz-tour", String(i));
      window.location.href = ENDERECOS[p.pagina];
      return;
    }
    indice = i;
    sessao.gravar("mz-tour", String(i));
    const el = p.alvo ? document.querySelector(p.alvo) : null;
    alvo = visivel(el) ? el : null;
    if (alvo) {
      // o alvo pode estar esperando a animação de entrada
      alvo.closest(".revelar")?.classList.add("visivel");
      if (alvo.classList.contains("revelar")) alvo.classList.add("visivel");
      rolarAte(alvo);
    }
    raiz.hidden = false;
    lancador.hidden = true;
    document.body.classList.add("tour-ativo");
    desenhar();
    if (!quadro) acompanhar();
  }

  function encerrar() {
    raiz.hidden = true;
    pausado = false;
    alvo = null;
    indice = -1;
    sessao.apagar("mz-tour");
    document.body.classList.remove("tour-ativo");
    lancador.hidden = false;
    cancelAnimationFrame(quadro);
    quadro = 0;
  }

  function pausar() { pausado = true; raiz.hidden = true; }
  function retomar() {
    if (!pausado || indice < 0) return;
    pausado = false;
    raiz.hidden = false;
    desenhar();
  }
  // quando o diálogo aberto pela demonstração fecha (WhatsApp, teste), o tour volta
  document.addEventListener("close", () => {
    if (pausado) setTimeout(() => { if (!document.querySelector("dialog[open]")) retomar(); }, 60);
  }, true);

  function experimentar() {
    const p = PASSOS[indice];
    const el = p.acao && document.querySelector(p.acao.alvo);
    if (!el) return;
    if (p.acao.fica) { el.click(); desenhar(); return; }
    pausar();
    el.click();
    // se nada abriu na tela (ex.: WhatsApp real em outra aba), o tour volta sozinho
    setTimeout(() => { if (!document.querySelector("dialog[open]")) retomar(); }, 500);
  }

  cartao.addEventListener("click", (e) => {
    if (e.target.closest("[data-tour-proximo]")) {
      if (PASSOS[indice].final) encerrar(); else ir(indice + 1);
    } else if (e.target.closest("[data-tour-voltar]")) ir(indice - 1);
    else if (e.target.closest("[data-tour-sair]")) encerrar();
    else if (e.target.closest("[data-tour-recomecar]")) ir(0);
    else if (e.target.closest("[data-tour-acao]")) experimentar();
  });
  raiz.querySelector(".tour__bloqueio").addEventListener("click", () => {
    cartao.classList.remove("tour__cartao--chama");
    void cartao.offsetWidth;
    cartao.classList.add("tour__cartao--chama"); // lembra onde está o tour
  });
  document.addEventListener("keydown", (e) => {
    if (raiz.hidden || pausado) return;
    if (e.key === "Escape") encerrar();
    else if (e.key === "ArrowRight" && !PASSOS[indice].final) ir(indice + 1);
    else if (e.key === "ArrowLeft" && indice > 0) ir(indice - 1);
  });
  lancador.addEventListener("click", () => {
    const daqui = PASSOS.findIndex((p) => p.pagina === pagina);
    ir(daqui >= 0 ? daqui : 0);
  });
  window.addEventListener("resize", () => { if (alvo && !raiz.hidden) rolarAte(alvo); });

  /* ---------- quando começa ----------
     Continua de onde parou (tour passando de uma página para outra) ou, na primeira visita
     à página inicial, se oferece logo depois da abertura. */
  function depoisDaAbertura(fn) {
    const espera = () => {
      if (document.querySelector(".intro") || document.documentElement.classList.contains("com-intro")) setTimeout(espera, 200);
      else setTimeout(fn, 500);
    };
    espera();
  }
  depoisDaAbertura(() => {
    const salvo = parseInt(sessao.ler("mz-tour"), 10);
    if (!Number.isNaN(salvo) && PASSOS[salvo] && PASSOS[salvo].pagina === pagina) {
      setTimeout(() => ir(salvo), 350);
    } else if (pagina === "inicio" && !sessao.ler("mz-tour-visto")) {
      sessao.gravar("mz-tour-visto", "1");
      ir(0);
    } else {
      if (!Number.isNaN(salvo)) sessao.apagar("mz-tour");
      lancador.hidden = false;
    }
  });
})();
