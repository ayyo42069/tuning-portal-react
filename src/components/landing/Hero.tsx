"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import icons
const ChevronRightIcon = dynamic(
  () =>
    import("@heroicons/react/24/outline").then((mod) => mod.ChevronRightIcon),
  { ssr: false }
);
const ArrowRightIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.ArrowRightIcon),
  { ssr: false }
);

interface HeroProps {
  inView: boolean;
}

export const Hero = ({ inView }: HeroProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 text-white py-20 lg:py-32">
      {/* SVG Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
            filter: "blur(0.5px)",
          }}
        ></div>
      </div>

      {/* Circuit board pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/circuit-board.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div
          initial={{ x: -100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 -top-64 -left-64 will-change-transform"
        />
        <motion.div
          initial={{ x: 100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 top-1/3 -right-64 will-change-transform"
        />
        <motion.div
          initial={{ y: 100, opacity: 0.2 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -bottom-32 left-1/3 will-change-transform"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants} className="space-y-8">
            <motion.h2
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-bold leading-tight"
            >
              Unlock Your Vehicle's{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400">
                True Potential
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xl text-blue-100 max-w-lg"
            >
              Professional ECU tuning solutions to enhance performance, improve
              fuel efficiency, and customize your driving experience.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center group"
              >
                Get Started
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-lg border border-blue-300 text-white hover:bg-white hover:text-blue-700 transition-all duration-300 font-medium flex items-center group backdrop-blur-sm bg-white/5"
              >
                Learn More
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          {/* SVG illustration */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex justify-center items-center"
          >
            <svg
              width="400"
              height="300"
              viewBox="0 0 400 300"
              className="w-full max-w-lg"
            >
              <defs>
                <linearGradient
                  id="car-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <g className="car-illustration" filter="url(#glow)">
                <path
                  d="M50,180 L100,140 L300,140 L350,180 L370,200 L350,220 L50,220 L30,200 L50,180 Z"
                  fill="url(#car-gradient)"
                  opacity="0.8"
                />
                <path
                  d="M120,140 L120,100 L280,100 L280,140"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="200"
                  r="30"
                  fill="#1e3a8a"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle
                  cx="300"
                  cy="200"
                  r="30"
                  fill="#1e3a8a"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <path d="M150,170 L250,170" stroke="#fff" strokeWidth="2" />
                <path d="M160,190 L240,190" stroke="#fff" strokeWidth="2" />
                <motion.path
                  d="M50,200 L30,200"
                  stroke="#fff"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
                <motion.path
                  d="M350,200 L370,200"
                  stroke="#fff"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </g>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
