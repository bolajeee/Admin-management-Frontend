import React from 'react';
import { DatePicker, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;

const DateRangeSelector = ({ value, onChange }) => {
    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        onChange([start, end]);
    };

    return (
        <div className="flex flex-col md:flex-row gap-2">
            <RangePicker
                value={value}
                onChange={onChange}
                className="w-full md:w-auto"
                suffixIcon={<CalendarOutlined />}
            />
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: '7D', days: 7 },
                    { label: '30D', days: 30 },
                    { label: '90D', days: 90 },
                    { label: 'YTD', days: new Date().getDate() + 1 },
                ].map(({ label, days }) => (
                    <Button
                        key={label}
                        size="small"
                        onClick={() => handleQuickSelect(days)}
                        className="text-xs"
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default DateRangeSelector;
