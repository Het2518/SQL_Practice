import fs from 'fs';
import path from 'path';

const file = path.join('src/data/databases', 'ecommerce.sql');
let c = fs.readFileSync(file, 'utf-8');

// 1. products.supplier_id
c = c.replace(/supplier_id  INTEGER/g, 'supplier_id  INTEGER REFERENCES suppliers(supplier_id)');

// 2. Add suppliers table BEFORE products table
const suppliersTable = `
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INTEGER PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  country TEXT
);
`;
c = c.replace(/CREATE TABLE IF NOT EXISTS products/, suppliersTable + '\nCREATE TABLE IF NOT EXISTS products');

// 3. Add seed data for suppliers (IDs 1 to 15) before INSERT INTO products
const suppliersSeed = `INSERT INTO suppliers VALUES
  (1,'TechElectro','contact@techelectro.com','USA'),
  (2,'GlobalGadgets','sales@globalgadgets.com','UK'),
  (3,'MobiTech','info@mobitech.com','China'),
  (4,'PhotoWorld','support@photoworld.com','Japan'),
  (5,'HomeEssentials','hello@homeessentials.com','USA'),
  (6,'FashionHub','style@fashionhub.com','France'),
  (7,'SportsGear','team@sportsgear.com','Germany'),
  (8,'BookDepot','orders@bookdepot.com','Canada'),
  (9,'ToyUniverse','fun@toyuniverse.com','USA'),
  (10,'AutoParts','service@autoparts.com','Japan'),
  (11,'KitchenPro','chef@kitchenpro.com','Italy'),
  (12,'BeautyCo','glow@beautyco.com','South Korea'),
  (13,'PetSupplies','woof@petsupplies.com','UK'),
  (14,'GardenCare','plants@gardencare.com','Netherlands'),
  (15,'MusicWorld','play@musicworld.com','USA');
`;
c = c.replace(/INSERT INTO products VALUES/, suppliersSeed + '\nINSERT INTO products VALUES');

fs.writeFileSync(file, c);
console.log('Fixed ecommerce.sql');
