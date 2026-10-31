"""Audit rendered video pixels and measured stationary anchors, without editing art."""
import json
import subprocess
from pathlib import Path
import numpy as np

count, max_center_error, improved = 0, 0., 0
for video in sorted(Path('public/training').glob('*/*.mp4')):
    measurements=json.loads(video.with_suffix('.alignment.json').read_text())
    assert len(measurements['frames'])==16, str(video)
    assert all(f['scale']==1 for f in measurements['frames']), f'Per-frame zoom: {video}'
    assert measurements['meanAnchorScoreAfter']+1e-9>=measurements['meanAnchorScoreBefore'], f'Unstable anchor: {video}'
    improved += measurements['meanAnchorScoreAfter']-measurements['meanAnchorScoreBefore']>.008
    raw=subprocess.check_output(['ffmpeg','-v','error','-threads','1','-i',str(video),'-vf',"select='eq(mod(n,3),0)*lte(n,45)'",'-fps_mode','vfr','-f','rawvideo','-pix_fmt','rgb24','-'])
    frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,400,400,3)
    assert len(frames)==16, str(video)
    bounds=[]
    for frame in frames:
        rgb=frame.astype(float)
        # H.264 chroma subsampling softens pale brown fur; include those edges.
        colored=(rgb.mean(axis=2)<234)&(rgb.max(axis=2)-rgb.min(axis=2)>16)
        y,x=np.nonzero(colored)
        assert len(x)>30,str(video)
        bounds.append([np.quantile(x,.003),np.quantile(y,.003),np.quantile(x,.997),np.quantile(y,.997)])
        fy,fx=np.nonzero(rgb.mean(axis=2)<234)
        assert fx.min()>=7 and fx.max()<=393 and fy.min()>=7 and fy.max()<=393,f'Clipped artwork: {video}'
    boxes=np.array(bounds)
    center=np.array([(boxes[:,0].min()+boxes[:,2].max())/2,(boxes[:,1].min()+boxes[:,3].max())/2])
    error=float(np.abs(center-200).max())
    assert error<=8,f'Off-center artwork: {video}: {center.tolist()}'
    max_center_error=max(max_center_error,error)
    count+=1
assert count==76,f'Expected 76 clips, found {count}'
assert improved>=10,'Stationary anchor registration must materially improve drifting clips'
print(f'PASS: {count} centered 400x400 clips; no per-frame zoom; no cropped artwork; {improved} clips have improved stationary anchors; maximum center error {max_center_error:.2f}px.')
