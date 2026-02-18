export const getArgentinaToday = (): string => {
    const now = new Date();
    // Create a date object for the current time in Argentina
    const argentinaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));

    const year = argentinaDate.getFullYear();
    const month = String(argentinaDate.getMonth() + 1).padStart(2, '0');
    const day = String(argentinaDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const getArgentinaDate = (): Date => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
};

export const getArgentinaDateFrom = (dateInput: string | Date): Date => {
    const date = new Date(dateInput);
    return new Date(date.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
};

export const formatArgentinaDate = (dateStr: string, options: Intl.DateTimeFormatOptions = {}): string => {
    if (!dateStr) return '';

    // If explicitly just a date string YYYY-MM-DD
    if (dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        // Create date at noon to avoid timezone rolling issues with midnight
        return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('es-AR', options);
    }

    // Otherwise treat as ISO/full date
    return new Date(dateStr).toLocaleDateString('es-AR', {
        ...options,
        timeZone: 'America/Argentina/Buenos_Aires'
    });
};

export const formatArgentinaTime = (dateStr: string | Date): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
    });
};

export const safeDateFormat = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const toLocalISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
