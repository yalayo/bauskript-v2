import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgClass: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
    text: string;
  };
}

export const StatsCard = ({
  title,
  value,
  icon,
  iconBgClass,
  iconColor,
  trend,
}: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <span
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            iconBgClass,
            iconColor
          )}
        >
          <i className={icon}></i>
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-dark">{value}</p>
      {trend && (
        <div className="flex items-center mt-2 text-sm">
          <span
            className={cn(
              "flex items-center",
              trend.isPositive ? "text-success" : "text-error"
            )}
          >
            <i
              className={`fas fa-arrow-${
                trend.isPositive ? "up" : "down"
              } mr-1`}
            ></i>
            {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.text}</span>
        </div>
      )}
    </div>
  );
};
