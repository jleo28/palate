/**
 * One-off generator for src/data/menu.sample.json.
 * Hand-authored per-item macros (roughly USDA-typical for the food and portion),
 * then assembled into everyday/rotation schedules by a deterministic shuffle so
 * every hall x period x day combination passes the validator without hand-typing
 * 126 individual day lists. Re-run with `tsx scripts/genMenu.ts` after editing
 * the item defs below; it overwrites src/data/menu.sample.json.
 */
import { writeFileSync } from "node:fs";
import type { Allergen, DietTag, HallId, MealPeriod, MenuFile, MenuItem, Role } from "../src/core/types";

type Pool = "breakfast-everyday" | "breakfast-rotation" | "lunch-dinner-everyday" | "evk" | "parkside" | "village" | "saladbar" | "deli" | "fruitdairy" | "dessert";

interface ItemDef {
  id: string;
  name: string;
  station: string;
  role: Role;
  servingUnit: string;
  servingGrams: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: DietTag[];
  allergens: Allergen[];
  pools: Pool[];
}

const V: DietTag[] = ["vegan", "vegetarian"];
const VEG: DietTag[] = ["vegetarian"];
const HALAL: DietTag[] = ["halal"];
const PORK: DietTag[] = ["contains_pork"];
const BEEF: DietTag[] = ["contains_beef"];

