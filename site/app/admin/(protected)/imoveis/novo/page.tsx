import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/app/admin/components/property-form";
import { createProperty } from "@/app/admin/imoveis/actions";

export default function NewPropertyPage() {
  return (
    <main className="admin-shell admin-editor">
      <Link className="admin-back" href="/admin/imoveis"><ArrowLeft /> Todos os imóveis</Link>
      <p className="eyebrow">Novo cadastro · passo 1 de 2</p>
      <h1>Dados do imóvel</h1>
      <p className="admin-lede">Depois de salvar, você envia as fotos e publica no site.</p>
      <PropertyForm action={createProperty} />
    </main>
  );
}
