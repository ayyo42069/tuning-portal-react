"use client";

import { motion } from "framer-motion";
import { ChartBarIcon, CogIcon, SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface FeaturesProps {
  inView: boolean;
}

export const Features = ({ inView }: FeaturesProps) => {
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

  const features = [
    {
      icon: ChartBarIcon,
      title: "Performance Optimization",
      description: "Unlock your vehicle's full potential with our advanced ECU tuning solutions.",
    },
    {
      icon: CogIcon,
      title: "Custom Tuning",
      description: "Tailored solutions to meet your specific performance goals and requirements.",
    },
    {
      icon: SparklesIcon,
      title: "Enhanced Efficiency",
      description: "Improve fuel efficiency while maintaining optimal performance levels.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety First",
      description: "All tunes are thoroughly tested to ensure reliability and engine safety.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of performance, efficiency, and reliability
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
