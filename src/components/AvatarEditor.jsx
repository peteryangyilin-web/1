import React, { useEffect, useRef, useState } from "react";
import { Upload, X, Check } from "lucide-react";

export default function AvatarEditor({ value, onSave, onClose }) {
  const dialog = useRef(null), canvas = useRef(null), upload = useRef(null);
  const [source, setSource] = useState(value || "");
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1), [x, setX] = useState(50), [y, setY] = useState(50);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    if (!source) { setImage(null); return; }
    let active = true;
    const photo = new Image();
    photo.onload = () => { if (active) setImage(photo); };
    photo.onerror = () => { if (active) { setImage(null); setError("We couldn’t open this image. Try a JPG, PNG, WebP or GIF."); } };
    photo.src = source;
    return () => { active = false; if (source.startsWith("blob:")) URL.revokeObjectURL(source); };
  }, [source]);
  useEffect(() => {
    if (!image || !canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    ctx.fillStyle = "#f0f8f3";
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(image, (image.naturalWidth - side) * x / 100, (image.naturalHeight - side) * y / 100, side, side, 0, 0, 256, 256);
  }, [image, zoom, x, y]);
  return <dialog ref={dialog} className="avatar-editor" aria-labelledby="avatar-editor-title" onCancel={onClose} onKeyDown={e => { if (e.key === "Escape" || e.key === "Tab") e.stopPropagation(); }} onClick={e => { if (e.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="avatar-editor-top"><span className="eyebrow">MAKE IT YOURS</span><button type="button" className="icon-button" aria-label="Close avatar editor" onClick={onClose}><X size={18} /></button></div>
    <h2 id="avatar-editor-title">Create your own avatar?</h2>
    <p>You, your pet, or something you love. Give your GO character a little personality.</p>
    <input ref={upload} type="file" className="sr-only" aria-label="Upload avatar photo" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => {
      const file = e.target.files?.[0]; e.target.value = "";
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { setError("Choose a JPG, PNG, WebP or GIF image."); return; }
      if (file.size > 10 * 1024 * 1024) { setError("Choose an image smaller than 10 MB."); return; }
      setError(""); setImage(null); setZoom(1); setX(50); setY(50); setSource(URL.createObjectURL(file));
    }} />
    <div className="avatar-crop-preview">{image ? <canvas ref={canvas} width="256" height="256" aria-label="Cropped avatar preview" role="img" /> : <Upload size={34} strokeWidth={1.3} />}</div>
    <button type="button" className="secondary-button avatar-upload" onClick={() => upload.current.click()}><Upload size={15} />{image ? "Choose another photo" : "Upload a photo"}</button>
    <small className="avatar-file-hint">JPG, PNG, WebP or GIF · up to 10 MB</small>
    {image && <div className="avatar-crop-controls">
      <label>Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
      <label>Horizontal position<input type="range" min="0" max="100" value={x} onChange={e => setX(Number(e.target.value))} /></label>
      <label>Vertical position<input type="range" min="0" max="100" value={y} onChange={e => setY(Number(e.target.value))} /></label>
    </div>}
    {error && <p className="avatar-error" role="alert">{error}</p>}
    <p className="avatar-privacy">Crop your photo into a character avatar. Your photo is processed on this device.</p>
    <div className="avatar-editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="button" className="primary-button" disabled={!image} onClick={() => { try { onSave(canvas.current.toDataURL("image/jpeg", .85)); } catch { setError("We couldn’t save this image. Please try another photo."); } }}><Check size={15} /> Use this avatar</button></div>
  </dialog>;
}
