import { describe, expect, it, vi } from "vitest";
import { authorizeAdmin } from "@/lib/supabase/auth";

describe("autorização administrativa", () => {
  it("recusa quem não está autenticado", async () => {
    const client = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } };
    await expect(authorizeAdmin(client as never)).resolves.toEqual({ ok: false, reason: "unauthenticated" });
  });

  it("recusa usuário autenticado fora da lista de administradores", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) }) })),
    };
    await expect(authorizeAdmin(client as never)).resolves.toEqual({ ok: false, reason: "forbidden" });
  });

  it("aceita usuário presente em admin_users", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "user-1" } }) }) }) })),
    };
    await expect(authorizeAdmin(client as never)).resolves.toEqual({ ok: true, userId: "user-1" });
  });
});
