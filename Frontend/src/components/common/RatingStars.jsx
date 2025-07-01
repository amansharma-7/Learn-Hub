import React, { useEffect, useState } from "react";
import {
  TiStarFullOutline,
  TiStarHalfOutline,
  TiStarOutline,
} from "react-icons/ti";

function RatingStars({ Review_Count = 0, Star_Size = 20 }) {
  const Review_Cnt = Number(Review_Count);
  const [starCount, SetStarCount] = useState({
    full: 0,
    half: 0,
    empty: 0,
  });

  useEffect(() => {
    const wholeStars = Math.floor(Review_Cnt) || 0;

    SetStarCount({
      full: wholeStars,
      half: Number.isInteger(Review_Cnt) ? 0 : 1,
      empty: Number.isInteger(Review_Cnt) ? 5 - wholeStars : 4 - wholeStars,
    });
  }, [Review_Cnt]);

  return (
    <div className="flex gap-1 text-yellow-100">
      {[...Array(starCount.full)].map((_, i) => (
        <TiStarFullOutline key={`full-${i}`} size={Star_Size} />
      ))}
      {[...Array(starCount.half)].map((_, i) => (
        <TiStarHalfOutline key={`half-${i}`} size={Star_Size} />
      ))}
      {[...Array(starCount.empty)].map((_, i) => (
        <TiStarOutline key={`empty-${i}`} size={Star_Size} />
      ))}
    </div>
  );
}

export default RatingStars;
