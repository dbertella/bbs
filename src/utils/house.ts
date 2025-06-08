export const formatHouseName = (house: string): string => {
    switch (house) {
        case 'SERRA':
            return 'La Serra';
        case 'SOLARO':
            return 'Solaro';
        default:
            return house;
    }
}; 
export const houseBgColor = (house: string): string => {
    switch (house) {
        case 'SERRA':
            return 'bg-blue-500';
        case 'SOLARO':
            return 'bg-emerald-500';
        default:
            return house;
    }
}; 