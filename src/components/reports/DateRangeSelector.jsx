
import React from 'react';
import { DatePicker, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // Ant Design v5 uses dayjs instead of moment

const { RangePicker } = DatePicker;

const DateRangeSelector = ({ value, onChange }) => {
    // Convert dates to dayjs objects for Ant Design
    const dayjsValue = value && value[0] && value[1] 
        ? [dayjs(value[0]), dayjs(value[1])] 
        : null;
    
    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        // Convert to dayjs first for Ant Design
        const dayjsStart = dayjs(start);
        const dayjsEnd = dayjs(end);
        
        // Call onChange with native Date objects for compatibility with the rest of the app
        onChange([start, end]);
    };

    const handleChange = (dates) => {
        // If dates is null (cleared) or has two values
        if (!dates || (dates[0] && dates[1])) {
            // Convert dayjs objects back to native Date objects
            const nativeDates = dates 
                ? [dates[0].toDate(), dates[1].toDate()]
                : [null, null];
            
            onChange(nativeDates);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-2">
            <RangePicker
                value={dayjsValue}
                onChange={handleChange}
                className="w-full md:w-auto"
                suffixIcon={<CalendarOutlined />}
            />
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: '7D', days: 7 },
                    { label: '30D', days: 30 },
                    { label: '90D', days: 90 },
                    { label: 'YTD', days: new Date().getDate() + new Date().getMonth() * 30 },
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