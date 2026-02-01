'use client';

export function GraphLegend() {
  return (
    <div className="fixed top-6 right-6 glass-panel p-4 rounded-lg w-64 text-dark-900 z-10 shadow-lg">
      <h3 className="font-semibold mb-3 text-sm">Legend</h3>

      {/* Subject Colors */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-semibold text-dark-500">Colors</h4>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#B31B1B' }}></div>
          <span className="text-xs">Computer Science</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#333333' }}></div>
          <span className="text-xs">Mathematics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#D44A3C' }}></div>
          <span className="text-xs">Highlighted (from chat)</span>
        </div>
      </div>

      {/* Node Size */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold mb-2 text-dark-500">Node Size</h4>
        <p className="text-xs text-dark-500">Centrality in course graph</p>
      </div>

      {/* Opacity */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold mb-2 text-dark-500">Opacity</h4>
        <p className="text-xs text-dark-500">Student enjoyment score (higher = more opaque)</p>
      </div>

      {/* Interaction */}
      <div>
        <h4 className="text-xs font-semibold mb-2 text-dark-500">Interaction</h4>
        <p className="text-xs text-dark-500">Click nodes to view details</p>
      </div>
    </div>
  );
}
