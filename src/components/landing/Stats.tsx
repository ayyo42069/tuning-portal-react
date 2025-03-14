"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatsProps {
  inView: boolean;
}

export const Stats = ({ inView }: StatsProps) => {
  const [count, setCount] = useState({ users: 0, files: 0, satisfaction: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

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

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);

      const duration = 2000;
      const interval = 20;
      const steps = duration / interval;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setCount({
          users: Math.floor(progress * 5000),
          files: Math.floor(progress * 25000),
          satisfaction: Math.floor(progress * 98),
        });

        if (step >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView, hasAnimated]);

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4"
      >
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div variants={itemVariants} className="p-6">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {count.users.toLocaleString()}+
            </div>
            <div className="text-gray-600 dark:text-gray-300">Active Users</div>
          </motion.div>
          <motion.div variants={itemVariants} className="p-6">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {count.files.toLocaleString()}+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Tuning Files Created
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="p-6">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {count.satisfaction}%
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Customer Satisfaction
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
