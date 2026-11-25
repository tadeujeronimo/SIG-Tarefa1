# SIG-Tarefa1: Coletor GPS com Next.js

Aplicação em Next.js que captura a posição do dispositivo pela Geolocation API (Datum WGS 84) e mostra o ponto coletado no mapa do OpenStreetMap. Cada leitura exibe latitude, longitude, altitude, precisão horizontal e horário, e uma lista guarda as últimas leituras da sessão.

Projeto para a Tarefa 1 de Sistemas de Informações Geográficas na Web: Exercício 04 da aula SIG#04.1 – GPS com Next.js.

## Funcionalidades

- Botão "Coletar ponto" que aciona o receptor GNSS com `enableHighAccuracy: true`, `timeout` de 15 s e `maximumAge: 0` (sem posição em cache).
- Cartão com latitude, longitude (6 casas decimais), altitude, precisão em metros e horário da leitura.
- Selo de qualidade da precisão: Boa (até 10 m, satélite), Média (até 100 m) e Baixa (provável posição por IP ou Wi-Fi).
- Mapa do OpenStreetMap com marcador e janela de cerca de 220 m, calculada em metros a partir da latitude (com correção da longitude por 1/cos(latitude)).
- Contador de leituras da sessão e histórico das últimas 5 leituras.
- Botão para copiar "latitude, longitude".
- Mensagens de erro em português para permissão negada, posição indisponível e tempo esgotado.

## Como executar

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # versão de produção
npm run start    # serve a versão de produção
npm run lint     # ESLint
```

## Como testar

A Geolocation API só funciona em contexto seguro: `https://` ou `http://localhost`.

| Endereço | Geolocalização |
| --- | --- |
| `http://localhost:3000` (no computador) | Funciona |
| `http://192.168.x.x:3000` (no celular, via Wi-Fi) | Bloqueada pelo navegador |
| `https://seu-projeto.vercel.app` (no celular) | Funciona, com satélite real |

Para a coleta em campo, publique na [Vercel](https://vercel.com): suba o projeto para o GitHub, importe o repositório e clique em Deploy. Abra o endereço HTTPS no celular, ao ar livre.

## Tecnologias

Next.js (App Router), React, Geolocation API, OpenStreetMap, CSS Modules e ESLint.

## Estrutura

```text
app/          page.jsx (lógica do GPS e do mapa), layout.jsx, estilos
package.json  dependências e scripts
```

## Problemas comuns

- **Precisão de milhares de metros e altitude indisponível no notebook:** computadores comuns não têm receptor GNSS. O navegador estima a posição pelo IP ou pelas redes Wi-Fi próximas. A precisão de 3 a 5 m só aparece em um celular, ao ar livre.
- **Permissão negada:** clique no cadeado da barra de endereços e libere o acesso à Localização.
- **Tempo esgotado:** em ambientes fechados o receptor pode não travar satélites. Vá para uma área aberta e tente de novo.
- **Mapa em branco:** o OpenStreetMap precisa de internet.
- **Erro de WebSocket (`/_next/hmr`) ao abrir pelo IP da rede:** vem do hot reload do modo de desenvolvimento e não afeta o GPS. Use `localhost` ou `npm run build && npm run start`.

## Créditos

- Estrutura da atividade baseada na aula **SIG#04.1 – GPS com Next.js**, do professor José Rui.
- Mapa: contribuidores do **OpenStreetMap**, com a atribuição exibida no próprio mapa.
- Referência da API: [Geolocation API](https://developer.mozilla.org/pt-BR/docs/Web/API/Geolocation_API) (MDN Web Docs).

## Autor

- **Nome**: Tadeu dos Santos Jerônimo
- **Matrícula**: 2026202194
- **E-mail**: tadeus.jeronimo@gmail.com
- **Disciplina**: Sistemas de Informações Geográficas na Web - IF Sudeste/MG
