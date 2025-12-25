   let allMeals = []; // Store all meals for filtering
        let searchTimeout;

        // Fetch initial meals from API
        async function fetchInitialMeals() {
            showLoading();
            try {
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
                const data = await response.json();
                
                if (data.meals) {
                    allMeals = data.meals;
                    displayMeals(allMeals);
                    updateSearchResults(`Found ${allMeals.length} recipes`);
                } else {
                    displayError('No recipes found');
                }
            } catch (error) {
                console.error('Error fetching meals:', error);
                displayError('Failed to load recipes. Please try again.');
            } finally {
                hideLoading();
            }
        }

        // Search meals by name
        async function searchMeals(searchTerm) {
            showLoading();
            try {
                if (!searchTerm.trim()) {
                    // If search is empty, show initial meals
                    displayMeals(allMeals);
                    updateSearchResults(`Found ${allMeals.length} recipes`);
                    hideLoading();
                    return;
                }

                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
                const data = await response.json();
                
                if (data.meals) {
                    displayMeals(data.meals);
                    updateSearchResults(`Found ${data.meals.length} recipes for "${searchTerm}"`);
                } else {
                    displayMeals([]);
                    updateSearchResults(`No recipes found for "${searchTerm}"`);
                }
            } catch (error) {
                console.error('Search error:', error);
                displayError('Search failed. Please try again.');
            } finally {
                hideLoading();
            }
        }

        // Get meal details by ID
        async function getMealDetails(id) {
            showLoading();
            try {
                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                const data = await response.json();
                
                if (data.meals && data.meals[0]) {
                    showMealModal(data.meals[0]);
                }
            } catch (error) {
                console.error('Error fetching meal details:', error);
                alert('Failed to load meal details');
            } finally {
                hideLoading();
            }
        }

        // Display meals in the list
        function displayMeals(meals) {
            const container = document.getElementById('mealsList');
            
            if (!meals || meals.length === 0) {
                container.innerHTML = '<div class="empty-state">No recipes found. Try a different search!</div>';
                return;
            }
            
            container.innerHTML = meals.map(meal => {
                // Get first 5 ingredients
                const ingredients = [];
                for (let i = 1; i <= 5; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient && ingredient.trim()) {
                        ingredients.push(ingredient);
                    }
                }
                
                return `
                    <div class="meal-card" onclick="getMealDetails('${meal.idMeal}')">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-photo">
                        <div class="meal-info">
                            <div class="meal-category">${meal.strCategory}</div>
                            <h3>${meal.strMeal}</h3>
                            <div class="meal-area">${meal.strArea}</div>
                            ${ingredients.length > 0 ? `
                                <div class="meal-ingredients">
                                    <h4>Main Ingredients:</h4>
                                    <div class="ingredients-list">
                                        ${ingredients.slice(0, 5).map(ing => 
                                            `<span class="ingredient-tag">${ing}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Show meal modal with details
        function showMealModal(meal) {
            const modal = document.getElementById('mealModal');
            const modalContent = document.getElementById('modalContent');
            
            // Get all ingredients and measures
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim()) {
                    ingredients.push({ ingredient, measure });
                }
            }
            
            modalContent.innerHTML = `
                <div class="modal-header">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                </div>
                <div class="modal-body">
                    <h2>${meal.strMeal}</h2>
                    <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                        <span class="meal-category">${meal.strCategory}</span>
                        <span class="meal-area">${meal.strArea}</span>
                    </div>
                    
                    ${meal.strYoutube ? `
                        <div style="margin-bottom: 20px;">
                            <a href="${meal.strYoutube}" target="_blank" 
                               style="background: #ff0000; color: white; padding: 10px 20px; 
                                      border-radius: 5px; text-decoration: none; display: inline-block;">
                                📺 Watch Video Recipe
                            </a>
                        </div>
                    ` : ''}
                    
                    <div class="instructions">
                        <h3>Instructions</h3>
                        <p>${meal.strInstructions}</p>
                    </div>
                    
                    ${ingredients.length > 0 ? `
                        <div class="meal-ingredients">
                            <h3>Ingredients</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
                                ${ingredients.map(item => `
                                    <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                                        <strong>${item.ingredient}</strong>
                                        ${item.measure ? `<br><small>${item.measure}</small>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Close modal
        function closeModal() {
            const modal = document.getElementById('mealModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Update search results message
        function updateSearchResults(message) {
            document.getElementById('searchResults').innerHTML = `<p>${message}</p>`;
        }

        // Show loading indicator
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }

        // Hide loading indicator
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        // Display error message
        function displayError(message) {
            document.getElementById('mealsList').innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button onclick="fetchInitialMeals()" 
                            style="margin-top: 10px; padding: 8px 16px; 
                                   background: #3498db; color: white; 
                                   border: none; border-radius: 5px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }

        // Debounced search for better performance
        function debouncedSearch() {
            const searchTerm = document.getElementById('searchInput').value;
            clearTimeout(searchTimeout);
            
            if (searchTerm.length === 0) {
                displayMeals(allMeals);
                updateSearchResults(`Found ${allMeals.length} recipes`);
                return;
            }
            
            searchTimeout = setTimeout(() => {
                searchMeals(searchTerm);
            }, 500);
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('mealModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', fetchInitialMeals);

        // Add event listener for search input
        document.getElementById('searchInput').addEventListener('input', debouncedSearch);