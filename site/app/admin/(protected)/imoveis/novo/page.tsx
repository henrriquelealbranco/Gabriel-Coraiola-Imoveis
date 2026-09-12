import { PropertyForm } from "@/app/admin/components/property-form";
import { createProperty } from "@/app/admin/imoveis/actions";

export default function NewPropertyPage() { return <main className="admin-shell admin-editor"><p className="eyebrow">Novo cadastro</p><h1>Adicionar imóvel</h1><PropertyForm action={createProperty} /></main>; }
