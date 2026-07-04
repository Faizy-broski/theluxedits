"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Globe, Plus, Pencil, Trash2, X, Save,
  Eye, Package, CheckCircle, EyeOff, ExternalLink, RefreshCw,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { confirmDelete, toastSuccess, toastError } from "@/lib/swal";

interface Website {
  id: number;
  name: string;
  url: string | null;
  is_active: boolean;
  is_hidden: boolean;
  products_count: number;
  created_at?: string;
}

type ModalState = null | "add" | "view" | "edit";

const defaultForm = { name: "", url: "", is_active: true, is_hidden: false };

export default function AdminWebsitesPage() {
  const [websites,  setWebsites]  = useState<Website[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<ModalState>(null);
  const [selected,  setSelected]  = useState<Website | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [form,      setForm]      = useState(defaultForm);

  function load() {
    setLoading(true);
    adminApi.get("/admin/websites")
      .then(({ data }) => setWebsites(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(defaultForm);
    setSelected(null);
    setModal("add");
  }
  function openEdit(w: Website) {
    setForm({ name: w.name, url: w.url || "", is_active: w.is_active, is_hidden: w.is_hidden });
    setSelected(w);
    setModal("edit");
  }
  function openView(w: Website) {
    setSelected(w);
    setModal("view");
  }
  function closeModal() { setModal(null); setSelected(null); }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "add") {
        const { data } = await adminApi.post("/admin/websites", form);
        setWebsites((w) => [...w, data]);
        toastSuccess("Website added.");
      } else if (modal === "edit" && selected) {
        const { data } = await adminApi.put(`/admin/websites/${selected.id}`, form);
        setWebsites((w) => w.map((x) => x.id === data.id ? { ...data, products_count: x.products_count } : x));
        toastSuccess("Website updated.");
      }
      closeModal();
    } catch { toastError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number, name: string) {
    const ok = await confirmDelete(
      `Delete "${name}"?`,
      "All linked products will also be removed."
    );
    if (!ok) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/admin/websites/${id}`);
      setWebsites((w) => w.filter((x) => x.id !== id));
      if (modal !== null) closeModal();
      toastSuccess("Website deleted.");
    } catch { toastError("Failed to delete. Please try again."); }
    finally { setDeleting(null); }
  }

  // Derived stats from websites list
  const totalActive   = websites.filter((w) => w.is_active).length;
  const totalHidden   = websites.filter((w) => w.is_hidden).length;
  const totalProducts = websites.reduce((sum, w) => sum + (Number(w.products_count) || 0), 0);

  return (
    <AdminShell>

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Websites</h1>
          <p className="mt-0.5 text-sm text-black/40">Manage scraper source websites</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[12px] text-black/60 hover:text-black transition">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Refresh
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black/80 transition">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Website
          </button>
        </div>
      </div>

      {/* ── Stat widgets ── */}
      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Globe className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Total Sites</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {loading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-neutral-100" /> : websites.length}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">source websites</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Active</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {loading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-neutral-100" /> : totalActive}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">{loading ? "—" : websites.length - totalActive} inactive</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
              <EyeOff className="h-4 w-4 text-black/40" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Hidden</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {loading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-neutral-100" /> : totalHidden}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">not shown publicly</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Package className="h-4 w-4 text-violet-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Products</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-neutral-100" /> : totalProducts.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">across all sites</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-black/8 bg-neutral-50/80">
              <th className="px-5 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Website</th>
              <th className="px-4 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[100px]">Status</th>
              <th className="px-4 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[100px]">Visibility</th>
              <th className="px-4 py-3 text-right font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[110px]">Products</th>
              <th className="px-4 py-3 text-right font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-black/5">
                  <td className="px-5 py-3">
                    <div className="space-y-1.5">
                      <div className="h-3 animate-pulse rounded bg-neutral-100 w-40" />
                      <div className="h-2.5 animate-pulse rounded bg-neutral-100 w-56" />
                    </div>
                  </td>
                  <td className="px-4 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-16" /></td>
                  <td className="px-4 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-16" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-3 animate-pulse rounded bg-neutral-100 w-12 ml-auto" /></td>
                  <td className="px-4 py-3" />
                </tr>
              ))
            ) : websites.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Globe className="mx-auto mb-3 h-10 w-10 text-black/10" strokeWidth={0.8} />
                  <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/30">No websites yet</p>
                  <button onClick={openAdd}
                    className="mt-4 flex items-center gap-1.5 mx-auto rounded-lg bg-black px-4 py-2 text-[12px] font-medium text-white hover:bg-black/80 transition">
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add your first website
                  </button>
                </td>
              </tr>
            ) : (
              websites.map((w) => (
                <tr key={w.id} className="border-b border-black/5 hover:bg-neutral-50/70 transition-colors group">

                  {/* Name + URL */}
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-black/85">{w.name}</p>
                    {w.url ? (
                      <div className="mt-0.5 flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5 text-black/25 flex-shrink-0" strokeWidth={1.3} />
                        <a href={w.url} target="_blank" rel="noopener noreferrer"
                          className="font-jet text-[9px] text-black/35 hover:text-black transition truncate max-w-[300px]">
                          {w.url}
                        </a>
                      </div>
                    ) : (
                      <p className="font-jet text-[9px] text-black/20 mt-0.5">No URL</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.1em] ${w.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-black/40 border-black/10"}`}>
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Visibility */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.1em] ${w.is_hidden ? "bg-neutral-100 text-black/40 border-black/10" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                      {w.is_hidden ? (
                        <><EyeOff className="h-2.5 w-2.5" strokeWidth={1.4} /> Hidden</>
                      ) : (
                        <><Eye className="h-2.5 w-2.5" strokeWidth={1.4} /> Visible</>
                      )}
                    </span>
                  </td>

                  {/* Products count */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-jet text-[12px] font-medium text-black/70">{(Number(w.products_count) || 0).toLocaleString()}</span>
                    <p className="font-jet text-[9px] text-black/25">products</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(w)} title="View details"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                        <Eye className="h-3 w-3" strokeWidth={1.4} />
                      </button>
                      <button onClick={() => openEdit(w)} title="Edit"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                        <Pencil className="h-3 w-3" strokeWidth={1.4} />
                      </button>
                      <button onClick={() => handleDelete(w.id, w.name)} disabled={deleting === w.id}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200/60 text-red-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                        {deleting === w.id
                          ? <span className="h-2.5 w-2.5 animate-spin rounded-full border border-red-300 border-t-red-500" />
                          : <Trash2 className="h-3 w-3" strokeWidth={1.4} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── View Modal ── */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-6 border-b border-black/8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                  <Globe className="h-5 w-5 text-black/50" strokeWidth={1.3} />
                </div>
                <div>
                  <h2 className="font-semibold text-black">{selected.name}</h2>
                  <p className="font-jet text-[9px] text-black/35 uppercase tracking-[0.15em]">Website #{selected.id}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-black/30 hover:text-black transition mt-0.5">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* URL */}
              <div>
                <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/35 mb-1.5">URL</p>
                {selected.url ? (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-black hover:underline break-all">
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-black/40" strokeWidth={1.4} />
                    {selected.url}
                  </a>
                ) : (
                  <p className="text-sm text-black/30 italic">No URL set</p>
                )}
              </div>

              {/* Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/35 mb-1.5">Status</p>
                  <span className={`inline-flex rounded-full border px-3 py-1 font-jet text-[9px] uppercase tracking-[0.12em] ${selected.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-black/40 border-black/10"}`}>
                    {selected.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/35 mb-1.5">Visibility</p>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-jet text-[9px] uppercase tracking-[0.12em] ${selected.is_hidden ? "bg-neutral-100 text-black/40 border-black/10" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                    {selected.is_hidden ? "Hidden" : "Visible"}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="rounded-xl bg-neutral-50 border border-black/5 p-4 flex items-center justify-between">
                <div>
                  <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/35">Scraped Products</p>
                  <p className="mt-1 text-2xl font-bold text-black">{(Number(selected.products_count) || 0).toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-black/10" strokeWidth={1} />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { closeModal(); setTimeout(() => openEdit(selected!), 50); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black/80 transition">
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                Edit Website
              </button>
              <button onClick={() => handleDelete(selected.id, selected.name)} disabled={deleting === selected.id}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-40 transition flex-shrink-0">
                <Trash2 className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-black">{modal === "add" ? "Add Website" : "Edit Website"}</h2>
              <button onClick={closeModal} className="text-black/30 hover:text-black transition">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Farfetch"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 placeholder-black/25" />
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">URL</label>
                <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://www.farfetch.com"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 placeholder-black/25" />
              </div>
              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-black/70">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded" />
                  Active
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-black/70">
                  <input type="checkbox" checked={form.is_hidden} onChange={(e) => setForm((f) => ({ ...f, is_hidden: e.target.checked }))}
                    className="h-4 w-4 rounded" />
                  Hidden from public
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 rounded-lg border border-black/15 py-2.5 text-sm text-black/60 hover:text-black transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
                  {saving
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <Save className="h-4 w-4" strokeWidth={1.8} />}
                  {modal === "add" ? "Add Website" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminShell>
  );
}
