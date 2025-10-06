// Main JavaScript for FarmHelp site
document.addEventListener('DOMContentLoaded', function() {
    // Form validation for login form
    setupLoginValidation();
    
    // Form validation for registration form
    setupRegisterValidation();
    
    // Soil analysis form handling
    setupSoilAnalysisForm();
});

// Login form validation
function setupLoginValidation() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(event) {
        let isValid = true;
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        
        // Reset error messages
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        
        // Email validation
        if (email && emailError) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.value)) {
                emailError.textContent = 'Please enter a valid email address';
                isValid = false;
            }
        }
        
        // Password validation
        if (password && passwordError) {
            if (password.value.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters';
                isValid = false;
            }
        }
        
        if (!isValid) {
            event.preventDefault();
        }
    });
}

// Registration form validation
function setupRegisterValidation() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Get form fields
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        // Get error elements
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        
        // Reset error messages
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (confirmPasswordError) confirmPasswordError.textContent = '';
        
        // Name validation
        if (name && nameError) {
            if (name.value.trim().length < 2) {
                nameError.textContent = 'Name must be at least 2 characters';
                isValid = false;
            }
        }
        
        // Email validation
        if (email && emailError) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.value)) {
                emailError.textContent = 'Please enter a valid email address';
                isValid = false;
            }
        }
        
        // Password validation
        if (password && passwordError) {
            if (password.value.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters';
                isValid = false;
            }
        }
        
        // Confirm password validation
        if (password && confirmPassword && confirmPasswordError) {
            if (password.value !== confirmPassword.value) {
                confirmPasswordError.textContent = 'Passwords do not match';
                isValid = false;
            }
        }
        
        if (!isValid) {
            event.preventDefault();
        }
    });
}

// Soil analysis form handling
function setupSoilAnalysisForm() {
    const soilForm = document.getElementById('soil-form');
    if (!soilForm) return;
    
    soilForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = {
            N: parseInt(document.getElementById('nitrogen').value),
            P: parseInt(document.getElementById('phosphorus').value),
            K: parseInt(document.getElementById('potassium').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            humidity: parseFloat(document.getElementById('humidity').value),
            ph: parseFloat(document.getElementById('ph').value),
            rainfall: parseFloat(document.getElementById('rainfall').value),
            region: document.getElementById('region').value
        };
        
        // Validate form data
        if (!validateSoilData(formData)) {
            return;
        }
        
        // Show loading state
        const resultsSection = document.getElementById('results');
        const loader = document.querySelector('.loader');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (loader) loader.classList.remove('hidden');
        
        // Send API request
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Authentication error - redirect to login
                    window.location.href = '/login';
                    return;
                }
                return response.json().then(err => {
                    throw new Error(err.error || 'An error occurred during prediction');
                });
            }
            return response.json();
        })
        .then(data => {
            // Display results
            displayResults(data);
        })
        .catch(error => {
            showError(error.message);
        })
        .finally(() => {
            // Hide loader
            if (loader) loader.classList.add('hidden');
            
            // Scroll to results
            if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Validate soil analysis form data
function validateSoilData(data) {
    // Check ranges
    if (data.N < 0 || data.N > 140) {
        showError('Nitrogen (N) must be between 0 and 140');
        return false;
    }
    if (data.P < 0 || data.P > 140) {
        showError('Phosphorus (P) must be between 0 and 140');
        return false;
    }
    if (data.K < 0 || data.K > 140) {
        showError('Potassium (K) must be between 0 and 140');
        return false;
    }
    if (data.temperature < 0 || data.temperature > 50) {
        showError('Temperature must be between 0 and 50°C');
        return false;
    }
    if (data.humidity < 0 || data.humidity > 100) {
        showError('Humidity must be between 0 and 100%');
        return false;
    }
    if (data.ph < 0 || data.ph > 14) {
        showError('pH must be between 0 and 14');
        return false;
    }
    if (data.rainfall < 0 || data.rainfall > 300) {
        showError('Rainfall must be between 0 and 300mm');
        return false;
    }
    
    return true;
}

// Display results from API
function displayResults(data) {
    const cropName = document.getElementById('crop-name');
    const cropDescription = document.getElementById('crop-description');
    const fertilizersList = document.getElementById('fertilizers-list');
    const farmingTips = document.getElementById('farming-tips');
    
    if (cropName) cropName.textContent = data.crop || 'Unknown crop';
    if (cropDescription) cropDescription.textContent = data.description || 'No description available';
    
    // Display fertilizers
    if (fertilizersList && data.fertilizers) {
        fertilizersList.innerHTML = '';
        data.fertilizers.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            fertilizersList.appendChild(li);
        });
    }
    
    // Display farming tips (tips is a string, not an array)
    if (farmingTips && data.tips) {
        farmingTips.textContent = data.tips;
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.remove('hidden');
    } else {
        alert(message);
    }
}