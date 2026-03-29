import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BANNED_WORDS: string[] = [
  "connard", "connasse", "salope", "pute", "putain", "enculé", "enculer", "encule",
  "fdp", "fils de pute", "fils de putain", "va te faire", "va te foutre",
  "merde", "emmerde", "emmerder", "chier", "chieur", "chieuse",
  "con", "conne", "cons", "connes", "gros con", "pauvre con",
  "abruti", "abruties", "abrutils", "abrutie",
  "imbécile", "imbecile", "idiot", "idiote", "crétin", "cretine", "crétine",
  "débile", "debile", "taré", "tare", "tarée", "taree",
  "naze", "bouffon", "bouffonne", "clodo", "clochard",
  "bâtard", "batard", "batarde", "bâtarde",
  "gueuler", "ferme ta gueule", "ta gueule", "ferme la",
  "ordure", "ordures", "pourriture", "raclure",
  "maudit", "maudite", "sacré", "ostie", "câlice", "crisse", "tabarnak", "tabarnac",
  "niquer", "nique", "niquez",

  "nègre", "negre", "négresse", "negresse", "bamboula", "bounty",
  "bougnoule", "bougnoul", "melon", "bicot", "raton", "renoi",
  "youpin", "youping", "youpine", "yid", "feuj",
  "boche", "fridolin", "rosbif", "macaroni", "espingouin",
  "chinetoque", "chinetoc", "chintok", "jaunasse",
  "sale arabe", "sale noir", "sale blanc", "sale juif",
  "singe", "gorille", "macaque",
  "gay", "pédé", "pede", "pédasse", "tapette", "fiotte", "gouine",
  "trans", "travelo", "travesti",
  "invalide", "handicapé de", "débile mental", "idiot du village",
  "islamiste", "islamophobie", "antisémite", "antisemite",
  "raciste", "facho", "fasciste", "nazi", "nazisme", "néonazi", "neonazi",

  "sexe", "porn", "porno", "pornographie", "pornographique",
  "bite", "bites", "zizi", "pine", "queue", "chibre",
  "vagin", "chatte", "vulve", "clitoris", "seins", "nichons", "tétons",
  "couilles", "burnes", "testicules",
  "anus", "cul", "fesse", "fesses",
  "masturbation", "masturber", "branler", "branlette",
  "éjaculer", "ejaculer", "éjaculation", "ejaculation",
  "orgasme", "baisé", "baise", "baiser", "niqueur",
  "partouze", "orgie", "gang bang", "gangbang",
  "escort", "call-girl", "prostituée", "prostitution", "proxénète", "proxenete",
  "cam girl", "cam-girl", "camgirl", "onlyfans", "only fans",
  "sexting", "nudes", "nude", "photo nue", "photos nues",
  "exhib", "exhibitionnisme", "voyeurisme",
  "sodomie", "fellation", "cunnilingus",

  "drogue", "drogues", "cannabis", "marijuana", "weed", "shit", "haschich", "hashish",
  "cocaine", "cocaïne", "coke", "héroïne", "heroine", "mdma", "ecstasy",
  "speed", "amphétamine", "amphetamine", "lsd", "acide",
  "crack", "crystal meth", "meth", "méthamphétamine", "methamphétamine",
  "stups", "stupéfiants", "stupefiants",
  "arme", "armes", "pistolet", "fusil", "kalachnikov", "revolver", "couteau de combat",
  "explosif", "explosifs", "bombe", "grenade", "dynamite",
  "trafic", "trafiquant", "dealer", "deal", "revendeur",
  "blanchiment", "argent sale", "argent noir",
  "terrorisme", "terroriste", "djihad", "jihad", "attentat",
  "pédophilie", "pedophilie", "pédopornographie", "pedopornographie",
  "inceste",
  "meurtre", "assassinat", "tuer", "tuer quelqu", "je vais tuer",
  "viol", "violeur", "violer",
  "suicide", "me tuer", "me suicider",
  "contrebande", "fraude",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-*\.@]/g, "")
    .replace(/o/g, "0")
    .replace(/O/g, "0")
    .replace(/l/g, "1")
    .replace(/I/g, "1")
    .replace(/1/g, "1")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/8/g, "b")
    .replace(/\$/g, "s")
    .replace(/\+/g, "t")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDigits(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bo\b/gi, "0")
    .replace(/(?<!\w)o(?!\w)/gi, "0")
    .replace(/[oO]/g, "0")
    .replace(/[lIi|]/g, "1")
    .replace(/[sS\$]/g, "5")
    .replace(/[bB]/g, "8")
    .replace(/[zZ]/g, "2")
    .replace(/[gG]/g, "9")
    .replace(/[^\d]/g, "");
}

