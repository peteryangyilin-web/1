import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolveTrainingAvatar, getTrainingMedia } from '../src/trainingAvatars.js';
import { EXERCISE_DEMOS } from '../src/exerciseDemos.js';

test('saved gender and animal select the matching training character', () => {
  for (const gender of ['female', 'male']) for (const [species, animal] of [['selkirk', 'cat'], ['shiba', 'dog']]) {
    for (const bodyType of ['lean', 'athletic', 'strong']) {
      const avatar = resolveTrainingAvatar({ gender, avatarCharacter:species, bodyType });
      assert.equal(avatar.key, `${gender}-${animal}`);
      assert.equal(avatar.species, species);
      assert.equal(avatar.gender, gender);
    }
  }
  assert.equal(resolveTrainingAvatar().key, 'male-dog');
  assert.equal(resolveTrainingAvatar({ gender:'unexpected', avatarCharacter:'unexpected' }).key, 'male-dog');
  assert.equal(getTrainingMedia({}, null), null);
});

test('all 22 training movements have playable media for all four avatar combinations', () => {
  const unique = new Set();
  for (const gender of ['female','male']) for (const avatarCharacter of ['selkirk','shiba']) {
    for (const demo of Object.values(EXERCISE_DEMOS)) {
      const media = getTrainingMedia({gender, avatarCharacter}, demo);
      for (const asset of [media.video, media.poster]) assert.ok(existsSync(new URL('../public'+asset, import.meta.url)), `Missing ${asset}`);
      const video = readFileSync(new URL('../public'+media.video, import.meta.url));
      assert.equal(video.subarray(4,8).toString(), 'ftyp');
      const poster = readFileSync(new URL('../public'+media.poster, import.meta.url));
      const version=createHash('sha256').update(video).update(poster).digest('hex').slice(0,12);
      for(const asset of [media.video,media.poster]) assert.equal(new URL(asset,'https://go.test').searchParams.get('v'),version,'Training must request the current animation content');
      assert.equal(poster.readUInt32BE(16),400);
      assert.equal(poster.readUInt32BE(20),400);
      assert.ok(media.playbackRate>0 && media.playbackRate<2);
      unique.add(media.video);
    }
  }
  assert.equal(unique.size,76);
});

test('walking activities use their own tempo and strength exercises retain distinct choreography', () => {
  const profile={gender:'female',avatarCharacter:'selkirk'};
  for (const id of ['walk','warmup','cardio','cooldown']) {
    const media=getTrainingMedia(profile,EXERCISE_DEMOS[id]);
    assert.equal(media.motion,'walk');
    assert.equal(media.playbackRate,3/EXERCISE_DEMOS[id].duration);
  }
  const hashes=new Set();
  for (const gender of ['female','male']) for (const avatarCharacter of ['selkirk','shiba']) {
    for (const id of ['bench','incline','row','dumbbellrow','squat','pushup']) {
      const {video}=getTrainingMedia({gender,avatarCharacter},EXERCISE_DEMOS[id]);
      hashes.add(createHash('sha256').update(readFileSync(new URL('../public'+video,import.meta.url))).digest('hex'));
    }
  }
  assert.equal(hashes.size,24,'Distinct characters and exercises must not silently share the same old cat movie');
});
