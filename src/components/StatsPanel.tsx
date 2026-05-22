interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
  avgResolutionTime: number;
}

interface StatsPanelProps {
  stats: Stats | null | undefined;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metal-panel p-4 animate-pulse">
            <div className="h-8 bg-gray-700/50 rounded mb-2"></div>
            <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatTime = (ms: number) => {
    if (ms === 0) return "—";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const statCards = [
    {
      label: "Open Tickets",
      value: stats.open,
      color: "text-green-400",
      led: "led-green",
      bg: "from-green-900/20 to-transparent",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "text-amber-400",
      led: "led-amber",
      bg: "from-amber-900/20 to-transparent",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      color: "text-blue-400",
      led: "led-green",
      bg: "from-blue-900/20 to-transparent",
    },
    {
      label: "Urgent/High",
      value: stats.urgent + stats.high,
      color: "text-red-400",
      led: "led-red",
      bg: "from-red-900/20 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`metal-panel p-4 md:p-5 bg-gradient-to-br ${stat.bg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-2xl md:text-3xl font-bold ${stat.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>
              {stat.value}
            </span>
            <div className={`led ${stat.led}`}></div>
          </div>
          <p className="text-amber-100/60 text-xs md:text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
