'use client';

import { motion } from 'framer-motion';

export const SectionReveal = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ y: 12 }}
    whileInView={{ y: 0 }}
    viewport={{ once: true, amount: 0.05 }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);