function detectPhoneNumbers(texts: string[]): boolean {
  const WORD_TO_DIGIT: Record<string, string> = {
    "zero": "0", "zéro": "0",
    "un": "1", "une": "1",
    "deux": "2",
    "trois": "3",
    "quatre": "4",
    "cinq": "5",
    "six": "6",
    "sept": "7",
    "huit": "8",
    "neuf": "9",
    "dix": "10",
    "onze": "11",
    "douze": "12",
    "treize": "13",
    "quatorze": "14",
    "quinze": "15",
    "seize": "16",
    "vingt": "20",
    "trente": "30",
    "quarante": "40",
    "cinquante": "50",
    "soixante": "60",
  };

  const WRITTEN_PHONE_PATTERNS = [
    /z[eé]ro[\s\-]*six/i,
    /z[eé]ro[\s\-]*sept/i,
    /z[eé]ro[\s\-]*huit/i,
    /z[eé]ro[\s\-]*neuf/i,
    /0[\s\-]*six/i,
    /0[\s\-]*sept/i,
    /0[\s\-]*huit/i,
    /0[\s\-]*neuf/i,
    /\+[\s]*33/i,
    /\+[\s]*262/i,
    /\+[\s]*269/i,
    /\+[\s]*32/i,
    /\+[\s]*41/i,
    /\+[\s]*1[\s]*[\(\-]?\s*\d{3}/i,
    /\+[\s]*44/i,
  ];

  const FRENCH_MOBILE_REGEX = /(?:(?:\+|00)33[\s.\-]?)?(?:0)?[67]\s*(?:[\s.\-\/\(\)]{0,3}\d){8}/;
  const FRENCH_FIXED_REGEX = /(?:(?:\+|00)33[\s.\-]?)?0[1-9]\s*(?:[\s.\-\/\(\)]{0,3}\d){8}/;
  const REUNION_REGEX = /(?:(?:\+|00)262[\s.\-]?)?0?[267]\s*(?:[\s.\-\/\(\)]{0,3}\d){7,8}/;
  const MAYOTTE_REGEX = /(?:(?:\+|00)269[\s.\-]?)?0?[267]\s*(?:[\s.\-\/\(\)]{0,3}\d){7,8}/;

  for (const text of texts) {
    if (!text) continue;

    for (const pattern of WRITTEN_PHONE_PATTERNS) {
      if (pattern.test(text)) return true;
    }

    if (
      FRENCH_MOBILE_REGEX.test(text) ||
      FRENCH_FIXED_REGEX.test(text) ||
      REUNION_REGEX.test(text) ||
      MAYOTTE_REGEX.test(text)
    ) {
      return true;
    }

    let wordConverted = text.toLowerCase();
    for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
      const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
      wordConverted = wordConverted.replace(wordRegex, digit);
    }
    if (
      FRENCH_MOBILE_REGEX.test(wordConverted) ||
      REUNION_REGEX.test(wordConverted) ||
      MAYOTTE_REGEX.test(wordConverted)
    ) {
      return true;
    }

    const digits = extractDigits(text);
    if (digits.length >= 10) {
      const frMobile = /0[67]\d{8}/;
      const frFixed = /0[1-9]\d{8}/;
      const reunion = /0262\d{6}|0692\d{6}|0693\d{6}/;
      const mayotte = /0269\d{6}|0639\d{6}/;
      const intlFr = /33[67]\d{8}/;
      const intlReunion = /262\d{8}|262692\d{6}|262693\d{6}/;

      if (
        frMobile.test(digits) ||
        frFixed.test(digits) ||
        reunion.test(digits) ||
        mayotte.test(digits) ||
        intlFr.test(digits) ||
        intlReunion.test(digits)
      ) {
        return true;
      }
    }

    const contactKeywords = [
      /\bwhatsapp\b/i,
      /\bwatsapp\b/i,
      /\bwa[\.\s]*me\b/i,
      /\btelegram\b/i,
      /\bsignal\b/i,
      /\bviber\b/i,
      /\bmessenger\b/i,
      /\bappellez[\s-]moi\b/i,
      /\bappelle[\s-]moi\b/i,
      /\bcontactez[\s-]moi\b/i,
      /\bécrivez[\s-]moi\b/i,
      /\becrivez[\s-]moi\b/i,
      /\bmon num[eé]ro\b/i,
      /\bmon num\b/i,
      /\bmon t[eé]l\b/i,
      /\bmon portable\b/i,
      /\bmon mobile\b/i,
    ];

    for (const kw of contactKeywords) {
      if (kw.test(text)) return true;
    }

    const emailRegex = /[a-zA-Z0-9._%+\-]+\s*@\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/;
    if (emailRegex.test(text)) return true;
  }

  return false;
}

function detectBannedContent(texts: string[]): { found: boolean; words: string[]; phoneDetected: boolean } {
  const detectedWords: string[] = [];

  for (const text of texts) {
    if (!text) continue;
    const normalized = normalizeText(text);

    for (const banned of BANNED_WORDS) {
      const normalizedBanned = normalizeText(banned);
      const regex = new RegExp(`(?:^|\\s|[^a-z])${normalizedBanned.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}(?:$|\\s|[^a-z])`, "i");

      if (regex.test(normalized) || normalized.includes(normalizedBanned)) {
        if (!detectedWords.includes(banned)) {
          detectedWords.push(banned);
        }
      }
    }
  }

  const phoneDetected = detectPhoneNumbers(texts);

  return { found: detectedWords.length > 0 || phoneDetected, words: detectedWords, phoneDetected };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as { texts: string[] };
    const { texts } = body;

    if (!texts || !Array.isArray(texts)) {
      return new Response(JSON.stringify({ error: "texts array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = detectBannedContent(texts);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
