import React from 'react';

export const motion = new Proxy({}, {
  get: (target, prop) => {
    return React.forwardRef(function MotionFallback({
      children,
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      transition,
      layout,
      layoutId,
      ...props
    }, ref) {
      return React.createElement(prop, { ref, ...props }, children);
    });
  }
});

export const AnimatePresence = ({ children }) => children;

export default motion;
