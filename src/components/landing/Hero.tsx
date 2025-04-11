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
            
            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="pt-6 border-t border-blue-700/30"
            >
              <p className="text-blue-200 text-sm mb-3">Trusted by automotive enthusiasts worldwide</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-200 text-sm">4.9/5 from 500+ reviews</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Car image */}
          <motion.div 
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-400/20 rounded-2xl transform -rotate-3"></div>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/ecu-tuning.png"
                    alt="Car ECU Tuning"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent rounded-2xl"></div>
                </div>
              </div>
              
              {/* Floating stats */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -left-6 top-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-blue-100 dark:border-blue-800"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">+30%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Power Increase</div>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -right-6 bottom-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-blue-100 dark:border-blue-800"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">-15%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Fuel Consumption</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
