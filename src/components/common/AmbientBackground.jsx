import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-violet-200/20 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-200/18 blur-3xl" />
    </div>
  );
}
