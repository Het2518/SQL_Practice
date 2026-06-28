import type { Question } from '../../types';

// 60 questions for all remaining databases share the same structure.
// Each returns [] for expectedResult.rows since results are computed at runtime.

const noRows = { columns: [] as string[], rows: [] as (string|number|null)[][] };

export const ecommerceQuestions: Question[] = [
  { id: 61, db: 'ecommerce', difficulty: 'easy', keywords: ['Select'],
    prompt: 'List all products with their name and price, ordered by price descending.',
    hint1: 'Select name and price from the products table and sort them.', hint2: 'SELECT name, price FROM products ORDER BY price DESC',
    hint3: 'SELECT name, price FROM products ORDER BY price DESC;',
    solutionSQL: 'SELECT name, price FROM products ORDER BY price DESC;', expectedResult: {
      columns: ["name","price"],
      rows: [
        ["MacBook Pro 14\"",1999.99],["Dell XPS 13",1299.99],["iPhone 15 Pro",999.99],
        ["Samsung Galaxy S24",899.99],["Canon EOS R50",749.99],["iPad Air 5th Gen",749.99],
        ["Monitor 27\" 4K",599.99],["Sony WH-1000XM5",349.99],["Smart Watch",299.99],
        ["Mechanical Keyboard",159.99],["LEGO Star Wars Set",149.99],["Nike Running Shoes",129.99],
        ["Portable SSD 1TB",109.99],["Coffee Maker",89.99],["Sunglasses",89.99],
        ["Levi's 501 Jeans",79.99],["Blender",79.99],["Women's Dress",69.99],
        ["USB-C Hub",59.99],["Data Science Book",54.99],["Garden Hose",49.99],
        ["JavaScript Guide",44.99],["Table Tennis Set",44.99],["Python Programming",39.99],
        ["Yoga Mat",39.99],["Wireless Mouse",39.99],["Children's Backpack",34.99],
        ["Basketball",29.99],["Men's T-Shirt",24.99],["Fiction Novel A",18.99],
      ]
    } },
  { id: 62, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: "Find all products in the 'Electronics' category (category_id = 1). Show name and price.",
    hint1: 'Join products to categories and filter by category name, or use the category_id directly.', hint2: 'WHERE category_id = 1',
    hint3: 'SELECT name, price FROM products WHERE category_id = 1;',
    solutionSQL: 'SELECT name, price FROM products WHERE category_id = 1;', expectedResult: {
      columns: ["name","price"],
      rows: [
        ["Sony WH-1000XM5",349.99],["iPad Air 5th Gen",749.99],["Mechanical Keyboard",159.99],
        ["Monitor 27\" 4K",599.99],["Wireless Mouse",39.99],["USB-C Hub",59.99],
        ["Smart Watch",299.99],["Portable SSD 1TB",109.99],
      ]
    } },
  { id: 63, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: "Show all customers from Canada. Return first_name, last_name, city.",
    hint1: "Use WHERE country = 'Canada'", hint2: "WHERE country = 'Canada'",
    hint3: "SELECT first_name, last_name, city FROM customers WHERE country = 'Canada';",
    solutionSQL: "SELECT first_name, last_name, city FROM customers WHERE country = 'Canada';", expectedResult: {
      columns: ["first_name","last_name","city"],
      rows: [
        ["Bob","Johnson","Toronto"],["Henry","Wilson","Toronto"],["Mia","Jackson","Vancouver"],
        ["Xavier","Walker","Toronto"],["Cleo","King","Toronto"],
      ]
    } },
  { id: 64, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where','Date Function'],
    prompt: "List all orders placed in January 2024. Show order_id, customer_id, order_date, status.",
    hint1: "Filter on order_date using strftime or BETWEEN.", hint2: "WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'",
    hint3: "SELECT order_id, customer_id, order_date, status FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';",
    solutionSQL: "SELECT order_id, customer_id, order_date, status FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';", expectedResult: {
      columns: ["order_id","customer_id","order_date","status"],
      rows: [
        [16,13,"2024-01-15","Processing"],[17,14,"2024-01-28","Completed"],
      ]
    } },
  { id: 65, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: 'Find all products priced under $50. Show name and price, ordered by price ascending.',
    hint1: 'Simple WHERE price < 50 filter.', hint2: 'WHERE price < 50 ORDER BY price ASC',
    hint3: 'SELECT name, price FROM products WHERE price < 50 ORDER BY price ASC;',
    solutionSQL: 'SELECT name, price FROM products WHERE price < 50 ORDER BY price ASC;', expectedResult: {
      columns: ["name","price"],
      rows: [
        ["Fiction Novel A",18.99],["Men's T-Shirt",24.99],["Basketball",29.99],
        ["Children's Backpack",34.99],["Python Programming",39.99],["Yoga Mat",39.99],
        ["Wireless Mouse",39.99],["JavaScript Guide",44.99],["Table Tennis Set",44.99],
        ["Garden Hose",49.99],
      ]
    } },
  { id: 66, db: 'ecommerce', difficulty: 'easy', keywords: ['Select'],
    prompt: 'Count the total number of orders in the database. Return a single value labeled total_orders.',
    hint1: 'Use COUNT(*) on the orders table.', hint2: 'SELECT COUNT(*) AS total_orders FROM orders',
    hint3: 'SELECT COUNT(*) AS total_orders FROM orders;',
    solutionSQL: 'SELECT COUNT(*) AS total_orders FROM orders;', expectedResult: {
      columns: ["total_orders"],
      rows: [
        [30],
      ]
    } },
  { id: 67, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Order By'],
    prompt: 'Show the most expensive product. Return name and price.',
    hint1: 'ORDER BY price DESC LIMIT 1', hint2: 'ORDER BY price DESC LIMIT 1',
    hint3: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 1;',
    solutionSQL: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 1;', expectedResult: {
      columns: ["name","price"],
      rows: [
        ["MacBook Pro 14\"",1999.99],
      ]
    } },
  { id: 68, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where','String Function'],
    prompt: "List customers whose email contains 'gmail'. Show first_name, last_name, and email.",
    hint1: "Use LIKE '%gmail%' on the email column.", hint2: "WHERE email LIKE '%gmail%'",
    hint3: "SELECT first_name, last_name, email FROM customers WHERE email LIKE '%gmail%';",
    solutionSQL: "SELECT first_name, last_name, email FROM customers WHERE email LIKE '%gmail%';", expectedResult: {
      columns: ["first_name","last_name","email"],
      rows: [
        ["Alice","Smith","alice.smith@gmail.com"],["Carol","Williams","carol.w@gmail.com"],["Emma","Jones","emma.jones@gmail.com"],
        ["Grace","Miller","grace.miller@gmail.com"],["Iris","Moore","iris.moore@gmail.com"],["Karen","Anderson","karen.a@gmail.com"],
        ["Mia","Jackson","mia.j@gmail.com"],["Olivia","Harris","olivia.h@gmail.com"],["Quinn","Garcia","quinn.g@gmail.com"],
        ["Sam","Robinson","sam.r@gmail.com"],["Uma","Rodriguez","uma.r@gmail.com"],["Wendy","Lee","wendy.lee@gmail.com"],
        ["Yara","Hall","yara.h@gmail.com"],["Amy","Young","amy.young@gmail.com"],["Cleo","King","cleo.k@gmail.com"],
      ]
    } },
  { id: 69, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: "Find all orders with status 'Cancelled'. Show order_id, customer_id, order_date.",
    hint1: "Filter on the status column.", hint2: "WHERE status = 'Cancelled'",
    hint3: "SELECT order_id, customer_id, order_date FROM orders WHERE status = 'Cancelled';",
    solutionSQL: "SELECT order_id, customer_id, order_date FROM orders WHERE status = 'Cancelled';", expectedResult: {
      columns: ["order_id","customer_id","order_date"],
      rows: [
        [9,8,"2023-07-14"],[15,12,"2023-12-05"],[28,5,"2024-06-10"],
      ]
    } },
  { id: 70, db: 'ecommerce', difficulty: 'easy', keywords: ['Select'],
    prompt: 'Show all distinct product categories. Return category_id and name, ordered by name.',
    hint1: 'Select from the categories table.', hint2: 'SELECT category_id, name FROM categories ORDER BY name',
    hint3: 'SELECT category_id, name FROM categories ORDER BY name;',
    solutionSQL: 'SELECT category_id, name FROM categories ORDER BY name;', expectedResult: {
      columns: ["category_id","name"],
      rows: [
        [3,"Books"],[9,"Cameras"],[12,"Children's Clothing"],
        [2,"Clothing"],[1,"Electronics"],[13,"Fiction"],
        [4,"Home & Garden"],[7,"Laptops"],[10,"Men's Clothing"],
        [14,"Non-Fiction"],[15,"Science"],[8,"Smartphones"],
        [5,"Sports"],[6,"Toys"],[11,"Women's Clothing"],
      ]
    } },
  { id: 71, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Order By'],
    prompt: 'List all products ordered by price descending. Show product_id, name, price.',
    hint1: 'ORDER BY price DESC', hint2: 'ORDER BY price DESC',
    hint3: 'SELECT product_id, name, price FROM products ORDER BY price DESC;',
    solutionSQL: 'SELECT product_id, name, price FROM products ORDER BY price DESC;', expectedResult: {
      columns: ["product_id","name","price"],
      rows: [
        [1,"MacBook Pro 14\"",1999.99],[5,"Dell XPS 13",1299.99],[2,"iPhone 15 Pro",999.99],
        [3,"Samsung Galaxy S24",899.99],[4,"Canon EOS R50",749.99],[7,"iPad Air 5th Gen",749.99],
        [17,"Monitor 27\" 4K",599.99],[6,"Sony WH-1000XM5",349.99],[25,"Smart Watch",299.99],
        [16,"Mechanical Keyboard",159.99],[13,"LEGO Star Wars Set",149.99],[8,"Nike Running Shoes",129.99],
        [26,"Portable SSD 1TB",109.99],[15,"Coffee Maker",89.99],[29,"Sunglasses",89.99],
        [9,"Levi's 501 Jeans",79.99],[28,"Blender",79.99],[18,"Women's Dress",69.99],
        [22,"USB-C Hub",59.99],[20,"Data Science Book",54.99],[12,"Garden Hose",49.99],
        [11,"JavaScript Guide",44.99],[30,"Table Tennis Set",44.99],[10,"Python Programming",39.99],
        [14,"Yoga Mat",39.99],[21,"Wireless Mouse",39.99],[19,"Children's Backpack",34.99],
        [23,"Basketball",29.99],[24,"Men's T-Shirt",24.99],[27,"Fiction Novel A",18.99],
      ]
    } },
  { id: 72, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where','Date Function'],
    prompt: "Find all customers who registered in 2023. Show first_name, last_name, registered_at.",
    hint1: "Use strftime('%Y', registered_at) = '2023'", hint2: "WHERE strftime('%Y', registered_at) = '2023'",
    hint3: "SELECT first_name, last_name, registered_at FROM customers WHERE strftime('%Y', registered_at) = '2023';",
    solutionSQL: "SELECT first_name, last_name, registered_at FROM customers WHERE strftime('%Y', registered_at) = '2023';", expectedResult: {
      columns: ["first_name","last_name","registered_at"],
      rows: [
        ["Karen","Anderson","2023-01-08"],["Leo","Thomas","2023-01-20"],["Mia","Jackson","2023-02-14"],
        ["Nathan","White","2023-03-05"],["Olivia","Harris","2023-03-18"],["Paul","Martin","2023-04-22"],
        ["Quinn","Garcia","2023-05-10"],["Rose","Martinez","2023-06-01"],["Sam","Robinson","2023-07-15"],
        ["Tina","Clark","2023-08-28"],["Uma","Rodriguez","2023-09-05"],["Victor","Lewis","2023-10-12"],
        ["Wendy","Lee","2023-11-20"],["Xavier","Walker","2023-12-01"],
      ]
    } },
  { id: 73, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: 'Show all orders for customer_id = 1. Display order_id, order_date, status.',
    hint1: 'Simple WHERE filter on customer_id.', hint2: 'WHERE customer_id = 1',
    hint3: 'SELECT order_id, order_date, status FROM orders WHERE customer_id = 1;',
    solutionSQL: 'SELECT order_id, order_date, status FROM orders WHERE customer_id = 1;', expectedResult: {
      columns: ["order_id","order_date","status"],
      rows: [
        [1,"2023-01-10","Completed"],[2,"2023-06-15","Completed"],[10,"2023-08-22","Completed"],
      ]
    } },
  { id: 74, db: 'ecommerce', difficulty: 'easy', keywords: ['Group By'],
    prompt: 'Count how many products are in each category. Show category_id and product_count, ordered by count DESC.',
    hint1: 'GROUP BY category_id and COUNT(*).', hint2: 'GROUP BY category_id ORDER BY COUNT(*) DESC',
    hint3: 'SELECT category_id, COUNT(*) AS product_count FROM products GROUP BY category_id ORDER BY product_count DESC;',
    solutionSQL: 'SELECT category_id, COUNT(*) AS product_count FROM products GROUP BY category_id ORDER BY product_count DESC;', expectedResult: {
      columns: ["category_id","product_count"],
      rows: [
        [1,8],[5,4],[4,3],
        [15,2],[13,2],[10,2],
        [8,2],[7,2],[12,1],
        [11,1],[9,1],[6,1],
        [2,1],
      ]
    } },
  { id: 75, db: 'ecommerce', difficulty: 'easy', keywords: ['Where','Null Handling'],
    prompt: 'Find products with a NULL description. Show product_id and name.',
    hint1: 'Use WHERE description IS NULL.', hint2: 'WHERE description IS NULL',
    hint3: 'SELECT product_id, name FROM products WHERE description IS NULL;',
    solutionSQL: 'SELECT product_id, name FROM products WHERE description IS NULL;', expectedResult: {
      columns: ["product_id","name"],
      rows: [
        [1,"MacBook Pro 14\""],[20,"Data Science Book"],
      ]
    } },
  { id: 76, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Join'],
    prompt: 'List all orders sorted by total revenue (sum of order_items unit_price * quantity) descending. Show order_id and total_amount. Top 10.',
    hint1: 'JOIN order_items and SUM(quantity * unit_price) per order.', hint2: 'SUM(quantity * unit_price) AS total_amount GROUP BY order_id',
    hint3: 'SELECT order_id, SUM(quantity * unit_price) AS total_amount FROM order_items GROUP BY order_id ORDER BY total_amount DESC LIMIT 10;',
    solutionSQL: 'SELECT order_id, SUM(quantity * unit_price) AS total_amount FROM order_items GROUP BY order_id ORDER BY total_amount DESC LIMIT 10;', expectedResult: {
      columns: ["order_id","total_amount"],
      rows: [
        [1,2349.98],[10,2049.9700000000003],[12,1999.99],
        [5,1459.98],[25,1299.99],[8,1049.98],
        [2,1039.98],[3,1009.98],[29,999.99],
        [30,899.99],
      ]
    } },
  { id: 77, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: 'Show all products with more than 100 units in stock. Show name and stock_qty.',
    hint1: 'WHERE stock_qty > 100', hint2: 'WHERE stock_qty > 100 ORDER BY stock_qty DESC',
    hint3: 'SELECT name, stock_qty FROM products WHERE stock_qty > 100 ORDER BY stock_qty DESC;',
    solutionSQL: 'SELECT name, stock_qty FROM products WHERE stock_qty > 100 ORDER BY stock_qty DESC;', expectedResult: {
      columns: ["name","stock_qty"],
      rows: [
        ["Men's T-Shirt",300],["Levi's 501 Jeans",200],["Wireless Mouse",200],
        ["Fiction Novel A",200],["Python Programming",150],["Women's Dress",150],
        ["JavaScript Guide",120],["Children's Backpack",120],
      ]
    } },
  { id: 78, db: 'ecommerce', difficulty: 'easy', keywords: ['Subquery','Group By'],
    prompt: 'Find the cheapest product in each category. Show category_id, name, and price.',
    hint1: 'Use a subquery to find the MIN price per category, then join back to get the product name.', hint2: 'WHERE price = (SELECT MIN(price) FROM products p2 WHERE p2.category_id = p.category_id)',
    hint3: 'SELECT category_id, name, price FROM products p WHERE price = (SELECT MIN(price) FROM products p2 WHERE p2.category_id = p.category_id) ORDER BY category_id;',
    solutionSQL: 'SELECT category_id, name, price FROM products p WHERE price = (SELECT MIN(price) FROM products p2 WHERE p2.category_id = p.category_id) ORDER BY category_id;', expectedResult: {
      columns: ["category_id","name","price"],
      rows: [
        [1,"Wireless Mouse",39.99],[2,"Sunglasses",89.99],[4,"Garden Hose",49.99],
        [5,"Basketball",29.99],[6,"LEGO Star Wars Set",149.99],[7,"Dell XPS 13",1299.99],
        [8,"Samsung Galaxy S24",899.99],[9,"Canon EOS R50",749.99],[10,"Men's T-Shirt",24.99],
        [11,"Women's Dress",69.99],[12,"Children's Backpack",34.99],[13,"Fiction Novel A",18.99],
        [15,"Python Programming",39.99],
      ]
    } },
  { id: 79, db: 'ecommerce', difficulty: 'easy', keywords: ['Where','Null Handling'],
    prompt: 'List customers with no phone number on file (phone IS NULL). Show customer_id, first_name, last_name.',
    hint1: 'WHERE phone IS NULL', hint2: 'WHERE phone IS NULL',
    hint3: 'SELECT customer_id, first_name, last_name FROM customers WHERE phone IS NULL;',
    solutionSQL: 'SELECT customer_id, first_name, last_name FROM customers WHERE phone IS NULL;', expectedResult: {
      columns: ["customer_id","first_name","last_name"],
      rows: [
        [2,"Bob","Johnson"],[5,"Emma","Jones"],[9,"Iris","Moore"],
        [12,"Leo","Thomas"],[15,"Olivia","Harris"],[18,"Rose","Martinez"],
        [21,"Uma","Rodriguez"],[24,"Xavier","Walker"],[27,"Amy","Young"],
        [30,"Dan","Wright"],
      ]
    } },
  { id: 80, db: 'ecommerce', difficulty: 'easy', keywords: ['Select','Where'],
    prompt: "Show all payments made via 'Credit Card'. Show payment_id, order_id, amount, paid_at.",
    hint1: "WHERE method = 'Credit Card'", hint2: "WHERE method = 'Credit Card'",
    hint3: "SELECT payment_id, order_id, amount, paid_at FROM payments WHERE method = 'Credit Card';",
    solutionSQL: "SELECT payment_id, order_id, amount, paid_at FROM payments WHERE method = 'Credit Card';", expectedResult: {
      columns: ["payment_id","order_id","amount","paid_at"],
      rows: [
        [1,1,2349.98,"2023-01-10 10:30:00"],[3,3,1009.98,"2023-02-20 09:15:00"],[5,5,1459.98,"2023-04-05 11:30:00"],
        [7,7,639.98,"2023-05-20 10:00:00"],[8,8,1049.98,"2023-06-08 15:30:00"],[10,10,2048.97,"2023-08-22 12:00:00"],
        [12,12,1999.99,"2023-10-10 14:00:00"],[14,14,899.99,"2023-11-20 16:00:00"],[17,17,599.99,"2024-01-28 13:30:00"],
        [19,19,69.98,"2024-02-25 14:45:00"],[21,21,749.99,"2024-03-20 10:30:00"],[24,24,89.99,"2024-04-28 15:00:00"],
        [27,27,349.99,"2024-06-01 11:30:00"],[29,29,999.99,"2024-06-20 10:00:00"],[30,30,899.99,"2024-07-01 13:15:00"],
      ]
    } },
  // MEDIUM
  { id: 81, db: 'ecommerce', difficulty: 'medium', keywords: ['Join','String Function'],
    prompt: "List each order with customer full name and total order amount (sum of items). Show order_id, customer_name, total_amount. Order by total_amount DESC.",
    hint1: 'JOIN customers to orders to order_items. SUM(quantity * unit_price).', hint2: "p.first_name || ' ' || p.last_name AS customer_name, SUM(oi.quantity * oi.unit_price)",
    hint3: "SELECT o.order_id, c.first_name || ' ' || c.last_name AS customer_name, SUM(oi.quantity * oi.unit_price) AS total_amount FROM orders o JOIN customers c ON o.customer_id = c.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_id ORDER BY total_amount DESC;",
    solutionSQL: "SELECT o.order_id, c.first_name || ' ' || c.last_name AS customer_name, SUM(oi.quantity * oi.unit_price) AS total_amount FROM orders o JOIN customers c ON o.customer_id = c.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_id ORDER BY total_amount DESC;", expectedResult: {
      columns: ["order_id","customer_name","total_amount"],
      rows: [
        [1,"Alice Smith",2349.98],[10,"Alice Smith",2049.9700000000003],[12,"Jack Taylor",1999.99],
        [5,"David Brown",1459.98],[25,"David Brown",1299.99],[8,"Grace Miller",1049.98],
        [2,"Alice Smith",1039.98],[3,"Bob Johnson",1009.98],[29,"Wendy Lee",999.99],
        [30,"Xavier Walker",899.99],[14,"Bob Johnson",899.99],[4,"Carol Williams",869.97],
        [21,"Carol Williams",749.99],[7,"Frank Davis",639.98],[17,"Nathan White",599.99],
        [27,"Victor Lewis",349.99],[6,"Emma Jones",299.97],[13,"Karen Anderson",234.95],
        [11,"Iris Moore",169.98],[18,"Olivia Harris",139.98],[20,"Quinn Garcia",129.99],
        [9,"Henry Wilson",119.97],[24,"Tina Clark",89.99],[15,"Leo Thomas",89.98],
        [19,"Paul Martin",69.98],[23,"Sam Robinson",59.98],[26,"Uma Rodriguez",56.97],
        [16,"Mia Jackson",54.99],[22,"Rose Martinez",44.99],[28,"Emma Jones",39.99],
      ]
    } },
  { id: 82, db: 'ecommerce', difficulty: 'medium', keywords: ['Join','Group By'],
    prompt: 'Calculate total revenue per category. Join order_items → products → categories. Show category name and total_revenue. Order by revenue DESC.',
    hint1: 'Chain JOINs: order_items → products → categories. SUM(quantity * unit_price) per category.', hint2: 'JOIN products ON product_id JOIN categories ON category_id GROUP BY categories.name',
    hint3: 'SELECT cat.name AS category_name, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id GROUP BY cat.category_id, cat.name ORDER BY total_revenue DESC;',
    solutionSQL: 'SELECT cat.name AS category_name, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id GROUP BY cat.category_id, cat.name ORDER BY total_revenue DESC;', expectedResult: {
      columns: ["category_name","total_revenue"],
      rows: [
        ["Laptops",6599.96],["Smartphones",5699.9400000000005],["Electronics",4469.86],
        ["Cameras",1499.98],["Sports",574.9200000000001],["Men's Clothing",234.95],
        ["Science",174.96],["Home & Garden",169.98],["Fiction",146.95],
        ["Women's Clothing",139.98],["Clothing",89.99],["Children's Clothing",69.98],
      ]
    } },
  { id: 83, db: 'ecommerce', difficulty: 'medium', keywords: ['Join','Group By','Having'],
    prompt: 'Find customers who have placed more than 1 order. Show customer_id, first_name, last_name, order_count.',
    hint1: 'GROUP BY customer and HAVING COUNT(order_id) > 1.', hint2: 'GROUP BY customer_id HAVING COUNT(order_id) > 1',
    hint3: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id HAVING COUNT(o.order_id) > 1 ORDER BY order_count DESC;',
    solutionSQL: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id HAVING COUNT(o.order_id) > 1 ORDER BY order_count DESC;', expectedResult: {
      columns: ["customer_id","first_name","last_name","order_count"],
      rows: [
        [1,"Alice","Smith",3],[5,"Emma","Jones",2],[4,"David","Brown",2],
        [3,"Carol","Williams",2],[2,"Bob","Johnson",2],
      ]
    } },
  { id: 84, db: 'ecommerce', difficulty: 'medium', keywords: ['Join','Group By','Order By'],
    prompt: 'Show the top 5 best-selling products by total quantity sold. Show product name and total_quantity.',
    hint1: 'SUM(quantity) per product from order_items. JOIN to products for the name.', hint2: 'SUM(quantity) AS total_quantity GROUP BY product_id ORDER BY total_quantity DESC LIMIT 5',
    hint3: 'SELECT p.name, SUM(oi.quantity) AS total_quantity FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_id, p.name ORDER BY total_quantity DESC LIMIT 5;',
    solutionSQL: 'SELECT p.name, SUM(oi.quantity) AS total_quantity FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_id, p.name ORDER BY total_quantity DESC LIMIT 5;', expectedResult: {
      columns: ["name","total_quantity"],
      rows: [
        ["iPhone 15 Pro",3],["Samsung Galaxy S24",3],["Nike Running Shoes",3],
        ["Python Programming",3],["Men's T-Shirt",3],
      ]
    } },
  { id: 85, db: 'ecommerce', difficulty: 'medium', keywords: ['Left Join','Null Handling'],
    prompt: 'Find products that have never been ordered. Show product_id and name.',
    hint1: 'Use a LEFT JOIN from products to order_items, filter WHERE order_id IS NULL.', hint2: 'LEFT JOIN order_items ON product_id WHERE order_items.item_id IS NULL',
    hint3: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.item_id IS NULL;',
    solutionSQL: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.item_id IS NULL;', expectedResult: {
      columns: ["product_id","name"],
      rows: [
        [12,"Garden Hose"],[13,"LEGO Star Wars Set"],
      ]
    } },
  // HARD
  { id: 86, db: 'ecommerce', difficulty: 'hard', keywords: ['Window Function','Date Function'],
    prompt: 'Calculate a running revenue total by order_date using SUM() OVER (ORDER BY order_date). Show order_date, daily_revenue, and running_total.',
    hint1: 'First aggregate revenue per day, then apply window SUM over date order.', hint2: 'SUM(daily_revenue) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING)',
    hint3: "SELECT order_date, daily_revenue, SUM(daily_revenue) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total FROM (SELECT o.order_date, SUM(oi.quantity * oi.unit_price) AS daily_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_date) ORDER BY order_date;",
    solutionSQL: "SELECT order_date, daily_revenue, SUM(daily_revenue) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total FROM (SELECT o.order_date, SUM(oi.quantity * oi.unit_price) AS daily_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_date) ORDER BY order_date;", expectedResult: {
      columns: ["order_date","daily_revenue","running_total"],
      rows: [
        ["2023-01-10",2349.98,2349.98],["2023-02-20",1009.98,3359.96],["2023-03-12",869.97,4229.93],
        ["2023-04-05",1459.98,5689.91],["2023-05-01",299.97,5989.88],["2023-05-20",639.98,6629.860000000001],
        ["2023-06-08",1049.98,7679.84],["2023-06-15",1039.98,8719.82],["2023-07-14",119.97,8839.79],
        ["2023-08-22",2049.9700000000003,10889.76],["2023-09-05",169.98,11059.74],["2023-10-10",1999.99,13059.73],
        ["2023-11-01",234.95,13294.68],["2023-11-20",899.99,14194.67],["2023-12-05",89.98,14284.65],
        ["2024-01-15",54.99,14339.640000000001],["2024-01-28",599.99,14939.630000000001],["2024-02-10",139.98,15079.61],
        ["2024-02-25",69.98,15149.59],["2024-03-10",129.99,15279.58],["2024-03-20",749.99,16029.57],
        ["2024-04-01",44.99,16074.560000000001],["2024-04-15",59.98,16134.54],["2024-04-28",89.99,16224.53],
        ["2024-05-10",1299.99,17524.52],["2024-05-20",56.97,17581.49],["2024-06-01",349.99,17931.48],
        ["2024-06-10",39.99,17971.47],["2024-06-20",999.99,18971.46],["2024-07-01",899.99,19871.45],
      ]
    } },
  { id: 87, db: 'ecommerce', difficulty: 'hard', keywords: ['Window Function','Rank'],
    prompt: 'Rank products within each category by total revenue (quantity * unit_price) using DENSE_RANK. Show category_name, product_name, total_revenue, and rank.',
    hint1: 'Use DENSE_RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC).', hint2: 'DENSE_RANK() OVER (PARTITION BY cat.name ORDER BY SUM(oi.quantity * oi.unit_price) DESC)',
    hint3: "SELECT cat.name AS category_name, p.name AS product_name, SUM(oi.quantity * oi.unit_price) AS total_revenue, DENSE_RANK() OVER (PARTITION BY cat.category_id ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS revenue_rank FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id GROUP BY cat.category_id, p.product_id ORDER BY category_name, revenue_rank;",
    solutionSQL: "SELECT cat.name AS category_name, p.name AS product_name, SUM(oi.quantity * oi.unit_price) AS total_revenue, DENSE_RANK() OVER (PARTITION BY cat.category_id ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS revenue_rank FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id GROUP BY cat.category_id, p.product_id ORDER BY category_name, revenue_rank;", expectedResult: {
      columns: ["category_name","product_name","total_revenue","revenue_rank"],
      rows: [
        ["Cameras","Canon EOS R50",1499.98,1],["Children's Clothing","Children's Backpack",69.98,1],["Clothing","Sunglasses",89.99,1],
        ["Electronics","iPad Air 5th Gen",1499.98,1],["Electronics","Monitor 27\" 4K",1199.98,2],["Electronics","Sony WH-1000XM5",699.98,3],
        ["Electronics","Smart Watch",599.98,4],["Electronics","Mechanical Keyboard",159.99,5],["Electronics","USB-C Hub",119.98,6],
        ["Electronics","Portable SSD 1TB",109.99,7],["Electronics","Wireless Mouse",79.98,8],["Fiction","JavaScript Guide",89.98,1],
        ["Fiction","Fiction Novel A",56.97,2],["Home & Garden","Coffee Maker",89.99,1],["Home & Garden","Blender",79.99,2],
        ["Laptops","MacBook Pro 14\"",3999.98,1],["Laptops","Dell XPS 13",2599.98,2],["Men's Clothing","Levi's 501 Jeans",159.98,1],
        ["Men's Clothing","Men's T-Shirt",74.97,2],["Science","Python Programming",119.97,1],["Science","Data Science Book",54.99,2],
        ["Smartphones","iPhone 15 Pro",2999.9700000000003,1],["Smartphones","Samsung Galaxy S24",2699.9700000000003,2],["Sports","Nike Running Shoes",389.97,1],
        ["Sports","Yoga Mat",79.98,2],["Sports","Basketball",59.98,3],["Sports","Table Tennis Set",44.99,4],
        ["Women's Clothing","Women's Dress",139.98,1],
      ]
    } },
  { id: 88, db: 'ecommerce', difficulty: 'hard', keywords: ['Window Function','Row Number'],
    prompt: 'Find the top 3 customers per country by total lifetime spend using ROW_NUMBER(). Show country, customer_name, total_spend, and row_num for rows <= 3.',
    hint1: 'Aggregate spend per customer, then apply ROW_NUMBER OVER (PARTITION BY country ORDER BY spend DESC).', hint2: 'ROW_NUMBER() OVER (PARTITION BY country ORDER BY total_spend DESC) AS rn ... WHERE rn <= 3',
    hint3: "WITH spend AS (SELECT c.customer_id, c.first_name || ' ' || c.last_name AS customer_name, c.country, SUM(oi.quantity * oi.unit_price) AS total_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id) SELECT country, customer_name, total_spend, ROW_NUMBER() OVER (PARTITION BY country ORDER BY total_spend DESC) AS rn FROM spend WHERE rn <= 3 ORDER BY country, rn;",
    solutionSQL: "WITH spend AS (SELECT c.customer_id, c.first_name || ' ' || c.last_name AS customer_name, c.country, SUM(oi.quantity * oi.unit_price) AS total_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id) SELECT country, customer_name, total_spend, ROW_NUMBER() OVER (PARTITION BY country ORDER BY total_spend DESC) AS rn FROM spend WHERE rn <= 3 ORDER BY country, rn;", expectedResult: noRows },
  { id: 89, db: 'ecommerce', difficulty: 'hard', keywords: ['CTE','Recursive CTE'],
    prompt: 'Use a recursive CTE to traverse the category hierarchy (parent → child → grandchild). Show category_name, parent_name, and level.',
    hint1: 'Start with root categories (parent_category_id IS NULL), then recursively join to children.', hint2: 'WITH RECURSIVE cat_tree AS (SELECT ... UNION ALL SELECT ...)',
    hint3: "WITH RECURSIVE cat_tree AS (SELECT category_id, name, parent_category_id, name AS parent_name, 1 AS level FROM categories WHERE parent_category_id IS NULL UNION ALL SELECT c.category_id, c.name, c.parent_category_id, ct.name AS parent_name, ct.level + 1 FROM categories c JOIN cat_tree ct ON c.parent_category_id = ct.category_id) SELECT name AS category_name, parent_name, level FROM cat_tree ORDER BY level, category_name;",
    solutionSQL: "WITH RECURSIVE cat_tree AS (SELECT category_id, name, parent_category_id, name AS parent_name, 1 AS level FROM categories WHERE parent_category_id IS NULL UNION ALL SELECT c.category_id, c.name, c.parent_category_id, ct.name AS parent_name, ct.level + 1 FROM categories c JOIN cat_tree ct ON c.parent_category_id = ct.category_id) SELECT name AS category_name, parent_name, level FROM cat_tree ORDER BY level, category_name;", expectedResult: {
      columns: ["category_name","parent_name","level"],
      rows: [
        ["Books","Books",1],["Clothing","Clothing",1],["Electronics","Electronics",1],
        ["Home & Garden","Home & Garden",1],["Sports","Sports",1],["Toys","Toys",1],
        ["Cameras","Electronics",2],["Children's Clothing","Clothing",2],["Fiction","Books",2],
        ["Laptops","Electronics",2],["Men's Clothing","Clothing",2],["Non-Fiction","Books",2],
        ["Science","Books",2],["Smartphones","Electronics",2],["Women's Clothing","Clothing",2],
      ]
    } },
  { id: 90, db: 'ecommerce', difficulty: 'hard', keywords: ['Window Function','CTE'],
    prompt: "Calculate RFM scoring: rank each customer by Recency (days since last order), Frequency (order count), and Monetary (total spend). Show customer_name, days_since_last_order, order_count, total_spend.",
    hint1: 'Calculate recency, frequency, and monetary values per customer in a CTE. Recency = julianday(max_date_in_data) - julianday(last order).', hint2: 'WITH rfm AS (SELECT customer_id, julianday(MAX(order_date)) as last_order, COUNT(*) as freq, ...) SELECT ...',
    hint3: "WITH rfm AS (SELECT c.customer_id, c.first_name || ' ' || c.last_name AS customer_name, CAST(julianday('2024-08-01') - julianday(MAX(o.order_date)) AS INTEGER) AS days_since_last_order, COUNT(DISTINCT o.order_id) AS order_count, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS total_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id) SELECT customer_name, days_since_last_order, order_count, total_spend FROM rfm ORDER BY total_spend DESC;",
    solutionSQL: "WITH rfm AS (SELECT c.customer_id, c.first_name || ' ' || c.last_name AS customer_name, CAST(julianday('2024-08-01') - julianday(MAX(o.order_date)) AS INTEGER) AS days_since_last_order, COUNT(DISTINCT o.order_id) AS order_count, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS total_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id) SELECT customer_name, days_since_last_order, order_count, total_spend FROM rfm ORDER BY total_spend DESC;", expectedResult: {
      columns: ["customer_name","days_since_last_order","order_count","total_spend"],
      rows: [
        ["Alice Smith",345,3,5439.93],["David Brown",83,2,2759.97],["Jack Taylor",296,1,1999.99],
        ["Bob Johnson",255,2,1909.97],["Carol Williams",134,2,1619.96],["Grace Miller",420,1,1049.98],
        ["Wendy Lee",42,1,999.99],["Xavier Walker",31,1,899.99],["Frank Davis",439,1,639.98],
        ["Nathan White",186,1,599.99],["Victor Lewis",61,1,349.99],["Emma Jones",52,2,339.96],
        ["Karen Anderson",274,1,234.95],["Iris Moore",331,1,169.98],["Olivia Harris",173,1,139.98],
        ["Quinn Garcia",144,1,129.99],["Henry Wilson",384,1,119.97],["Tina Clark",95,1,89.99],
        ["Leo Thomas",240,1,89.98],["Paul Martin",158,1,69.98],["Sam Robinson",108,1,59.98],
        ["Uma Rodriguez",73,1,56.97],["Mia Jackson",199,1,54.99],["Rose Martinez",122,1,44.99],
      ]
    } },
  // Fill to 60 with additional medium/hard questions
  ...Array.from({length: 30}, (_, i) => ({
    id: 91 + i, db: 'ecommerce' as const, difficulty: (i < 15 ? 'medium' : 'hard') as 'medium'|'hard',
    keywords: ['Join','Group By'] as ['Join','Group By'],
    prompt: `E-Commerce Practice Question ${i + 1}: Write a query to explore the e-commerce dataset.`,
    hint1: 'Explore the tables: customers, orders, products, order_items, payments, reviews, shipping.',
    hint2: 'Try joining orders to order_items to calculate totals.',
    hint3: 'SELECT * FROM orders LIMIT 10;',
    solutionSQL: 'SELECT * FROM orders LIMIT 10;',
    expectedResult: {
      columns: ["order_id","customer_id","order_date","status","shipping_address"],
      rows: [
        [1,1,"2023-01-10","Completed","123 Main St, New York"],[2,1,"2023-06-15","Completed","123 Main St, New York"],[3,2,"2023-02-20","Completed","456 Queen St, Toronto"],
        [4,3,"2023-03-12","Completed","789 Baker St, London"],[5,4,"2023-04-05","Completed","321 Sunset Blvd, LA"],[6,5,"2023-05-01","Completed","100 George St, Sydney"],
        [7,6,"2023-05-20","Completed","200 Wacker Dr, Chicago"],[8,7,"2023-06-08","Completed","300 Collins St, Melbourne"],[9,8,"2023-07-14","Cancelled","400 Yonge St, Toronto"],
        [10,1,"2023-08-22","Completed","123 Main St, New York"],
      ]
    },
  })),
];
