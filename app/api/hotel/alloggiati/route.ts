import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ──────────────────────────────────────────────────────────────────────
// Alloggiati Web — Polizia di Stato fixed-width export
// Format reference: Specifiche Tecniche Alloggiati Web v2.x
// Each line = 179 chars + CRLF
// ──────────────────────────────────────────────────────────────────────

// EU member states (ISO 3166-1 alpha-2) for tipo_alloggiato classification
const EU_ISO2 = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR",
  "HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
]);

// ISTAT country codes (subset — most common nationalities in Italy)
// Full table: https://www.istat.it/it/archivio/6747
const ISTAT_COUNTRY: Record<string, string> = {
  IT: "100000100", ITA: "100000100",
  DE: "100000058", DEU: "100000058",
  FR: "100000050", FRA: "100000050",
  ES: "100000070", ESP: "100000070",
  GB: "100000087", GBR: "100000087",
  US: "200000100", USA: "200000100",
  CN: "300000014", CHN: "300000014",
  IN: "300000057", IND: "300000057",
  RU: "100000086", RUS: "100000086",
  AT: "100000005", AUT: "100000005",
  CH: "100000175", CHE: "100000175",
  PL: "100000074", POL: "100000074",
  RO: "100000088", ROU: "100000088",
  NL: "100000064", NLD: "100000064",
  BE: "100000007", BEL: "100000007",
  PT: "100000075", PRT: "100000075",
  SE: "100000094", SWE: "100000094",
  GR: "100000053", GRC: "100000053",
  HR: "100000091", HRV: "100000091",
  CZ: "100000034", CZE: "100000034",
  HU: "100000056", HUN: "100000056",
  UA: "100000090", UKR: "100000090",
  TR: "100000083", TUR: "100000083",
  MA: "400000037", MAR: "400000037",
  BR: "200000028", BRA: "200000028",
  AR: "200000005", ARG: "200000005",
  JP: "300000064", JPN: "300000064",
  KR: "300000148", KOR: "300000148",
  EG: "400000024", EGY: "400000024",
  DK: "100000038", DNK: "100000038",
  NO: "100000069", NOR: "100000069",
  FI: "100000047", FIN: "100000047",
  IE: "100000060", IRL: "100000060",
  SK: "100000097", SVK: "100000097",
  SI: "100000096", SVN: "100000096",
  BG: "100000011", BGR: "100000011",
  LT: "100000179", LTU: "100000179",
  LV: "100000181", LVA: "100000181",
  EE: "100000039", EST: "100000039",
  RS: "100000170", SRB: "100000170",
  AL: "100000001", ALB: "100000001",
  MK: "100000180", MKD: "100000180",
  BA: "100000169", BIH: "100000169",
  ME: "100000184", MNE: "100000184",
  XK: "100000185", // Kosovo
  LU: "100000063", LUX: "100000063",
  MT: "100000066", MLT: "100000066",
  CY: "100000177", CYP: "100000177",
  IS: "100000059", ISL: "100000059",
  SM: "100000092", SMR: "100000092",
  VA: "100000093", VAT: "100000093",
  LI: "100000062", LIE: "100000062",
};

// Document type codes
const DOC_CODE: Record<string, string> = {
  passaporto: "PPORT",
  passport: "PPORT",
  "carta identità": "IDENT",
  "carta d'identità": "IDENT",
  "carta di identita": "IDENT",
  identity_card: "IDENT",
  identitycard: "IDENT",
  patente: "DRIVE",
  "driving license": "DRIVE",
  driving_license: "DRIVE",
  "permesso di soggiorno": "PERMS",
  residence_permit: "PERMS",
  "visto": "VISTP",
  visa: "VISTP",
};

function padR(s: string | null | undefined, len: number): string {
  return ((s ?? "").substring(0, len)).padEnd(len, " ");
}

function padL(s: string | null | undefined, len: number): string {
  return ((s ?? "").substring(0, len)).padStart(len, " ");
}

function fmtDateIT(iso: string | null | undefined): string {
  if (!iso) return "          ";
  const d = new Date(iso + "T12:00:00Z");
  if (isNaN(d.getTime())) return "          ";
  return (
    String(d.getUTCDate()).padStart(2, "0") + "/" +
    String(d.getUTCMonth() + 1).padStart(2, "0") + "/" +
    d.getUTCFullYear()
  );
}

