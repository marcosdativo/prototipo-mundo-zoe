/* Mundo Zoe — dados do protótipo.
   Tudo o que muda de clínica para clínica fica aqui: todas as páginas leem deste arquivo.
   Campos marcados com "A CONFIRMAR" são exemplos para a apresentação. */
window.MZ = {
  // Modo apresentação: liga o tour guiado e o botão "Tour guiado" no canto da tela.
  // Desligue (false) quando o site for ao ar de verdade.
  apresentacao: true,

  contato: {
    // Só números: 55 + DDD + número (ex.: "5511912345678").
    // Vazio = modo demonstração: os botões mostram a mensagem pronta em vez de abrir o WhatsApp.
    whatsapp: "",
    whatsappExibicao: "(00) 00000-0000",          // A CONFIRMAR
    telefone: "",                                  // ex.: "+551130000000"
    telefoneExibicao: "(00) 0000-0000",            // A CONFIRMAR
    instagram: "@mundozoe",                        // A CONFIRMAR
    instagramUrl: "",                              // ex.: "https://instagram.com/..."
    google: "",                                    // link do Perfil da Empresa no Google (avaliações)
    endereco: "Rua Exemplo, 000 — Bairro",         // A CONFIRMAR
    cidade: "Cidade — UF",                         // A CONFIRMAR
    // Texto que o Google Maps entende (endereço completo). Vazio = mapa ilustrativo.
    mapa: "",
    // Fuso da clínica: o selo "aberto agora" e a agenda usam este relógio, não o de quem visita.
    fuso: "America/Sao_Paulo",                  // A CONFIRMAR
    // Expediente — A CONFIRMAR. 0 = domingo, 1 = segunda … 6 = sábado; dia que não aparece = fechado.
    // Limites: o horário não pode passar da meia-noite ("18:00"–"02:00" não funciona) e a agenda
    // oferece horários de hora em hora, então um turno com menos de 60 minutos não aparece nela.
    // Daqui saem os horários exibidos, o selo "Aberto agora" e os dias/horários da agenda do contato.
    expediente: {
      1: ["09:00", "19:00"],
      2: ["09:00", "19:00"],
      3: ["09:00", "19:00"],
      4: ["09:00", "19:00"],
      5: ["09:00", "19:00"],
      6: ["09:00", "13:00"]
    },
    // Datas sem atendimento (feriados, recesso) — A CONFIRMAR. Somem da agenda e contam como "fechado".
    datasFechadas: ["2026-10-12", "2026-11-02", "2026-11-20", "2026-12-24", "2026-12-25", "2026-12-31", "2027-01-01"],
    responsavel: "Nome da profissional",           // A CONFIRMAR
    registro: "CRBM nº 00000"                      // A CONFIRMAR
  },

  // Fotos ILUSTRATIVAS (banco Unsplash, licença gratuita) para a apresentação.
  // Troque pelas fotos reais da clínica: pode ser um link ou um arquivo local, ex.: "assets/img/fotos/recepcao.jpg".
  // "pos" ajusta o enquadramento (como o object-position do CSS). Sem foto, o site mostra o desenho dourado.
  fotos: {
    inicio: { src: "https://images.unsplash.com/photo-1637722881530-97871cfab220", pos: "50% 32%" },
    ambiente: "https://images.unsplash.com/photo-1763873993447-1d0be71a96d9",
    detalhe: "https://images.unsplash.com/photo-1749137315928-bc96451fa4c0",
    essencia: "https://images.unsplash.com/photo-1760862652442-e8ff7ebdd2f8",
    profissional: { src: "https://images.unsplash.com/photo-1709136494437-5b3e29bfe62b", pos: "42% 30%" },
    recepcao: "https://images.unsplash.com/photo-1648775507324-b48dd3791fa5",
    sala: "https://images.unsplash.com/photo-1595871151608-bc7abd1caca3",
    detalhes: "https://images.unsplash.com/photo-1773565744218-d8d11de58362"
  },

  // Teste "Descubra o seu tratamento": cada objetivo aponta para procedimentos (pelos slugs abaixo).
  // É um ponto de partida para a conversa — quem indica o tratamento é a avaliação.
  quiz: {
    rosto: [
      { id: "linhas", rotulo: "Linhas de expressão", procedimentos: ["botox"] },
      { id: "volume", rotulo: "Perda de volume e contornos", procedimentos: ["preenchimento"] },
      { id: "flacidez-rosto", rotulo: "Flacidez no rosto", procedimentos: ["ultraformer", "sculptra"] },
      { id: "pele", rotulo: "Textura e qualidade da pele", procedimentos: ["sculptra"] }
    ],
    corpo: [
      { id: "gordura", rotulo: "Gordura localizada", procedimentos: ["criolipolise", "endolaser"] },
      { id: "flacidez-corpo", rotulo: "Flacidez no corpo", procedimentos: ["ultraformer", "sculptra"] },
      { id: "gluteos", rotulo: "Contorno dos glúteos", procedimentos: ["gluteo-max"] },
      { id: "vasinhos", rotulo: "Vasinhos nas pernas", procedimentos: ["remocao-de-vasinhos"] }
    ]
  },

  // Textos de "resumo" = documento de procedimentos da clínica.
  // "semAgulha: true" só nos procedimentos não invasivos (o teste usa para ordenar as opções).
  // "sobre" e "beneficios" = redação sugerida, para validação da profissional responsável.
  procedimentos: [
    {
      slug: "botox",
      nome: "Botox",
      areas: ["Facial"],
      icone: "botox",
      foto: "https://images.unsplash.com/photo-1761718210089-ba3bb5ccb54f",
      resumo: "Suaviza linhas de expressão e proporciona uma aparência mais descansada e rejuvenescida.",
      sobre: "Aplicação de toxina botulínica em pontos estratégicos do rosto para relaxar a musculatura responsável pelas linhas de expressão — como as da testa, entre as sobrancelhas e ao redor dos olhos. A dose e os pontos de aplicação são definidos na avaliação, buscando um resultado que preserve a sua expressão.",
      beneficios: ["Pode suavizar linhas de expressão", "Contribui para uma aparência mais descansada", "Planejamento que busca preservar a sua expressão"]
    },
    {
      slug: "preenchimento",
      nome: "Preenchimento",
      areas: ["Facial"],
      icone: "preenchimento",
      foto: "https://images.unsplash.com/photo-1552693673-1bf958298935",
      resumo: "Restaura volume, realça contornos e harmoniza os traços faciais.",
      sobre: "Aplicação de ácido hialurônico em regiões específicas do rosto para repor volume, realçar contornos e equilibrar as proporções — em áreas como lábios, olheiras, mandíbula e queixo. O planejamento respeita os seus traços e busca um resultado harmônico.",
      beneficios: ["Pode repor volume em regiões específicas", "Contribui para realçar os contornos do rosto", "Planejamento que busca harmonia com os seus traços"]
    },
    {
      slug: "sculptra",
      nome: "Sculptra",
      areas: ["Facial", "Corporal"],
      icone: "sculptra",
      foto: "https://images.unsplash.com/photo-1643684391140-c5056cfd3436",
      resumo: "Bioestimulador de colágeno que melhora firmeza, textura e qualidade da pele.",
      sobre: "Bioestimulador à base de ácido poli-L-láctico que estimula o próprio organismo a produzir colágeno. Quando há resposta ao tratamento, a melhora tende a ser gradual, com mais firmeza, textura e qualidade de pele — no rosto e em áreas do corpo.",
      beneficios: ["Estimula a produção natural de colágeno", "Pode contribuir para firmeza, textura e qualidade da pele", "Evolução gradual, no tempo do seu organismo"]
    },
    {
      slug: "ultraformer",
      semAgulha: true,
      nome: "Ultraformer",
      areas: ["Facial", "Corporal"],
      icone: "ultraformer",
      foto: "https://images.unsplash.com/photo-1713085085470-fba013d67e65",
      resumo: "Tecnologia de ultrassom micro e macrofocado para estimular colágeno e melhorar a flacidez.",
      sobre: "Tecnologia de ultrassom micro e macrofocado que atua em diferentes profundidades da pele, estimulando a produção de colágeno. É usada no tratamento da flacidez no rosto e no corpo; quando há resposta, a evolução tende a ser progressiva nas semanas seguintes.",
      beneficios: ["Estimula a produção de colágeno", "Pode auxiliar no tratamento da flacidez", "Tecnologia não invasiva"]
    },
    {
      slug: "endolaser",
      nome: "Endolaser",
      areas: ["Corporal"],
      icone: "endolaser",
      foto: "https://images.unsplash.com/photo-1712638932314-e2b185ca0930",
      resumo: "Tratamento que auxilia na redução de gordura localizada e melhora do contorno corporal.",
      sobre: "Tecnologia a laser aplicada sob a pele por meio de uma fibra óptica muito fina, que atua sobre a gordura localizada e estimula a retração dos tecidos. É uma opção para quem busca um contorno corporal mais definido.",
      beneficios: ["Pode auxiliar na redução de gordura localizada", "Contribui para um contorno mais definido", "Pode estimular a firmeza da pele na região tratada"]
    },
    {
      slug: "criolipolise",
      semAgulha: true,
      nome: "Criolipólise",
      areas: ["Corporal"],
      icone: "criolipolise",
      foto: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      resumo: "Tecnologia que utiliza o resfriamento controlado para reduzir gordura localizada.",
      sobre: "Tecnologia que utiliza o resfriamento controlado para atingir as células de gordura, que tendem a ser eliminadas pelo próprio organismo ao longo das semanas seguintes. Um procedimento não invasivo para tratar áreas de gordura localizada.",
      beneficios: ["Pode auxiliar na redução de gordura localizada", "Procedimento não invasivo", "Evolução progressiva, quando há resposta ao tratamento"]
    },
    {
      slug: "gluteo-max",
      nome: "Glúteo Max",
      areas: ["Corporal"],
      icone: "gluteo",
      foto: "https://images.unsplash.com/photo-1639162906614-0603b0ae95fd",
      resumo: "Protocolo voltado para valorização do contorno, volume e definição dos glúteos.",
      sobre: "Protocolo personalizado para a região dos glúteos, que combina técnicas para valorizar o contorno, o volume e a definição, de acordo com o objetivo de cada paciente. As etapas e o número de sessões são definidos na avaliação.",
      beneficios: ["Busca valorizar o contorno dos glúteos", "Pode contribuir para volume e definição", "Protocolo pensado para o seu objetivo"]
    },
    {
      slug: "remocao-de-vasinhos",
      nome: "Remoção de vasinhos",
      areas: ["Corporal"],
      icone: "vasinhos",
      foto: "https://images.unsplash.com/photo-1700760933574-9f0f4ea9aa3b",
      resumo: "Procedimento para amenizar vasinhos e melhorar a aparência da pele.",
      sobre: "Procedimento voltado para amenizar os pequenos vasos aparentes, comuns principalmente nas pernas. A técnica mais adequada é definida na avaliação, considerando o tipo de vaso e as características da sua pele.",
      beneficios: ["Pode amenizar vasinhos aparentes", "Contribui para uma pele mais uniforme", "Técnica escolhida para o seu tipo de vaso"]
    }
  ]
};
