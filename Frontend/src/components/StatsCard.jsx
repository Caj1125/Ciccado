const colorMap = {
  blue: "primary",
  green: "success",
  red: "danger",
  yellow: "warning",
  purple: "purple",
};

function StatsCard({ title, value, change, trend, icon: Icon, color = "blue" }) {
  const cssColor = colorMap[color] || "primary";

  return (
    <div className={`stat-card ${cssColor}`}>
      <div className="stat-card-header">
        <div>
          <span className="stat-label">{title}</span>
          <span className="stat-value">{value}</span>
        </div>
        {Icon && (
          <div className={`stat-icon stat-icon--${cssColor}`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {change && (
        <div className="stat-change">
          {trend === "up" && <span className="stat-trend stat-trend--up">↑</span>}
          {trend === "down" && <span className="stat-trend stat-trend--down">↓</span>}
          <span className="stat-change-text">{change}</span>
        </div>
      )}
    </div>
  );
}

export default StatsCard;
