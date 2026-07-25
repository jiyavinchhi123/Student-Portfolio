import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Motion values for client coordinates (tracks mouse cursor position)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring damping configuration for high-fidelity inertia trail
  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const cursorSpringX = useSpring(cursorX, springConfig);
  const cursorSpringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect mobile touch pointer capabilities
    const detectTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };
    detectTouch();

    if (isTouch) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Expand custom cursor outer boundary on interactive element bounds
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-pointer") ||
        target.closest(".skill-box") ||
        target.closest(".rounded-2xl") ||
        target.closest(".stat-card");

      setHovered(!!isClickable);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouch, visible]);

  if (isTouch || !visible) return null;

  return (
    <>
      {/* Glow Center Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-[9999] mix-blend-screen shadow-[0_0_8px_rgba(59,130,246,0.9)]"
        style={{
          x: cursorSpringX,
          y: cursorSpringY,
          translateX: "-50%",
          translateY: "-50%"
        }}
      />
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-blue-400 pointer-events-none z-[9998] mix-blend-screen"
        style={{
          x: cursorSpringX,
          y: cursorSpringY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          width: hovered ? 48 : 22,
          height: hovered ? 48 : 22,
          backgroundColor: hovered ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0)",
          borderColor: hovered ? "rgba(96, 165, 250, 0.85)" : "rgba(96, 165, 250, 0.45)",
          boxShadow: hovered
            ? "0 0 16px rgba(59, 130, 246, 0.4)"
            : "0 0 0px rgba(59, 130, 246, 0)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </>
  );
}
