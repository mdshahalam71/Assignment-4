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
                    hideLoading();
                    return;
                }

                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
                const data = await response.json();
                const newData=data.meals
                if (newData) {
                    displayMeals(newData);
                } else {
                    displayMeals([]);

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
                container.innerHTML = '<div class="no-data">No Data Found!</div>';
                return;
            }
            
            container.innerHTML = meals.map(meal => {
                 
                return `
                    <div class="meal-card")">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-photo">
                        <div class="meal-info">
                            <div class="meal-category">${meal.strMeal}</div>
                             
                            <div class="meal-area">${meal.strInstructions}</div>
                             <button  onclick="getMealDetails('${meal.idMeal}')">view recipe</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Show meal modal with details
        function showMealModal(meal) {
            const modal = document.getElementById('mealModal');
            const modalContent = document.getElementById('modalContent');
        
            modalContent.innerHTML = `
               <div class="main">
                    <div class="modal-header">
                      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                   </div>
                   <div class="modal-body">
                        <div class="instructions">
                            <h3>${meal.strMeal}</h3>
                            <p>${meal.strInstructions}</p>
                        </div>
                    </div>
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

        // Show loading indicator
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }

        // Hide loading indicator
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

       

        // Debounced search for better performance
        function debouncedSearch() {
            const searchTerm = document.getElementById('searchInput').value;
            clearTimeout(searchTimeout);
            
            if (searchTerm.length === 0) {

                displayMeals(allMeals);
                return;
            } 
          
            
            searchTimeout = setTimeout(() => {
                searchMeals(searchTerm);
            },500);
        }

      function searchIcon(){ 
        return debouncedSearch()
      }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', fetchInitialMeals);

        // Add event listener for search input
        document.getElementById('search-icon').addEventListener('input',searchIcon);

         