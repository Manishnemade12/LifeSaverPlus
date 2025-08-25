interface WaveVisualizerProps {
  isActive: boolean;
}

export const WaveVisualizer = ({ isActive }: WaveVisualizerProps) => {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex items-center space-x-1 h-16">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`
            w-1 bg-voice-primary rounded-full transition-all duration-300
            ${isActive 
              ? 'wave-animation' 
              : 'h-4'
            }
          `}
          style={{
            animationDelay: isActive ? `${bar * 0.1}s` : '0s',
            height: isActive ? undefined : '16px'
          }}
        />
      ))}
    </div>
  );
};