// Form validation and security

// Honeypot field name (should be hidden from users)
var HONEYPOT_FIELD = 'website_url';

// Initialize form validation
function initFormValidation() {
  var forms = document.querySelectorAll('form[data-validate]');
  
  for (var i = 0; i < forms.length; i++) {
    var form = forms[i];
    
    // Add honeypot field if not present
    if (!form.querySelector('[name="' + HONEYPOT_FIELD + '"]')) {
      var honeypot = document.createElement('input');
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
    var inputs = form.querySelectorAll('input, textarea, select');
    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j];
      input.addEventListener('blur', function() {
        validateField(this);
      });
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    }
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  var form = e.target;
  
  // Check honeypot
  var honeypot = form.querySelector('[name="' + HONEYPOT_FIELD + '"]');
  if (honeypot && honeypot.value) {
    // Bot detected - silently fail
    console.warn('Bot detected');
    return false;
  }
  
  // Validate all fields
  var isValid = true;
  var inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  
  for (var i = 0; i < inputs.length; i++) {
    if (!validateField(inputs[i])) {
      isValid = false;
    }
  }
  
  if (!isValid) {
    return false;
  }
  
  // Submit form (replace with actual submission logic)
  submitForm(form);
  
  return false;
}

// Validate individual field
function validateField(field) {
  var value = field.value.trim();
  var type = field.type;
  var required = field.hasAttribute('required');
  
  clearFieldError(field);
  
  // Required validation
  if (required && !value) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Email validation
  if (type === 'email' && value) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Phone validation
  if (type === 'tel' && value) {
    var phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      showFieldError(field, 'Please enter a valid phone number');
      return false;
    }
  }
  
  // URL validation
  if (type === 'url' && value) {
    try {
      new URL(value);
    } catch (e) {
      showFieldError(field, 'Please enter a valid URL');
      return false;
    }
  }
  
  // Min length validation
  var minLength = field.getAttribute('minlength');
  if (minLength && value.length < parseInt(minLength, 10)) {
    showFieldError(field, 'Minimum length is ' + minLength + ' characters');
    return false;
  }
  
  // Max length validation
  var maxLength = field.getAttribute('maxlength');
  if (maxLength && value.length > parseInt(maxLength, 10)) {
    showFieldError(field, 'Maximum length is ' + maxLength + ' characters');
    return false;
  }
  
  return true;
}

// Show field error
function showFieldError(field, message) {
  field.setAttribute('aria-invalid', 'true');
  field.classList.add('error');
  
  // Remove existing error message
  var parent = field.parentElement;
  if (parent) {
    var existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add error message
    var errorMessage = document.createElement('span');
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
  
  var parent = field.parentElement;
  if (parent) {
    var errorMessage = parent.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}

// Submit form (replace with actual API call)
function submitForm(form) {
  var submitButton = form.querySelector('button[type="submit"]');
  var originalText = submitButton ? submitButton.textContent : null;
  
  // Disable submit button
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }
  
  // Create form data
  var formData = new FormData(form);
  var data = {};
  for (var pair of formData.entries()) {
    if (pair[0] !== HONEYPOT_FIELD) {
      data[pair[0]] = pair[1];
    }
  }
  
  // Replace with actual API endpoint when backend is ready
  fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(function(response) {
    if (response.ok) {
      showFormSuccess(form);
    } else if (response.status === 404) {
      showFormError(form, 'Form submission is not configured yet. Please email us at contact@hireritz.com.');
    } else {
      throw new Error('Form submission failed');
    }
  })
  .catch(function(error) {
    if (error.message && error.message.indexOf('Failed to fetch') !== -1) {
      showFormError(form, 'Unable to connect. Please email us at contact@hireritz.com.');
    } else {
      showFormError(form, 'Something went wrong. Please try again or email contact@hireritz.com.');
    }
  })
  .finally(function() {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText || 'Submit';
    }
  });
}

// Show form success message
function showFormSuccess(form) {
  var successMessage = document.createElement('div');
  successMessage.className = 'form-success';
  successMessage.setAttribute('role', 'alert');
  successMessage.textContent = 'Thank you! Your message has been sent successfully.';
  
  var parent = form.parentElement;
  if (parent) {
    parent.insertBefore(successMessage, form);
  }
  form.reset();
  
  // Scroll to success message
  if (successMessage.scrollIntoView) {
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Show form error message
function showFormError(form, message) {
  var errorMessage = document.createElement('div');
  errorMessage.className = 'form-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.textContent = message;
  
  var parent = form.parentElement;
  if (parent) {
    parent.insertBefore(errorMessage, form);
  }
  
  // Scroll to error message
  if (errorMessage.scrollIntoView) {
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFormValidation);
} else {
  initFormValidation();
}
