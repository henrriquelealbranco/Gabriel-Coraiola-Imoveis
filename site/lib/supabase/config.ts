export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("hghpnnfrllhlyiswhhff")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://qawnrsmbxuzsucikcija.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("LBnJ4MJJ")
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : "sb_publishable_rqdHbmDGxmtdiIWfOrVdPw_BzvM432G";
