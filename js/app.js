// FoodLover - Développé par Baya AMELLAL PAYAN
// Gestionnaire de recettes avec localStorage

class FoodLoverApp {
    constructor() {
        // Je stocke les recettes et l'ID suivant
        this.recipes = JSON.parse(localStorage.getItem('foodlover_recipes')) || [];
        this.nextId = parseInt(localStorage.getItem('foodlover_next_id')) || 1;
        
        // Je initialise l'application
        this.init();
    }

    init() {
        console.log('🍴 FoodLover initialisé - Par Baya AMELLAL PAYAN');
        
        // Je lie les événements
        this.bindEvents();
        
        // J'affiche les recettes existantes
        this.displayRecipes();
        
        // Je met à jour le compteur
        this.updateRecipeCount();
    }

    bindEvents() {
        // Formulaire d'ajout
        const form = document.getElementById('recipeForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Bouton reset
        const resetBtn = form.querySelector('button[type="reset"]');
        resetBtn.addEventListener('click', () => this.clearForm());
        
        // Recherche en temps réel
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => this.handleSearch());
        
        // Filtre par catégorie
        const filterSelect = document.getElementById('filterCategory');
        filterSelect.addEventListener('change', () => this.handleFilter());
        
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Je charge le thème sauvegardé
        this.loadTheme();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        // Je récupère et valide les données
        const formData = this.getFormData();
        
        if (this.validateForm(formData)) {
            // Je créé la nouvelle recette
            const newRecipe = {
                id: this.nextId++,
                name: formData.name.trim(),
                category: formData.category,
                ingredients: formData.ingredients.trim(),
                steps: formData.steps.trim(),
                time: formData.time || null,
                createdAt: new Date().toISOString()
            };
            
            // J'ajoute à la liste et sauvegarde
            this.recipes.push(newRecipe);
            this.saveToStorage();
            
            // Je réaffiche tout
            this.displayRecipes();
            this.updateRecipeCount();
            
            // Je vide le formulaire
            this.clearForm();
            
            // Message de succès
            this.showNotification('✅ Recette ajoutée avec succès !', 'success');
        }
    }

    getFormData() {
        return {
            name: document.getElementById('recipeName').value,
            category: document.getElementById('recipeCategory').value,
            ingredients: document.getElementById('recipeIngredients').value,
            steps: document.getElementById('recipeSteps').value,
            time: document.getElementById('recipeTime').value
        };
    }

    validateForm(data) {
        // Je nettoie les erreurs précédentes
        this.clearErrors();
        
        let isValid = true;
        
        // Validation nom
        if (!data.name.trim()) {
            this.showError('recipeName', 'Le nom de la recette est obligatoire');
            isValid = false;
        }
        
        // Validation catégorie
        if (!data.category) {
            this.showError('recipeCategory', 'Veuillez choisir une catégorie');
            isValid = false;
        }
        
        // Validation ingrédients
        if (!data.ingredients.trim()) {
            this.showError('recipeIngredients', 'Les ingrédients sont obligatoires');
            isValid = false;
        }
        
        // Validation étapes
        if (!data.steps.trim()) {
            this.showError('recipeSteps', 'Les étapes sont obligatoires');
            isValid = false;
        }
        
        return isValid;
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('aria-live', 'polite');
        }
        
