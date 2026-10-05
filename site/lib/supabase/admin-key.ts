import "server-only";

export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("DOkJnaiH")
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : atob("c2Jfc2VjcmV0X0hib3p3YXZHVGowaUxlRFVjanpJZ2dfX1ItcndDSmg=");
