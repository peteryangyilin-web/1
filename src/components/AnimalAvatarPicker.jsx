import React, { useEffect, useRef, useState } from "react";
import { Check, X, ArrowUpRight } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import "./animalAvatarPicker.css";

export const AVATAR_CHARACTERS = [
  { id: "shiba", name: "Shiba Inu", breed: "柴犬", description: "Bright-eyed. Curly-tailed. Ready to GO.", label: "THE SUNNY ONE" },
  { id: "selkirk", name: "Selkirk Rex", breed: "塞尔凯克卷毛猫", description: "Soft curls. Quiet confidence. Your own pace.", label: "THE CURLY ONE" },
];
export const characterName = species => AVATAR_CHARACTERS.find(item => item.id === species)?.name || "Shiba Inu";

export default function AnimalAvatarPicker({ value, gender = "male", onSelect, onClose }) {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(value || "shiba");
  useEffect(() => { dialog.current.showModal(); return () => dialog.current?.close(); }, []);
  return <dialog ref={dialog} className="animal-picker" aria-labelledby="animal-picker-title" onCancel={onClose}
    onKeyDown={event => { if (["Escape", "Tab"].includes(event.key)) event.stopPropagation(); }}
    onClick={event => { if (event.target === dialog.current) { const box = dialog.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}>
    <div className="animal-picker-top"><span className="eyebrow">A LITTLE CHARACTER. A LOT OF YOU.</span><button type="button" className="icon-button" aria-label="Close avatar selection" onClick={onClose}><X size={19} /></button></div>
    <h2 id="animal-picker-title">Select your avatar</h2>
    <p>A full-body friend for your fitness journey. Who feels like you?</p>
    <div className="animal-picker-options" role="group" aria-label="Animal avatars">
      {AVATAR_CHARACTERS.map(character => <button type="button" key={character.id} className={`animal-picker-card ${selected === character.id ? "selected" : ""}`} aria-pressed={selected === character.id} aria-label={`Select ${character.name}`} onClick={() => setSelected(character.id)}>
        <span className="animal-picker-badge">{character.label}<span className="animal-picker-check">{selected === character.id && <Check size={13} />}</span></span>
        <AnimalAvatar gender={gender} species={character.id} />
        <strong>{character.name}</strong><span className="animal-picker-breed">{character.breed}</span><p>{character.description}</p>
      </button>)}
    </div>
    <div className="animal-picker-footer"><span>Your character follows you into Lean, Athletic and Strong.</span><div><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="button" className="primary-button" onClick={() => onSelect(selected)}>Use this avatar <ArrowUpRight size={15} /></button></div></div>
  </dialog>;
}
