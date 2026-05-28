#Festick — Plataforma Digital de Organização e Gestão de Festivais

> Projeto desenvolvido no âmbito da unidade curricular **40431 — Modelação e Análise de Sistemas**  
> Universidade de Aveiro · 2025/2026

---

## 👥 Grupo

| Nome | Número |
|------|--------|
| Gonçalo Coelho | 132782 |
| Guilherme Ribeiro | 133371 |
| João Brito | 133145 |
| João Coelho | 133165 |

---

## 📱 Sobre o Festick

O **Festick** é uma plataforma digital integrada para a gestão de festivais, que unifica num único ecossistema todas as vertentes operacionais — da compra de bilhetes à carteira digital cashless dentro do recinto.

A plataforma serve três tipos de utilizadores:
- **Participante** — compra bilhetes, entra com QR Code e paga com carteira digital
- **Vendedor** — recebe pedidos e processa pagamentos no recinto
- **Administrador** — monitoriza o festival em tempo real com dados e dashboards

---

## 🚀 Demo

🔗 **App disponível em:** https://g0ncal015.github.io/Festick_MAS_2025-2026

---

## 🛠️ Tecnologias

- **HTML5** — estrutura da aplicação
- **CSS3** — estilos com variáveis centralizadas para fácil personalização
- **JavaScript (Vanilla)** — lógica de negócio e gestão de estado
- **localStorage** — persistência de dados entre sessões
- **OpenStreetMap** — mapas de localização dos eventos
- **api.qrserver.com** — geração de QR Codes reais para os bilhetes

---

## 📂 Estrutura do projeto

```
Festick_MAS_2025-2026/
├── index.html                          # Estrutura HTML da app
├── style.css                           # Estilos (variáveis de cor no topo)
├── app.js                              # Lógica da aplicação
├── testes/
│   ├── testeHTML/                      # Testes Katalon Recorder (formato HTML)
│   │   ├── T01_Registo_Password_Fraca.html
│   │   ├── T02_Email_Ja_Existente.html
│   │   ├── T03_Registo_Password_Forte.html
│   │   ├── T04_Login_Valido.html
│   │   ├── T05_Credenciais_Erradas.html
│   │   ├── T06_Pesquisa_Nome.html
│   │   ├── T07_Comprar_Bilhetes.html
│   │   ├── T08_Filtros.html
│   │   ├── T09_Carregar_Carteira_Valido.html
│   │   └── T10_Carregar_Carteira_Invalido.html
│   └── testeJSON/                      # Testes em formato JSON (Puppeteer)
│       ├── T01_Registo_Password_Fraca.json
│       └── ... (restantes testes)
└── README.md
```

---

## ▶️ Como executar localmente

1. Clona o repositório:
```bash
git clone https://github.com/g0ncAl015/Festick_MAS_2025-2026
```

2. Abre a pasta no **VS Code**

3. Instala a extensão **Live Server**

4. Clica com o botão direito em `index.html` → **"Open with Live Server"**

5. A app abre em `http://127.0.0.1:5500/index.html`

---

## 👤 Conta de demonstração

| Campo | Valor |
|-------|-------|
| E-mail | `joana@festick.pt` |
| Password | `Joana@123` |

> Para criar uma nova conta, a password deve ter mínimo 8 caracteres, incluindo maiúscula, minúscula, número e carácter especial. Exemplo válido: `Festa@123`

---

## 🧪 Testes de aceitação (ATDD)

Os testes foram desenvolvidos com o **Katalon Recorder** seguindo a abordagem ATDD. Para executar:

1. Instala o [Katalon Recorder](https://www.katalon.com/katalon-recorder-ide/)
2. Abre a app localmente com o Live Server
3. No Katalon, clica em **"Open Test Suite"** e seleciona qualquer ficheiro em `testes/testeHTML/`
4. Clica **"Play Test Case"**

| Teste | Cenário |
|-------|---------|
| T01 | Registo com password fraca → erro aparece |
| T02 | Registo com e-mail já existente → erro aparece |
| T03 | Registo válido → entra na aplicação |
| T04 | Login válido → acede à home |
| T05 | Login com credenciais erradas → erro aparece |
| T06 | Pesquisa por nome → resultado correto na lista |
| T07 | Comprar bilhete → aparece em "Os meus bilhetes" |
| T08 | Filtro por categoria → só aparecem eventos do tipo |
| T09 | Carregar carteira com valor válido → saldo atualiza |
| T10 | Carregar carteira com valor inválido → erro aparece |

---

## ⚙️ Personalização de cores

As cores da aplicação estão centralizadas no topo do ficheiro `style.css`:

```css
:root {
  --accent:  #ff4d6d;  /* Cor principal (botões, destaques) */
  --accent2: #ff8c42;  /* Cor secundária (preços) */
  --bg:      #0a0a0f;  /* Fundo principal */
  --card:    #16161f;  /* Fundo dos cartões */
}
```

---

*Festick — porque ir a um festival deve ser simples.* 🎪
