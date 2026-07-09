import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/ecommerce.jsx');

const code = `const noRows = {
  columns: [],
  rows: []
};

const make = (id, db, diff, kw, prompt, h1, h2, h3, sql) => ({
  id,
  db,
  difficulty: diff,
  keywords: kw,
  prompt,
  hint1: h1,
  hint2: h2,
  hint3: h3,
  solutionSQL: sql,
  expectedResult: noRows
});

// E-COMMERCE QUESTIONS (IDs 61-120)
export const ecommerceQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================
  
  make(61, 'ecommerce', 'easy', ['topic:Data Cleaning', 'Where', 'company:Amazon'], 
    "The fulfillment team suspects some data entry issues with shipping times. Find all shipments where the delivered_at timestamp is earlier than the shipped_at timestamp. Return shipment_id, shipped_at, and delivered_at.", 
    "Look for logical inconsistencies in the timestamps.", "Use a WHERE clause to compare delivered_at and shipped_at.", 
    "SELECT shipment_id, shipped_at, delivered_at FROM shipping WHERE delivered_at < shipped_at;", 
    "SELECT shipment_id, shipped_at, delivered_at FROM shipping WHERE delivered_at < shipped_at;"),

  make(62, 'ecommerce', 'easy', ['topic:Basic SQL', 'String Functions', 'company:Shopify'], 
    "Marketing wants a clean mailing list. Retrieve the full names (formatted as 'Lastname, Firstname') and email addresses of all customers who registered in 2024.", 
    "Concatenate last_name, a comma, and first_name.", "Extract the year from registered_at.", 
    "SELECT last_name || ', ' || first_name AS full_name, email FROM customers WHERE registered_at >= '2024-01-01';", 
    "SELECT last_name || ', ' || first_name AS full_name, email FROM customers WHERE registered_at >= '2024-01-01';"),

  make(63, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:eBay'], 
    "Analyze payment preferences. Calculate the total amount received for each payment method. Group the result by method.", 
    "Filter or assume all amounts are received.", "Group by method and sum the amount.", 
    "SELECT method, SUM(amount) AS total_received FROM payments GROUP BY method;", 
    "SELECT method, SUM(amount) AS total_received FROM payments GROUP BY method;"),

  make(64, 'ecommerce', 'easy', ['topic:Data Analysis', 'Distinct', 'company:Etsy'], 
    "The logistics team wants to know how many distinct countries we have shipped to (based on customer accounts). Return a single column named 'unique_countries'.", 
    "Use the DISTINCT keyword inside an aggregate function.", "COUNT(DISTINCT country)", 
    "SELECT COUNT(DISTINCT country) AS unique_countries FROM customers;", 
    "SELECT COUNT(DISTINCT country) AS unique_countries FROM customers;"),

  make(65, 'ecommerce', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Walmart'], 
    "Identify incomplete customer profiles. Find the customer IDs and emails for all customers who have not provided a phone number (phone IS NULL).", 
    "Check if phone IS NULL.", "No tricks here.", 
    "SELECT customer_id, email FROM customers WHERE phone IS NULL;", 
    "SELECT customer_id, email FROM customers WHERE phone IS NULL;"),

  make(66, 'ecommerce', 'easy', ['topic:Date Functions', 'Where', 'company:Target'], 
    "Find all orders that were placed on Valentine's Day (February 14, 2023 or 2024). Return the order_id and customer_id.", 
    "Extract the month and day from order_date.", "Filter for -02-14.", 
    "SELECT order_id, customer_id FROM orders WHERE order_date LIKE '%-02-14';", 
    "SELECT order_id, customer_id FROM orders WHERE order_date LIKE '%-02-14';"),

  make(67, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Stripe'], 
    "Calculate the average rating given in all product reviews. Return the value rounded to two decimal places as 'avg_rating'.", 
    "Use AVG() on the rating column.", "Use ROUND(value, 2).", 
    "SELECT ROUND(AVG(rating), 2) AS avg_rating FROM reviews;", 
    "SELECT ROUND(AVG(rating), 2) AS avg_rating FROM reviews;"),

  make(68, 'ecommerce', 'easy', ['topic:Data Analysis', 'Limit', 'company:Wayfair'], 
    "Find the top 5 most expensive products in our catalog. Return their name and price.", 
    "Sort by price descending.", "Limit the result to 5.", 
    "SELECT name, price FROM products ORDER BY price DESC LIMIT 5;", 
    "SELECT name, price FROM products ORDER BY price DESC LIMIT 5;"),

  make(69, 'ecommerce', 'easy', ['topic:Basic SQL', 'In', 'company:BestBuy'], 
    "Identify electronics orders. Find all products that belong to category IDs 7, 8, or 9 (Laptops, Smartphones, Cameras). Return the name and stock_qty.", 
    "Use the IN operator.", "Filter on category_id.", 
    "SELECT name, stock_qty FROM products WHERE category_id IN (7, 8, 9);", 
    "SELECT name, stock_qty FROM products WHERE category_id IN (7, 8, 9);"),

  make(70, 'ecommerce', 'easy', ['topic:Basic SQL', 'Like', 'company:Alibaba'], 
    "Customer service needs to locate a supplier whose company name starts with 'Tech'. Return their company_name and contact_email.", 
    "Use LIKE 'Tech%'", "Filter on company_name.", 
    "SELECT company_name, contact_email FROM suppliers WHERE company_name LIKE 'Tech%';", 
    "SELECT company_name, contact_email FROM suppliers WHERE company_name LIKE 'Tech%';"),

  make(71, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Google'], 
    "How many orders exist for each status? Return the status and the count of orders, ordered from highest count to lowest.", 
    "Group by status.", "Count the rows and order by count descending.", 
    "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;", 
    "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;"),

  make(72, 'ecommerce', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Microsoft'], 
    "Standardize the display format for suppliers. Return a single column named 'supplier_info' in the format: 'Company [Country]'.", 
    "Concatenate company_name, ' [', country, and ']'.", "Use string concatenation operators.", 
    "SELECT company_name || ' [' || country || ']' AS supplier_info FROM suppliers;", 
    "SELECT company_name || ' [' || country || ']' AS supplier_info FROM suppliers;"),

  make(73, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Tesla'], 
    "Calculate the total potential inventory value (price * stock_qty) of all products currently in stock. Return as 'total_inventory_value'.", 
    "Multiply price by stock_qty inside the SUM function.", "No filtering needed unless stock_qty is null.", 
    "SELECT SUM(price * stock_qty) AS total_inventory_value FROM products;", 
    "SELECT SUM(price * stock_qty) AS total_inventory_value FROM products;"),

  make(74, 'ecommerce', 'easy', ['topic:Basic SQL', 'Where', 'company:Oracle'], 
    "Find payments that are 'Failed' and were attempted before January 1, 2024. Return payment_id and amount.", 
    "Filter by status and paid_at.", "Ensure date format matches.", 
    "SELECT payment_id, amount FROM payments WHERE status = 'Failed' AND paid_at < '2024-01-01';", 
    "SELECT payment_id, amount FROM payments WHERE status = 'Failed' AND paid_at < '2024-01-01';"),

  make(75, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Salesforce'], 
    "Determine the minimum, maximum, and average quantity ordered for any single item in the order_items table. Return as min_qty, max_qty, and avg_qty.", 
    "Use MIN(), MAX(), and AVG() functions.", "Apply them to the quantity column.", 
    "SELECT MIN(quantity) AS min_qty, MAX(quantity) AS max_qty, ROUND(AVG(quantity), 2) AS avg_qty FROM order_items;", 
    "SELECT MIN(quantity) AS min_qty, MAX(quantity) AS max_qty, ROUND(AVG(quantity), 2) AS avg_qty FROM order_items;"),

  make(76, 'ecommerce', 'easy', ['topic:Data Analysis', 'Group By', 'company:Netflix'], 
    "Which country has the most registered customers in our database? Return the country and the number of customers, ordered highest to lowest, limit 1.", 
    "Group by country.", "Count the customers, order desc, limit 1.", 
    "SELECT country, COUNT(*) as customer_count FROM customers GROUP BY country ORDER BY customer_count DESC LIMIT 1;", 
    "SELECT country, COUNT(*) as customer_count FROM customers GROUP BY country ORDER BY customer_count DESC LIMIT 1;"),

  make(77, 'ecommerce', 'easy', ['topic:Basic SQL', 'Where', 'company:Uber'], 
    "Find all reviews where the rating is exactly 5 stars. Return review_id, product_id, and customer_id.", 
    "Use WHERE rating = 5.", "No tricks, just direct filtering.", 
    "SELECT review_id, product_id, customer_id FROM reviews WHERE rating = 5;", 
    "SELECT review_id, product_id, customer_id FROM reviews WHERE rating = 5;"),

  make(78, 'ecommerce', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:Meta'], 
    "How many unique carriers have we used for shipping? Return as unique_carriers.", 
    "Use COUNT(DISTINCT carrier).", "Look in the shipping table.", 
    "SELECT COUNT(DISTINCT carrier) AS unique_carriers FROM shipping;", 
    "SELECT COUNT(DISTINCT carrier) AS unique_carriers FROM shipping;"),

  make(79, 'ecommerce', 'easy', ['topic:String Functions', 'Like', 'company:Apple'], 
    "Find all products where the description contains the word 'Apple'. Return name and description.", 
    "Use LIKE '%Apple%'.", "Filter on description.", 
    "SELECT name, description FROM products WHERE description LIKE '%Apple%';", 
    "SELECT name, description FROM products WHERE description LIKE '%Apple%';"),

  make(80, 'ecommerce', 'easy', ['topic:Math', 'Aggregate Functions', 'company:Amazon'], 
    "Calculate the total items currently out of stock (stock_qty = 0). Return the count of such products.", 
    "Use COUNT(*).", "Filter for stock_qty = 0.", 
    "SELECT COUNT(*) AS out_of_stock_count FROM products WHERE stock_qty = 0;", 
    "SELECT COUNT(*) AS out_of_stock_count FROM products WHERE stock_qty = 0;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(81, 'ecommerce', 'medium', ['topic:Joins', 'Math', 'company:Airbnb'], 
    "The finance team wants to reconcile order totals. For order_id 10, calculate the total expected revenue by multiplying the quantity by unit_price for all items in that order. Return the order_id and the expected_total.", 
    "Join orders and order_items.", "Sum (quantity * unit_price) for order_id 10.", 
    "SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS expected_total FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_id = 10 GROUP BY o.order_id;", 
    "SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS expected_total FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_id = 10 GROUP BY o.order_id;"),

  make(82, 'ecommerce', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Uber'], 
    "Identify our most valuable suppliers. Calculate the total inventory value (stock_qty * price) provided by each supplier. Return supplier company_name and total_inventory_value. Only include suppliers with a total inventory value > $5,000.", 
    "Join suppliers to products.", "Group by supplier, use SUM(stock_qty * price), and HAVING for the threshold.", 
    "SELECT s.company_name, SUM(p.stock_qty * p.price) AS total_inventory_value FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id GROUP BY s.company_name HAVING total_inventory_value > 5000;", 
    "SELECT s.company_name, SUM(p.stock_qty * p.price) AS total_inventory_value FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id GROUP BY s.company_name HAVING total_inventory_value > 5000;"),

  make(83, 'ecommerce', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:Meta'], 
    "Find the customers who have placed an order with a status of 'Cancelled'. Return their first and last names, and the order_date. Order by order_date descending.", 
    "Use a join between customers and orders.", "Filter for status = 'Cancelled'.", 
    "SELECT c.first_name, c.last_name, o.order_date FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = 'Cancelled' ORDER BY o.order_date DESC;", 
    "SELECT c.first_name, c.last_name, o.order_date FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = 'Cancelled' ORDER BY o.order_date DESC;"),

  make(84, 'ecommerce', 'medium', ['topic:Joins', 'Group By', 'company:Databricks'], 
    "Analyze product popularity. Which product category has sold the highest total quantity of items? Return the category name and the total quantity sold.", 
    "Join categories, products, and order_items.", "Group by category name, sum the quantity, order desc, limit 1.", 
    "SELECT c.name, SUM(oi.quantity) AS total_sold FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.name ORDER BY total_sold DESC LIMIT 1;", 
    "SELECT c.name, SUM(oi.quantity) AS total_sold FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.name ORDER BY total_sold DESC LIMIT 1;"),

  make(85, 'ecommerce', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:Amazon'], 
    "Create a product price tier classification. Categorize products as 'Budget' (< $50), 'Mid-Range' (>= $50 and <= $200), or 'Premium' (> $200). Count how many products fall into each tier.", 
    "Use a CASE statement inside a SELECT clause, then group by it.", "Filter on price.", 
    "SELECT CASE WHEN price < 50 THEN 'Budget' WHEN price <= 200 THEN 'Mid-Range' ELSE 'Premium' END AS price_tier, COUNT(*) AS product_count FROM products GROUP BY price_tier;", 
    "SELECT CASE WHEN price < 50 THEN 'Budget' WHEN price <= 200 THEN 'Mid-Range' ELSE 'Premium' END AS price_tier, COUNT(*) AS product_count FROM products GROUP BY price_tier;"),

  make(86, 'ecommerce', 'medium', ['topic:Joins', 'Null Handling', 'company:Snowflake'], 
    "Marketing wants a list of products that have never been ordered. Return the product ID and name of these products.", 
    "Find products that appear in products but NOT in order_items.", "Use a LEFT JOIN or NOT IN.", 
    "SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.item_id IS NULL;", 
    "SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.item_id IS NULL;"),

  make(87, 'ecommerce', 'medium', ['topic:Aggregate Functions', 'Math', 'company:Stripe'], 
    "Calculate the Average Order Value (AOV) for 'Completed' orders. The AOV is the sum of all payments for completed orders divided by the number of unique completed orders. Return as 'aov' rounded to 2 decimals.", 
    "Join orders and payments.", "Ensure floating point division.", 
    "SELECT ROUND(SUM(p.amount) / COUNT(DISTINCT o.order_id), 2) AS aov FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE o.status = 'Completed' AND p.status = 'Completed';", 
    "SELECT ROUND(SUM(p.amount) / COUNT(DISTINCT o.order_id), 2) AS aov FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE o.status = 'Completed' AND p.status = 'Completed';"),

  make(88, 'ecommerce', 'medium', ['topic:Joins', 'Self Join', 'company:Google'], 
    "Find pairs of products that share the exact same price and belong to the same category. Return their names and the shared price. Ensure pairs are unique.", 
    "Self join the products table.", "Join on category_id and price, use p1.product_id < p2.product_id.", 
    "SELECT p1.name AS product1, p2.name AS product2, p1.price FROM products p1 JOIN products p2 ON p1.category_id = p2.category_id AND p1.price = p2.price AND p1.product_id < p2.product_id;", 
    "SELECT p1.name AS product1, p2.name AS product2, p1.price FROM products p1 JOIN products p2 ON p1.category_id = p2.category_id AND p1.price = p2.price AND p1.product_id < p2.product_id;"),

  make(89, 'ecommerce', 'medium', ['topic:Date Functions', 'Aggregate Functions', 'company:Netflix'], 
    "We need to audit our shipping performance. Calculate the average delivery time (delivered_at - shipped_at) in days for all shipments handled by 'FedEx'.", 
    "Use julianday() to find the difference in days.", "Filter for carrier = 'FedEx' and delivered_at IS NOT NULL.", 
    "SELECT ROUND(AVG(julianday(delivered_at) - julianday(shipped_at)), 2) AS avg_delivery_days FROM shipping WHERE carrier = 'FedEx' AND delivered_at IS NOT NULL;", 
    "SELECT ROUND(AVG(julianday(delivered_at) - julianday(shipped_at)), 2) AS avg_delivery_days FROM shipping WHERE carrier = 'FedEx' AND delivered_at IS NOT NULL;"),

  make(90, 'ecommerce', 'medium', ['topic:Joins', 'Group By', 'company:Apple'], 
    "Customer success needs to know which customer has submitted the most 1-star reviews. Find the customer (first_name, last_name) who has written the highest number of reviews with a rating of 1.", 
    "Join customers and reviews.", "Count reviews, sort descending, limit 1.", 
    "SELECT c.first_name, c.last_name, COUNT(r.review_id) AS negative_reviews FROM customers c JOIN reviews r ON c.customer_id = r.customer_id WHERE r.rating = 1 GROUP BY c.customer_id ORDER BY negative_reviews DESC LIMIT 1;", 
    "SELECT c.first_name, c.last_name, COUNT(r.review_id) AS negative_reviews FROM customers c JOIN reviews r ON c.customer_id = r.customer_id WHERE r.rating = 1 GROUP BY c.customer_id ORDER BY negative_reviews DESC LIMIT 1;"),

  make(91, 'ecommerce', 'medium', ['topic:Subqueries', 'Having', 'company:Microsoft'], 
    "Identify highly rated products. Find the names of products where their average review rating is at least 4.5. Also return the average rating.", 
    "Join products and reviews.", "Group by product, use HAVING AVG(rating) >= 4.5.", 
    "SELECT p.name, AVG(r.rating) AS avg_rating FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id HAVING AVG(r.rating) >= 4.5;", 
    "SELECT p.name, ROUND(AVG(r.rating), 2) AS avg_rating FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id HAVING AVG(r.rating) >= 4.5;"),

  make(92, 'ecommerce', 'medium', ['topic:Joins', 'Date Functions', 'company:Tesla'], 
    "A customer service rep is looking for instances where a customer placed two orders within 30 days of each other. Return customer_id, order1_id, and order2_id.", 
    "Self join orders on customer_id.", "Compare order_date of order 1 with order_date of order 2.", 
    "SELECT o1.customer_id, o1.order_id AS order1, o2.order_id AS order2 FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.order_id < o2.order_id WHERE (julianday(o2.order_date) - julianday(o1.order_date)) BETWEEN 0 AND 30;", 
    "SELECT o1.customer_id, o1.order_id AS order1, o2.order_id AS order2 FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.order_id < o2.order_id WHERE (julianday(o2.order_date) - julianday(o1.order_date)) BETWEEN 0 AND 30;"),

  make(93, 'ecommerce', 'medium', ['topic:Joins', 'Group By', 'company:Salesforce'], 
    "Determine the most frequent shipping destination country for our products. Return the country and the number of shipments.", 
    "Join shipping, orders, and customers.", "Group by customer country, sort and limit.", 
    "SELECT c.country, COUNT(s.shipment_id) AS shipments FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN shipping s ON o.order_id = s.order_id GROUP BY c.country ORDER BY shipments DESC LIMIT 1;", 
    "SELECT c.country, COUNT(s.shipment_id) AS shipments FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN shipping s ON o.order_id = s.order_id GROUP BY c.country ORDER BY shipments DESC LIMIT 1;"),

  make(94, 'ecommerce', 'medium', ['topic:Case Statements', 'Math', 'company:Airbnb'], 
    "The finance team needs to calculate net revenue after applying a refund policy for returned items. If an order status was 'Refunded', subtract the payment amount from revenue. Calculate total net revenue.", 
    "Use a CASE statement inside a SUM to multiply amount by -1 or 1 based on status.", "Join orders and payments.", 
    "SELECT SUM(CASE WHEN o.status = 'Refunded' THEN -p.amount ELSE p.amount END) AS net_revenue FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' OR p.status = 'Refunded';", 
    "SELECT SUM(CASE WHEN o.status = 'Refunded' THEN -p.amount ELSE p.amount END) AS net_revenue FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' OR p.status = 'Refunded';"),

  make(95, 'ecommerce', 'medium', ['topic:Subqueries', 'In', 'company:Oracle'], 
    "Find all customers who have purchased products supplied by 'GlobalGadgets'. Return distinct first and last names.", 
    "Join customers, orders, order_items, products, and suppliers.", "Filter for company_name = 'GlobalGadgets'.", 
    "SELECT DISTINCT c.first_name, c.last_name FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE s.company_name = 'GlobalGadgets';", 
    "SELECT DISTINCT c.first_name, c.last_name FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE s.company_name = 'GlobalGadgets';"),

  make(96, 'ecommerce', 'medium', ['topic:CTEs', 'Data Analysis', 'company:Amazon'], 
    "Using a Common Table Expression (CTE), calculate the total number of orders placed per month in 2023. Then query the CTE to find the month(s) with the maximum number of orders.", 
    "CTE to count orders group by strftime('%m', order_date).", "Main query selects from CTE where count equals the MAX of the count.", 
    "WITH MonthlyOrders AS (SELECT strftime('%Y-%m', order_date) as order_month, COUNT(*) as order_count FROM orders WHERE order_date LIKE '2023-%' GROUP BY order_month) SELECT order_month FROM MonthlyOrders WHERE order_count = (SELECT MAX(order_count) FROM MonthlyOrders);", 
    "WITH MonthlyOrders AS (SELECT strftime('%Y-%m', order_date) as order_month, COUNT(*) as order_count FROM orders WHERE order_date LIKE '2023-%' GROUP BY order_month) SELECT order_month FROM MonthlyOrders WHERE order_count = (SELECT MAX(order_count) FROM MonthlyOrders);"),

  make(97, 'ecommerce', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Uber'], 
    "Find the customer who has spent the most money across all their orders. Return their first name, last name, and total spent.", 
    "Join customers, orders, and payments.", "Sum amount, sort descending, limit 1.", 
    "SELECT c.first_name, c.last_name, SUM(p.amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY c.customer_id ORDER BY total_spent DESC LIMIT 1;", 
    "SELECT c.first_name, c.last_name, SUM(p.amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY c.customer_id ORDER BY total_spent DESC LIMIT 1;"),

  make(98, 'ecommerce', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:Databricks'], 
    "Identify cross-category shoppers. Find customers who have purchased products from both the 'Electronics' category and the 'Clothing' category. Return their customer IDs.", 
    "Use INTERSECT between two subqueries.", "Or use COUNT(DISTINCT) with a HAVING clause.", 
    "SELECT c.customer_id FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id WHERE cat.name = 'Electronics' INTERSECT SELECT c.customer_id FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id WHERE cat.name = 'Clothing';", 
    "SELECT c.customer_id FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id WHERE cat.name = 'Electronics' INTERSECT SELECT c.customer_id FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN categories cat ON p.category_id = cat.category_id WHERE cat.name = 'Clothing';"),

  make(99, 'ecommerce', 'medium', ['topic:Subqueries', 'Null Handling', 'company:Apple'], 
    "The marketing team suspects some fake accounts. Find customers who registered but have never placed an order. Return their customer_id and full name.", 
    "Use a LEFT JOIN and check for NULL.", "Or use NOT IN (SELECT customer_id FROM orders).", 
    "SELECT customer_id, first_name || ' ' || last_name AS full_name FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders);", 
    "SELECT customer_id, first_name || ' ' || last_name AS full_name FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders);"),

  make(100, 'ecommerce', 'medium', ['topic:Math', 'Group By', 'company:Stripe'], 
    "Calculate the 'return' rate for each product. A return is when an order status is 'Refunded'. Return product name and return rate as a percentage. Only show products with at least 1 order.", 
    "Calculate (Total refunded / Total orders) * 100.", "Group by product.", 
    "SELECT p.name, ROUND(SUM(CASE WHEN o.status = 'Refunded' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS return_rate FROM products p JOIN order_items oi ON p.product_id = oi.product_id JOIN orders o ON oi.order_id = o.order_id GROUP BY p.product_id HAVING COUNT(o.order_id) > 0;", 
    "SELECT p.name, ROUND(SUM(CASE WHEN o.status = 'Refunded' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS return_rate FROM products p JOIN order_items oi ON p.product_id = oi.product_id JOIN orders o ON oi.order_id = o.order_id GROUP BY p.product_id HAVING COUNT(o.order_id) > 0;"),

  make(101, 'ecommerce', 'medium', ['topic:Data Analysis', 'Group By', 'company:Airbnb'], 
    "Determine the most profitable day of the week (Monday=1, Sunday=0) for placing orders. Return the day number and total revenue.", 
    "Extract the day of the week from order_date.", "Group by this value, sum amount, and sort descending.", 
    "SELECT strftime('%w', o.order_date) AS day_of_week, SUM(p.amount) AS total_revenue FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY day_of_week ORDER BY total_revenue DESC LIMIT 1;", 
    "SELECT strftime('%w', o.order_date) AS day_of_week, SUM(p.amount) AS total_revenue FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY day_of_week ORDER BY total_revenue DESC LIMIT 1;"),

  make(102, 'ecommerce', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Netflix'], 
    "Find the supplier with the most delayed shipments. Assume a shipment is delayed if delivered_at is more than 5 days after shipped_at. Return supplier company_name and delayed_count.", 
    "Join suppliers, products, order_items, orders, and shipping.", "Filter for delay > 5, group by supplier.", 
    "SELECT su.company_name, COUNT(DISTINCT s.shipment_id) as delayed_count FROM suppliers su JOIN products p ON su.supplier_id = p.supplier_id JOIN order_items oi ON p.product_id = oi.product_id JOIN shipping s ON oi.order_id = s.order_id WHERE (julianday(s.delivered_at) - julianday(s.shipped_at)) > 5 GROUP BY su.supplier_id ORDER BY delayed_count DESC LIMIT 1;", 
    "SELECT su.company_name, COUNT(DISTINCT s.shipment_id) as delayed_count FROM suppliers su JOIN products p ON su.supplier_id = p.supplier_id JOIN order_items oi ON p.product_id = oi.product_id JOIN shipping s ON oi.order_id = s.order_id WHERE (julianday(s.delivered_at) - julianday(s.shipped_at)) > 5 GROUP BY su.supplier_id ORDER BY delayed_count DESC LIMIT 1;"),

  make(103, 'ecommerce', 'medium', ['topic:Date Functions', 'CTEs', 'company:Meta'], 
    "List all payments that were made more than 7 days after the order was placed. Return order_id and the delay in days.", 
    "Use julianday difference between paid_at and order_date.", "Filter for difference > 7.", 
    "SELECT o.order_id, ROUND(julianday(p.paid_at) - julianday(o.order_date)) AS delay_days FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.paid_at IS NOT NULL AND (julianday(p.paid_at) - julianday(o.order_date)) > 7;", 
    "SELECT o.order_id, ROUND(julianday(p.paid_at) - julianday(o.order_date)) AS delay_days FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.paid_at IS NOT NULL AND (julianday(p.paid_at) - julianday(o.order_date)) > 7;"),

  make(104, 'ecommerce', 'medium', ['topic:String Functions', 'Basic SQL', 'company:Google'], 
    "Generate a receipt string for all completed orders. Format: 'ORDER [ID]: [TOTAL] paid via [METHOD]'.", 
    "Join orders and payments.", "Use string concatenation.", 
    "SELECT 'ORDER ' || o.order_id || ': ' || p.amount || ' paid via ' || p.method AS receipt FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE o.status = 'Completed' AND p.status = 'Completed';", 
    "SELECT 'ORDER ' || o.order_id || ': ' || p.amount || ' paid via ' || p.method AS receipt FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE o.status = 'Completed' AND p.status = 'Completed';"),

  make(105, 'ecommerce', 'medium', ['topic:Group By', 'Having', 'company:Salesforce'], 
    "Identify products that are frequently reviewed. Find products that have more than 3 reviews and an average rating below 3. Return product_id and avg_rating.", 
    "Join products and reviews.", "Group by product, use HAVING count > 3 and avg < 3.", 
    "SELECT product_id, AVG(rating) as avg_rating FROM reviews GROUP BY product_id HAVING COUNT(review_id) > 3 AND AVG(rating) < 3;", 
    "SELECT product_id, AVG(rating) as avg_rating FROM reviews GROUP BY product_id HAVING COUNT(review_id) > 3 AND AVG(rating) < 3;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(106, 'ecommerce', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Netflix'], 
    "Identify 'repeat buyers'. Find customers who placed a second order within exactly 30 days of their first order. Return their customer_id.", 
    "Use the LEAD() function over a partition of customer_id ordered by order_date.", "Check the time difference.", 
    "WITH OrderedDates AS (SELECT customer_id, order_date, LEAD(order_date) OVER(PARTITION BY customer_id ORDER BY order_date) as next_order FROM orders) SELECT DISTINCT customer_id FROM OrderedDates WHERE next_order IS NOT NULL AND (julianday(next_order) - julianday(order_date)) <= 30;", 
    "WITH OrderedDates AS (SELECT customer_id, order_date, LEAD(order_date) OVER(PARTITION BY customer_id ORDER BY order_date) as next_order FROM orders) SELECT DISTINCT customer_id FROM OrderedDates WHERE next_order IS NOT NULL AND (julianday(next_order) - julianday(order_date)) <= 30;"),

  make(107, 'ecommerce', 'hard', ['topic:Window Functions', 'CTEs', 'company:Meta'], 
    "Calculate the 7-day rolling average of daily revenue. Group orders by their order_date. Return date and rolling_avg.", 
    "First, calculate daily revenue.", "Then apply a window function ROWS BETWEEN 6 PRECEDING AND CURRENT ROW.", 
    "WITH DailyRev AS (SELECT DATE(o.order_date) as o_date, SUM(p.amount) as rev FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY DATE(o.order_date)) SELECT o_date, ROUND(AVG(rev) OVER(ORDER BY o_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as rolling_avg FROM DailyRev;", 
    "WITH DailyRev AS (SELECT DATE(o.order_date) as o_date, SUM(p.amount) as rev FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY DATE(o.order_date)) SELECT o_date, ROUND(AVG(rev) OVER(ORDER BY o_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as rolling_avg FROM DailyRev;"),

  make(108, 'ecommerce', 'hard', ['topic:Window Functions', 'Data Analysis', 'company:Amazon'], 
    "Detect 'shipping anomalies'. A shipping anomaly happens when a shipment is marked as delivered, but the payment for that order is still 'Pending' or 'Failed'. Return the order IDs.", 
    "Join orders, shipping, and payments.", "Check the statuses.", 
    "SELECT DISTINCT o.order_id FROM orders o JOIN shipping s ON o.order_id = s.order_id JOIN payments p ON o.order_id = p.order_id WHERE s.delivered_at IS NOT NULL AND p.status IN ('Pending', 'Failed');", 
    "SELECT DISTINCT o.order_id FROM orders o JOIN shipping s ON o.order_id = s.order_id JOIN payments p ON o.order_id = p.order_id WHERE s.delivered_at IS NOT NULL AND p.status IN ('Pending', 'Failed');"),

  make(109, 'ecommerce', 'hard', ['topic:Window Functions', 'Rank', 'company:Google'], 
    "For each product category, rank the products by their total revenue generated. Return Category Name, Product Name, Revenue, and Rank (1 being highest).", 
    "Join categories, products, order_items.", "Use DENSE_RANK() partitioned by category ordered by revenue.", 
    "WITH Rev AS (SELECT c.name as category_name, p.name as product_name, COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue FROM categories c JOIN products p ON c.category_id = p.category_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.name, p.name) SELECT category_name, product_name, revenue, DENSE_RANK() OVER(PARTITION BY category_name ORDER BY revenue DESC) as rank FROM Rev;", 
    "WITH Rev AS (SELECT c.name as category_name, p.name as product_name, COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue FROM categories c JOIN products p ON c.category_id = p.category_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.name, p.name) SELECT category_name, product_name, revenue, DENSE_RANK() OVER(PARTITION BY category_name ORDER BY revenue DESC) as rank FROM Rev;"),

  make(110, 'ecommerce', 'hard', ['topic:Window Functions', 'Math', 'company:Stripe'], 
    "Calculate the Month-over-Month (MoM) revenue growth percentage for the store. Return the month (YYYY-MM) and the growth percentage rounded to 2 decimal places.", 
    "Extract month, sum revenue.", "Use LAG() to get previous month's revenue.", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', paid_at) as mth, SUM(amount) as rev FROM payments WHERE status = 'Completed' GROUP BY mth), MoM AS (SELECT mth, rev, LAG(rev) OVER(ORDER BY mth) as prev_rev FROM Monthly) SELECT mth, ROUND((rev - prev_rev) * 100.0 / prev_rev, 2) as mom_growth FROM MoM WHERE prev_rev IS NOT NULL;", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', paid_at) as mth, SUM(amount) as rev FROM payments WHERE status = 'Completed' GROUP BY mth), MoM AS (SELECT mth, rev, LAG(rev) OVER(ORDER BY mth) as prev_rev FROM Monthly) SELECT mth, ROUND((rev - prev_rev) * 100.0 / prev_rev, 2) as mom_growth FROM MoM WHERE prev_rev IS NOT NULL;"),

  make(111, 'ecommerce', 'hard', ['topic:CTEs', 'Window Functions', 'company:Airbnb'], 
    "Identify 'Inventory Bottlenecks'. Find products that were ordered when their stock_qty was exactly 0. Return product_id and name.", 
    "This implies looking at current stock vs historical orders, or if a product has orders but stock is 0.", "Assume we just find products with stock_qty = 0 that appear in order_items.", 
    "SELECT DISTINCT p.product_id, p.name FROM products p JOIN order_items oi ON p.product_id = oi.product_id WHERE p.stock_qty = 0;", 
    "SELECT DISTINCT p.product_id, p.name FROM products p JOIN order_items oi ON p.product_id = oi.product_id WHERE p.stock_qty = 0;"),

  make(112, 'ecommerce', 'hard', ['topic:Window Functions', 'Ntile', 'company:Apple'], 
    "Create a customer tier system. Group all customers who have made at least one purchase into 3 tiers (tertiles) based on their total lifetime spend. Return customer_id, total_spend, and tier.", 
    "Sum amount per customer.", "Use NTILE(3) ordered by total_spend descending.", 
    "WITH Spend AS (SELECT o.customer_id, SUM(p.amount) as total_spend FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY o.customer_id) SELECT customer_id, total_spend, NTILE(3) OVER(ORDER BY total_spend DESC) AS tier FROM Spend;", 
    "WITH Spend AS (SELECT o.customer_id, SUM(p.amount) as total_spend FROM orders o JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY o.customer_id) SELECT customer_id, total_spend, NTILE(3) OVER(ORDER BY total_spend DESC) AS tier FROM Spend;"),

  make(113, 'ecommerce', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Uber'], 
    "Identify 'ghost orders' - orders that were created (Pending) but never got a payment record or shipping record after 7 days. Return the order_id.", 
    "Check orders without matching payments or shipping records.", "Filter for age > 7 days.", 
    "SELECT o.order_id FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id LEFT JOIN shipping s ON o.order_id = s.order_id WHERE p.payment_id IS NULL AND s.shipment_id IS NULL AND (julianday('2024-08-01') - julianday(o.order_date)) > 7;", 
    "SELECT o.order_id FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id LEFT JOIN shipping s ON o.order_id = s.order_id WHERE p.payment_id IS NULL AND s.shipment_id IS NULL AND (julianday('2024-08-01') - julianday(o.order_date)) > 7;"),

  make(114, 'ecommerce', 'hard', ['topic:Window Functions', 'Partition By', 'company:Salesforce'], 
    "For each supplier, find the single product that generated the highest revenue. Return company_name, product name, and revenue.", 
    "Calculate revenue per product.", "Use ROW_NUMBER() partitioned by supplier ordered by revenue DESC.", 
    "WITH ProdRev AS (SELECT s.company_name, p.name, SUM(oi.quantity * oi.unit_price) as rev FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id), Ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY company_name ORDER BY rev DESC) as rn FROM ProdRev) SELECT company_name, name, rev FROM Ranked WHERE rn = 1;", 
    "WITH ProdRev AS (SELECT s.company_name, p.name, SUM(oi.quantity * oi.unit_price) as rev FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id), Ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY company_name ORDER BY rev DESC) as rn FROM ProdRev) SELECT company_name, name, rev FROM Ranked WHERE rn = 1;"),

  make(115, 'ecommerce', 'hard', ['topic:CTEs', 'Self Join', 'company:Databricks'], 
    "Find customers who upgraded their purchases. Specifically, a customer who bought a 'Budget' product (price < 50) and then later bought a 'Premium' product (price > 200). Return customer_id.", 
    "Identify dates of budget and premium purchases.", "Self join on customer and check date progression.", 
    "WITH Purchases AS (SELECT o.customer_id, o.order_date, p.price FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id) SELECT DISTINCT p1.customer_id FROM Purchases p1 JOIN Purchases p2 ON p1.customer_id = p2.customer_id WHERE p1.price < 50 AND p2.price > 200 AND p1.order_date < p2.order_date;", 
    "WITH Purchases AS (SELECT o.customer_id, o.order_date, p.price FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id) SELECT DISTINCT p1.customer_id FROM Purchases p1 JOIN Purchases p2 ON p1.customer_id = p2.customer_id WHERE p1.price < 50 AND p2.price > 200 AND p1.order_date < p2.order_date;"),

  make(116, 'ecommerce', 'hard', ['topic:Window Functions', 'Row Number', 'company:Netflix'], 
    "Identify the first ever review written by each customer. Return the customer's full name, the product name, and the rating.", 
    "Use ROW_NUMBER() partitioned by customer ordered by reviewed_at.", "Filter for rn = 1.", 
    "WITH FirstReview AS (SELECT c.first_name || ' ' || c.last_name as name, p.name as product, r.rating, ROW_NUMBER() OVER(PARTITION BY c.customer_id ORDER BY r.reviewed_at) as rn FROM customers c JOIN reviews r ON c.customer_id = r.customer_id JOIN products p ON r.product_id = p.product_id) SELECT name, product, rating FROM FirstReview WHERE rn = 1;", 
    "WITH FirstReview AS (SELECT c.first_name || ' ' || c.last_name as name, p.name as product, r.rating, ROW_NUMBER() OVER(PARTITION BY c.customer_id ORDER BY r.reviewed_at) as rn FROM customers c JOIN reviews r ON c.customer_id = r.customer_id JOIN products p ON r.product_id = p.product_id) SELECT name, product, rating FROM FirstReview WHERE rn = 1;"),

  make(117, 'ecommerce', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Snowflake'], 
    "Calculate the 'Cart Abandonment' value. Assume any 'Pending' or 'Cancelled' order with items but no successful payment is an abandoned cart. Find the total potential revenue lost from these abandoned carts.", 
    "Sum the unit_price * quantity for these orders.", "Filter for missing or failed/pending payments.", 
    "SELECT SUM(oi.quantity * oi.unit_price) as lost_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id LEFT JOIN payments p ON o.order_id = p.order_id WHERE o.status IN ('Pending', 'Cancelled') AND (p.status IS NULL OR p.status != 'Completed');", 
    "SELECT SUM(oi.quantity * oi.unit_price) as lost_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id LEFT JOIN payments p ON o.order_id = p.order_id WHERE o.status IN ('Pending', 'Cancelled') AND (p.status IS NULL OR p.status != 'Completed');"),

  make(118, 'ecommerce', 'hard', ['topic:Window Functions', 'Data Analysis', 'company:Microsoft'], 
    "Calculate the percentage of total category revenue that each product represents. Return category name, product name, revenue, and percentage rounded to 2 decimals.", 
    "Use SUM() OVER(PARTITION BY category_id).", "Divide product revenue by category revenue.", 
    "WITH ProdRev AS (SELECT c.name as cat_name, p.name as prod_name, SUM(oi.quantity * oi.unit_price) as rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id) SELECT cat_name, prod_name, rev, ROUND(rev * 100.0 / SUM(rev) OVER(PARTITION BY cat_name), 2) as pct FROM ProdRev;", 
    "WITH ProdRev AS (SELECT c.name as cat_name, p.name as prod_name, SUM(oi.quantity * oi.unit_price) as rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id) SELECT cat_name, prod_name, rev, ROUND(rev * 100.0 / SUM(rev) OVER(PARTITION BY cat_name), 2) as pct FROM ProdRev;"),

  make(119, 'ecommerce', 'hard', ['topic:CTEs', 'Null Handling', 'company:Oracle'], 
    "Find 'loss leader' products. A product is a loss leader if its current price in the products table is less than the average unit_price it was actually sold for in the order_items table. Return product name, current price, and avg historical sold price.", 
    "Calculate average unit_price per product in order_items.", "Compare to current price in products table.", 
    "SELECT p.name, p.price as current_price, ROUND(AVG(oi.unit_price), 2) as avg_sold_price FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id HAVING p.price < AVG(oi.unit_price);", 
    "SELECT p.name, p.price as current_price, ROUND(AVG(oi.unit_price), 2) as avg_sold_price FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id HAVING p.price < AVG(oi.unit_price);"),

  make(120, 'ecommerce', 'hard', ['topic:Data Analysis', 'Group By', 'company:Amazon'], 
    "Generate a Customer Lifetime Value (CLV) scorecard. For each customer, calculate Total Spend, Average Order Value (AOV), and their Days Since Last Order (Recency). Assume current date is '2024-08-01'. Return top 3 customers by Total Spend.", 
    "Combine metrics in a grouped query.", "Use julianday to find recency.", 
    "SELECT c.customer_id, SUM(p.amount) as total_spend, ROUND(AVG(p.amount), 2) as aov, ROUND(julianday('2024-08-01') - julianday(MAX(o.order_date))) as days_since_last_order FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY c.customer_id ORDER BY total_spend DESC LIMIT 3;", 
    "SELECT c.customer_id, SUM(p.amount) as total_spend, ROUND(AVG(p.amount), 2) as aov, ROUND(julianday('2024-08-01') - julianday(MAX(o.order_date))) as days_since_last_order FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN payments p ON o.order_id = p.order_id WHERE p.status = 'Completed' GROUP BY c.customer_id ORDER BY total_spend DESC LIMIT 3;")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT ecommerce questions!');
