/**
 * favorites-config.js
 * 
 * Edit this file to customize which recipes appear on the homepage
 * under "Favourite Recipes". Just add the recipe titles you want to display.
 * 
 * The recipe titles must exactly match the titles in recipes-data.js
 */

if(typeof window !== 'undefined') {
    window.FAVORITE_RECIPES = [
      "Chicken Curry",
      "Homemade Woolworths rice",
      "Two minute noodle Ramen",
      "Welsh Cakes"
    ];
}

// Also set in Node.js context if needed
if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        FAVORITE_RECIPES: [
          "Chicken Curry",
          "Homemade Woolworths rice",
          "Two minute noodle Ramen",
          "Welsh Cakes"
        ]
    };
}
