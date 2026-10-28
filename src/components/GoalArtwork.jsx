import React from "react";

const GOAL_IMAGES = {
  muscle: "/goals/build-muscle.png",
  fatloss: "/goals/lose-fat.png",
  endurance: "/goals/improve-endurance.png",
  wellbeing: "/goals/feel-healthier.png",
};

export default function GoalArtwork({ goal }) {
  return <img
    className={`goal-artwork goal-artwork-${goal}`}
    src={GOAL_IMAGES[goal]}
    width="1254"
    height="1254"
    alt=""
    decoding="async"
  />;
}
