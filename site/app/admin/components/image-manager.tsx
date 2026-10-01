import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { deleteImage, moveImage } from "@/app/admin/imoveis/[id]/images/actions";
import { ImageUploadForm } from "@/app/admin/components/image-upload-form";
import type { PropertyImage } from "@/lib/properties/types";

export function ImageManager({ propertyId, images }: { propertyId: string; images: PropertyImage[] }) {
  return (
    <section className="image-manager" aria-labelledby="fotos-titulo">
      <header className="image-manager__head">
        <div>
          <p className="eyebrow">Galeria</p>
          <h2 id="fotos-titulo">Fotos do imóvel</h2>
        </div>
        <p>{images.length ? `${images.length} ${images.length === 1 ? "foto" : "fotos"}. A primeira é a capa no site.` : "Nenhuma foto ainda."}</p>
      </header>

      <ImageUploadForm propertyId={propertyId} />

      {images.length > 0 && (
        <ol className="photo-grid">
          {images.map((image, index) => (
            <li key={image.id}>
              <figure>
                {image.url ? <img src={image.url} alt={`Foto ${index + 1}`} loading="lazy" /> : <div className="photo-missing">Arquivo indisponível</div>}
                {index === 0 && <figcaption>Capa</figcaption>}
              </figure>
              <div className="photo-tools">
                <div className="photo-move">
                  <MoveForm propertyId={propertyId} imageId={image.id} imageIds={images.map(({ id }) => id)} direction={-1} disabled={index === 0} label={`Mover foto ${index + 1} para antes`}><ArrowLeft /></MoveForm>
                  <MoveForm propertyId={propertyId} imageId={image.id} imageIds={images.map(({ id }) => id)} direction={1} disabled={index === images.length - 1} label={`Mover foto ${index + 1} para depois`}><ArrowRight /></MoveForm>
                </div>
                <form action={deleteImage}>
                  <input type="hidden" name="propertyId" value={propertyId} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <button className="danger" type="submit" aria-label={`Excluir foto ${index + 1}`} title="Excluir foto"><Trash2 /></button>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// A direção vai em campo oculto: o botão clicado não chega ao servidor como campo do formulário.
function MoveForm({ propertyId, imageId, imageIds, direction, disabled, label, children }: {
  propertyId: string; imageId: string; imageIds: string[]; direction: -1 | 1; disabled: boolean; label: string; children: React.ReactNode;
}) {
  return (
    <form action={moveImage}>
      {imageIds.map((id) => <input key={id} type="hidden" name="imageIds" value={id} />)}
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="imageId" value={imageId} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} aria-label={label} title={label}>{children}</button>
    </form>
  );
}
