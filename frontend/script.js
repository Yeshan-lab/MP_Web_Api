const API_BASE = window.location.origin;

let currentProteinGoal = 50;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTips();
    updateProteinDisplay(0);
});

// Load nutrition tips
async function loadTips() {
    try {
        const response = await fetch(`${API_BASE}/api/tips?count=3`);
        const data = await response.json();
        
        const tipsContainer = document.getElementById('tipsContainer');
        tipsContainer.innerHTML = '';
        
        data.tips.forEach(tip => {
            const tipElement = document.createElement('div');
            tipElement.className = 'tip';
            tipElement.textContent = `• ${tip}`;
            tipsContainer.appendChild(tipElement);
        });
    } catch (error) {
        console.error('Error loading tips:', error);
    }
}

// Generate meal plan
async function generateMealPlan() {
    try {
        // Show loading state
        document.body.classList.add('loading');
        
        const response = await fetch(`${API_BASE}/api/generate-meal-plan?protein_goal=${currentProteinGoal}`);
        const data = await response.json();
        
        if (data.success) {
            displayMealPlan(data.data);
            updateProteinDisplay(data.data.total_protein);
            displayTips(data.data.tips);
        } else {
            alert('Error generating meal plan: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate meal plan. Please try again.');
    } finally {
        document.body.classList.remove('loading');
    }
}

// Display meal plan
function displayMealPlan(mealPlan) {
    const mealsContainer = document.getElementById('mealsContainer');
    mealsContainer.innerHTML = '';
    
    const meals = ['breakfast', 'lunch', 'dinner'];
    
    meals.forEach(mealKey => {
        const meal = mealPlan[mealKey];
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        mealCard.innerHTML = `
            <h3>${meal.type}</h3>
            <div class="meal-item">
                <strong>Protein:</strong> ${meal.protein.name} (${meal.protein.protein}g)
                <br><small>Cost: ${meal.protein.cost} • Type: ${meal.protein.type}</small>
            </div>
            <div class="meal-item">
                <strong>Vegetable:</strong> ${meal.veggie}
            </div>
            <div class="meal-item">
                <strong>Carb:</strong> ${meal.carb}
            </div>
        `;
        
        mealsContainer.appendChild(mealCard);
    });
}

// Update protein goal
function updateProteinGoal() {
    const goalInput = document.getElementById('proteinGoal');
    const newGoal = parseInt(goalInput.value);
    
    if (newGoal >= 20 && newGoal <= 150) {
        currentProteinGoal = newGoal;
        updateProteinDisplay(0); // Reset display
        alert(`Protein goal updated to ${newGoal}g`);
    } else {
        alert('Please enter a protein goal between 20g and 150g');
        goalInput.value = currentProteinGoal;
    }
}

// Update protein display
function updateProteinDisplay(currentProtein) {
    const proteinText = document.getElementById('proteinText');
    const proteinProgress = document.getElementById('proteinProgress');
    
    const percentage = Math.min((currentProtein / currentProteinGoal) * 100, 100);
    
    proteinText.textContent = `Protein: ${currentProtein}/${currentProteinGoal}g`;
    proteinProgress.style.width = `${percentage}%`;
}

// Display tips
function displayTips(tips) {
    const tipsContainer = document.getElementById('tipsContainer');
    tipsContainer.innerHTML = '';
    
    tips.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip';
        tipElement.textContent = `• ${tip}`;
        tipsContainer.appendChild(tipElement);
    });
}

// Show food database modal
async function showFoodDatabase() {
    try {
        const response = await fetch(`${API_BASE}/api/foods`);
        const data = await response.json();
        
        populateFoodList('proteinsList', data.proteins);
        populateFoodList('veggiesList', data.veggies, true);
        populateFoodList('carbsList', data.carbs, true);
        
        document.getElementById('foodModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading food database:', error);
        alert('Failed to load food database');
    }
}

// Populate food list
function populateFoodList(containerId, items, isSimple = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        if (isSimple) {
            foodItem.innerHTML = `<h4>${item}</h4>`;
        } else {
            foodItem.innerHTML = `
                <h4>${item.name}</h4>
                <div class="food-detail"><strong>Protein:</strong> ${item.protein}g</div>
                <div class="food-detail"><strong>Cost:</strong> ${item.cost}</div>
                <div class="food-detail"><strong>Type:</strong> ${item.type}</div>
            `;
        }
        
        container.appendChild(foodItem);
    });
}

// Close modal
function closeModal() {
    document.getElementById('foodModal').style.display = 'none';
}

// Tab switching
function openTab(tabName) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all buttons
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the specific tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to the button that opened the tab
    event.currentTarget.classList.add('active');
}

// Close modal if clicked outside
window.onclick = function(event) {
    const modal = document.getElementById('foodModal');
    if (event.target === modal) {
        closeModal();
    }
}
