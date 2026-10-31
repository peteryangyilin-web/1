import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const sourceDir = resolve('assets/animation-sources/training');
const outputDir = resolve('public/training');
const ffmpeg = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
const force = process.argv.includes('--force');
const selected = process.argv.slice(2).filter(arg => arg !== '--force');
const allSources = readdirSync(sourceDir).filter(f => f.endsWith('.png'));
const sources = allSources.filter(f => !selected.length || selected.includes(f));
mkdirSync(outputDir, { recursive: true });
for (const file of sources) {
  const match = file.match(/^(female|male)-(cat|dog)-([a-z]+)\.png$/);
  if (!match) throw new Error(`Unexpected sprite filename: ${file}`);
  const [, gender, animal, motion] = match;
  const source = join(sourceDir, file), dir = join(outputDir, `${gender}-${animal}`);
  mkdirSync(dir, { recursive: true });
  const video = join(dir, `${motion}.mp4`), poster = join(dir, `${motion}.png`);
  if (!force && existsSync(video) && existsSync(poster) && statSync(video).size > 2000 && statSync(video).mtimeMs >= statSync(source).mtimeMs) continue;
  const scratch = mkdtempSync(join(tmpdir(), 'go-training-'));
  try {
    const { width, height } = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', source], { encoding: 'utf8' })).streams[0];
    if (width !== height || width < 1000) throw new Error(`Sprite sheet is not a high-resolution square: ${file}`);
    // Drawn rows can extend a few pixels beyond a mathematical quarter.
    // Separate at real white gutters so toes, ears and overhead weights stay whole.
    const sheetRows = execFileSync('magick', [source, '-colorspace', 'Gray', '-threshold', '88%', '-negate', '-scale', `1x${height}!`, '-depth', '8', 'gray:-']);
    const rowEdges = [0];
    for (let k = 1; k < 4; k++) {
      const center = k*height/4;
      const lo = Math.floor(center-height/16), hi = Math.ceil(center+height/16);
      const gaps = []; let gapStart = -1;
      for (let y = lo; y <= hi; y++) {
        if (sheetRows[y] === 0) {
          if (gapStart < 0) gapStart = y;
        } else if (gapStart >= 0) {
          if (y-gapStart >= 3) gaps.push([gapStart,y-1]);
          gapStart = -1;
        }
      }
      if (gapStart >= 0 && hi-gapStart >= 3) gaps.push([gapStart,hi]);
      gaps.sort((a,b) => Math.abs((a[0]+a[1])/2-center)-Math.abs((b[0]+b[1])/2-center));
      rowEdges.push(gaps.length ? Math.floor((gaps[0][0]+gaps[0][1])/2) : Math.floor(center));
    }
    rowEdges.push(height);
    const sourceScale = Math.min(1,340/Math.max(...rowEdges.slice(1).map((edge,i)=>edge-rowEdges[i])));
    for (let i = 0; i < 16; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const x = Math.floor(col * width / 4), y = rowEdges[row];
      const w = Math.floor((col + 1) * width / 4) - x, h = rowEdges[row+1]-y;
      const tile = join(scratch, 'tile.png');
      ffmpeg(['-i', source, '-vf', `crop=${w}:${h}:${x}:${y}`, '-frames:v', '1', tile]);
      // Find the main painted row band. This discards fragments crossing a
      // sprite-cell boundary without mixing, warping or repainting any pose.
      const rows = execFileSync('magick', [tile, '-colorspace', 'Gray', '-threshold', '88%', '-negate', '-scale', `1x${h}!`, '-depth', '8', 'gray:-']);
      const bands = [];
      let start = -1, end = -1, score = 0;
      for (let y = 0; y < rows.length; y++) {
        if (rows[y] >= 2) {
          if (start < 0) start = y;
          end = y; score += rows[y];
        } else if (start >= 0 && y - end >= 8) {
          bands.push({ start, end, score }); start = -1; score = 0;
        }
      }
      if (start >= 0) bands.push({ start, end, score });
      const main = bands.sort((a,b) => b.score-a.score)[0];
      if (!main || main.end-main.start < 25) throw new Error(`Empty or invalid pose ${file}:${i}`);
      const cropTop = Math.max(0, main.start-3);
      const cropBottom = Math.min(h, main.end+4);
      const bottom = main.end-cropTop+1;
      const scaledWidth = Math.round(w*sourceScale), scaledHeight = Math.round((cropBottom-cropTop)*sourceScale);
      const scaledBottom = Math.round(bottom*sourceScale);
      ffmpeg(['-i', tile, '-vf', `crop=${w}:${cropBottom-cropTop}:0:${cropTop},scale=${scaledWidth}:${scaledHeight}:flags=lanczos,pad=400:400:${Math.floor((400-scaledWidth)/2)}:${360-scaledBottom}:white`, '-frames:v', '1', join(scratch, `pose-${i}.png`)]);
    }
    const cycle = [...Array.from({ length: 16 }, (_, i) => i), ...Array.from({ length: 14 }, (_, i) => 14-i)];
    cycle.forEach((pose, frame) => copyFileSync(join(scratch, `pose-${pose}.png`), join(scratch, `${String(frame).padStart(3, '0')}.png`)));
    // Discrete painted poses only: never optical flow, crossfades or silhouette blending.
    ffmpeg(['-framerate', '10', '-i', join(scratch, '%03d.png'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', video]);
    copyFileSync(join(scratch, 'pose-0.png'), poster);
    console.log(`${gender}-${animal}/${motion}: 16 painted poses, 3-second loop`);
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}
const manifest = allSources.map(file => {
  const [,gender,animal,motion] = file.match(/^(female|male)-(cat|dog)-([a-z]+)\.png$/);
  return { avatar:`${gender}-${animal}`, motion, poses:16, duration:3 };
});
writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');

// Bundle content versions so updated clips and posters get fresh browser URLs.
const versions = Object.fromEntries(manifest.map(({ avatar, motion }) => {
  const base = join(outputDir, avatar, motion);
  const version = createHash('sha256').update(readFileSync(`${base}.mp4`)).update(readFileSync(`${base}.png`)).digest('hex').slice(0,12);
  return [`${avatar}/${motion}`, version];
}));
writeFileSync(resolve('src/trainingMediaVersions.js'), '// Generated by npm run generate:training.\nexport const TRAINING_MEDIA_VERSIONS = '+JSON.stringify(versions, null, 2)+';\n');
