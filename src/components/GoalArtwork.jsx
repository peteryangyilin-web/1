import React from "react";

/* Lightweight local illustrations: each goal has its own movement. */
export default function GoalArtwork({ goal }) {
  return <svg className={`goal-artwork goal-artwork-${goal}`} viewBox="0 0 240 170" fill="none" aria-hidden="true">
    <circle cx="123" cy="86" r="67" fill="currentColor" opacity=".07" />
    <circle cx="123" cy="86" r="54" stroke="currentColor" strokeOpacity=".13" strokeDasharray="3 7" />
    <path d="M38 149H202" stroke="currentColor" strokeOpacity=".13" strokeLinecap="round" />
    {goal === "muscle" && <g className="goal-figure">
      <path d="M93 79L76 91L65 63M147 79L164 91L175 63" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M108 110L99 143M132 110L141 143" stroke="#253d36" strokeWidth="15" strokeLinecap="round" />
      <path d="M97 76Q120 64 143 76L136 117H104Z" fill="currentColor" />
      <circle cx="120" cy="49" r="17" fill="#e4bda3" />
      <path d="M104 46Q102 26 122 30Q139 29 137 45L128 40L108 45Z" fill="#253d36" />
      <g stroke="#253d36" strokeLinecap="round"><path d="M52 57L78 64M162 64L188 57" strokeWidth="5" /><path d="M55 49L51 65M74 56L70 72M166 56L170 72M185 49L189 65" strokeWidth="8" /></g>
      <path d="M115 83L124 83M113 92L127 92" stroke="white" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
    </g>}
    {goal === "fatloss" && <g className="goal-figure">
      <path d="M76 92C30 12 207 3 166 95" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <path d="M109 110L99 140M131 110L140 137" stroke="#253d36" strokeWidth="13" strokeLinecap="round" />
      <path d="M102 73L85 95L72 87M138 73L155 95L168 87" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M104 70Q120 64 136 70L134 111H106Z" fill="currentColor" />
      <circle cx="120" cy="47" r="16" fill="#d5a181" /><path d="M104 45Q103 24 121 28Q139 27 137 45L128 38L104 45Z" fill="#253d36" />
      <path d="M82 150Q120 162 158 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M63 94L71 82M169 82L177 94" stroke="#253d36" strokeWidth="5" strokeLinecap="round" />
    </g>}
    {goal === "endurance" && <g className="goal-figure">
      <path d="M66 69H42M67 84H29M69 100H45" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <path d="M114 106L93 128L66 125M126 108L146 125L144 147" stroke="#253d36" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114 72L96 87L80 79M137 76L154 85L166 67" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M116 65Q128 62 142 75L129 114L104 105Z" fill="currentColor" />
      <circle cx="139" cy="45" r="16" fill="#e4bda3" /><path d="M124 42Q122 21 142 27Q158 26 156 44L145 37Z" fill="#253d36" />
      <path d="M61 125L65 133M141 149L155 149" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </g>}
    {goal === "wellbeing" && <g className="goal-figure">
      <path d="M105 113Q71 108 78 134Q94 151 120 132Q149 152 164 134Q168 112 136 113" fill="#253d36" />
      <path d="M102 78L87 103L67 101M138 78L153 103L173 101" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M103 73Q120 65 137 73L138 116Q120 126 102 116Z" fill="currentColor" />
      <circle cx="120" cy="48" r="17" fill="#d5a181" /><path d="M103 47Q99 27 120 28Q141 27 137 48L130 40L110 43Z" fill="#253d36" />
      <path d="M178 57Q185 46 191 55Q199 45 204 54Q211 65 191 77Q176 67 178 57Z" fill="currentColor" opacity=".35" />
      <path d="M116 88H124M120 84V92" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>}
    <g className="goal-spark" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55"><path d="M51 38V48M46 43H56M192 109V117M188 113H196" /></g>
  </svg>;
}
