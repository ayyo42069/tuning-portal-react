"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  inView: boolean;
}

export const Hero = ({ inView }: HeroProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 lg:py-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-20 -top-20 -left-20 animate-blob"></div>
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500 opacity-20 top-1/3 -right-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 rounded-full bg-purple-500 opacity-20 bottom-0 left-1/3 animate-blob animation-delay-4000"></div>
      </div>

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
                True Potential
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xl text-blue-100 max-w-lg"
            >
              Professional ECU tuning solutions to enhance performance,
              improve fuel efficiency, and customize your driving experience.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center group"
              >
                Get Started
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-lg border border-blue-300 text-white hover:bg-white hover:text-blue-700 transition-all duration-300 font-medium flex items-center group"
              >
                Learn More
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
