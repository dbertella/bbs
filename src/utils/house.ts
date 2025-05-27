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