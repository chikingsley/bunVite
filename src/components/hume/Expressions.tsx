import { Hume } from "hume";
import { expressionColors, isExpressionColor } from "@/utils/expressionColors";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CSSProperties, memo, useEffect, useMemo } from "react";
import * as R from "remeda";

// Memoized EmotionBar component to prevent unnecessary re-renders
const EmotionBar = memo(({
  emotionKey,
  value
}: {
  emotionKey: string;
  value: number;
}) => {
  const color = useMemo(
    () => isExpressionColor(emotionKey) ? expressionColors[emotionKey] : "var(--bg)",
    [emotionKey]
  );

  const containerStyle = useMemo(
    () => ({ "--bg": color } as CSSProperties),
    [color]
  );

  const motionWidth = useMotionValue(0);
  const widthPercentage = useTransform(motionWidth, (w) => `${w}%`);

  useEffect(() => {
    const clampedValue = R.clamp(value, { min: 0, max: 1 });
    const targetWidth = clampedValue * 100;
    const animation = animate(motionWidth, targetWidth, {
      duration: 0.8,
      ease: "easeOut"
    });
    return () => animation.stop();
  }, [value, motionWidth]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between gap-1 font-mono pb-1">
        <div className="font-medium truncate">{emotionKey}</div>
        <div className="tabular-nums opacity-50">{value.toFixed(2)}</div>
      </div>
      <div className="relative h-1" style={containerStyle}>
        <div className="absolute top-0 left-0 size-full rounded-full opacity-10 bg-[var(--bg)]" />
        <motion.div
          data-component="emotion-bar"
          className="absolute top-0 left-0 h-full bg-[var(--bg)] rounded-full"
          style={{ width: widthPercentage }}
        />
      </div>
    </div>
  );
});

EmotionBar.displayName = "EmotionBar"; // For React DevTools

export default function Expressions({
  values,
}: {
  values: Hume.empathicVoice.EmotionScores | undefined;
}) {
  const top3 = useMemo(() => {
    if (!values) return [];
    return R.pipe(
      values,
      R.entries(),
      R.sortBy(R.prop(1)),
      R.reverse(),
      R.take(3)
    );
  }, [values]);

  if (!values) return null;

  return (
    <div className="text-xs p-3 w-full border-t border-border flex flex-col md:flex-row gap-3">
      {top3.map(([key, value]) => (
        <EmotionBar key={key} emotionKey={key} value={value} />
      ))}
    </div>
  );
}