const items: ItemDef[] = [
  // --- Breakfast Bar: everyday ---
  { id: "scrambled-eggs", name: "Scrambled eggs", station: "Breakfast Bar", role: "protein", servingUnit: "scoop", servingGrams: 100, protein: 12, carbs: 2, fat: 10, tags: VEG, allergens: ["egg"], pools: ["breakfast-everyday"] },
  { id: "tofu-scramble", name: "Tofu scramble", station: "Breakfast Bar", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 11, carbs: 4, fat: 7, tags: V, allergens: ["soy"], pools: ["breakfast-everyday"] },
  { id: "oatmeal", name: "Oatmeal", station: "Breakfast Bar", role: "carb", servingUnit: "cup", servingGrams: 200, protein: 5, carbs: 27, fat: 3, tags: V, allergens: [], pools: ["breakfast-everyday"] },
  { id: "whole-wheat-toast", name: "Whole wheat toast", station: "Breakfast Bar", role: "carb", servingUnit: "slice", servingGrams: 30, protein: 4, carbs: 13, fat: 1, tags: VEG, allergens: ["wheat"], pools: ["breakfast-everyday"] },
  { id: "mixed-berries", name: "Mixed berries", station: "Fruit & Dairy", role: "extra", servingUnit: "cup", servingGrams: 100, protein: 1, carbs: 12, fat: 0, tags: V, allergens: [], pools: ["breakfast-everyday"] },

  // --- Breakfast Bar: rotation ---
  { id: "egg-whites", name: "Egg whites", station: "Breakfast Bar", role: "protein", servingUnit: "scoop", servingGrams: 100, protein: 11, carbs: 1, fat: 0, tags: VEG, allergens: ["egg"], pools: ["breakfast-rotation"] },
  { id: "turkey-bacon", name: "Turkey bacon", station: "Breakfast Bar", role: "protein", servingUnit: "strip", servingGrams: 20, protein: 6, carbs: 0, fat: 4, tags: [], allergens: [], pools: ["breakfast-rotation"] },
  { id: "pork-sausage-links", name: "Pork sausage links", station: "Breakfast Bar", role: "protein", servingUnit: "link", servingGrams: 60, protein: 9, carbs: 1, fat: 16, tags: PORK, allergens: [], pools: ["breakfast-rotation"] },
  { id: "plant-based-sausage", name: "Plant-based sausage", station: "Breakfast Bar", role: "protein", servingUnit: "link", servingGrams: 60, protein: 11, carbs: 4, fat: 9, tags: V, allergens: ["soy"], pools: ["breakfast-rotation"] },
  { id: "greek-yogurt", name: "Greek yogurt", station: "Fruit & Dairy", role: "protein", servingUnit: "cup", servingGrams: 170, protein: 17, carbs: 6, fat: 4, tags: VEG, allergens: ["milk"], pools: ["breakfast-rotation"] },
  { id: "cottage-cheese", name: "Cottage cheese", station: "Fruit & Dairy", role: "protein", servingUnit: "cup", servingGrams: 150, protein: 14, carbs: 5, fat: 2, tags: VEG, allergens: ["milk"], pools: ["breakfast-rotation"] },
  { id: "steel-cut-oats", name: "Steel cut oats", station: "Breakfast Bar", role: "carb", servingUnit: "cup", servingGrams: 200, protein: 6, carbs: 28, fat: 3, tags: V, allergens: [], pools: ["breakfast-rotation"] },
  { id: "pancakes", name: "Pancakes", station: "Breakfast Bar", role: "carb", servingUnit: "pancake", servingGrams: 60, protein: 4, carbs: 22, fat: 4, tags: VEG, allergens: ["egg", "milk", "wheat"], pools: ["breakfast-rotation"] },
  { id: "waffles", name: "Waffles", station: "Breakfast Bar", role: "carb", servingUnit: "waffle", servingGrams: 75, protein: 5, carbs: 25, fat: 6, tags: VEG, allergens: ["egg", "milk", "wheat"], pools: ["breakfast-rotation"] },
  { id: "french-toast", name: "French toast", station: "Breakfast Bar", role: "carb", servingUnit: "slice", servingGrams: 65, protein: 5, carbs: 20, fat: 5, tags: VEG, allergens: ["egg", "milk", "wheat"], pools: ["breakfast-rotation"] },
  { id: "bagel", name: "Bagel", station: "Breakfast Bar", role: "carb", servingUnit: "bagel", servingGrams: 95, protein: 9, carbs: 48, fat: 1, tags: VEG, allergens: ["wheat"], pools: ["breakfast-rotation"] },
  { id: "hash-browns", name: "Hash browns", station: "Breakfast Bar", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 2, carbs: 18, fat: 6, tags: V, allergens: [], pools: ["breakfast-everyday"] },
  { id: "breakfast-potatoes", name: "Breakfast potatoes", station: "Breakfast Bar", role: "veg", servingUnit: "scoop", servingGrams: 120, protein: 2, carbs: 20, fat: 4, tags: V, allergens: [], pools: ["breakfast-everyday"] },
  { id: "cream-cheese", name: "Cream cheese", station: "Breakfast Bar", role: "extra", servingUnit: "packet", servingGrams: 20, protein: 1, carbs: 1, fat: 8, tags: VEG, allergens: ["milk"], pools: ["breakfast-rotation"] },
  { id: "peanut-butter", name: "Peanut butter", station: "Breakfast Bar", role: "extra", servingUnit: "packet", servingGrams: 32, protein: 8, carbs: 6, fat: 16, tags: V, allergens: ["peanuts"], pools: ["breakfast-rotation"] },
  { id: "granola", name: "Granola", station: "Fruit & Dairy", role: "extra", servingUnit: "scoop", servingGrams: 50, protein: 4, carbs: 26, fat: 7, tags: VEG, allergens: ["tree_nuts", "wheat"], pools: ["breakfast-rotation"] },
  { id: "banana", name: "Banana", station: "Fruit & Dairy", role: "extra", servingUnit: "banana", servingGrams: 120, protein: 1, carbs: 27, fat: 0, tags: V, allergens: [], pools: ["breakfast-rotation", "fruitdairy"] },
  { id: "orange-juice", name: "Orange juice", station: "Fruit & Dairy", role: "extra", servingUnit: "cup", servingGrams: 240, protein: 2, carbs: 26, fat: 0, tags: V, allergens: [], pools: ["breakfast-rotation"] },
  { id: "milk-2percent", name: "2% milk", station: "Fruit & Dairy", role: "extra", servingUnit: "cup", servingGrams: 240, protein: 8, carbs: 12, fat: 5, tags: VEG, allergens: ["milk"], pools: ["breakfast-rotation"] },

  // --- Lunch/dinner everyday (all halls, keeps the validator satisfied on its own) ---
  { id: "grilled-chicken-breast", name: "Grilled chicken breast", station: "Grill", role: "protein", servingUnit: "piece", servingGrams: 120, protein: 26, carbs: 0, fat: 4, tags: HALAL, allergens: [], pools: ["lunch-dinner-everyday"] },
  { id: "black-beans", name: "Black beans", station: "Main Line", role: "protein", servingUnit: "scoop", servingGrams: 130, protein: 8, carbs: 24, fat: 1, tags: V, allergens: [], pools: ["lunch-dinner-everyday"] },
  { id: "brown-rice", name: "Brown rice", station: "Main Line", role: "carb", servingUnit: "scoop", servingGrams: 150, protein: 4, carbs: 35, fat: 1, tags: V, allergens: [], pools: ["lunch-dinner-everyday"] },
  { id: "quinoa", name: "Quinoa", station: "Main Line", role: "carb", servingUnit: "scoop", servingGrams: 140, protein: 5, carbs: 30, fat: 3, tags: V, allergens: [], pools: ["lunch-dinner-everyday"] },
  { id: "steamed-broccoli", name: "Steamed broccoli", station: "Main Line", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 3, carbs: 7, fat: 0, tags: V, allergens: [], pools: ["lunch-dinner-everyday"] },
  { id: "mixed-greens", name: "Mixed greens", station: "Salad Bar", role: "veg", servingUnit: "cup", servingGrams: 60, protein: 1, carbs: 3, fat: 0, tags: V, allergens: [], pools: ["lunch-dinner-everyday"] },

  // --- Main Line rotation (shared across halls) ---
  { id: "white-rice", name: "White rice", station: "Main Line", role: "carb", servingUnit: "scoop", servingGrams: 150, protein: 3, carbs: 40, fat: 0, tags: V, allergens: [], pools: ["evk", "parkside", "village"] },
  { id: "roasted-potatoes", name: "Roasted potatoes", station: "Main Line", role: "carb", servingUnit: "scoop", servingGrams: 140, protein: 3, carbs: 26, fat: 4, tags: V, allergens: [], pools: ["evk", "parkside", "village"] },
  { id: "garlic-mashed-potatoes", name: "Garlic mashed potatoes", station: "Main Line", role: "carb", servingUnit: "scoop", servingGrams: 150, protein: 3, carbs: 24, fat: 5, tags: VEG, allergens: ["milk"], pools: ["evk", "village"] },
  { id: "dinner-rolls", name: "Dinner rolls", station: "Main Line", role: "carb", servingUnit: "roll", servingGrams: 45, protein: 4, carbs: 22, fat: 2, tags: VEG, allergens: ["wheat"], pools: ["evk", "parkside"] },
  { id: "roasted-vegetables", name: "Roasted vegetables", station: "Main Line", role: "veg", servingUnit: "scoop", servingGrams: 110, protein: 2, carbs: 12, fat: 3, tags: V, allergens: [], pools: ["evk", "parkside", "village"] },
  { id: "sauteed-spinach", name: "Sauteed spinach", station: "Main Line", role: "veg", servingUnit: "scoop", servingGrams: 90, protein: 3, carbs: 4, fat: 3, tags: V, allergens: [], pools: ["evk", "parkside", "village"] },
  { id: "green-beans", name: "Green beans", station: "Main Line", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 2, carbs: 8, fat: 2, tags: V, allergens: [], pools: ["evk", "village"] },
  { id: "glazed-carrots", name: "Glazed carrots", station: "Main Line", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 1, carbs: 14, fat: 2, tags: VEG, allergens: ["milk"], pools: ["evk", "parkside"] },
  { id: "grilled-chicken-thigh", name: "Grilled chicken thigh", station: "Main Line", role: "protein", servingUnit: "piece", servingGrams: 110, protein: 22, carbs: 0, fat: 9, tags: HALAL, allergens: [], pools: ["evk", "parkside"] },
  { id: "baked-cod", name: "Baked cod", station: "Main Line", role: "protein", servingUnit: "piece", servingGrams: 130, protein: 24, carbs: 0, fat: 2, tags: [], allergens: ["fish"], pools: ["parkside", "village"] },
  { id: "roast-turkey", name: "Roast turkey", station: "Main Line", role: "protein", servingUnit: "slice", servingGrams: 100, protein: 24, carbs: 0, fat: 3, tags: [], allergens: [], pools: ["evk"] },
  { id: "vegetarian-chili", name: "Vegetarian chili", station: "Main Line", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 12, carbs: 28, fat: 3, tags: V, allergens: [], pools: ["evk", "village"] },

  // --- EVK: Grill and bowls character ---
  { id: "cheeseburger-patty", name: "Cheeseburger patty", station: "Grill", role: "protein", servingUnit: "patty", servingGrams: 110, protein: 20, carbs: 1, fat: 18, tags: BEEF, allergens: ["milk"], pools: ["evk"] },
  { id: "turkey-burger-patty", name: "Turkey burger patty", station: "Grill", role: "protein", servingUnit: "patty", servingGrams: 110, protein: 21, carbs: 1, fat: 9, tags: [], allergens: [], pools: ["evk"] },
  { id: "veggie-burger-patty", name: "Veggie burger patty", station: "Grill", role: "protein", servingUnit: "patty", servingGrams: 100, protein: 14, carbs: 15, fat: 5, tags: V, allergens: ["soy"], pools: ["evk", "village"] },
  { id: "grilled-steak-tips", name: "Grilled steak tips", station: "Grill", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 25, carbs: 0, fat: 12, tags: BEEF, allergens: [], pools: ["evk"] },
  { id: "bbq-pulled-pork", name: "BBQ pulled pork", station: "Grill", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 20, carbs: 8, fat: 10, tags: PORK, allergens: [], pools: ["evk"] },
  { id: "grilled-sausage", name: "Grilled sausage", station: "Grill", role: "protein", servingUnit: "link", servingGrams: 90, protein: 13, carbs: 3, fat: 20, tags: PORK, allergens: [], pools: ["evk"] },
  { id: "buffalo-cauliflower", name: "Buffalo cauliflower", station: "Grill", role: "veg", servingUnit: "scoop", servingGrams: 110, protein: 3, carbs: 14, fat: 6, tags: V, allergens: [], pools: ["evk", "village"] },
  { id: "sweet-potato-fries", name: "Sweet potato fries", station: "Grill", role: "carb", servingUnit: "scoop", servingGrams: 110, protein: 2, carbs: 28, fat: 8, tags: V, allergens: [], pools: ["evk"] },
  { id: "tater-tots", name: "Tater tots", station: "Grill", role: "carb", servingUnit: "scoop", servingGrams: 110, protein: 3, carbs: 26, fat: 9, tags: V, allergens: [], pools: ["evk"] },
  { id: "mac-and-cheese", name: "Mac and cheese", station: "Grill", role: "carb", servingUnit: "scoop", servingGrams: 170, protein: 10, carbs: 34, fat: 12, tags: VEG, allergens: ["milk", "wheat"], pools: ["evk"] },
  { id: "loaded-baked-potato", name: "Loaded baked potato", station: "Grill", role: "carb", servingUnit: "potato", servingGrams: 220, protein: 6, carbs: 40, fat: 8, tags: VEG, allergens: ["milk"], pools: ["evk"] },
  { id: "coleslaw", name: "Coleslaw", station: "Grill", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 1, carbs: 10, fat: 6, tags: VEG, allergens: ["egg"], pools: ["evk"] },
  { id: "grilled-corn", name: "Grilled corn", station: "Grill", role: "veg", servingUnit: "ear", servingGrams: 100, protein: 3, carbs: 19, fat: 2, tags: V, allergens: [], pools: ["evk", "parkside"] },
  { id: "chili-con-carne", name: "Chili con carne", station: "Grill", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 18, carbs: 18, fat: 9, tags: BEEF, allergens: [], pools: ["evk"] },
  { id: "cornbread", name: "Cornbread", station: "Grill", role: "carb", servingUnit: "square", servingGrams: 60, protein: 4, carbs: 26, fat: 6, tags: VEG, allergens: ["egg", "milk", "wheat"], pools: ["evk"] },

  // --- Parkside: Global Kitchen character ---
  { id: "chicken-tikka-masala", name: "Chicken tikka masala", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 22, carbs: 9, fat: 14, tags: HALAL, allergens: ["milk"], pools: ["parkside"] },
  { id: "chana-masala", name: "Chana masala", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 11, carbs: 30, fat: 6, tags: V, allergens: [], pools: ["parkside", "village"] },
  { id: "beef-fajita-strips", name: "Beef fajita strips", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 110, protein: 22, carbs: 2, fat: 10, tags: BEEF, allergens: [], pools: ["parkside"] },
  { id: "chicken-fajita-strips", name: "Chicken fajita strips", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 110, protein: 24, carbs: 2, fat: 6, tags: HALAL, allergens: [], pools: ["parkside"] },
  { id: "pad-thai-noodles", name: "Pad thai noodles", station: "Global Kitchen", role: "carb", servingUnit: "scoop", servingGrams: 200, protein: 9, carbs: 45, fat: 10, tags: VEG, allergens: ["egg", "peanuts", "soy"], pools: ["parkside"] },
  { id: "tofu-stir-fry", name: "Tofu stir fry", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 180, protein: 15, carbs: 12, fat: 9, tags: V, allergens: ["soy"], pools: ["parkside", "village"] },
  { id: "falafel", name: "Falafel", station: "Global Kitchen", role: "protein", servingUnit: "piece", servingGrams: 90, protein: 7, carbs: 16, fat: 8, tags: V, allergens: ["sesame"], pools: ["parkside"] },
  { id: "hummus", name: "Hummus", station: "Global Kitchen", role: "extra", servingUnit: "scoop", servingGrams: 80, protein: 4, carbs: 10, fat: 7, tags: V, allergens: ["sesame"], pools: ["parkside"] },
  { id: "pita-bread", name: "Pita bread", station: "Global Kitchen", role: "carb", servingUnit: "piece", servingGrams: 60, protein: 5, carbs: 33, fat: 1, tags: VEG, allergens: ["wheat"], pools: ["parkside"] },
  { id: "jasmine-rice", name: "Jasmine rice", station: "Global Kitchen", role: "carb", servingUnit: "scoop", servingGrams: 150, protein: 3, carbs: 38, fat: 0, tags: V, allergens: [], pools: ["parkside", "village"] },
  { id: "kung-pao-chicken", name: "Kung pao chicken", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 180, protein: 20, carbs: 10, fat: 12, tags: [], allergens: ["peanuts", "soy"], pools: ["parkside"] },
  { id: "edamame", name: "Edamame", station: "Global Kitchen", role: "veg", servingUnit: "cup", servingGrams: 120, protein: 11, carbs: 10, fat: 5, tags: V, allergens: ["soy"], pools: ["parkside", "village"] },
  { id: "miso-soup", name: "Miso soup", station: "Global Kitchen", role: "extra", servingUnit: "cup", servingGrams: 200, protein: 3, carbs: 4, fat: 2, tags: V, allergens: ["soy"], pools: ["parkside"] },
  { id: "vegetable-biryani", name: "Vegetable biryani", station: "Global Kitchen", role: "carb", servingUnit: "scoop", servingGrams: 200, protein: 6, carbs: 45, fat: 6, tags: V, allergens: [], pools: ["parkside", "village"] },
  { id: "lentil-dal", name: "Lentil dal", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 13, carbs: 26, fat: 4, tags: V, allergens: [], pools: ["parkside", "village"] },
  { id: "chicken-shawarma", name: "Chicken shawarma", station: "Global Kitchen", role: "protein", servingUnit: "scoop", servingGrams: 130, protein: 25, carbs: 3, fat: 8, tags: HALAL, allergens: [], pools: ["parkside"] },
  { id: "tzatziki", name: "Tzatziki", station: "Global Kitchen", role: "extra", servingUnit: "scoop", servingGrams: 60, protein: 2, carbs: 3, fat: 3, tags: VEG, allergens: ["milk"], pools: ["parkside"] },
  { id: "greek-salad", name: "Greek salad", station: "Global Kitchen", role: "veg", servingUnit: "cup", servingGrams: 130, protein: 3, carbs: 6, fat: 7, tags: VEG, allergens: ["milk"], pools: ["parkside"] },
  { id: "naan", name: "Naan", station: "Global Kitchen", role: "carb", servingUnit: "piece", servingGrams: 70, protein: 6, carbs: 34, fat: 5, tags: VEG, allergens: ["wheat", "milk"], pools: ["parkside"] },
  { id: "stir-fried-bok-choy", name: "Stir-fried bok choy", station: "Global Kitchen", role: "veg", servingUnit: "scoop", servingGrams: 100, protein: 2, carbs: 5, fat: 2, tags: V, allergens: ["soy"], pools: ["parkside", "village"] },

  // --- Village: Plant Based character ---
  { id: "lentil-bolognese", name: "Lentil bolognese", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 14, carbs: 28, fat: 5, tags: V, allergens: [], pools: ["village"] },
  { id: "tempeh-bowl", name: "Tempeh bowl", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 170, protein: 18, carbs: 14, fat: 9, tags: V, allergens: ["soy"], pools: ["village"] },
  { id: "chickpea-curry", name: "Chickpea curry", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 200, protein: 12, carbs: 30, fat: 7, tags: V, allergens: [], pools: ["village"] },
  { id: "plant-crumble-tacos", name: "Plant crumble tacos", station: "Plant Based", role: "protein", servingUnit: "taco", servingGrams: 130, protein: 12, carbs: 18, fat: 6, tags: V, allergens: ["soy", "wheat"], pools: ["village"] },
  { id: "cashew-stir-fry", name: "Cashew stir fry", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 180, protein: 13, carbs: 20, fat: 12, tags: V, allergens: ["tree_nuts", "soy"], pools: ["village"] },
  { id: "jackfruit-carnitas", name: "Jackfruit carnitas", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 170, protein: 6, carbs: 24, fat: 4, tags: V, allergens: [], pools: ["village"] },
  { id: "vegan-mac-and-cheese", name: "Vegan mac and cheese", station: "Plant Based", role: "carb", servingUnit: "scoop", servingGrams: 170, protein: 8, carbs: 36, fat: 10, tags: V, allergens: ["tree_nuts", "wheat"], pools: ["village"] },
  { id: "roasted-cauliflower-steak", name: "Roasted cauliflower steak", station: "Plant Based", role: "veg", servingUnit: "steak", servingGrams: 150, protein: 4, carbs: 12, fat: 5, tags: V, allergens: [], pools: ["village"] },
  { id: "black-bean-burger-patty", name: "Black bean burger patty", station: "Plant Based", role: "protein", servingUnit: "patty", servingGrams: 110, protein: 12, carbs: 20, fat: 4, tags: V, allergens: ["wheat", "soy"], pools: ["village"] },
  { id: "seitan-strips", name: "Seitan strips", station: "Plant Based", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 21, carbs: 8, fat: 3, tags: V, allergens: ["wheat"], pools: ["village"] },
  { id: "coconut-curry-vegetables", name: "Coconut curry vegetables", station: "Plant Based", role: "veg", servingUnit: "scoop", servingGrams: 150, protein: 3, carbs: 14, fat: 9, tags: V, allergens: [], pools: ["village"] },
  { id: "farro-salad", name: "Farro salad", station: "Plant Based", role: "carb", servingUnit: "cup", servingGrams: 160, protein: 6, carbs: 32, fat: 4, tags: V, allergens: ["wheat"], pools: ["village"] },
  { id: "beet-goat-cheese-salad", name: "Beet and goat cheese salad", station: "Plant Based", role: "veg", servingUnit: "cup", servingGrams: 130, protein: 5, carbs: 10, fat: 8, tags: VEG, allergens: ["milk"], pools: ["village"] },
  { id: "grilled-halloumi", name: "Grilled halloumi", station: "Plant Based", role: "protein", servingUnit: "slice", servingGrams: 80, protein: 16, carbs: 2, fat: 18, tags: VEG, allergens: ["milk"], pools: ["village"] },
  { id: "tahini-kale-salad", name: "Tahini kale salad", station: "Plant Based", role: "veg", servingUnit: "cup", servingGrams: 100, protein: 3, carbs: 8, fat: 6, tags: V, allergens: ["sesame"], pools: ["village"] },

  // --- Deli (shared) ---
  { id: "turkey-breast-slices", name: "Turkey breast slices", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 90, protein: 18, carbs: 1, fat: 2, tags: [], allergens: [], pools: ["deli"] },
  { id: "ham-slices", name: "Ham slices", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 90, protein: 15, carbs: 2, fat: 6, tags: PORK, allergens: [], pools: ["deli"] },
  { id: "roast-beef-slices", name: "Roast beef slices", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 90, protein: 19, carbs: 0, fat: 5, tags: BEEF, allergens: [], pools: ["deli"] },
  { id: "egg-salad", name: "Egg salad", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 10, carbs: 2, fat: 14, tags: VEG, allergens: ["egg"], pools: ["deli"] },
  { id: "tuna-salad", name: "Tuna salad", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 120, protein: 18, carbs: 3, fat: 10, tags: [], allergens: ["fish", "egg"], pools: ["deli"] },
  { id: "chickpea-salad", name: "Chickpea salad", station: "Deli", role: "protein", servingUnit: "scoop", servingGrams: 150, protein: 9, carbs: 26, fat: 5, tags: V, allergens: [], pools: ["deli"] },
  { id: "swiss-cheese", name: "Swiss cheese", station: "Deli", role: "extra", servingUnit: "slice", servingGrams: 20, protein: 5, carbs: 0, fat: 6, tags: VEG, allergens: ["milk"], pools: ["deli"] },
  { id: "whole-grain-bread", name: "Whole grain bread", station: "Deli", role: "carb", servingUnit: "slice", servingGrams: 35, protein: 4, carbs: 14, fat: 1, tags: VEG, allergens: ["wheat"], pools: ["deli"] },
  { id: "potato-salad", name: "Potato salad", station: "Deli", role: "carb", servingUnit: "scoop", servingGrams: 150, protein: 3, carbs: 24, fat: 8, tags: VEG, allergens: ["egg", "milk"], pools: ["deli"] },
  { id: "pasta-salad", name: "Pasta salad", station: "Deli", role: "carb", servingUnit: "scoop", servingGrams: 160, protein: 6, carbs: 32, fat: 6, tags: VEG, allergens: ["wheat", "egg"], pools: ["deli"] },

  // --- Salad Bar (shared) ---
  { id: "spinach-leaves", name: "Spinach leaves", station: "Salad Bar", role: "veg", servingUnit: "cup", servingGrams: 50, protein: 1, carbs: 2, fat: 0, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "cherry-tomatoes", name: "Cherry tomatoes", station: "Salad Bar", role: "veg", servingUnit: "scoop", servingGrams: 80, protein: 1, carbs: 5, fat: 0, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "cucumber-slices", name: "Cucumber slices", station: "Salad Bar", role: "veg", servingUnit: "scoop", servingGrams: 80, protein: 0, carbs: 3, fat: 0, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "shredded-carrots", name: "Shredded carrots", station: "Salad Bar", role: "veg", servingUnit: "scoop", servingGrams: 70, protein: 1, carbs: 7, fat: 0, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "chickpeas-topping", name: "Chickpeas", station: "Salad Bar", role: "protein", servingUnit: "scoop", servingGrams: 100, protein: 7, carbs: 20, fat: 2, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "grilled-chicken-topping", name: "Grilled chicken topping", station: "Salad Bar", role: "protein", servingUnit: "scoop", servingGrams: 100, protein: 22, carbs: 0, fat: 3, tags: HALAL, allergens: [], pools: ["saladbar"] },
  { id: "hard-boiled-egg", name: "Hard boiled egg", station: "Salad Bar", role: "protein", servingUnit: "egg", servingGrams: 50, protein: 6, carbs: 0, fat: 5, tags: VEG, allergens: ["egg"], pools: ["saladbar"] },
  { id: "feta-cheese", name: "Feta cheese", station: "Salad Bar", role: "extra", servingUnit: "scoop", servingGrams: 30, protein: 4, carbs: 1, fat: 6, tags: VEG, allergens: ["milk"], pools: ["saladbar"] },
  { id: "sunflower-seeds", name: "Sunflower seeds", station: "Salad Bar", role: "extra", servingUnit: "scoop", servingGrams: 20, protein: 4, carbs: 4, fat: 9, tags: V, allergens: [], pools: ["saladbar"] },
  { id: "croutons", name: "Croutons", station: "Salad Bar", role: "extra", servingUnit: "scoop", servingGrams: 20, protein: 2, carbs: 14, fat: 3, tags: VEG, allergens: ["wheat"], pools: ["saladbar"] },
  { id: "ranch-dressing", name: "Ranch dressing", station: "Salad Bar", role: "extra", servingUnit: "ladle", servingGrams: 30, protein: 0, carbs: 2, fat: 14, tags: VEG, allergens: ["milk", "egg"], pools: ["saladbar"] },
  { id: "balsamic-vinaigrette", name: "Balsamic vinaigrette", station: "Salad Bar", role: "extra", servingUnit: "ladle", servingGrams: 30, protein: 0, carbs: 3, fat: 8, tags: V, allergens: [], pools: ["saladbar"] },

  // --- Fruit & Dairy (shared) ---
  { id: "fresh-fruit-cup", name: "Fresh fruit cup", station: "Fruit & Dairy", role: "extra", servingUnit: "cup", servingGrams: 140, protein: 1, carbs: 20, fat: 0, tags: V, allergens: [], pools: ["fruitdairy"] },
  { id: "whole-apple", name: "Whole apple", station: "Fruit & Dairy", role: "extra", servingUnit: "apple", servingGrams: 150, protein: 0, carbs: 22, fat: 0, tags: V, allergens: [], pools: ["fruitdairy"] },
  { id: "orange", name: "Orange", station: "Fruit & Dairy", role: "extra", servingUnit: "orange", servingGrams: 130, protein: 1, carbs: 15, fat: 0, tags: V, allergens: [], pools: ["fruitdairy"] },
  { id: "string-cheese", name: "String cheese", station: "Fruit & Dairy", role: "extra", servingUnit: "piece", servingGrams: 28, protein: 7, carbs: 1, fat: 6, tags: VEG, allergens: ["milk"], pools: ["fruitdairy"] },
  { id: "chocolate-milk", name: "Chocolate milk", station: "Fruit & Dairy", role: "extra", servingUnit: "cup", servingGrams: 240, protein: 8, carbs: 25, fat: 5, tags: VEG, allergens: ["milk"], pools: ["fruitdairy"] },

  // --- Dessert (present on the hall menu, never offered by the solver) ---
  { id: "chocolate-chip-cookie", name: "Chocolate chip cookie", station: "Fruit & Dairy", role: "dessert", servingUnit: "cookie", servingGrams: 40, protein: 2, carbs: 22, fat: 8, tags: VEG, allergens: ["wheat", "egg", "milk"], pools: ["dessert"] },
  { id: "soft-serve-ice-cream", name: "Soft serve ice cream", station: "Fruit & Dairy", role: "dessert", servingUnit: "scoop", servingGrams: 90, protein: 3, carbs: 22, fat: 7, tags: VEG, allergens: ["milk"], pools: ["dessert"] },
  { id: "brownie", name: "Brownie", station: "Fruit & Dairy", role: "dessert", servingUnit: "square", servingGrams: 45, protein: 3, carbs: 26, fat: 10, tags: VEG, allergens: ["wheat", "egg", "milk", "tree_nuts"], pools: ["dessert"] },
];

