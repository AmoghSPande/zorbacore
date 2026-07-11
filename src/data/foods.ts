export interface FoodItem {
  id: string;
  name: string;
  unit: string; // the "1 qty" serving this entry describes
  kcal: number;
  protein: number; // grams
}

const f = (id: string, name: string, unit: string, kcal: number, protein: number): FoodItem =>
  ({ id, name, unit, kcal, protein });

/**
 * Typical Indian city-household foods, standard home servings.
 * Values are honest approximations — consistency matters more than precision.
 * katori ≈ 150ml bowl.
 */
export const FOODS: FoodItem[] = [
  // breads & grains
  f('roti', 'Roti / Chapati', '1 medium', 80, 3),
  f('phulka', 'Phulka (no ghee)', '1', 60, 2),
  f('roti-ghee', 'Roti with ghee', '1', 120, 3),
  f('paratha', 'Plain paratha', '1', 180, 4),
  f('aloo-paratha', 'Aloo paratha', '1', 250, 5),
  f('paneer-paratha', 'Paneer paratha', '1', 280, 9),
  f('naan', 'Butter naan', '1', 300, 8),
  f('bread', 'Bread', '1 slice', 70, 2),
  f('rice', 'Steamed rice', '1 katori', 170, 3),
  f('jeera-rice', 'Jeera rice', '1 katori', 220, 4),
  f('veg-pulao', 'Veg pulao', '1 bowl', 250, 5),
  f('chicken-biryani', 'Chicken biryani', '1 plate', 550, 25),
  f('veg-biryani', 'Veg biryani', '1 plate', 450, 10),
  f('khichdi', 'Khichdi', '1 bowl', 200, 7),
  f('curd-rice', 'Curd rice', '1 bowl', 250, 6),

  // breakfast
  f('poha', 'Poha', '1 plate', 250, 5),
  f('upma', 'Upma', '1 bowl', 230, 6),
  f('idli', 'Idli', '1', 60, 2),
  f('dosa', 'Plain dosa', '1', 130, 3),
  f('masala-dosa', 'Masala dosa', '1', 350, 7),
  f('uttapam', 'Uttapam', '1', 220, 6),
  f('medu-vada', 'Medu vada', '1', 130, 3),
  f('oats', 'Oats with milk', '1 bowl', 200, 7),
  f('cornflakes', 'Cornflakes with milk', '1 bowl', 220, 7),
  f('daliya', 'Daliya', '1 bowl', 180, 6),
  f('maggi', 'Maggi', '1 packet', 350, 8),
  f('besan-chilla', 'Besan chilla', '1', 130, 6),

  // dals & curries
  f('dal-tadka', 'Dal tadka', '1 katori', 150, 7),
  f('dal-makhani', 'Dal makhani', '1 katori', 230, 8),
  f('rajma', 'Rajma', '1 katori', 180, 9),
  f('chole', 'Chole', '1 katori', 200, 9),
  f('sambar', 'Sambar', '1 katori', 100, 5),
  f('kadhi', 'Kadhi', '1 katori', 150, 5),
  f('palak-paneer', 'Palak paneer', '1 katori', 250, 11),
  f('paneer-butter-masala', 'Paneer butter masala', '1 katori', 330, 12),
  f('mix-veg', 'Mixed veg sabzi', '1 katori', 120, 3),
  f('aloo-gobi', 'Aloo gobi', '1 katori', 150, 3),
  f('bhindi', 'Bhindi fry', '1 katori', 130, 2),
  f('baingan-bharta', 'Baingan bharta', '1 katori', 140, 3),
  f('chicken-curry', 'Chicken curry (home)', '1 katori', 250, 20),
  f('butter-chicken', 'Butter chicken', '1 katori', 350, 22),
  f('fish-curry', 'Fish curry', '1 katori', 200, 18),
  f('egg-curry', 'Egg curry (2 eggs)', '1 katori', 250, 14),
  f('mutton-curry', 'Mutton curry', '1 katori', 300, 22),

  // protein staples
  f('egg-boiled', 'Boiled egg', '1', 70, 6),
  f('omelette', 'Omelette (2 eggs)', '1', 180, 12),
  f('paneer', 'Paneer', '100 g', 290, 18),
  f('grilled-chicken', 'Grilled chicken breast', '100 g', 165, 31),
  f('curd', 'Curd / dahi', '1 katori', 80, 4),
  f('raita', 'Raita', '1 katori', 90, 4),
  f('buttermilk', 'Buttermilk / chaas', '1 glass', 40, 2),
  f('milk', 'Milk (full cream)', '1 glass 250ml', 150, 8),
  f('milk-toned', 'Milk (toned)', '1 glass 250ml', 120, 8),
  f('whey', 'Whey protein', '1 scoop', 120, 24),
  f('sprouts', 'Sprouts', '1 bowl', 100, 7),
  f('soya-chunks', 'Soya chunks (cooked)', '1 bowl', 170, 24),
  f('peanuts', 'Peanuts', 'handful 30g', 170, 7),
  f('almonds', 'Almonds', '10', 70, 3),
  f('peanut-butter', 'Peanut butter', '1 tbsp', 95, 4),

  // snacks & street food
  f('samosa', 'Samosa', '1', 260, 4),
  f('kachori', 'Kachori', '1', 210, 3),
  f('pakora', 'Pakoras', '5 pieces', 250, 5),
  f('vada-pav', 'Vada pav', '1', 300, 7),
  f('pav-bhaji', 'Pav bhaji', '1 plate', 400, 9),
  f('chole-bhature', 'Chole bhature', '1 plate', 600, 14),
  f('pani-puri', 'Pani puri', '6', 180, 3),
  f('bhel-puri', 'Bhel puri', '1 plate', 220, 5),
  f('momos', 'Veg momos', '6', 300, 8),
  f('dhokla', 'Dhokla', '2 pieces', 120, 4),
  f('khakhra', 'Khakhra', '1', 60, 2),
  f('namkeen', 'Namkeen mixture', 'handful', 150, 3),
  f('biscuits', 'Biscuits (Marie)', '2', 60, 1),
  f('parle-g', 'Parle-G', '4', 110, 2),
  f('chips', 'Chips', 'small pack', 280, 3),

  // drinks & sweets
  f('chai', 'Chai (milk + sugar)', '1 cup', 60, 2),
  f('chai-no-sugar', 'Chai (no sugar)', '1 cup', 35, 2),
  f('coffee-milk', 'Coffee with milk', '1 cup', 90, 3),
  f('black-coffee', 'Black coffee', '1 cup', 5, 0),
  f('juice', 'Fresh fruit juice', '1 glass', 120, 1),
  f('cold-drink', 'Cold drink', '300 ml', 130, 0),
  f('lassi', 'Sweet lassi', '1 glass', 220, 6),
  f('coconut-water', 'Coconut water', '1', 45, 1),
  f('gulab-jamun', 'Gulab jamun', '1', 150, 2),
  f('jalebi', 'Jalebi', '2', 200, 2),
  f('laddu', 'Besan laddu', '1', 180, 3),
  f('kheer', 'Kheer', '1 katori', 250, 6),
  f('halwa', 'Sooji halwa', '1 katori', 300, 4),
  f('ice-cream', 'Ice cream', '1 scoop', 140, 2),
  f('chocolate', 'Chocolate', 'small bar', 250, 3),
  f('beer', 'Beer', '500 ml', 200, 2),
  f('whisky', 'Whisky', '60 ml', 140, 0),

  // fruits & sides
  f('banana', 'Banana', '1', 105, 1),
  f('apple', 'Apple', '1', 80, 1),
  f('mango', 'Mango', '1', 200, 2),
  f('papaya', 'Papaya', '1 bowl', 60, 1),
  f('orange', 'Orange', '1', 60, 1),
  f('grapes', 'Grapes', '1 bowl', 100, 1),
  f('salad', 'Salad (kachumber)', '1 plate', 50, 2),
  f('ghee', 'Ghee', '1 tsp', 45, 0),
  f('butter', 'Butter', '1 tsp', 35, 0),

  // eating out / fast food
  f('pizza', 'Pizza', '1 slice', 280, 11),
  f('burger', 'Veg burger', '1', 350, 14),
  f('fries', 'French fries', 'medium', 350, 4),
  f('fried-rice', 'Fried rice', '1 plate', 400, 8),
  f('noodles', 'Hakka noodles', '1 plate', 400, 9),
  f('sandwich', 'Veg sandwich', '1', 250, 7),
  f('thali', 'Veg thali (full)', '1', 700, 18),
  f('thali-nonveg', 'Non-veg thali (full)', '1', 850, 35),
];