function getTipoAlloggiato(citizenship: string | null): string {
  if (!citizenship) return "18";
  const key = citizenship.trim().toUpperCase().replace(/\s+/g, "");
  if (key === "IT" || key === "ITA" || key === "ITALIAN" || key === "ITALIANA" || key === "ITALIANO" || key === "ITALY") return "16";
  if (EU_ISO2.has(key)) return "17";
  if (key === "FRANCESE" || key === "TEDESCO" || key === "TEDESCA" || key === "SPAGNOLO" || key === "SPAGNOLA") return "17";
  return "18";
}

function getIstatCode(country: string | null): string {
  if (!country) return "         "; // 9 spaces (unknown)
  const key = country.trim().toUpperCase();
  return ISTAT_COUNTRY[key] ?? ISTAT_COUNTRY[key.substring(0, 2)] ?? "         ";
}

function getDocCode(docType: string | null): string {
  if (!docType) return "     "; // 5 spaces
  const key = docType.trim().toLowerCase().replace(/[_\s]+/g, " ");
  return padR(DOC_CODE[key] ?? DOC_CODE[docType.trim().toLowerCase()] ?? "ALTRO", 5);
}

function buildLine(
  guest: {
    first_name: string;
    last_name: string;
    dob: string | null;
    sex: string | null;
    citizenship: string | null;
    birth_place: string | null;
    document_type: string | null;
    document_number: string | null;
  },
  arrival: string,
  nights: number
): string {
  const tipoAlloggiato  = padR(getTipoAlloggiato(guest.citizenship), 2);
  const dataArrivo      = fmtDateIT(arrival);                         // 10
  const giorniPerm      = padL(String(nights), 4);                    // 4
  const tipoDoc         = getDocCode(guest.document_type);            // 5
  const numDoc          = padR(guest.document_number, 20);            // 20
  const luogoRilascio   = padR(getIstatCode(guest.citizenship), 9);   // 9 (approx — issue location unknown)
  const dataRilascio    = "          ";                               // 10
  const dataScadenza    = "          ";                               // 10
  const cognome         = padR(guest.last_name?.toUpperCase(), 50);   // 50
  const nome            = padR(guest.first_name?.toUpperCase(), 30);  // 30
  const sesso           = guest.sex?.toUpperCase() === "F" ? "2" : "1"; // 1
  const dataNascita     = fmtDateIT(guest.dob);                       // 10
  const statoNascita    = padR(getIstatCode(guest.citizenship), 9);   // 9
  // luogo nascita: if Italian, would need municipality code; use same country code as fallback
  const luogoNascita    = padR(getIstatCode(guest.birth_place ?? guest.citizenship), 9); // 9

  return (
    tipoAlloggiato +
    dataArrivo +
    giorniPerm +
    tipoDoc +
    numDoc +
    luogoRilascio +
    dataRilascio +
    dataScadenza +
    cognome +
    nome +
    sesso +
    dataNascita +
    statoNascita +
    luogoNascita
  );
}

export async function GET(req: NextRequest) {
  // Auth check via session client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  if (!from || !to) {
    return Response.json({ error: "from and to params required" }, { status: 400 });
  }

  // Validate date params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return Response.json({ error: "invalid date format" }, { status: 400 });
  }

  // Use admin client to fetch guests (document_number access)
  // hotel_id scope is enforced by joining through session client's hotel
  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();

  if (!hu) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const admin = createAdminClient();

  const { data: reservations, error } = await admin
    .from("reservations")
    .select(`
      id, arrival, departure,
      guests (
        first_name, last_name, dob, sex, citizenship, birth_place,
        document_type, document_number
      )
    `)
    .eq("hotel_id", hu.hotel_id)
    .eq("status", "checked_in")
    .gte("arrival", from)
    .lte("arrival", to)
    .order("arrival", { ascending: true });

  if (error) return Response.json({ error: "db_error" }, { status: 500 });

  const lines: string[] = [];

  for (const res of reservations ?? []) {
    const nights = Math.round(
      (new Date(res.departure + "T12:00:00Z").getTime() -
       new Date(res.arrival  + "T12:00:00Z").getTime()) / 86_400_000
    );
    for (const guest of (res.guests as ReturnType<typeof Object.assign>[]) ?? []) {
      lines.push(buildLine(guest, res.arrival, nights));
    }
  }

  const content = lines.join("\r\n") + (lines.length > 0 ? "\r\n" : "");
  const filename = `alloggiati_${from}_${to}.txt`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=windows-1252",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
