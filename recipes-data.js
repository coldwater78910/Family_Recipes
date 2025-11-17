/* Shared recipes data — used by dynamic pages and scripts
   Keep this as the single source of truth for recipe data on the site.
*/
const RECIPES = [
    {
        "title": "Chicken Curry",
        "tags": "dinner,curry,easy",
        "time": "45 min",
        "difficulty": "Medium",
        "img": "Recipe Images/chicken-curry.jpg",
        "desc": "Classic, comforting chicken curry with warm spices and coconut cream.",
        "ingredients": [
            "3 chicken breasts",
            "1 tin of coconut cream",
            "1 tin of diced tomatoes",
            "1 tin of tomato puree",
            "1 Onion",
            "1 1/2 teaspoons of crushed garlic",
            "Dash of oil",
            "1 1/2 teaspoons of chicken spice",
            "1 teaspoon of coriander",
            "3 cloves",
            "1 bay leaf",
            "1/4 teaspoon of cinnamon",
            "1 teaspoon of cumin",
            "Squeeze of lemon juice or 1/2 a lemon",
            "1 1/2 teaspoons of curry powder",
            "1 teaspoon of sugar"
        ],
        "steps": [
            "Cut the chicken breasts into strips and place in a bowl.",
            "Pour a dash of oil over the chicken breasts.",
            "Add all the spices (besides cloves and bay leaves), garlic and lemon juice into the bowl with the chicken.",
            "Cover with a plate and let marinade for 30+ minutes.",
            "Begin heating your pot while you dice your onion.",
            "After 5 minutes your pot should be thoroughly heated, add a dash of oil to the pot and let heat.",
            "Add your onion in and cook till it's translucent.",
            "Add in your sugar (be careful not to caramelize the onions or burn the sugar).",
            "Add in your marinated chicken breast, and sauté until outside is browned.",
            "Add in the tin of diced tomatoes and tomato puree, and cook down for 5 to 10 minutes.",
            "Add in your tin of coconut cream, bay leaf and cloves.",
            "Leave lid partially off and simmer until cooked down to the preferred consistency."
        ]
    }
];

// Expose for older browsers; pages simply include this file before any scripts that use RECIPES.
if(typeof window !== 'undefined') window.RECIPES = RECIPES;
