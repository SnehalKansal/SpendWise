const Utils = (() => {
    const formatCurrency = (amount, currency = '₹') => {
        const num = parseFloat(amount);
        if (isNaN(num)) {
            return `${currency}0.00`;
        }
        return `${currency}${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    const formatDate = (dateString, locale = 'en-IN') => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // For HTML date input format (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    };

    // Basic form validation helper
    const validateField = (inputElement, validationFn, errorMessage) => {
        const errorDisplay = document.getElementById(`${inputElement.id}Error`) || 
                             (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('form-error-message') ? inputElement.nextElementSibling : null);
        
        if (!validationFn(inputElement.value.trim())) {
            if (errorDisplay) errorDisplay.textContent = errorMessage;
            inputElement.classList.add('is-invalid');
            return false;
        } else {
            if (errorDisplay) errorDisplay.textContent = '';
            inputElement.classList.remove('is-invalid');
            return true;
        }
    };

    const clearValidationErrors = (formElement) => {
        formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        formElement.querySelectorAll('.form-error-message').forEach(el => el.textContent = '');
    };
    

    return {
        formatCurrency,
        formatDate,
        formatDateForInput,
        generateUniqueId,
        validateField,
        clearValidationErrors
    };
})();