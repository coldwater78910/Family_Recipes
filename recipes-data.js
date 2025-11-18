
const RECIPES = [
  {
    title: "Simple Sandwich",
    tags: ["sandwich", "quick", "easy"],
    time: "Prep: 5 min; Cook: 5 min; Total: 10 min",
    difficulty: "easy",
    cuisine: "Various",
    img: "recipe-images/simple-sandwich.JPG",
    desc: "A quick and easy sandwich with fresh veggies and cheese.",
    ingredients: [
      "4 slices of bread",
      "4 leaves of lettuce",
      "4 slices of tomato",
      "4 slices of cheese",
      "2 slices of onion",
      "12 slices of cucumber",
      "Salt",
      "Pepper",
      "Season with a generous amount of salt and pepper",
      "Cut in half, and enjoy"
    ],
    steps: [
      "Butter your bread",
      "Place 2 leaves of lettuce on 2 slices of bread",
      "Place 2 slices of cheese on each slice of bread with lettuce",
      "Place 2 slices of tomato",
      "Separate the rings of onion and place them on the bread",
      "Place 6 slices of cucumber on each slice of bread with the rest of the ingredients"
    ]
  },
  {
    title: "Chicken Curry",
    tags: ["dinner", "curry", "easy"],
    time: "45 min",
    difficulty: "Medium",
    servings: 4,
    img: "recipe-images/chicken-curry.jpg",
    desc: "Simple chicken curry and rice",
    ingredients: [
      "3 chicken breasts",
      "1 tin of coconut cream",
      "1 tin of diced tomatoes",
      "1 Onion",
      "1 1/2 teaspoons of crushed garlic",
      "Oil",
      "1 1/2 teaspoons of chicken spice",
      "1 teaspoon of coriander",
      "3 cloves",
      "1 bay leaf",
      "1/4 teaspoon of cinnamon",
      "1 teaspoon of cumin",
      "Squeeze of lemon juice or 1/2 a lemon",
      "1 1/2 teaspoons of curry powder",
      "1 teaspoon of sugar",
      "2 potatoes, peeled and cubed",
      "1 cup rice",
      "A spring onion (for garnish)"
    ],
    steps: [
      "Curry:",
      "Cut the chicken breasts into strips and place in a bowl.",
      "Pour a dash of oil over the chicken breasts.",
      "Add all the spices, garlic and lemon juice into the bowl with the chicken. (besides cloves and bay leaves)",
      "Cover with a plate and let marinade for 30+ minutes.",
      "Begin heating your pot while you dice your onion.",
      "After 5 minutes your pot should be thoroughly heated, add a dash of oil to the pot and let heat.",
      "Add your onion in and cook till it's translucent.",
      "Add in your sugar (be careful not to caramelize the onions or burn the sugar).",
      "Add in your marinated chicken breast, and sauté until outside is browned.",
      "Add in the tin of diced tomatoes, and cook down for 5 to 10 minutes.",
      "Add in your tin of coconut cream, bay leaf and cloves.",
      "Add the cubed potatoes and cook until tender.",
      "Once potatoes are tender and curry has thickened, taste and adjust seasoning as needed.",
      "Rice:",
      "Rinse the rice in cold water until the water runs clear.",
      "Place rice in a pot with 6 cups of water bring to a boil.",
      "When starch bubbles begin to seep out from under the lid, boil for 14 minutes.",
      "After the 14 minutes, drain off the excess water and set the rice aside.",
      "Serve the curry over rice and garnish with sliced spring onion.",
      "Notes:",
      "For marinades, any amount of time for it to sit and absorb is better than no time."
    ]
  },
  {
    title: "Homemade Woolworths rice",
    tags: ["rice", "dinner", "easy"],
    time: "Prep: 5-15 minutes; Cook: 30± minutes; Total: 35-45 minutes",
    difficulty: "easy",
    cuisine: "Various",
    img: "recipe-images/homemade-woolworths-rice.png",
    desc: "Homemade rice with peas, corn, and onion, seasoned with Maggi.",
    ingredients: [
      "1 cup of rice",
      "6 cups of water",
      "100g of peas",
      "100g of corn",
      "1 onion",
      "3 tablespoons of Maggi Aromé All-Purpose Seasoning"
    ],
    steps: [
      "Rinse rice in cold water until water is clear",
      "Place rice in a pot with 6 cups of water",
      "Heat rice until water begins to boil and starch bubbles begin to seep out from under the lid, boil for 12 minutes.",
      "While rice is cooking, boil peas and corn in salted water",
      "Pull out peas and corn when they are almost finished cooking, and put them one side",
      "At this point your rice should be cooked, drain off excess water, and put the rice to one side",
      "Heat up your pan while you finely dice your onion, almost mincing it",
      "Drizzle oil into the pan once heated place in your diced onion",
      "When onion is translucent and has reduced, add in your peas and corn",
      "Add in your rice, and mix well",
      "Cook for 5 minutes, and drizzle over 3 tablespoons of Maggi",
      "Stir well, and enjoy"
    ]
  }
];

if (typeof window !== "undefined") window.RECIPES = RECIPES;
