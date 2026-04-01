// Form validation and security

// Honeypot field name (should be hidden from users)
const HONEYPOT_FIELD = 'website_url';

// Initialize form validation
export function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach((form) => {
    // Add honeypot field if not present
    if (!form.querySelector(`[name="${HONEYPOT_FIELD}"]`)) {
      const honeypot = document.createElement('input');
      honeypot.type = 'text';
      honeypot.name = HONEYPOT_FIELD;
      honeypot.style.position = 'absolute';
      honeypot.style.left = '-9999px';
      honeypot.style.opacity = '0';
      honeypot.setAttribute('tabindex', '-1');
      honeypot.setAttribute('autocomplete', 'off');
      form.appendChild(honeypot);
    }
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  });
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  
  // Check honeypot
  const honeypot = form.querySelector(`[name="${HONEYPOT_FIELD}"]`);
  if (honeypot && honeypot.value) {
    // Bot detected - silently fail
    console.warn('Bot detected');
    return false;
  }
  
  // Validate all fields
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  
  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    return false;
  }
  
  // Submit form (replace with actual submission logic)
  submitForm(form);
  
  return false;
}

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.hasAttribute('required');
  
  clearFieldError(field);
  
  // Required validation
  if (type === 'file') {
    if (required && (!field.files || field.files.length === 0)) {
      showFieldError(field, 'Please upload your CV or resume');
      return false;
    }
    if (field.files && field.files.length > 0) {
      const maxBytes = field.getAttribute('data-max-bytes');
      if (maxBytes) {
        const max = parseInt(maxBytes, 10);
        if (field.files[0].size > max) {
          showFieldError(field, 'File must be 5MB or smaller');
          return false;
        }
      }
    }
  } else if (required && !value) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Email validation
  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Phone validation
  if (type === 'tel' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      showFieldError(field, 'Please enter a valid phone number');
      return false;
    }
  }
  
  // URL validation
  if (type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      showFieldError(field, 'Please enter a valid URL');
      return false;
    }
  }
  
  // Min length validation
  const minLength = field.getAttribute('minlength');
  if (minLength && value.length < parseInt(minLength, 10)) {
    showFieldError(field, `Minimum length is ${minLength} characters`);
    return false;
  }
  
  // Max length validation
  const maxLength = field.getAttribute('maxlength');
  if (maxLength && value.length > parseInt(maxLength, 10)) {
    showFieldError(field, `Maximum length is ${maxLength} characters`);
    return false;
  }
  
  return true;
}

// Show field error
function showFieldError(field, message) {
  field.setAttribute('aria-invalid', 'true');
  field.classList.add('error');
  
  // Remove existing error message
  const parent = field.parentElement;
  if (parent) {
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add error message
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.setAttribute('role', 'alert');
    parent.appendChild(errorMessage);
  }
}

// Clear field error
function clearFieldError(field) {
  field.removeAttribute('aria-invalid');
  field.classList.remove('error');
  
  const parent = field.parentElement;
  if (parent) {
    const errorMessage = parent.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}

// Submit form (replace with actual API call)
async function submitForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton ? submitButton.textContent : null;
  
  // Disable submit button
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Remove honeypot from data
    delete data[HONEYPOT_FIELD];
    
    // Replace with actual API endpoint
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      showFormSuccess(form);
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    showFormError(form, 'Something went wrong. Please try again.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText || 'Submit';
    }
  }
}

// Show form success message
function showFormSuccess(form) {
  const successMessage = document.createElement('div');
  successMessage.className = 'form-success';
  successMessage.setAttribute('role', 'alert');
  successMessage.textContent = 'Thank you! Your message has been sent successfully.';
  
  const parent = form.parentElement;
  if (parent) {
    parent.insertBefore(successMessage, form);
  }
  form.reset();
  
  // Scroll to success message
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show form error message
function showFormError(form, message) {
  const errorMessage = document.createElement('div');
  errorMessage.className = 'form-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.textContent = message;
  
  const parent = form.parentElement;
  if (parent) {
    parent.insertBefore(errorMessage, form);
  }
  
  // Scroll to error message
  errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFormValidation);
} else {
  initFormValidation();
}
