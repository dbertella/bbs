export function setupDateValidation(startDateInput: HTMLInputElement, endDateInput: HTMLInputElement) {
    const validateDates = () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (startDate && endDate && startDate > endDate) {
            endDateInput.setCustomValidity('End date must be after start date');
        } else {
            endDateInput.setCustomValidity('');
        }
        endDateInput.reportValidity();
    };

    // Validate on input change
    startDateInput.addEventListener('change', validateDates);
    endDateInput.addEventListener('change', validateDates);

    // Initial validation
    validateDates();
} 