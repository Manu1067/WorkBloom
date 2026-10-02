import React from 'react';

export const APIProvider = ({ children }) => <>{children}</>;

export const Map = ({ children, style, className }) => (
  <div style={{ background: 'hsl(var(--sage-deep) / 0.8)', color: 'hsl(43 46% 96%)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, border: '1px solid hsl(var(--line) / 0.2)', ...style }} className={className}>
    {children}
  </div>
);

export const useMap = () => null;
export const useMapsLibrary = () => null;
export const AdvancedMarker = ({ children }) => <>{children}</>;
export const Pin = () => null;

export default {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
};
