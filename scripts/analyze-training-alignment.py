"""Measure frame registration and shared framing; never edits or writes images."""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
from scipy.optimize import minimize

folder, motion = Path(sys.argv[1]), sys.argv[2]
images = [np.asarray(Image.open(folder / f'pose-{i}.png').convert('RGB'), dtype=float) for i in range(16)]
inks = [gaussian_filter(np.where(im.mean(axis=2) < 240, 1-im.mean(axis=2)/255, 0), 1.2)[::3, ::3] for im in images]

def bounds(im, colored=False):
    mask = (im.mean(axis=2) < 234)
    if colored:
        mask &= (im.max(axis=2)-im.min(axis=2) > 20)
    y, x = np.nonzero(mask)
    if len(x) < 30:
        if colored: return bounds(im, False)
        raise ValueError('Empty animation pose')
    q = .003 if colored else 0
    return np.array([np.quantile(x,q), np.quantile(y,q), np.quantile(x,1-q), np.quantile(y,1-q)])

box = bounds(images[0])
if motion == 'walk':
    y0, y1 = box[1], box[1]+.34*(box[3]-box[1])
else:
    y0, y1 = box[3]-38, min(390,box[3]+7)
x0, x1 = max(10,box[0]-18), min(390,box[2]+18)
yy, xx = np.mgrid[int(y0):int(y1):3, int(x0):int(x1):3]
x, y = xx.ravel(), yy.ravel()
ax, ay = (x0+x1)/2, (y0+y1)/2
reference = map_coordinates(inks[0], [y/3,x/3], order=1, mode='constant')
reference_norm = np.linalg.norm(reference)+1e-10

def correlation(index, params):
    dx, dy = params
    scale = 1.0
    sample = map_coordinates(inks[index], [(ay+(y-ay-dy)/scale)/3, (ax+(x-ax-dx)/scale)/3], order=1, mode='constant')
    return float(np.dot(reference,sample)/(reference_norm*(np.linalg.norm(sample)+1e-10)))

transforms = []
for i in range(16):
    identity = np.array([0.,0.])
    before = correlation(i,identity)
    if i == 0:
        best, after = identity, before
    else:
        def cost(params):
            dx,dy=params
            return -correlation(i,params)+.002*(dx/36)**2+.004*(dy/12)**2
        candidates = [np.array([float(dx),float(dy)]) for dx in range(-30,31,6) for dy in [-6,0,6]]
        seed = min(candidates,key=cost)
        result = minimize(cost,seed,method='Powell',bounds=[(-36,36),(-12,12)],options={'maxiter':24,'maxfev':180,'xtol':.12,'ftol':.0001})
        best = result.x
        after = correlation(i,best)
        if after < .48 or after-before < .008:
            best, after = identity, before
    dx,dy = (float(v) for v in best)
    scale = 1.0
    transforms.append({'dx':dx,'dy':dy,'scale':scale,'before':before,'after':after})

colored_boxes, all_boxes = [], []
for image, params in zip(images,transforms):
    for colored, output in [(True,colored_boxes),(False,all_boxes)]:
        b = bounds(image,colored)
        s,dx,dy = params['scale'],params['dx'],params['dy']
        b[[0,2]]=ax+s*(b[[0,2]]-ax)+dx
        b[[1,3]]=ay+s*(b[[1,3]]-ay)+dy
        output.append(b)

def union(boxes):
    b=np.array(boxes)
    return np.array([b[:,0].min(),b[:,1].min(),b[:,2].max(),b[:,3].max()])
character, artwork = union(colored_boxes), union(all_boxes)
cx, cy = (character[0]+character[2])/2, (character[1]+character[3])/2
extent=max(artwork[2]-cx,cx-artwork[0],artwork[3]-cy,cy-artwork[1])
framing=min(1.5,304/max(character[2]-character[0],character[3]-character[1]),186/max(extent,1))
frames=[]
for params in transforms:
    s,dx,dy=params['scale'],params['dx'],params['dy']
    frames.append({**params,'renderScale':s*framing,'offsetX':200+((1-s)*ax+dx-cx)*framing,'offsetY':200+((1-s)*ay+dy-cy)*framing})
print(json.dumps({'frames':frames,'characterCenter':[200,200],'framingScale':framing,'meanAnchorScoreBefore':float(np.mean([f['before'] for f in transforms])),'meanAnchorScoreAfter':float(np.mean([f['after'] for f in transforms]))}))