function kcalOf(i: Pick<ItemDef, "protein" | "carbs" | "fat">): number {
  return Math.round(i.protein * 4 + i.carbs * 4 + i.fat * 9);
}

const library: MenuItem[] = items.map((i) => ({
  id: i.id,
  name: i.name,
  station: i.station,
  role: i.role,
  servingUnit: i.servingUnit,
  servingGrams: i.servingGrams,
  kcal: kcalOf(i),
  protein: i.protein,
  carbs: i.carbs,
  fat: i.fat,
  tags: i.tags,
  allergens: i.allergens,
  source: "sample" as const,
}));

const byPool = (pool: Pool) => items.filter((i) => i.pools.includes(pool)).map((i) => i.id);

const HALLS: HallId[] = ["evk", "parkside", "village"];
const PERIODS: MealPeriod[] = ["breakfast", "lunch", "dinner"];
const DOWS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKS = [1, 2];

const EVERYDAY = {
  breakfast: byPool("breakfast-everyday"),
  lunch: byPool("lunch-dinner-everyday"),
  dinner: byPool("lunch-dinner-everyday"),
};

const HALL_ROTATION_POOL: Record<HallId, Record<MealPeriod, string[]>> = {
  evk: {
    breakfast: byPool("breakfast-rotation"),
    lunch: [...byPool("evk"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
    dinner: [...byPool("evk"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
  },
  parkside: {
    breakfast: byPool("breakfast-rotation"),
    lunch: [...byPool("parkside"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
    dinner: [...byPool("parkside"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
  },
  village: {
    breakfast: byPool("breakfast-rotation"),
    lunch: [...byPool("village"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
    dinner: [...byPool("village"), ...byPool("saladbar"), ...byPool("deli"), ...byPool("fruitdairy"), ...byPool("dessert")],
  },
};

const ROTATION_TAKE: Record<MealPeriod, number> = { breakfast: 8, lunch: 9, dinner: 9 };

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const rotation: MenuFile["rotation"] = { evk: {}, parkside: {}, village: {} };

for (const hall of HALLS) {
  for (const week of WEEKS) {
    for (const dow of DOWS) {
      const dayKey = `w${week}-${dow}`;
      rotation[hall][dayKey] = { breakfast: [], lunch: [], dinner: [] };
      for (const period of PERIODS) {
        const pool = HALL_ROTATION_POOL[hall][period];
        const seed = hashString(`${hall}|${period}|${dayKey}`);
        const shuffled = seededShuffle(pool, seed);
        const everydaySet = new Set(EVERYDAY[period]);
        const picked: string[] = [];
        for (const id of shuffled) {
          if (everydaySet.has(id) || picked.includes(id)) continue;
          picked.push(id);
          if (picked.length === ROTATION_TAKE[period]) break;
        }
        rotation[hall][dayKey][period] = picked;
      }
    }
  }
}

const menu: MenuFile = {
  rotationWeeks: 2,
  rotationAnchor: "2026-08-24",
  items: library,
  everyday: { evk: EVERYDAY, parkside: EVERYDAY, village: EVERYDAY },
  rotation,
};

writeFileSync(new URL("../src/data/menu.sample.json", import.meta.url), `${JSON.stringify(menu, null, 2)}\n`);
console.log(`Wrote ${library.length} items to src/data/menu.sample.json`);
