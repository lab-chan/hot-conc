import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const KMA_STATION = {
  id: "494",
  name: "세종고운 AWS",
  sidoCode: "3600000000",
};

const WEATHER_TABLE = "weather_daily";
const SOURCE_NAME = "기상청 날씨누리 AWS";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type LiveWeatherItem = {
  date: string;
  rainMm: number;
  isFinal: boolean;
  fetchedAt: string;
  source: string;
  sourcePayload: Record<string, unknown>;
};

type StoredWeatherRow = {
  observed_date: string;
  rain_mm: number | string;
  is_final: boolean;
  fetched_at: string;
  source_name: string;
};

function jsonResponse(body: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function seoulDateKey(separator = "-") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${separator}${values.month}${separator}${values.day}`;
}

function getSecretKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const directKey = Deno.env.get("SUPABASE_SECRET_KEY");
  if (directKey) return directKey;

  try {
    const keyMap = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const defaultKey = keyMap?.default;
    if (typeof defaultKey === "string" && defaultKey) return defaultKey;
    return Object.values(keyMap).find((value) => typeof value === "string" && value) as string || "";
  } catch {
    return "";
  }
}

function getDatabaseConfig() {
  return {
    url: String(Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, ""),
    key: getSecretKey(),
  };
}

function databaseHeaders(extra: HeadersInit = {}) {
  const { key } = getDatabaseConfig();
  return {
    apikey: key,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function persistFinalWeather(items: LiveWeatherItem[]) {
  const { url, key } = getDatabaseConfig();
  if (!url || !key) throw new Error("기상자료 저장용 서버 설정이 없습니다.");

  const rows = items
    .filter((item) => item.isFinal)
    .map((item) => ({
      station_id: KMA_STATION.id,
      station_name: KMA_STATION.name,
      observed_date: item.date,
      rain_mm: item.rainMm,
      is_final: true,
      source_name: SOURCE_NAME,
      source_url: "https://www.weather.go.kr/w/observation/land/aws-obs.do",
      source_payload: item.sourcePayload,
      fetched_at: item.fetchedAt,
    }));

  if (!rows.length) return;

  const response = await fetch(
    `${url}/rest/v1/${WEATHER_TABLE}?on_conflict=station_id,observed_date`,
    {
      method: "POST",
      headers: databaseHeaders({ Prefer: "resolution=ignore-duplicates,return=minimal" }),
      body: JSON.stringify(rows),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`기상자료 저장 실패 (${response.status}) ${detail.slice(0, 160)}`);
  }
}

async function loadStoredWeather(): Promise<LiveWeatherItem[]> {
  const { url, key } = getDatabaseConfig();
  if (!url || !key) throw new Error("기상자료 저장용 서버 설정이 없습니다.");

  const query = new URLSearchParams({
    select: "observed_date,rain_mm,is_final,fetched_at,source_name",
    station_id: `eq.${KMA_STATION.id}`,
    order: "observed_date.asc",
  });
  const response = await fetch(`${url}/rest/v1/${WEATHER_TABLE}?${query}`, {
    headers: databaseHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`저장된 기상자료 조회 실패 (${response.status}) ${detail.slice(0, 160)}`);
  }

  const rows = await response.json() as StoredWeatherRow[];
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      date: String(row.observed_date || ""),
      rainMm: Number(row.rain_mm),
      isFinal: row.is_final !== false,
      fetchedAt: String(row.fetched_at || ""),
      source: String(row.source_name || SOURCE_NAME),
      sourcePayload: {},
    }))
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(item.rainMm));
}

async function fetchLiveWeather(sourceUrl: URL): Promise<{
  items: LiveWeatherItem[];
  station: { id: string; name: string; latitude: number; longitude: number };
}> {
  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "application/json",
      Referer: "https://www.weather.go.kr/w/weather/land/aws-obs.do",
      "User-Agent": "ConcreteCuringWeatherCheck/2.0",
    },
  });
  if (!response.ok) throw new Error(`기상청 응답 오류 (${response.status})`);

  const payload = await response.json();
  const fetchedAt = new Date().toISOString();
  const today = seoulDateKey();
  const sourceItems = Array.isArray(payload?.items) ? payload.items : [];
  const items = sourceItems
    .map((sourceItem: Record<string, unknown>) => {
      const date = String(sourceItem.fullTm || sourceItem.awsUpdated || "");
      const rainMm = Number.parseFloat(String(sourceItem.awsPcpDay ?? "").replaceAll(",", ""));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(rainMm)) return null;
      return {
        date,
        rainMm: Math.max(0, rainMm),
        isFinal: date < today,
        fetchedAt,
        source: SOURCE_NAME,
        sourcePayload: sourceItem,
      };
    })
    .filter((item: LiveWeatherItem | null): item is LiveWeatherItem => Boolean(item))
    .sort((a: LiveWeatherItem, b: LiveWeatherItem) => a.date.localeCompare(b.date));

  return {
    items,
    station: {
      id: String(payload?.stnInfo?.awsId || KMA_STATION.id),
      name: String(payload?.stnInfo?.nameKo || KMA_STATION.name),
      latitude: Number(payload?.stnInfo?.lat),
      longitude: Number(payload?.stnInfo?.lon),
    },
  };
}

const handleRequest = async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "GET") return jsonResponse({ error: "GET 요청만 허용합니다." }, 405);

  const requestedStationId = new URL(request.url).searchParams.get("stationId") || KMA_STATION.id;
  if (requestedStationId !== KMA_STATION.id) {
    return jsonResponse({ error: "허용되지 않은 관측소입니다." }, 400);
  }

  const sourceUrl = new URL("https://www.weather.go.kr/w/observation/land/aws-obs-data.do");
  sourceUrl.searchParams.set("db", "DAYDB");
  sourceUrl.searchParams.set("tm", seoulDateKey("."));
  sourceUrl.searchParams.set("stnId", KMA_STATION.id);
  sourceUrl.searchParams.set("sidoCode", KMA_STATION.sidoCode);
  sourceUrl.searchParams.set("sort", "");
  sourceUrl.searchParams.set("config", "");

  let liveItems: LiveWeatherItem[] = [];
  let storedItems: LiveWeatherItem[] = [];
  let liveError = "";
  let persistenceError = "";
  let station = {
    id: KMA_STATION.id,
    name: KMA_STATION.name,
    latitude: Number.NaN,
    longitude: Number.NaN,
  };

  try {
    const live = await fetchLiveWeather(sourceUrl);
    liveItems = live.items;
    station = live.station;
  } catch (error) {
    liveError = error instanceof Error ? error.message : "기상청 자료를 가져오지 못했습니다.";
  }

  try {
    if (liveItems.length) await persistFinalWeather(liveItems);
    storedItems = await loadStoredWeather();
  } catch (error) {
    persistenceError = error instanceof Error ? error.message : "기상자료 영구 저장을 확인하지 못했습니다.";
  }

  const merged = new Map<string, LiveWeatherItem>();
  liveItems.forEach((item) => merged.set(item.date, item));
  storedItems.forEach((item) => merged.set(item.date, item));
  const items = Array.from(merged.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ sourcePayload: _sourcePayload, ...item }) => item);

  if (!items.length && liveError) {
    return jsonResponse({ error: liveError, persistenceError }, 502);
  }

  return jsonResponse(
    {
      station,
      items,
      fetchedAt: new Date().toISOString(),
      source: {
        name: SOURCE_NAME,
        url: "https://www.weather.go.kr/w/observation/land/aws-obs.do",
      },
      persistence: {
        available: !persistenceError,
        message: persistenceError,
      },
      warning: liveError,
    },
    200,
    { "Cache-Control": "public, max-age=300, s-maxage=900" },
  );
};

export default {
  fetch: handleRequest,
};
