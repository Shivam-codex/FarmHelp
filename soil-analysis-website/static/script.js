document.addEventListener('DOMContentLoaded', function() {
    const soilForm = document.getElementById('soil-form');
    const resultsSection = document.getElementById('results');
    const loader = document.querySelector('.loader');
    
    // Form submission handler
    soilForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loader and results section
        resultsSection.classList.remove('hidden');
        loader.classList.remove('hidden');
        
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
        if (!validateFormData(formData)) {
            loader.classList.add('hidden');
            return;
        }
        
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
            loader.classList.add('hidden');
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Form validation
    function validateFormData(data) {
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
        
        const validRegions = ['Western Maharashtra', 'Khandesh/North Maharashtra', 'Vidarbha', 'Marathwada', 'Konkan'];
        if (!validRegions.includes(data.region)) {
            showError('Please select a valid region');
            return false;
        }
        
        return true;
    }
    
    // Display results
    function displayResults(data) {
        document.getElementById('crop-name').textContent = data.crop;
        document.getElementById('crop-description').textContent = data.description;
        
        // Display fertilizers
        const fertilizersList = document.getElementById('fertilizers-list');
        fertilizersList.innerHTML = '';
        data.fertilizers.forEach(fertilizer => {
            const li = document.createElement('li');
            li.textContent = fertilizer;
            fertilizersList.appendChild(li);
        });
        
        // Display farming tips
        document.getElementById('farming-tips').textContent = data.tips;
    }
    
    // Show error message
    function showError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            soilForm.insertBefore(errorElement, soilForm.firstChild);
        }
        
        // Set error message
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    // Add error message styling
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            background-color: #ffebee;
            color: #d32f2f;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            border-left: 4px solid #d32f2f;
        }
    `;
    document.head.appendChild(style);
});