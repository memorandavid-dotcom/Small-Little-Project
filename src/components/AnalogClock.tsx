import * as React from 'react';
import { motion } from 'motion/react';

interface AnalogClockProps {
  time: Date;
}

export function AnalogClock({ time }: AnalogClockProps) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div className="relative w-48 h-48 rounded-full border-4 border-[#1A1A1A] bg-white shadow-inner flex items-center justify-center">
      {/* Clock Face Markings */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-3 bg-[#CED4DA] rounded-full"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-84px)`,
          }}
        />
      ))}

      {/* Hour Hand */}
      <motion.div
        className="absolute w-1.5 h-12 bg-[#1A1A1A] rounded-full origin-bottom"
        style={{ bottom: '50%', transform: `rotate(${hourDegrees}deg)` }}
        animate={{ rotate: hourDegrees }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Minute Hand */}
      <motion.div
        className="absolute w-1 h-16 bg-[#1A1A1A] rounded-full origin-bottom"
        style={{ bottom: '50%', transform: `rotate(${minuteDegrees}deg)` }}
        animate={{ rotate: minuteDegrees }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Second Hand */}
      <motion.div
        className="absolute w-0.5 h-18 bg-red-500 rounded-full origin-bottom"
        style={{ bottom: '50%', transform: `rotate(${secondDegrees}deg)` }}
        animate={{ rotate: secondDegrees }}
        transition={{ type: 'linear', duration: 0.1 }}
      />

      {/* Center Dot */}
      <div className="absolute w-3 h-3 bg-[#1A1A1A] rounded-full z-10 border-2 border-white" />
    </div>
  );
}
