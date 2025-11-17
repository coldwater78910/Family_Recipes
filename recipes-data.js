/* Shared recipes data — used by dynamic pages and scripts
   Keep this as the single source of truth for recipe data on the site.
*/
const RECIPES = [
    {
        "title": "Chicken Curry",
        "tags": "dinner,curry,easy",
        "time": "Prep: 15 min; Cook: 45 min; Total: 60+ min",
        "difficulty": "Medium",
        "cuisine": "Indian",
        "img": "recipe-images/chicken-curry.jpg",
        "desc": "Classic, comforting chicken curry with warm spices, coconut cream, and a bright squeeze of lemon.",
        "ingredients": [
            "3 chicken breasts",
            "Dash of oil",
            "1 Onion",
            "1 1/2 teaspoons of crushed garlic",
            "1 1/2 teaspoons of chicken spice",
            "1 teaspoon of coriander",
            "1 teaspoon of cumin",
            "1/4 teaspoon of cinnamon",
            "3 cloves",
            "1 bay leaf",
            "1 1/2 teaspoons of curry powder",
            "1 teaspoon of sugar",
            "1 tin of diced tomatoes",
            "1 tin of tomato puree",
            "1 tin of coconut cream",
            "Squeeze of lemon juice or 1/2 a lemon",
            "3 potatoes",
            "some spring onion (for garnish)",
            "1 cup of rice"
        ],
        "steps": [
            "Cut the chicken breasts into strips and place in a bowl.",
            "Pour a dash of oil over the chicken breasts.",
            "Add all the spices, garlic and lemon juice into the bowl with the chicken (besides cloves and bay leaves).",
            "Cover with a plate and let marinade for 30+ minutes.",
            "Begin heating your pot while you dice your onion.",
            "Peel and chop your potatoes.",
            "After 5 minutes your pot should be thoroughly heated, add a dash of oil to the pot and let heat.",
            "Add your onion in and cook till it's translucent.",
            "Add in your sugar (be careful not to caramelize the onions or burn the sugar).",
            "Add in your marinated chicken breast, and sauté until outside is browned.",
            "Add in the tin of diced tomatoes and tomato puree, and cook down for 5 to 10 minutes.",
            "Add in your tin of coconut cream, bay leaf and cloves.",
            "Add your peeled and chopped potatoes.",
            "Leave lid partially off and simmer until cooked down to the preferred consistency.",
            "Start the rice while waiting for the curry to simmer and reduce.",
            "Measure 1 cup of rice and rinse under cold water until water runs clear.",
            "In a pot, add the rinsed rice and 6 cups of water.",
            "Put the lid on fully and let boil.",
            "Once the water is boiling and the starch bubbles start to leak out from the lid, put the lid off halfway and leave to cook for 14 minutes.",
            "After 14 minutes, drain off excess water, and leave covered in the pot until ready to plate."
        ],
        "notes": [
            "Stir every few minutes.",
            "With marinating meat, any time is better than no time."
        ]
    }
];

// Expose for older browsers; pages simply include this file before any scripts that use RECIPES.
if(typeof window !== 'undefined') window.RECIPES = RECIPES;