        // J'ajoute la classe error au champ
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
        }
    }

    clearErrors() {
        // Je supprime tous les messages d'erreur
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
        
        // Je supprime les classes error
        const fields = document.querySelectorAll('.error');
        fields.forEach(field => field.classList.remove('error'));
    }

    displayRecipes(recipesToShow = null) {
        const container = document.getElementById('recipesContainer');
        const recipes = recipesToShow || this.recipes;
        
        if (recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>👋 ${recipesToShow ? 'Aucune recette trouvée' : 'Aucune recette pour le moment'}</p>
                    <p>${recipesToShow ? 'Essayez un autre terme de recherche' : 'Ajoutez votre première recette ci-dessus !'}</p>
                </div>
            `;
            return;
        }
        
        // Je génère les cartes de recettes
        container.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        const categoryIcons = {
            entree: '🥗',
            plat: '🍽️',
            dessert: '🍰',
            boisson: '🥤'
        };
        
        const timeDisplay = recipe.time ? `⏱️ ${recipe.time} min` : '';
        
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-header">
                    <h3 class="recipe-title">${this.escapeHtml(recipe.name)}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-category">${categoryIcons[recipe.category]} ${recipe.category}</span>
                        ${timeDisplay ? `<span class="recipe-time">${timeDisplay}</span>` : ''}
                    </div>
                </div>
                
                <div class="recipe-content">
                    <div class="recipe-section">
                        <h4>Ingrédients :</h4>
                        <div class="recipe-ingredients">${this.formatIngredients(recipe.ingredients)}</div>
                    </div>
                    
                    <div class="recipe-section">
                        <h4>Étapes :</h4>
                        <div class="recipe-steps">${this.formatSteps(recipe.steps)}</div>
                    </div>
                </div>
                
                <div class="recipe-actions">
                    <button class="btn-edit" onclick="app.editRecipe(${recipe.id})" title="Modifier">
                        ✏️ Modifier
                    </button>
                    <button class="btn-delete" onclick="app.deleteRecipe(${recipe.id})" title="Supprimer">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    formatIngredients(ingredients) {
        return ingredients.split('\n')
            .filter(line => line.trim())
            .map(ingredient => `<div class="ingredient-item">${this.escapeHtml(ingredient.trim())}</div>`)
            .join('');
    }

    formatSteps(steps) {
        return steps.split('\n')
            .filter(line => line.trim())
            .map((step, index) => `<div class="step-item"><strong>${index + 1}.</strong> ${this.escapeHtml(step.trim())}</div>`)
            .join('');
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filteredRecipes = this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.toLowerCase().includes(searchTerm)
        );
        
        this.displayRecipes(filteredRecipes);
        this.updateRecipeCount(filteredRecipes.length);
    }

    handleFilter() {
        const selectedCategory = document.getElementById('filterCategory').value;
        const filteredRecipes = selectedCategory 
            ? this.recipes.filter(recipe => recipe.category === selectedCategory)
            : this.recipes;
        
        this.displayRecipes(filteredRecipes);
        this.updateRecipeCount(filteredRecipes.length);
    }

    editRecipe(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;
        
        // Je remplis le formulaire avec les données
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('recipeIngredients').value = recipe.ingredients;
        document.getElementById('recipeSteps').value = recipe.steps;
        document.getElementById('recipeTime').value = recipe.time || '';
        
        // Je supprime la recette (elle sera re-créée avec les nouvelles données)
        this.deleteRecipe(id, false);
        
        // Je scroll vers le formulaire
        document.querySelector('.recipe-form').scrollIntoView({ behavior: 'smooth' });
        
        this.showNotification('📝 Recette chargée pour modification', 'info');
    }

    deleteRecipe(id, showConfirm = true) {
        if (showConfirm && !confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
            return;
        }
        
        // Je supprime de la liste
        this.recipes = this.recipes.filter(recipe => recipe.id !== id);
        
        // Je sauvegarde et réaffiche
        this.saveToStorage();
        this.displayRecipes();
        this.updateRecipeCount();
        
        if (showConfirm) {
            this.showNotification('🗑️ Recette supprimée', 'success');
        }
    }

    clearForm() {
        document.getElementById('recipeForm').reset();
        this.clearErrors();
    }

    updateRecipeCount(count = null) {
        const countElement = document.getElementById('recipeCount');
        const displayCount = count !== null ? count : this.recipes.length;
        countElement.textContent = `(${displayCount})`;
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle');
        
        body.classList.toggle('dark-theme');
        
        // Je change l'icône
        if (body.classList.contains('dark-theme')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('foodlover_theme', 'dark');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('foodlover_theme', 'light');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('foodlover_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('.theme-toggle').textContent = '☀️';
        }
    }

    showNotification(message, type = 'info') {
        // Je crée une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Je l'ajoute au DOM
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Je la supprime après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    saveToStorage() {
        localStorage.setItem('foodlover_recipes', JSON.stringify(this.recipes));
        localStorage.setItem('foodlover_next_id', this.nextId.toString());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// J'initialise l'application quand le DOM est chargé
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new FoodLoverApp();
});
