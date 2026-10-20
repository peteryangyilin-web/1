import React, { useId } from "react";
import "./animalAvatar.css";

const BUILDS = {
  lean: { width: 0.9, chest: 31, leg: 16, arm: 13 },
  athletic: { width: 1, chest: 36, leg: 18, arm: 15 },
  strong: { width: 1.13, chest: 41, leg: 21, arm: 18 },
};

function Curls({ points, color = "#a28d7b", opacity = 0.55 }) {
  return <g fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" opacity={opacity}>
    {points.map(([x, y, s = 1], index) => <path key={index} transform={`translate(${x} ${y}) scale(${s})`} d="M-5 1C-7-4-1-7 3-4C7-1 4 5 0 4C-3 4-3 0-1-1" />)}
  </g>;
}

/** A whole animal character. Human-like posture, animal anatomy from ears to paws. */
export default function AnimalAvatar({ species = "shiba", build = "athletic", className = "" }) {
  const unique = useId().replace(/:/g, "");
  const id = name => `animal-${unique}-${name}`;
  const cat = species === "selkirk";
  const shape = BUILDS[build] || BUILDS.athletic;
  const coat = cat ? "#c5b7a4" : "#d99145";
  const coatDark = cat ? "#a79681" : "#bd7131";
  const cream = cat ? "#f4efe6" : "#fff3df";
  const kit = cat ? "#2889ad" : "#237b58";
  const kitDark = cat ? "#17647f" : "#175f43";
  const chest = shape.chest;
  const torso = `M${120-chest} 130Q120 113 ${120+chest} 130Q${165+chest/5} 155 ${151+chest/6} 201Q120 219 ${89-chest/6} 201Q${75-chest/5} 155 ${120-chest} 130Z`;
  const shirt = `M${120-chest+3} 139L${103} 129Q120 143 137 129L${120+chest-3} 139L${150+chest/7} 197Q120 212 ${90-chest/7} 197Z`;
  const headCurls = [[81,61,.8],[95,49,.85],[109,50,.9],[124,47,1],[140,50,.8],[153,60,.9],[77,77,.8],[94,66,.9],[112,64,.7],[132,63,.9],[149,75,.85],[161,83,.7],[80,96,.8],[93,91,.65],[153,98,.85],[92,110,.9],[144,113,.85],[110,119,.7],[129,119,.8]];
  return <svg className={`animal-avatar animal-avatar-${cat ? "selkirk" : "shiba"} animal-avatar-${build} ${className}`} viewBox="0 0 240 300" data-species={species} data-build={build} role="img" aria-label={`${cat ? "Selkirk Rex cat" : "Shiba Inu dog"} ${build} full-body avatar`}>
    <defs>
      <linearGradient id={id("coat")} x1=".2" y1="0" x2=".9" y2="1"><stop stopColor={cat ? "#e2d9ca" : "#efb46f"} /><stop offset="1" stopColor={coat} /></linearGradient>
      <linearGradient id={id("kit")} x1="0" y1="0" x2="1" y2="1"><stop stopColor={kit} /><stop offset="1" stopColor={kitDark} /></linearGradient>
      <radialGradient id={id("aura")}><stop stopColor={cat ? "#d9eef7" : "#d9eee1"} stopOpacity=".8" /><stop offset="1" stopColor={cat ? "#e9f5fb" : "#edf8f0"} stopOpacity="0" /></radialGradient>
      <clipPath id={id("torso")}><path d={torso} /></clipPath>
      <clipPath id={id("face")}><path d={cat ? "M70 79Q70 43 103 42Q120 35 139 44Q170 44 171 80Q179 106 152 122Q120 139 88 122Q60 108 70 79Z" : "M75 72Q85 42 120 43Q157 43 167 75L175 97Q170 121 145 130Q120 142 95 129Q72 119 65 97Z"} /></clipPath>
    </defs>
    <circle cx="120" cy="153" r="112" fill={`url(#${id("aura")})`} />
    <ellipse cx="121" cy="279" rx={cat ? "64" : "61"} ry="9" fill={cat ? "#1c7590" : "#2c7650"} opacity=".09" />
    <g className="animal-character">
      {/* A recognisable animal tail grows out of the hips, behind the outfit. */}
      <g className="animal-tail" fill="none" strokeLinecap="round">
        {cat ? <><path d="M151 213Q196 238 196 190Q196 163 177 168Q164 174 180 184" stroke={coatDark} strokeWidth="20" /><path d="M156 212Q192 231 192 192" stroke={coat} strokeWidth="12" /><Curls points={[[181,219,.65],[195,204,.7],[196,186,.7],[183,170,.65]]} /></> : <><path d="M151 202Q190 208 190 180Q188 155 169 163Q151 169 165 182" stroke={coatDark} strokeWidth="24" /><path d="M155 200Q184 205 184 181Q183 165 171 170" stroke="#f5c486" strokeWidth="14" /><path d="M170 170Q159 174 165 182" stroke={cream} strokeWidth="13" /></>}
      </g>
      <g transform={`translate(120 0) scale(${shape.width} 1) translate(-120 0)`}>
        {/* Digitigrade hind legs and large rounded animal paws. */}
        <path d={`M${101-shape.leg/2} 206Q89 235 88 256Q82 269 91 273H112Q122 269 114 257L117 220Z`} fill={`url(#${id("coat")})`} />
        <path d={`M${139+shape.leg/2} 206Q151 235 152 256Q159 269 149 273H128Q118 269 126 257L123 220Z`} fill={`url(#${id("coat")})`} />
        <path d="M89 252Q105 249 114 258L116 266Q117 274 106 275H89Q80 271 84 264Z" fill={cream} />
        <path d="M151 252Q135 249 126 258L124 266Q123 274 134 275H151Q160 271 156 264Z" fill={cream} />
        <path d="M92 266V272M101 265V273M139 265V273M148 266V272" stroke={coatDark} strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" />
        {/* Full furry torso and shoulders beneath the sleeveless training kit. */}
        <path d={torso} fill={`url(#${id("coat")})`} />
        {cat && <g clipPath={`url(#${id("torso")})`}><Curls points={[[91,137],[104,128],[124,129],[145,135],[156,149],[85,155],[91,176],[148,178],[92,197],[146,197]]} /></g>}
        <path d={shirt} fill={`url(#${id("kit")})`} />
        <path d="M103 132Q120 145 137 132" stroke={cream} strokeWidth="4" strokeLinecap="round" />
        <path d={`M${92-chest/7} 194Q120 207 ${148+chest/7} 194`} fill="none" stroke="white" strokeOpacity=".16" strokeWidth="2" />
        <path d="M105 202L135 202L149 214L141 237L123 233L120 219L117 233L99 237L91 214Z" fill={kitDark} />
        <path d="M120 208V222M99 230L115 227M125 227L141 230" stroke="white" strokeOpacity=".2" strokeWidth="2" />
        <path d="M115 159H125M115 164H121" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
        {/* Thick forelimbs stay furry down to the paws, rather than human hands. */}
        {build === "strong" ? <>
          <path d="M85 143Q64 153 70 177L88 193M155 143Q176 153 170 177L152 193" stroke={coatDark} strokeWidth={shape.arm*1.55} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M85 141Q68 154 75 175L89 188M155 141Q172 154 165 175L151 188" stroke={`url(#${id("coat")})`} strokeWidth={shape.arm*1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="89" cy="190" rx="13" ry="14" fill={cream} transform="rotate(-25 89 190)" /><ellipse cx="151" cy="190" rx="13" ry="14" fill={cream} transform="rotate(25 151 190)" />
          <path d="M83 192L90 197M145 197L152 192" stroke={coatDark} strokeWidth="1.5" opacity=".4" />
        </> : <>
          <path d="M86 143Q72 161 69 188L67 209M154 143Q169 159 174 184L178 204" stroke={coatDark} strokeWidth={shape.arm*1.65} fill="none" strokeLinecap="round" />
          <path d="M86 141Q77 164 74 187L72 205M154 141Q164 163 169 184L173 201" stroke={`url(#${id("coat")})`} strokeWidth={shape.arm*1.4} fill="none" strokeLinecap="round" />
          <ellipse cx="69" cy="210" rx="12" ry="16" fill={cream} transform="rotate(8 69 210)" /><ellipse cx="176" cy="206" rx="12" ry="16" fill={cream} transform="rotate(-12 176 206)" />
          <path d="M63 214L64 221M70 215L71 222M175 211L175 218M182 210L181 216" stroke={coatDark} strokeWidth="1.4" opacity=".45" strokeLinecap="round" />
        </>}
        {cat && <Curls points={build === "strong" ? [[76,153,.8],[74,169,.7],[164,153,.8],[166,169,.7],[98,245,.7],[142,245,.7]] : [[79,154,.8],[74,172,.8],[72,190,.7],[161,153,.8],[166,173,.8],[173,192,.7],[98,246,.7],[142,246,.7]]} />}
        {/* The neck ruff connects head and body with the same coat texture. */}
        <path d="M94 114L90 122L97 125L96 133L105 132L109 142L119 136L130 142L135 132L144 134L143 125L151 121L145 113Z" fill={cream} />
        {cat && <Curls points={[[102,123,.65],[119,130,.65],[136,124,.65]]} color="#c5b8a7" />}
      </g>
      {/* Species-specific animal face and ears, in the same illustrated body. */}
      {cat ? <>
        <path d="M80 72Q62 31 74 28Q97 28 105 52M135 52Q146 27 167 28Q176 32 160 73" fill={coatDark} />
        <path d="M79 58Q69 34 78 36Q89 38 94 52M147 52Q156 36 164 36L158 59" fill="#d7b6aa" />
        <Curls points={[[75,36,.8],[84,44,.8],[157,35,.8],[163,45,.8]]} />
      </> : <>
        <path d="M77 75L72 24Q73 17 80 21L108 47M132 47L161 21Q168 17 168 25L163 76" fill={coatDark} />
        <path d="M81 56L80 32L96 48M145 48L160 32L158 57" fill="#e7b694" />
      </>}
      <path d={cat ? "M70 79Q70 43 103 42Q120 35 139 44Q170 44 171 80Q179 106 152 122Q120 139 88 122Q60 108 70 79Z" : "M75 72Q85 42 120 43Q157 43 167 75L175 97Q170 121 145 130Q120 142 95 129Q72 119 65 97Z"} fill={`url(#${id("coat")})`} />
      {cat && <g clipPath={`url(#${id("face")})`}><Curls points={headCurls} /><path d="M78 102Q72 116 91 124M150 121Q170 112 163 98" stroke={cream} strokeWidth="8" strokeLinecap="round" opacity=".65" /></g>}
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
