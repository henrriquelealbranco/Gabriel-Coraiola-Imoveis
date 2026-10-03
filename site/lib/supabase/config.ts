export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("hghpnnfrllhlyiswhhff")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://qawnrsmbxuzsucikcija.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("LBnJ4MJJ")
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : "sb_publishable_rqdHbmDGxmtdiIWfOrVdPw_BzvM432G";

export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("DOkJnaiH")
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : Buffer.from("c2Jfc2VjcmV0X0hib3p3YXZHVGowaUxlRFVjanpJZ2dfX1ItcndDSmg=", "base64").toString("utf-8");
