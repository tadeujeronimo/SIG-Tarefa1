"use client";

import { useState } from "react";
import styles from "./page.module.css";

// ---------- Constantes e funções auxiliares (fora do componente) ----------

// Metros por grau de latitude (aprox. constante em qualquer ponto da Terra)
const METROS_POR_GRAU = 111320;

// Meia-largura da janela do mapa, em metros (110 m de cada lado = janela ~220 m)
const RAIO_JANELA_METROS = 110;

// Opções passadas ao hardware de GPS
const OPCOES_GPS = {
  enableHighAccuracy: true, // exige o chip GNSS, não só torre/Wi-Fi
  timeout: 15000,           // 15 s para travar satélites
  maximumAge: 0,            // nunca aceitar posição em cache
};

// Quantas leituras mostrar no histórico
const MAX_HISTORICO = 5;

// Converte o código de erro da API em mensagem para o usuário
function mensagemDeErro(erro) {
  if (erro.code === erro.PERMISSION_DENIED) {
    return "Permissão negada. Libere o acesso à localização no cadeado da barra de endereços.";
  }
  if (erro.code === erro.POSITION_UNAVAILABLE) {
    return "Posição indisponível. Verifique se o GPS do aparelho está ligado.";
  }
  if (erro.code === erro.TIMEOUT) {
    return "Tempo esgotado: nenhum sinal de satélite foi obtido a tempo.";
  }
  return `Erro de localização: ${erro.message}`;
}

// Classifica a precisão horizontal (em metros) em faixas de qualidade
function classificarPrecisao(metros) {
  if (metros <= 10) return { rotulo: "Boa (satélite)", classe: "boa" };
  if (metros <= 100) return { rotulo: "Média", classe: "media" };
  return { rotulo: "Baixa (provável IP/Wi-Fi)", classe: "ruim" };
}

// Monta a URL do mapa do OpenStreetMap com bounding box.
// A longitude é corrigida por 1/cos(latitude): quanto mais longe do Equador,
// menos metros cabem em 1 grau de longitude.
function urlDoMapa(lat, lng) {
  const deltaLat = RAIO_JANELA_METROS / METROS_POR_GRAU;
  const deltaLng = deltaLat / Math.cos((lat * Math.PI) / 180);

  const oeste = lng - deltaLng;
  const sul = lat - deltaLat;
  const leste = lng + deltaLng;
  const norte = lat + deltaLat;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${oeste},${sul},${leste},${norte}` +
    `&layer=mapnik&marker=${lat},${lng}`
  );
}

// ---------- Componente principal ----------

export default function Pagina() {
  const [leitura, setLeitura] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [totalLeituras, setTotalLeituras] = useState(0);
  const [copiado, setCopiado] = useState(false);

  function coletar() {
    if (!("geolocation" in navigator)) {
      setErro("Este navegador não suporta a Geolocation API.");
      return;
    }

    setBuscando(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const { latitude, longitude, altitude, accuracy } = posicao.coords;

        const nova = {
          latitude,
          longitude,
          altitude,
          precisao: accuracy,
          horario: new Date(posicao.timestamp).toLocaleTimeString("pt-BR"),
        };

        setLeitura(nova);
        // Guarda no histórico (mais recente primeiro, limitado a MAX_HISTORICO)
        setHistorico((anterior) => [nova, ...anterior].slice(0, MAX_HISTORICO));
        setTotalLeituras((n) => n + 1);
        setCopiado(false);
        setBuscando(false);
      },
      (falha) => {
        setErro(mensagemDeErro(falha));
        setBuscando(false);
      },
      OPCOES_GPS
    );
  }

  async function copiarCoordenadas() {
    if (!leitura) return;
    const texto = `${leitura.latitude.toFixed(6)}, ${leitura.longitude.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setErro("Não foi possível copiar. Selecione e copie manualmente.");
    }
  }

  const qualidade = leitura ? classificarPrecisao(leitura.precisao) : null;

  return (
    <main className={styles.pagina}>
      <header className={styles.topo}>
        <h1>Coletor GPS</h1>
        <p>Coordenadas WGS 84 · SIG-Web</p>
      </header>

      <button className={styles.botao} onClick={coletar} disabled={buscando}>
        {buscando ? "Buscando localização..." : "Coletar ponto"}
      </button>

      {erro && <p className={styles.erro}>{erro}</p>}

      {leitura && (
        <>
          <section className={styles.painel}>
            <div className={styles.painelTopo}>
              <span className={`${styles.selo} ${styles[qualidade.classe]}`}>
                ±{leitura.precisao.toFixed(1)} m · {qualidade.rotulo}
              </span>
              <span className={styles.contador}>
                Leituras nesta sessão: {totalLeituras}
              </span>
            </div>

            <dl className={styles.dados}>
              <div>
                <dt>Latitude</dt>
                <dd>{leitura.latitude.toFixed(6)}°</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{leitura.longitude.toFixed(6)}°</dd>
              </div>
              <div>
                <dt>Altitude</dt>
                <dd>
                  {leitura.altitude !== null
                    ? `${leitura.altitude.toFixed(1)} m`
                    : "indisponível"}
                </dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{leitura.horario}</dd>
              </div>
            </dl>

            <button className={styles.botaoSecundario} onClick={copiarCoordenadas}>
              {copiado ? "Copiado ✓" : "Copiar lat, lng"}
            </button>
          </section>

          <section className={styles.mapa}>
            <p className={styles.legenda}>
              OpenStreetMap · janela de ~{RAIO_JANELA_METROS * 2} m
            </p>
            <iframe
              src={urlDoMapa(leitura.latitude, leitura.longitude)}
              title="Posição coletada no OpenStreetMap"
              loading="lazy"
            />
          </section>
        </>
      )}

      {historico.length > 1 && (
        <section className={styles.historico}>
          <h2>Últimas leituras</h2>
          <ol>
            {historico.map((item, i) => (
              <li key={i}>
                <span>{item.horario}</span>
                <span>
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </span>
                <span>±{item.precisao.toFixed(0)} m</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
