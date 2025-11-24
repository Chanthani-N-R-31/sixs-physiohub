"use client";

type Props = {
  title: string;
  value: string | number;
  delta?: string;
  color?: string; // tailwind color class e.g. 'blue'
  icon?: React.ReactNode;
};

export default function StatsCard({ title, value, delta, color = "blue", icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
        </div>

        <div className="flex flex-col items-end">
          {icon ? <div className="text-gray-400">{icon}</div> : null}
          {delta ? (
            <div
              className={`mt-2 text-sm font-medium ${
                delta.startsWith("-") ? "text-red-600" : "text-green-600"
              }`}
            >
              {delta}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
