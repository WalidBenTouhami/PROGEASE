// src/utils/date.util.js

import { DateTime, Interval } from 'luxon';

export const DateUtils = {
    formatISO: (date) => DateTime.fromJSDate(date).toISO(),

    calculateWorkingDays: (start, end) => {
        let count = 0;
        let current = DateTime.fromJSDate(start);
        const endDate = DateTime.fromJSDate(end);

        while (current <= endDate) {
            if (current.weekday <= 5) count++;
            current = current.plus({ days: 1 });
        }

        return count;
    },

    isWeekend: (date) => {
        const dt = DateTime.fromJSDate(date);
        return dt.weekday > 5;
    },

    addBusinessDays: (startDate, days) => {
        let result = DateTime.fromJSDate(startDate);
        let added = 0;

        while (added < days) {
            result = result.plus({ days: 1 });
            if (result.weekday <= 5) added++;
        }

        return result.toJSDate();
    },

    timeBetween: (start, end, unit = 'hours') => {
        const startDt = DateTime.fromJSDate(start);
        const endDt = DateTime.fromJSDate(end);
        return Interval.fromDateTimes(startDt, endDt)
            .toDuration(unit)
            .toObject();
    }
};