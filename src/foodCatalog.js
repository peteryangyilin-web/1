// Approximate generic food values per 100 g, not brand-specific label data.
export const FOOD_CATALOG=[
 ['rice','Cooked white rice','米饭 白米',130,2.7,28.2,.3,150,'one small bowl'],
 ['brown-rice','Cooked brown rice','糙米',123,2.7,25.6,1,150,'one small bowl'],
 ['chicken','Cooked chicken breast','鸡胸肉 鸡肉',165,31,0,3.6,120,'one palm-sized portion'],
 ['egg','Boiled egg','鸡蛋 水煮蛋',155,12.6,1.1,10.6,50,'one medium egg'],
 ['salmon','Cooked salmon','三文鱼 鱼',206,22,0,12,120,'one fillet portion'],
 ['tofu','Firm tofu','豆腐',144,17.3,2.8,8.7,100,'one portion'],
 ['oats','Dry rolled oats','燕麦',379,13.2,67.7,6.5,40,'one dry serving'],
 ['yogurt','Plain Greek yogurt','酸奶 希腊酸奶',73,9.9,3.9,1.9,170,'one small pot'],
 ['banana','Banana','香蕉',89,1.1,22.8,.3,118,'one medium banana'],
 ['apple','Apple','苹果',52,.3,13.8,.2,150,'one small apple'],
 ['broccoli','Cooked broccoli','西兰花',35,2.4,7.2,.4,100,'one portion'],
 ['potato','Boiled potato','土豆',87,1.9,20.1,.1,150,'one medium potato'],
 ['beef','Cooked lean beef','牛肉',217,26,0,12,100,'one portion'],
 ['noodles','Cooked wheat noodles','面条',138,4.5,25.2,2.1,150,'one small bowl'],
 ['bread','Whole-wheat bread','面包 全麦',247,13,41,4.2,35,'one slice'],
 ['milk','Whole milk','牛奶',61,3.2,4.8,3.3,250,'one 250 mL glass (about 250 g)'],
 ['soy-milk','Unsweetened soy milk','豆浆',33,2.9,1.7,1.6,250,'one 250 mL glass (about 250 g)'],
 ['oil','Olive oil','橄榄油 油',884,0,0,100,10,'about two teaspoons'],
 ['almonds','Almonds','杏仁 坚果',579,21.2,21.6,49.9,20,'one small handful'],
 ['sweet-potato','Cooked sweet potato','红薯',90,2,20.7,.2,150,'one medium portion'],
].map(([id,name,aliases,calories,protein,carbs,fats,servingGrams,servingLabel])=>({id,name,aliases,calories,protein,carbs,fats,servingGrams,servingLabel}));
export function searchFoods(query='') {const q=query.trim().toLowerCase();return FOOD_CATALOG.filter(f=>!q||`${f.name} ${f.aliases}`.toLowerCase().includes(q));}
export function estimateMeal(items=[]) {const totals={calories:0,protein:0,carbs:0,fats:0};for(const item of items){const food=FOOD_CATALOG.find(f=>f.id===item.foodId);const grams=Number(item.grams);if(!food||!Number.isFinite(grams)||grams<1||grams>3000)throw new Error('Choose a food and a portion between 1 and 3,000 g.');for(const key of Object.keys(totals))totals[key]+=food[key]*grams/100;}return Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,Math.round(v*10)/10]));}
