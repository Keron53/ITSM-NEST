import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    icon?: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color?: string;
}

const Card = ({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: CardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
                </div>
                {Icon && (
                    <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={trendUp ? 'text-green-600' : 'text-red-600'}>
                        {trend}
                    </span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default Card;
