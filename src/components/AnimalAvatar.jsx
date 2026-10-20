import React, { useId } from "react";
import "./animalAvatar.css";

const BUILDS = {
  lean: { chest: 27, waist: 21, hip: 25, leg: 13, arm: 10, definition: .32 },
  athletic: { chest: 38, waist: 25, hip: 29, leg: 18, arm: 15, definition: .55 },
  strong: { chest: 49, waist: 29, hip: 34, leg: 24, arm: 21, definition: .75 },
};

/** A whole animal character. Human-like posture, animal anatomy from ears to paws. */
export default function AnimalAvatar({ species = "shiba", build = "athletic", className = "" }) {
  const unique = useId().replace(/:/g, "");
  const id = name => `animal-${unique}-${name}`;
  const cat = species === "selkirk";
  const shape = BUILDS[build] || BUILDS.athletic;
  const coat = cat ? "#c5b7a4" : "#d99145";
  const coatDark = cat ? "#a79681" : "#bd7131";
  const cream = cat ? "#f4efe6" : "#fff3df";
  const { chest, waist, hip } = shape;
  const torso = `M${120-chest} 132Q120 116 ${120+chest} 132Q${125+chest} 151 ${116+chest} 166L${120+waist} 195Q${125+waist} 214 ${120+hip} 225Q120 237 ${120-hip} 225Q${115-waist} 214 ${120-waist} 195L${124-chest} 166Q${115-chest} 151 ${120-chest} 132Z`;
  const belly = `M${120-chest*.63} 140Q120 132 ${120+chest*.63} 140Q${123+chest*.62} 158 ${120+waist*.7} 184L${120+waist*.6} 210Q120 223 ${120-waist*.6} 210L${120-waist*.7} 184Q${117-chest*.62} 158 ${120-chest*.63} 140Z`;
  const muscle = cat ? "#8d7965" : "#a7642c";
  const armLeft = 123-chest, armRight = 117+chest;
  const leftLeg = build === "strong" ? 96 : build === "athletic" ? 99 : 102;
  const rightLeg = 240-leftLeg;
  const paw = build === "strong" ? 19 : build === "athletic" ? 16 : 14;
  return <svg className={`animal-avatar animal-avatar-${cat ? "selkirk" : "shiba"} animal-avatar-${build} ${className}`} viewBox="0 0 240 300" data-species={species} data-build={build} role="img" aria-label={`${cat ? "Selkirk Rex cat" : "Shiba Inu dog"} ${build} full-body avatar`}>
    <defs>
      <linearGradient id={id("coat")} x1=".2" y1="0" x2=".9" y2="1"><stop stopColor={cat ? "#e2d9ca" : "#efb46f"} /><stop offset="1" stopColor={coat} /></linearGradient>
      <linearGradient id={id("belly")} x1="0" y1="0" x2="0" y2="1"><stop stopColor={cream} /><stop offset="1" stopColor={cat ? "#e8dfd0" : "#f5d6aa"} /></linearGradient>
      <radialGradient id={id("aura")}><stop stopColor={cat ? "#d9eef7" : "#d9eee1"} stopOpacity=".8" /><stop offset="1" stopColor={cat ? "#e9f5fb" : "#edf8f0"} stopOpacity="0" /></radialGradient>
      <clipPath id={id("torso")}><path d={torso} /></clipPath>
      <clipPath id={id("face")}><path d={cat ? "M70 79Q70 43 103 42Q120 35 139 44Q170 44 171 80Q179 106 152 122Q120 139 88 122Q60 108 70 79Z" : "M75 72Q85 42 120 43Q157 43 167 75L175 97Q170 121 145 130Q120 142 95 129Q72 119 65 97Z"} /></clipPath>
    </defs>
    <circle cx="120" cy="153" r="112" fill={`url(#${id("aura")})`} />
    <ellipse cx="121" cy="279" rx={cat ? "64" : "61"} ry="9" fill={cat ? "#1c7590" : "#2c7650"} opacity=".09" />
    <g className="animal-character">
      {/* A recognisable animal tail grows out of the hips, behind the body. */}
      <g className="animal-tail" fill="none" strokeLinecap="round">
        {cat ? <><path d="M151 213Q196 238 196 190Q196 163 177 168Q164 174 180 184" stroke={coatDark} strokeWidth="20" /><path d="M156 212Q192 231 192 192" stroke={coat} strokeWidth="12" /></> : <><path d="M151 202Q190 208 190 180Q188 155 169 163Q151 169 165 182" stroke={coatDark} strokeWidth="24" /><path d="M155 200Q184 205 184 181Q183 165 171 170" stroke="#f5c486" strokeWidth="14" /><path d="M170 170Q159 174 165 182" stroke={cream} strokeWidth="13" /></>}
      </g>
      <g className="animal-body" data-shoulder-width={chest * 2} data-muscle-definition={shape.definition}>
        {/* One continuous fur-covered body, with distinct shoulder and waist proportions. */}
        {[leftLeg, rightLeg].map((center, side) => <g key={side}>
          <path d={`M${center-shape.leg} 211Q${center-shape.leg-2} 231 ${center-shape.leg*.7} 251L${center-shape.leg*.6} 263Q${center} 275 ${center+shape.leg*.7} 262L${center+shape.leg*.65} 250Q${center+shape.leg} 227 ${center+shape.leg} 211Z`} fill={`url(#${id("coat")})`} />
          {build !== "lean" && <path d={`M${center-3} 229Q${center+shape.leg*.45} 236 ${center+shape.leg*.4} 249M${center-shape.leg*.55} 247Q${center-6} 252 ${center-5} 257`} fill="none" stroke={muscle} strokeOpacity={shape.definition*.6} strokeWidth={build === "strong" ? 2.3 : 1.6} strokeLinecap="round" />}
          <path d={`M${center-paw} 260Q${center-paw+3} 251 ${center} 254Q${center+paw-2} 252 ${center+paw} 263L${center+paw} 270Q${center+paw-3} 278 ${center} 276Q${center-paw-3} 278 ${center-paw} 268Z`} fill={cream} />
          <path d={`M${center-6} 267V274M${center+4} 267V275`} stroke={coatDark} strokeOpacity=".4" strokeWidth="1.5" strokeLinecap="round" />
        </g>)}
        <path className="animal-torso" d={torso} fill={`url(#${id("coat")})`} />
        <path d={belly} fill={`url(#${id("belly")})`} />
        <g className="animal-muscle-contours" clipPath={`url(#${id("torso")})`} fill="none" stroke={muscle} strokeOpacity={shape.definition} strokeWidth={build === "strong" ? 2.7 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          {/* Paired pectorals and a narrow sternum retain a natural fur palette. */}
          <path d={`M${120-chest*.78} 149Q${120-chest*.4} 140 116 148M124 148Q${120+chest*.4} 140 ${120+chest*.78} 149`} />
          <path d={`M${120-chest*.74} 160Q${120-chest*.4} 174 116 165M124 165Q${120+chest*.4} 174 ${120+chest*.74} 160`} />
          <path d={`M120 146V${build === "lean" ? 163 : 169}`} opacity=".65" />
          {build !== "lean" && <>
            <path d={`M${120-chest*.62} 173L${120-waist*.8} 190M${120+chest*.62} 173L${120+waist*.8} 190`} opacity=".65" />
            {[178, 190, 202].map((y, index) => <g key={y}>
              <path d={`M116 ${y}Q${120-waist*.65} ${y-4} ${120-waist*.6} ${y+2}Q${120-waist*.65} ${y+9} 116 ${y+7}M124 ${y}Q${120+waist*.65} ${y-4} ${120+waist*.6} ${y+2}Q${120+waist*.65} ${y+9} 124 ${y+7}`} fill={muscle} fillOpacity={build === "strong" ? .09 : .04} strokeOpacity={index === 2 ? shape.definition*.65 : shape.definition} />
            </g>)}
            <path d="M120 177V210" opacity=".5" strokeWidth="1.4" />
          </>}
          <path d={`M${120-waist*.82} 194Q${120-waist*.65} 205 ${120-waist*.4} 213M${120+waist*.82} 194Q${120+waist*.65} 205 ${120+waist*.4} 213`} opacity=".45" />
        </g>
        {/* Animal forelimbs, with visible deltoids and biceps on stronger builds. */}
        {build === "strong" ? <>
          <path d={`M${armLeft} 145Q53 156 60 178L80 197M${armRight} 145Q187 156 180 178L160 197`} stroke={coatDark} strokeWidth={shape.arm*1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${armLeft+2} 143Q58 157 65 175L82 192M${armRight-2} 143Q182 157 175 175L158 192`} stroke={`url(#${id("coat")})`} strokeWidth={shape.arm*1.65} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M67 143Q52 157 64 166M63 173Q70 169 77 177M173 143Q188 157 176 166M177 173Q170 169 163 177" fill="none" stroke={muscle} strokeOpacity=".65" strokeWidth="2.7" strokeLinecap="round" />
          <ellipse cx="83" cy="196" rx="14" ry="15" fill={cream} transform="rotate(-25 83 196)" /><ellipse cx="157" cy="196" rx="14" ry="15" fill={cream} transform="rotate(25 157 196)" />
          <path d="M77 198L84 203M156 203L163 198" stroke={coatDark} strokeWidth="1.5" opacity=".4" />
        </> : <>
          <path d={`M${armLeft} 144Q${armLeft-10} 162 ${armLeft-14} 188L${armLeft-17} 210M${armRight} 144Q${armRight+10} 162 ${armRight+14} 188L${armRight+17} 210`} stroke={coatDark} strokeWidth={shape.arm*1.9} fill="none" strokeLinecap="round" />
          <path d={`M${armLeft+1} 142Q${armLeft-6} 162 ${armLeft-10} 187L${armLeft-13} 206M${armRight-1} 142Q${armRight+6} 162 ${armRight+10} 187L${armRight+13} 206`} stroke={`url(#${id("coat")})`} strokeWidth={shape.arm*1.6} fill="none" strokeLinecap="round" />
          {build === "athletic" && <path d={`M${armLeft-5} 148Q${armLeft-14} 158 ${armLeft-8} 166M${armLeft-7} 173Q${armLeft-13} 177 ${armLeft-11} 185M${armRight+5} 148Q${armRight+14} 158 ${armRight+8} 166M${armRight+7} 173Q${armRight+13} 177 ${armRight+11} 185`} fill="none" stroke={muscle} strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />}
          <ellipse cx={armLeft-15} cy="211" rx={build === "lean" ? 10 : 12} ry="15" fill={cream} /><ellipse cx={armRight+15} cy="211" rx={build === "lean" ? 10 : 12} ry="15" fill={cream} />
          <path d={`M${armLeft-19} 215V222M${armLeft-12} 215V223M${armRight+12} 215V223M${armRight+19} 215V222`} stroke={coatDark} strokeWidth="1.4" opacity=".4" strokeLinecap="round" />
        </>}
        <path d="M94 114L90 122L97 125L96 133L105 132L109 142L119 136L130 142L135 132L144 134L143 125L151 121L145 113Z" fill={cream} />
      </g>
      {/* Species-specific animal face and ears, in the same illustrated body. */}
      {cat ? <>
        <path d="M80 72Q62 31 74 28Q97 28 105 52M135 52Q146 27 167 28Q176 32 160 73" fill={coatDark} />
        <path d="M79 58Q69 34 78 36Q89 38 94 52M147 52Q156 36 164 36L158 59" fill="#d7b6aa" />
      </> : <>
        <path d="M77 75L72 24Q73 17 80 21L108 47M132 47L161 21Q168 17 168 25L163 76" fill={coatDark} />
        <path d="M81 56L80 32L96 48M145 48L160 32L158 57" fill="#e7b694" />
      </>}
      <path d={cat ? "M70 79Q70 43 103 42Q120 35 139 44Q170 44 171 80Q179 106 152 122Q120 139 88 122Q60 108 70 79Z" : "M75 72Q85 42 120 43Q157 43 167 75L175 97Q170 121 145 130Q120 142 95 129Q72 119 65 97Z"} fill={`url(#${id("coat")})`} />
      {cat && <g clipPath={`url(#${id("face")})`}><path d="M78 102Q72 116 91 124M150 121Q170 112 163 98" stroke={cream} strokeWidth="8" strokeLinecap="round" opacity=".65" /></g>}
      {cat ? <>
        <path d="M88 80Q99 71 109 81Q100 91 89 85Z" fill="#f4f0d3" /><path d="M131 81Q141 71 153 80L151 86Q141 91 131 81Z" fill="#f4f0d3" />
        <ellipse cx="100" cy="81" rx="4" ry="6" fill="#69764a" /><ellipse cx="141" cy="81" rx="4" ry="6" fill="#69764a" />
        <ellipse cx="100" cy="81" rx="1.5" ry="5" fill="#29332c" /><ellipse cx="141" cy="81" rx="1.5" ry="5" fill="#29332c" />
        <path d="M88 79Q99 72 110 80M131 80Q142 72 153 79" stroke="#796956" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="109" cy="102" rx="15" ry="12" fill={cream} /><ellipse cx="132" cy="102" rx="15" ry="12" fill={cream} />
        <path d="M115 96Q120 93 125 96L120 102Z" fill="#b67e79" /><path d="M120 101V106M120 106Q113 111 109 106M120 106Q127 111 132 106" fill="none" stroke="#8d7770" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M97 101L77 97M96 107L75 109M143 101L164 97M144 107L166 109" stroke="#9d8d7b" strokeWidth="1.2" strokeLinecap="round" />
      </> : <>
        <path d="M70 93Q82 99 92 90Q103 97 120 100Q138 96 149 90Q159 99 170 94Q168 116 145 126Q120 139 95 126Q74 116 70 93Z" fill={cream} />
        <path d="M87 77Q98 72 107 79M133 79Q143 72 154 77" stroke="#976233" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="99" cy="84" rx="4.5" ry="5.5" fill="#3f342a" /><ellipse cx="142" cy="84" rx="4.5" ry="5.5" fill="#3f342a" />
        <circle cx="100.5" cy="82.5" r="1.4" fill="white" /><circle cx="143.5" cy="82.5" r="1.4" fill="white" />
        <ellipse cx="120" cy="105" rx="17" ry="12" fill="#fff8ec" />
        <path d="M111 98Q120 94 129 98Q128 106 120 107Q113 106 111 98Z" fill="#3f342a" /><path d="M120 107V113M120 113Q111 120 104 113M120 113Q129 120 136 113" stroke="#65513c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M113 118Q120 124 127 118Q125 131 120 130Q115 130 113 118Z" fill="#d78f8c" />
        <ellipse cx="84" cy="101" rx="7" ry="4" fill="#edbc8c" opacity=".6" /><ellipse cx="156" cy="101" rx="7" ry="4" fill="#edbc8c" opacity=".6" />
      </>}
    </g>
  </svg>;
}
