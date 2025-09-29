"use client";
import React, { useEffect, useMemo, useState } from "react";
import { init } from "@contentful/app-sdk";
import type { KnownAppSDK } from "@contentful/app-sdk";
import styles from "./editor.module.css";
import { ActionCreators } from "redux-undo";
import { useDispatch, useSelector } from "react-redux";
import { addBlock, LayoutBlock, removeBlock, reorderBlocks, RootState, setBlocks, updateBlock } from "../../lib/store";

function DraggableBlock({ block, index, onRemove }: { block: LayoutBlock; index: number; onRemove: () => void }) {
  const dispatch = useDispatch();
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(index));
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const from = Number(e.dataTransfer.getData("text/plain"));
        const to = index;
        const event = new CustomEvent("dnd-reorder", { detail: { from, to } });
        window.dispatchEvent(event);
      }}
      style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8, borderRadius: 8, background: "#fff" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>{block.type}</strong>
          <input
            placeholder="entryId (optional)"
            value={block.entryId ?? ""}
            onChange={(e) => dispatch(updateBlock({ ...block, entryId: e.target.value }))}
            style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }}
          />
        </div>
        <button onClick={onRemove}>Remove</button>
      </div>
      {/* Inline content editors for quick testing without linked entries */}
      {block.type === "hero" && (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          <input placeholder="Heading" value={block as any && (block as any).data?.heading || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, heading: e.target.value } }))} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          <input placeholder="Subtitle" value={block as any && (block as any).data?.subtitle || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, subtitle: e.target.value } }))} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="CTA Label" value={block as any && (block as any).data?.ctaLabel || ""}
              onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, ctaLabel: e.target.value } }))} style={{ flex: 1, padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
            <input placeholder="CTA Href" value={block as any && (block as any).data?.ctaHref || ""}
              onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, ctaHref: e.target.value } }))} style={{ flex: 1, padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          </div>
          <input placeholder="Background Image URL"
            value={block as any && (block as any).data?.backgroundImage?.url || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, backgroundImage: { url: e.target.value } } }))}
            style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
        </div>
      )}
      {block.type === "twoColumn" && (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          <input placeholder="Left Heading" value={block as any && (block as any).data?.leftHeading || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, leftHeading: e.target.value } }))} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          <input placeholder="Left Subtitle" value={block as any && (block as any).data?.leftSubtitle || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, leftSubtitle: e.target.value } }))} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Left CTA Label" value={block as any && (block as any).data?.leftCtaLabel || ""}
              onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, leftCtaLabel: e.target.value } }))} style={{ flex: 1, padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
            <input placeholder="Left CTA Href" value={block as any && (block as any).data?.leftCtaHref || ""}
              onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, leftCtaHref: e.target.value } }))} style={{ flex: 1, padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          </div>
          <input placeholder="Right Image URL" value={block as any && (block as any).data?.rightImage?.url || ""}
            onChange={(e) => dispatch(updateBlock({ ...block, data: { ...(block as any).data, rightImage: { url: e.target.value } } }))} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
        </div>
      )}
      {block.type === "imageGrid" && (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {[0,1,2,3].map((i) => (
            <input key={i} placeholder={`Image ${i+1} URL`} value={((block as any).data?.images?.[i]?.url) || ""}
              onChange={(e) => {
                const images = [0,1,2,3].map((j) => ({ url: ((block as any).data?.images?.[j]?.url) || "" }));
                images[i].url = e.target.value;
                dispatch(updateBlock({ ...block, data: { ...(block as any).data, images } }));
              }} style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContentfulAppPage() {
  const dispatch = useDispatch();
  const blocks = useSelector((s: RootState) => s.layout.present.blocks);
  const [sdk, setSdk] = useState<KnownAppSDK | null>(null);
  const [isFramed, setIsFramed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return window.self !== window.top; } catch { return true; }
  });
  const [entrySlug, setEntrySlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const framed = window.self !== window.top;
      if (framed !== isFramed) setIsFramed(framed);
    } catch {
      if (!isFramed) setIsFramed(true);
    }
  }, [isFramed]);

  useEffect(() => {
    if (!isFramed) return; // Running locally, outside of Contentful iframe
    try {
      init((appSdk) => {
        setSdk(appSdk as any);
        (appSdk as any).window?.startAutoResizer?.();
        const field = (appSdk as any).entry?.fields?.["layoutConfig"] ?? (appSdk as any).field;
        const slugField = (appSdk as any).entry?.fields?.["slug"];
        try { setEntrySlug(slugField?.getValue?.() ?? null); } catch {}
        if (!field) return;
        try {
          const value = field.getValue();
          if (Array.isArray(value)) {
            dispatch(setBlocks(value as LayoutBlock[]));
          }
        } catch {}

        const detach = field.onValueChanged((val: any) => {
          if (Array.isArray(val)) {
            dispatch(setBlocks(val as LayoutBlock[]));
          }
        });

        return () => {
          detach && detach();
        };
      });
    } catch {
      // ignore init errors when not in Contentful
    }
  }, [dispatch, isFramed]);

  useEffect(() => {
    const handler = (e: any) => {
      dispatch(reorderBlocks({ fromIndex: e.detail.from, toIndex: e.detail.to }));
    };
    window.addEventListener("dnd-reorder", handler as any);
    return () => window.removeEventListener("dnd-reorder", handler as any);
  }, [dispatch]);

  useEffect(() => {
    if (!sdk) return;
    const field = (sdk as any).entry?.fields?.["layoutConfig"] ?? (sdk as any).field;
    if (!field) return;
    field.setValue(blocks);
    if (isFramed) showToast("Saved");
  }, [blocks, sdk]);

  const add = (type: LayoutBlock["type"]) => {
    const id = `${type}-${Date.now()}`;
    dispatch(addBlock({ id, type }));
    showToast(`${type} added`);
  };

  return (
    <div className={`container section ${styles.wrapper}`}>
      {!isFramed && !isFullscreen && (
        <div className="btn" style={{ marginBottom: 12, background: "#fffbeb", borderColor: "#fde68a" }}>
          Local preview: SDK disabled. Open inside Contentful (fullscreen) to save to entry.
          <button onClick={toggleFullscreen} style={{ marginLeft: 8, padding: "4px 8px", fontSize: "12px" }}>Go Fullscreen</button>
        </div>
      )}
      <div className={styles.toolbar}>
        <h2>Landing Page Layout Builder</h2>
        {!isFramed && (
          <button className="btn" onClick={toggleFullscreen} style={{ marginRight: 8 }}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        )}
        <div className={styles.undoRedo}>
          <button className="btn" onClick={() => dispatch(ActionCreators.undo() as any)}>Undo</button>
          <button className="btn" onClick={() => dispatch(ActionCreators.redo() as any)}>Redo</button>
          <button
            className="btn btnPrimary"
            onClick={async () => {
              const slug = entrySlug || "page-1";
              try {
                await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, secret: (window as any).__REVALIDATE_SECRET__ }) });
              } catch {}
              window.open(`/landing/${slug}`, "_blank");
            }}
          >Preview</button>
          <button
            className="btn"
            onClick={async () => {
              const slug = entrySlug || "page-1";
              try {
                await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, secret: (window as any).__REVALIDATE_SECRET__ }) });
                showToast("Revalidated");
              } catch {}
            }}
          >Revalidate</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button className="btn btnPrimary" onClick={() => add("hero")}>Add Hero</button>
        <button className="btn" onClick={() => add("twoColumn")}>Add Two Column</button>
        <button className="btn" onClick={() => add("imageGrid")}>Add 2x2 Image Grid</button>
      </div>

      <div className={styles.list}>
        {blocks.map((b, idx) => (
          <div key={b.id} className={styles.item}>
            <div className={styles.row}>
              <span className={styles.handle}>⠿</span>
              <DraggableBlock block={b} index={idx} onRemove={() => dispatch(removeBlock(b.id))} />
            </div>
          </div>
        ))}
      </div>
      {toast && (
        <div style={{ position: "fixed", right: 16, bottom: 16, background: "#111827", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
