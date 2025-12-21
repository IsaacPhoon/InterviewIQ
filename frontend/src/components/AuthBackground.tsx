"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export const AuthBackground: React.FC = () => {
  // const floatingAnimation = {
  //   y: [0, -10, 0],
  //   transition: {
  //     duration: 3,
  //     repeat: Infinity,
  //     ease: "easeInOut" as const,
  //   },
  // };

  // Generate falling icons - memoized to prevent regeneration on re-renders
  // const fallingIcons = useMemo(
  //   () =>
  //     Array.from({ length: 30 }, (_, i) => {
  //       // Use index as seed for consistent random values
  //       const seed = i * 12345;
  //       const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
  //       const random2 = ((seed * 9307 + 49299) % 233282) / 233282;
  //       const random3 = ((seed * 9311 + 49301) % 233284) / 233284;
  //       const random4 = ((seed * 9313 + 49303) % 233286) / 233286;
  //       const random5 = ((seed * 9317 + 49307) % 233288) / 233288;
  //       const random6 = ((seed * 9319 + 49309) % 233290) / 233290;

  //       const isResume = random1 > 0.5;
  //       const delay = random2 * 10;
  //       const duration = 8 + random3 * 5;
  //       const startX = random4 * 100;
  //       const rotation = random5 * 360;
  //       const scale = 0.5 + random6 * 0.5;

  //       return {
  //         id: i,
  //         icon: isResume ? "📄" : "💼",
  //         delay,
  //         duration,
  //         startX,
  //         rotation,
  //         scale,
  //       };
  //     }),
  //   []
  // );

  return (
    <>
      {/* Falling icons animation - commented out */}
      {/* {fallingIcons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute pointer-events-none text-4xl opacity-20"
          initial={{
            top: "-10%",
            left: `${item.startX}%`,
            rotate: 0,
            scale: item.scale,
          }}
          animate={{
            top: "110%",
            rotate: item.rotation,
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {item.icon}
        </motion.div>
      ))} */}

      {/* Subtle animated background elements - commented out */}
      {/* <motion.div
        animate={floatingAnimation}
        className="absolute top-40 left-20 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1.5 },
        }}
        className="absolute bottom-40 right-20 w-80 h-80 bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-3xl"
      /> */}
    </>
  );
};
