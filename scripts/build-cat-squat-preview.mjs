import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Sixteen individually painted poses. Playback reverses them for the ascent.
// No optical flow, crossfades or blended silhouettes are used.
const source = resolve('assets/animation-sources/cat-squat-poses.png');
const output = resolve('public/previews');
const scratch = mkdtempSync(join(tmpdir(), 'go-squat-clean-'));
const ffmpeg = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
mkdirSync(output, { recursive: true });
try {
  const dimensions = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', source], { encoding: 'utf8' })).streams[0];
  if (dimensions.width !== 1254 || dimensions.height !== 1254) throw new Error('Unexpected source sheet dimensions');
  const edges = [0, 313, 627, 940, 1254];
  // Align the planted feet to the same baseline across the four source rows.
  const topPadding = [38, 37, 37, 55];
  for (let i = 0; i < 16; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const filter = `crop=${edges[col + 1] - edges[col]}:${edges[row + 1] - edges[row]}:${edges[col]}:${edges[row]},pad=400:400:42:${topPadding[row]}:white`;
    ffmpeg(['-i', source, '-vf', filter, '-frames:v', '1', join(scratch, `pose-${i}.png`)]);
  }
  const cycle = [...Array.from({ length: 16 }, (_, i) => i), ...Array.from({ length: 14 }, (_, i) => 14 - i)];
  cycle.forEach((pose, frame) => copyFileSync(join(scratch, `pose-${pose}.png`), join(scratch, `${String(frame).padStart(3, '0')}.png`)));
  ffmpeg(['-framerate', '10', '-i', join(scratch, '%03d.png'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-movflags', '+faststart', join(output, 'cat-squat.mp4')]);
  ffmpeg(['-framerate', '10', '-i', join(scratch, '%03d.png'), '-filter_complex', 'split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a', '-loop', '0', join(output, 'cat-squat.gif')]);
  console.log('Built clean squat preview: 16 painted poses, 30-pose cycle, 3 seconds, no blended frames.');
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
