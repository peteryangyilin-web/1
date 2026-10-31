import { TRAINING_MEDIA_VERSIONS } from "./trainingMediaVersions.js";

// Walking-based activities share the same gait at the activity's own tempo.
const WALKING_DEMOS = new Set(["walk", "warmup", "cardio", "cooldown"]);

export function resolveTrainingAvatar(profile = {}) {
  const gender = profile.gender === "female" ? "female" : "male";
  const animal = profile.avatarCharacter === "selkirk" ? "cat" : "dog";
  return {
    key: `${gender}-${animal}`,
    gender,
    animal,
    species: animal === "cat" ? "selkirk" : "shiba",
    label: `${gender === "female" ? "Female" : "Male"} ${animal === "cat" ? "cat" : "Shiba Inu"}`,
  };
}

export function getTrainingMedia(profile, demo) {
  if (!demo) return null;
  const avatar = resolveTrainingAvatar(profile);
  const motion = WALKING_DEMOS.has(demo.id) ? "walk" : demo.id;
  const base = `/training/${avatar.key}/${motion}`;
  const version = TRAINING_MEDIA_VERSIONS[`${avatar.key}/${motion}`];
  return { ...avatar, motion, video: `${base}.mp4?v=${version}`, poster: `${base}.png?v=${version}`, playbackRate: WALKING_DEMOS.has(demo.id) ? 3 / demo.duration : 1 };
}
