"use client";

import { useRef, useState, type DragEvent } from "react";
import { Pencil, Info, Trash2, Check, X, Plus, UploadCloud, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/format";
import { env } from "@/lib/env";
import type { Product } from "@/types";
import { saveProduct, deleteProduct, uploadImage, uploadProductFile } from "./actions";

type SalesInfo = { count: number; revenueCents: number };

function centsToInput(cents: number | null) {
  return cents ? (cents / 100).toString() : "";
}

function ImageField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImage(formData);
    setIsUploading(false);
    if (result.ok && result.url) {
      setValue(result.url);
    } else {
      setError(result.message ?? "Erro ao enviar a imagem.");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-brand-900">{label}</span>
      <input type="hidden" name={name} value={value} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Pré-visualização do produto" className="h-32 w-32 rounded-lg object-cover" />
        ) : (
          <UploadCloud className="h-8 w-8 text-slate-400" />
        )}

        <p className="text-sm text-slate-500">
          {isUploading ? (
            "Enviando..."
          ) : (
            <>
              Arraste uma imagem aqui, ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-brand-600 hover:text-brand-800"
              >
                escolha um arquivo
              </button>
            </>
          )}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}

      <input
        type="url"
        placeholder="ou cole o link de uma imagem"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}

function FileField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const [path, setPath] = useState(defaultValue ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductFile(formData);
    setIsUploading(false);
    if (result.ok && result.path) {
      setPath(result.path);
      setFileName(result.fileName ?? null);
      setPreviewUrl(result.previewUrl ?? null);
    } else {
      setError(result.message ?? "Erro ao enviar o arquivo.");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-brand-900">{label}</span>
      <input type="hidden" name={name} value={path} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white"
        }`}
      >
        <FileText className="h-8 w-8 text-slate-400" />

        {path ? (
          <p className="text-sm text-slate-600">
            Arquivo salvo{fileName ? `: ${fileName}` : ""}.{" "}
            {previewUrl ? (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:text-brand-800">
                Ver arquivo
              </a>
            ) : null}
          </p>
        ) : null}

        <p className="text-sm text-slate-500">
          {isUploading ? (
            "Enviando..."
          ) : (
            <>
              Arraste um PDF aqui, ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-brand-600 hover:text-brand-800"
              >
                {path ? "substitua o arquivo" : "escolha um arquivo"}
              </button>
            </>
          )}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ProductForm({ product, products, onDone }: { product?: Product; products: Product[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);

  const currentMainProduct = products.find((candidate) => candidate.is_main_product);
  const isEditingMain = product?.is_main_product ?? false;
  // Só existe 1 produto principal no catálogo: a opção só aparece se ainda
  // não houver um, ou se for o próprio produto que já é o principal.
  const canBeMain = !currentMainProduct || isEditingMain;

  return (
    <form
      action={async (formData) => {
        setError(null);
        const result = await saveProduct(formData);
        if (!result.ok) {
          setError(result.message ?? "Erro ao salvar o produto.");
          return;
        }
        onDone();
      }}
      className="space-y-4"
    >
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <Input id="name" name="name" label="Nome do produto" defaultValue={product?.name} required className="h-12" />
      <ImageField name="imagePath" label="Imagem do produto" defaultValue={product?.image_path ?? ""} />
      <FileField name="pdfPath" label="Arquivo do produto (PDF)" defaultValue={product?.pdf_path ?? ""} />
      <Input id="headline" name="headline" label="Headline" defaultValue={product?.headline ?? ""} className="h-12" />
      <Input id="subheadline" name="subheadline" label="Subheadline" defaultValue={product?.subheadline ?? ""} className="h-12" />
      <label className="block text-left">
        <span className="mb-1 block text-sm font-semibold text-brand-900">Descrição</span>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </label>
      <Input
        id="price"
        name="price"
        type="number"
        step="0.01"
        label="Preço"
        defaultValue={centsToInput(product?.price_cents ?? null)}
        required
        className="h-12"
      />
      <Input
        id="compareAtPrice"
        name="compareAtPrice"
        type="number"
        step="0.01"
        label="Preço âncora (riscado)"
        defaultValue={centsToInput(product?.compare_at_price_cents ?? null)}
        className="h-12"
      />
      <p className="text-xs text-slate-500">
        O preço é sempre cadastrado em USD (dólar) — cada visitante vê e paga o valor convertido pra moeda do seu país.
      </p>

      {canBeMain ? (
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-900">
          <input type="checkbox" name="isMainProduct" defaultChecked={isEditingMain} className="h-5 w-5 accent-brand-600" />
          Produto principal (vendido no link de checkout)
        </label>
      ) : (
        <Select
          id="offerRole"
          name="offerRole"
          label="Papel deste produto"
          defaultValue={product?.offer_role ?? ""}
          className="h-12"
        >
          <option value="">Nenhum (não aparece como oferta)</option>
          <option value="upsell">2ª oferta (upsell, aparece no carrinho)</option>
          <option value="downsell">3ª oferta (downsell, aparece ao clicar em pagar)</option>
        </Select>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-brand-900">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-5 w-5 accent-brand-600" />
        Produto ativo
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" size="md" variant="secondary">
          {product ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}

export function ProductsManager({
  products,
  salesByProduct,
}: {
  products: Product[];
  salesByProduct: Record<string, SalesInfo>;
}) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [infoProductId, setInfoProductId] = useState<string | null>(null);

  const infoProduct = products.find((product) => product.id === infoProductId) ?? null;
  const infoSales: SalesInfo = (infoProduct && salesByProduct[infoProduct.slug]) || { count: 0, revenueCents: 0 };
  const infoRoleLabel = infoProduct?.is_main_product
    ? "Produto principal"
    : infoProduct?.offer_role === "upsell"
      ? "2ª oferta (upsell)"
      : infoProduct?.offer_role === "downsell"
        ? "3ª oferta (downsell)"
        : "Nenhum";

  const editingProduct = products.find((product) => product.id === editingProductId) ?? null;
  const isProductModalOpen = showNewProduct || Boolean(editingProduct);
  function closeProductModal() {
    setShowNewProduct(false);
    setEditingProductId(null);
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`Excluir "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    const result = await deleteProduct(product.id);
    if (!result.ok) {
      window.alert(result.message ?? "Erro ao excluir o produto.");
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-900">Produtos</h2>
          <button
            type="button"
            onClick={() => setShowNewProduct(true)}
            aria-label="Novo produto"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-brand-700 hover:border-brand-300 hover:text-brand-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Card className="mt-4 overflow-x-auto p-0" hoverable={false}>
          <table className="w-full min-w-[560px] text-center text-sm">
            <thead className="bg-brand-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Preço</th>
                <th className="px-5 py-3 font-semibold">Quantidade vendida</th>
                <th className="px-5 py-3 font-semibold">Ativo</th>
                <th className="px-5 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-brand-50">
                  <td className="px-5 py-3 font-semibold text-brand-900">{product.name}</td>
                  <td className="px-5 py-3 text-slate-700">{formatPrice(product.price_cents, product.currency)}</td>
                  <td className="px-5 py-3 text-slate-700">{salesByProduct[product.slug]?.count ?? 0}</td>
                  <td className="px-5 py-3">
                    {product.active ? <Check className="mx-auto h-5 w-5 text-brand-600" /> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingProductId(product.id)}
                        aria-label="Editar produto"
                        className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInfoProductId(product.id)}
                        aria-label="Informações do produto"
                        className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        aria-label="Excluir produto"
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </section>

      {isProductModalOpen ? (
        <Modal title={editingProduct ? "Editar produto" : "Novo produto"} onClose={closeProductModal}>
          <ProductForm product={editingProduct ?? undefined} products={products} onDone={closeProductModal} />
        </Modal>
      ) : null}

      {infoProduct ? (
        <Modal
          title={
            <span className="flex items-center gap-2">
              {infoProduct.name}
              {infoProduct.active ? (
                <Check className="h-5 w-5 shrink-0 text-brand-600" />
              ) : (
                <X className="h-5 w-5 shrink-0 text-red-600" />
              )}
            </span>
          }
          onClose={() => setInfoProductId(null)}
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-500">Link do produto</p>
              <a
                href={`${env.siteUrl}/checkout/${infoProduct.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-brand-600 hover:text-brand-800 hover:underline"
              >
                {env.siteUrl}/checkout/{infoProduct.slug}
              </a>
            </div>

            <div>
              <p className="font-semibold text-slate-500">Número de vendas</p>
              <p className="mt-1 text-brand-900">{infoSales.count}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-500">Receita gerada</p>
              <p className="mt-1 text-brand-900">{formatPrice(infoSales.revenueCents, infoProduct.currency)}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-500">Preço atual</p>
              <p className="mt-1 text-brand-900">{formatPrice(infoProduct.price_cents, infoProduct.currency)}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-500">Papel no funil</p>
              <p className="mt-1 text-brand-900">{infoRoleLabel}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-500">Criado em</p>
              <p className="mt-1 text-brand-900">{new Date(infoProduct.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
