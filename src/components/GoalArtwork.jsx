import React from "react";

const GOAL_IMAGES = {
  muscle: "/avatars/male-dog-strong.png",
  fatloss: "/avatars/female-cat-lean.png",
  endurance: "/avatars/male-dog-lean.png",
  wellbeing: "/avatars/female-cat-athletic.png",
};

export default function GoalArtwork({ goal }) {
  return <img
    className={`goal-artwork goal-artwork-${goal}`}
    src={GOAL_IMAGES[goal]}
    width="1024"
    height="1536"
    alt=""
    decoding="async"
  />;
}
