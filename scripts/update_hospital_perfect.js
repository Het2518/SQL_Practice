import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/hospital.jsx');

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

// HOSPITAL QUESTIONS (IDs 1-60)
export const hospitalQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'hospital', 'easy', ['topic:Basic SQL', 'Where', 'company:MountSinai'], 
    "Find all patients who are female ('F'). Return their first_name and last_name.", 
    "Filter by gender.", "Use WHERE gender = 'F'.", 
    "SELECT first_name, last_name FROM patients WHERE gender = 'F';", 
    "SELECT first_name, last_name FROM patients WHERE gender = 'F';"),

  make(2, 'hospital', 'easy', ['topic:String Functions', 'Basic SQL', 'company:MayoClinic'], 
    "Format patient names for a wristband. Return a single column 'wristband_name' with the format 'LASTNAME, Firstname'.", 
    "Concatenate last_name, a comma and space, and first_name.", "Use the || operator.", 
    "SELECT last_name || ', ' || first_name AS wristband_name FROM patients;", 
    "SELECT last_name || ', ' || first_name AS wristband_name FROM patients;"),

  make(3, 'hospital', 'easy', ['topic:Math', 'Aggregate Functions', 'company:ClevelandClinic'], 
    "Calculate the average weight of all patients. Return as 'avg_weight' rounded to 1 decimal place.", 
    "Use AVG() on the weight column.", "Use ROUND() for formatting.", 
    "SELECT ROUND(AVG(weight), 1) AS avg_weight FROM patients;", 
    "SELECT ROUND(AVG(weight), 1) AS avg_weight FROM patients;"),

  make(4, 'hospital', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:KaiserPermanente'], 
    "Identify patients who have NO known allergies (allergies IS NULL). Return patient_id, first_name, and last_name.", 
    "Check if allergies is NULL.", "Use WHERE allergies IS NULL.", 
    "SELECT patient_id, first_name, last_name FROM patients WHERE allergies IS NULL;", 
    "SELECT patient_id, first_name, last_name FROM patients WHERE allergies IS NULL;"),

  make(5, 'hospital', 'easy', ['topic:Data Analysis', 'Group By', 'company:JohnsHopkins'], 
    "Count how many doctors we have for each specialty. Return specialty and the count.", 
    "Group by specialty in the doctors table.", "Use COUNT(*).", 
    "SELECT specialty, COUNT(*) AS doctor_count FROM doctors GROUP BY specialty;", 
    "SELECT specialty, COUNT(*) AS doctor_count FROM doctors GROUP BY specialty;"),

  make(6, 'hospital', 'easy', ['topic:Date Functions', 'Where', 'company:UCLAHealth'], 
    "Find all admissions that occurred in the year 2023. Return admission_id and admission_date.", 
    "Filter admission_date using LIKE or strftime.", "WHERE admission_date LIKE '2023-%'.", 
    "SELECT admission_id, admission_date FROM admissions WHERE admission_date LIKE '2023-%';", 
    "SELECT admission_id, admission_date FROM admissions WHERE admission_date LIKE '2023-%';"),

  make(7, 'hospital', 'easy', ['topic:Aggregate Functions', 'Math', 'company:NYULangone'], 
    "What is the maximum height recorded among our patients? Return as 'max_height'.", 
    "Use MAX(height).", "Query the patients table.", 
    "SELECT MAX(height) AS max_height FROM patients;", 
    "SELECT MAX(height) AS max_height FROM patients;"),

  make(8, 'hospital', 'easy', ['topic:Basic SQL', 'Limit', 'company:MassGeneral'], 
    "List the 5 most recent hospital admissions. Return admission_id and admission_date.", 
    "Sort by admission_date descending.", "Limit to 5.", 
    "SELECT admission_id, admission_date FROM admissions ORDER BY admission_date DESC LIMIT 5;", 
    "SELECT admission_id, admission_date FROM admissions ORDER BY admission_date DESC LIMIT 5;"),

  make(9, 'hospital', 'easy', ['topic:Basic SQL', 'In', 'company:StanfordHealth'], 
    "Find all patients from Ontario ('ON') or British Columbia ('BC'). Return first_name, last_name, and province_id.", 
    "Use the IN operator on the province_id column.", "WHERE province_id IN ('ON', 'BC').", 
    "SELECT first_name, last_name, province_id FROM patients WHERE province_id IN ('ON', 'BC');", 
    "SELECT first_name, last_name, province_id FROM patients WHERE province_id IN ('ON', 'BC');"),

  make(10, 'hospital', 'easy', ['topic:String Functions', 'Basic SQL', 'company:CedarSinai'], 
    "Find all patients whose allergy includes 'Penicillin' (may be part of a list). Return first_name and allergies.", 
    "Use LIKE '%Penicillin%'.", "Filter on the allergies column.", 
    "SELECT first_name, allergies FROM patients WHERE allergies LIKE '%Penicillin%';", 
    "SELECT first_name, allergies FROM patients WHERE allergies LIKE '%Penicillin%';"),

  make(11, 'hospital', 'easy', ['topic:Data Analysis', 'Group By', 'company:MountSinai'], 
    "How many diagnoses have a severity of 'Critical'? Return the count.", 
    "Use COUNT(*).", "Filter WHERE severity = 'Critical'.", 
    "SELECT COUNT(*) AS critical_count FROM diagnoses WHERE severity = 'Critical';", 
    "SELECT COUNT(*) AS critical_count FROM diagnoses WHERE severity = 'Critical';"),

  make(12, 'hospital', 'easy', ['topic:Date Functions', 'String Functions', 'company:MayoClinic'], 
    "Extract the year of birth for all patients. Return patient_id and birth_year.", 
    "Use substr() or strftime('%Y', birth_date).", "Query the patients table.", 
    "SELECT patient_id, strftime('%Y', birth_date) AS birth_year FROM patients;", 
    "SELECT patient_id, strftime('%Y', birth_date) AS birth_year FROM patients;"),

  make(13, 'hospital', 'easy', ['topic:Basic SQL', 'Where', 'company:ClevelandClinic'], 
    "Find all active medications (end_date IS NULL). Return medication_id and drug_name.", 
    "Filter by end_date IS NULL.", "Check the medications table.", 
    "SELECT medication_id, drug_name FROM medications WHERE end_date IS NULL;", 
    "SELECT medication_id, drug_name FROM medications WHERE end_date IS NULL;"),

  make(14, 'hospital', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:KaiserPermanente'], 
    "How many distinct cities do our patients come from? Return the count as 'unique_cities'.", 
    "Use COUNT(DISTINCT city).", "Query the patients table.", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM patients;", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM patients;"),

  make(15, 'hospital', 'easy', ['topic:Basic SQL', 'Math', 'company:JohnsHopkins'], 
    "List all patients who weigh more than 90 kg. Return first_name, last_name, and weight.", 
    "Filter for weight > 90.", "Look at the patients table.", 
    "SELECT first_name, last_name, weight FROM patients WHERE weight > 90;", 
    "SELECT first_name, last_name, weight FROM patients WHERE weight > 90;"),

  make(16, 'hospital', 'easy', ['topic:Data Cleaning', 'Like', 'company:UCLAHealth'], 
    "Find all doctors who are Surgeons (specialty contains 'Surgeon'). Return first_name, last_name, and specialty.", 
    "Use LIKE '%Surgeon%'.", "Query the doctors table.", 
    "SELECT first_name, last_name, specialty FROM doctors WHERE specialty LIKE '%Surgeon%';", 
    "SELECT first_name, last_name, specialty FROM doctors WHERE specialty LIKE '%Surgeon%';"),

  make(17, 'hospital', 'easy', ['topic:Basic SQL', 'Where', 'company:NYULangone'], 
    "Find all admissions that have not yet been discharged (discharge_date IS NULL). Return admission_id and patient_id.", 
    "Check if discharge_date IS NULL.", "Query the admissions table.", 
    "SELECT admission_id, patient_id FROM admissions WHERE discharge_date IS NULL;", 
    "SELECT admission_id, patient_id FROM admissions WHERE discharge_date IS NULL;"),

  make(18, 'hospital', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:MassGeneral'], 
    "Count the number of patients from each province (province_id). Return province_id and the count.", 
    "Group by province_id in the patients table.", "Use COUNT(*).", 
    "SELECT province_id, COUNT(*) AS patient_count FROM patients GROUP BY province_id;", 
    "SELECT province_id, COUNT(*) AS patient_count FROM patients GROUP BY province_id;"),

  make(19, 'hospital', 'easy', ['topic:Basic SQL', 'Order By', 'company:StanfordHealth'], 
    "Find the 3 oldest patients in the database based on their birth_date. Return first_name, last_name, and birth_date.", 
    "Order by birth_date ASC.", "Limit to 3.", 
    "SELECT first_name, last_name, birth_date FROM patients ORDER BY birth_date ASC LIMIT 3;", 
    "SELECT first_name, last_name, birth_date FROM patients ORDER BY birth_date ASC LIMIT 3;"),

  make(20, 'hospital', 'easy', ['topic:Basic SQL', 'Where', 'company:CedarSinai'], 
    "Find all medications prescribed in 2024. Return medication_id and start_date.", 
    "Filter start_date using LIKE '2024-%'.", "Query medications.", 
    "SELECT medication_id, start_date FROM medications WHERE start_date LIKE '2024-%';", 
    "SELECT medication_id, start_date FROM medications WHERE start_date LIKE '2024-%';"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'hospital', 'medium', ['topic:Joins', 'Data Analysis', 'company:MountSinai'], 
    "List all patients and the full name of their province. Return patient first_name, last_name, and province_name.", 
    "Join patients and province_names.", "Select the correct columns.", 
    "SELECT p.first_name, p.last_name, pn.province_name FROM patients p JOIN province_names pn ON p.province_id = pn.province_id;", 
    "SELECT p.first_name, p.last_name, pn.province_name FROM patients p JOIN province_names pn ON p.province_id = pn.province_id;"),

  make(22, 'hospital', 'medium', ['topic:Joins', 'Math', 'company:MayoClinic'], 
    "How many admissions were handled by the 'Cardiology' department? Return the department name and the admission count.", 
    "Join admissions to doctors, then to departments.", "Group by department and count.", 
    "SELECT d.department_name, COUNT(a.admission_id) AS admission_count FROM admissions a JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments d ON doc.department_id = d.department_id WHERE d.department_name = 'Cardiology' GROUP BY d.department_name;", 
    "SELECT d.department_name, COUNT(a.admission_id) AS admission_count FROM admissions a JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments d ON doc.department_id = d.department_id WHERE d.department_name = 'Cardiology' GROUP BY d.department_name;"),

  make(23, 'hospital', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:ClevelandClinic'], 
    "Find all doctors who are the head of a department. Return their first_name, last_name, and the department_name they head.", 
    "Join doctors and departments where doctor_id = head_doctor_id.", "Ensure correct join condition.", 
    "SELECT doc.first_name, doc.last_name, dep.department_name FROM doctors doc JOIN departments dep ON doc.doctor_id = dep.head_doctor_id;", 
    "SELECT doc.first_name, doc.last_name, dep.department_name FROM doctors doc JOIN departments dep ON doc.doctor_id = dep.head_doctor_id;"),

  make(24, 'hospital', 'medium', ['topic:Joins', 'Group By', 'company:KaiserPermanente'], 
    "Which doctor has attended to the most admissions? Return doctor first_name, last_name, and admission_count.", 
    "Join doctors and admissions.", "Group by doctor_id, sort desc, limit 1.", 
    "SELECT d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id ORDER BY admission_count DESC LIMIT 1;", 
    "SELECT d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id ORDER BY admission_count DESC LIMIT 1;"),

  make(25, 'hospital', 'medium', ['topic:Case Statements', 'Math', 'company:JohnsHopkins'], 
    "Calculate the Body Mass Index (BMI) for all patients. BMI = weight(kg) / (height(m) * height(m)). Note height in DB is in cm! Categorize them: < 18.5 (Underweight), 18.5-24.9 (Normal), 25-29.9 (Overweight), >= 30 (Obese). Return category and count.", 
    "Convert height to meters (height / 100.0).", "Use a CASE statement and group by it.", 
    "SELECT CASE WHEN weight / ((height/100.0) * (height/100.0)) < 18.5 THEN 'Underweight' WHEN weight / ((height/100.0) * (height/100.0)) < 25 THEN 'Normal' WHEN weight / ((height/100.0) * (height/100.0)) < 30 THEN 'Overweight' ELSE 'Obese' END AS bmi_category, COUNT(*) as patient_count FROM patients GROUP BY bmi_category;", 
    "SELECT CASE WHEN weight / ((height/100.0) * (height/100.0)) < 18.5 THEN 'Underweight' WHEN weight / ((height/100.0) * (height/100.0)) < 25 THEN 'Normal' WHEN weight / ((height/100.0) * (height/100.0)) < 30 THEN 'Overweight' ELSE 'Obese' END AS bmi_category, COUNT(*) as patient_count FROM patients GROUP BY bmi_category;"),

  make(26, 'hospital', 'medium', ['topic:Joins', 'Having', 'company:UCLAHealth'], 
    "Find patients who have been admitted more than 2 times. Return patient_id, first_name, last_name, and admission_count.", 
    "Join patients and admissions.", "Group by patient_id and use HAVING count > 2.", 
    "SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id HAVING COUNT(a.admission_id) > 2;", 
    "SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id HAVING COUNT(a.admission_id) > 2;"),

  make(27, 'hospital', 'medium', ['topic:Subqueries', 'Null Handling', 'company:NYULangone'], 
    "Identify patients who have NEVER been admitted. Return their patient_id, first_name, and last_name.", 
    "Use a subquery for patient_id NOT IN (admissions).", "Or use a LEFT JOIN.", 
    "SELECT patient_id, first_name, last_name FROM patients WHERE patient_id NOT IN (SELECT patient_id FROM admissions);", 
    "SELECT patient_id, first_name, last_name FROM patients WHERE patient_id NOT IN (SELECT patient_id FROM admissions);"),

  make(28, 'hospital', 'medium', ['topic:Date Functions', 'Math', 'company:MassGeneral'], 
    "Calculate the average length of stay (in days) for all discharged admissions (discharge_date - admission_date). Return it rounded to 1 decimal place.", 
    "Use julianday(discharge_date) - julianday(admission_date).", "Filter for discharge_date IS NOT NULL.", 
    "SELECT ROUND(AVG(julianday(discharge_date) - julianday(admission_date)), 1) AS avg_stay_days FROM admissions WHERE discharge_date IS NOT NULL;", 
    "SELECT ROUND(AVG(julianday(discharge_date) - julianday(admission_date)), 1) AS avg_stay_days FROM admissions WHERE discharge_date IS NOT NULL;"),

  make(29, 'hospital', 'medium', ['topic:Joins', 'Null Handling', 'company:StanfordHealth'], 
    "List all admissions that do NOT have a corresponding diagnosis record. Return admission_id and patient_id.", 
    "Left join admissions to diagnoses.", "Filter where diagnosis_id IS NULL.", 
    "SELECT a.admission_id, a.patient_id FROM admissions a LEFT JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.diagnosis_id IS NULL;", 
    "SELECT a.admission_id, a.patient_id FROM admissions a LEFT JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.diagnosis_id IS NULL;"),

  make(30, 'hospital', 'medium', ['topic:Joins', 'Data Analysis', 'company:CedarSinai'], 
    "Which drug (drug_name) has been prescribed the most times? Return the drug_name and the count.", 
    "Group by drug_name in medications.", "Order by count descending, limit 1.", 
    "SELECT drug_name, COUNT(*) AS prescription_count FROM medications GROUP BY drug_name ORDER BY prescription_count DESC LIMIT 1;", 
    "SELECT drug_name, COUNT(*) AS prescription_count FROM medications GROUP BY drug_name ORDER BY prescription_count DESC LIMIT 1;"),

  make(31, 'hospital', 'medium', ['topic:Subqueries', 'Math', 'company:MountSinai'], 
    "Find patients who are taller than the average height of all patients. Return first_name, last_name, and height.", 
    "Use a subquery to get AVG(height).", "Compare patient height to it.", 
    "SELECT first_name, last_name, height FROM patients WHERE height > (SELECT AVG(height) FROM patients);", 
    "SELECT first_name, last_name, height FROM patients WHERE height > (SELECT AVG(height) FROM patients);"),

  make(32, 'hospital', 'medium', ['topic:Joins', 'Group By', 'company:MayoClinic'], 
    "Find the total number of 'Critical' diagnoses handled by each department. Return department_name and critical_count.", 
    "Join diagnoses, admissions, doctors, and departments.", "Filter for severity = 'Critical', group by department.", 
    "SELECT dep.department_name, COUNT(diag.diagnosis_id) as critical_count FROM diagnoses diag JOIN admissions a ON diag.admission_id = a.admission_id JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id WHERE diag.severity = 'Critical' GROUP BY dep.department_name;", 
    "SELECT dep.department_name, COUNT(diag.diagnosis_id) as critical_count FROM diagnoses diag JOIN admissions a ON diag.admission_id = a.admission_id JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id WHERE diag.severity = 'Critical' GROUP BY dep.department_name;"),

  make(33, 'hospital', 'medium', ['topic:Joins', 'Date Functions', 'company:ClevelandClinic'], 
    "Find all patients who were admitted on their birthday (match the month and day). Return patient first_name, birth_date, and admission_date.", 
    "Join patients and admissions.", "Compare strftime('%m-%d', birth_date) to strftime('%m-%d', admission_date).", 
    "SELECT p.first_name, p.birth_date, a.admission_date FROM patients p JOIN admissions a ON p.patient_id = a.patient_id WHERE strftime('%m-%d', p.birth_date) = strftime('%m-%d', a.admission_date);", 
    "SELECT p.first_name, p.birth_date, a.admission_date FROM patients p JOIN admissions a ON p.patient_id = a.patient_id WHERE strftime('%m-%d', p.birth_date) = strftime('%m-%d', a.admission_date);"),

  make(34, 'hospital', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:KaiserPermanente'], 
    "Flag admissions as 'Short Stay' (< 3 days), 'Medium Stay' (3-7 days), or 'Long Stay' (> 7 days). Return admission_id and the flag. Only include discharged admissions.", 
    "Use julianday difference.", "Apply a CASE statement.", 
    "SELECT admission_id, CASE WHEN (julianday(discharge_date) - julianday(admission_date)) < 3 THEN 'Short Stay' WHEN (julianday(discharge_date) - julianday(admission_date)) <= 7 THEN 'Medium Stay' ELSE 'Long Stay' END AS stay_length FROM admissions WHERE discharge_date IS NOT NULL;", 
    "SELECT admission_id, CASE WHEN (julianday(discharge_date) - julianday(admission_date)) < 3 THEN 'Short Stay' WHEN (julianday(discharge_date) - julianday(admission_date)) <= 7 THEN 'Medium Stay' ELSE 'Long Stay' END AS stay_length FROM admissions WHERE discharge_date IS NOT NULL;"),

  make(35, 'hospital', 'medium', ['topic:CTEs', 'Data Analysis', 'company:JohnsHopkins'], 
    "Use a CTE to calculate the total number of medications prescribed per admission. Then query the CTE to find the admission_id(s) with the absolute highest number of medications.", 
    "CTE groups by admission_id and counts.", "Main query finds the MAX.", 
    "WITH MedCount AS (SELECT admission_id, COUNT(*) as med_count FROM medications GROUP BY admission_id) SELECT admission_id FROM MedCount WHERE med_count = (SELECT MAX(med_count) FROM MedCount);", 
    "WITH MedCount AS (SELECT admission_id, COUNT(*) as med_count FROM medications GROUP BY admission_id) SELECT admission_id FROM MedCount WHERE med_count = (SELECT MAX(med_count) FROM MedCount);"),

  make(36, 'hospital', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:UCLAHealth'], 
    "Find patients who have been diagnosed with BOTH 'Pneumonia' (in description) and 'Diabetes' (in description) across all their admissions. Return patient_id.", 
    "Use INTERSECT.", "Query diagnoses and admissions.", 
    "SELECT a.patient_id FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.description LIKE '%Pneumonia%' INTERSECT SELECT a.patient_id FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.description LIKE '%Diabetes%';", 
    "SELECT a.patient_id FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.description LIKE '%Pneumonia%' INTERSECT SELECT a.patient_id FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.description LIKE '%Diabetes%';"),

  make(37, 'hospital', 'medium', ['topic:Joins', 'Self Join', 'company:NYULangone'], 
    "Find pairs of doctors who share the exact same specialty and work in the same department. Return their names and the shared specialty. Ensure pairs are unique.", 
    "Self join doctors on specialty and department_id.", "Use d1.doctor_id < d2.doctor_id.", 
    "SELECT d1.first_name || ' ' || d1.last_name as doc1, d2.first_name || ' ' || d2.last_name as doc2, d1.specialty FROM doctors d1 JOIN doctors d2 ON d1.specialty = d2.specialty AND d1.department_id = d2.department_id AND d1.doctor_id < d2.doctor_id;", 
    "SELECT d1.first_name || ' ' || d1.last_name as doc1, d2.first_name || ' ' || d2.last_name as doc2, d1.specialty FROM doctors d1 JOIN doctors d2 ON d1.specialty = d2.specialty AND d1.department_id = d2.department_id AND d1.doctor_id < d2.doctor_id;"),

  make(38, 'hospital', 'medium', ['topic:Joins', 'Group By', 'company:MassGeneral'], 
    "Which province has the highest average patient weight? Return province_name and avg_weight.", 
    "Join patients and province_names.", "Group by province_name, avg(weight), sort desc, limit 1.", 
    "SELECT pn.province_name, AVG(p.weight) as avg_weight FROM patients p JOIN province_names pn ON p.province_id = pn.province_id GROUP BY pn.province_name ORDER BY avg_weight DESC LIMIT 1;", 
    "SELECT pn.province_name, AVG(p.weight) as avg_weight FROM patients p JOIN province_names pn ON p.province_id = pn.province_id GROUP BY pn.province_name ORDER BY avg_weight DESC LIMIT 1;"),

  make(39, 'hospital', 'medium', ['topic:Joins', 'Date Functions', 'company:StanfordHealth'], 
    "Find all medications that were prescribed AFTER the patient was officially discharged. Return medication_id, admission_id, and start_date.", 
    "Join medications and admissions.", "Check if start_date > discharge_date.", 
    "SELECT m.medication_id, m.admission_id, m.start_date FROM medications m JOIN admissions a ON m.admission_id = a.admission_id WHERE a.discharge_date IS NOT NULL AND m.start_date > a.discharge_date;", 
    "SELECT m.medication_id, m.admission_id, m.start_date FROM medications m JOIN admissions a ON m.admission_id = a.admission_id WHERE a.discharge_date IS NOT NULL AND m.start_date > a.discharge_date;"),

  make(40, 'hospital', 'medium', ['topic:Math', 'Data Analysis', 'company:CedarSinai'], 
    "Calculate the ratio of male to female patients in the database. Return the ratio as a decimal rounded to 2 places (M / F).", 
    "Use subqueries to count M and F.", "Divide them.", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM patients WHERE gender = 'M') AS REAL) / CAST((SELECT COUNT(*) FROM patients WHERE gender = 'F') AS REAL), 2) AS male_to_female_ratio;", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM patients WHERE gender = 'M') AS REAL) / CAST((SELECT COUNT(*) FROM patients WHERE gender = 'F') AS REAL), 2) AS male_to_female_ratio;"),

  make(41, 'hospital', 'medium', ['topic:Joins', 'Null Handling', 'company:MountSinai'], 
    "Find any doctors who have never attended to an admission. Return doctor_id, first_name, and last_name.", 
    "Left join doctors to admissions.", "Check for NULL admission_id.", 
    "SELECT d.doctor_id, d.first_name, d.last_name FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id WHERE a.admission_id IS NULL;", 
    "SELECT d.doctor_id, d.first_name, d.last_name FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id WHERE a.admission_id IS NULL;"),

  make(42, 'hospital', 'medium', ['topic:String Functions', 'Basic SQL', 'company:MayoClinic'], 
    "List all patients whose first name starts and ends with the same letter. Return first_name.", 
    "Use substr() and lower() to compare first and last characters.", "Query patients.", 
    "SELECT first_name FROM patients WHERE lower(substr(first_name, 1, 1)) = lower(substr(first_name, -1, 1));", 
    "SELECT first_name FROM patients WHERE lower(substr(first_name, 1, 1)) = lower(substr(first_name, -1, 1));"),

  make(43, 'hospital', 'medium', ['topic:Math', 'Date Functions', 'company:ClevelandClinic'], 
    "Calculate the current age (in years) of patient_id 5. Assume the current date is '2024-08-01'. Return the age rounded down to the nearest integer.", 
    "Use (julianday('2024-08-01') - julianday(birth_date)) / 365.25.", "Cast to integer or floor.", 
    "SELECT CAST((julianday('2024-08-01') - julianday(birth_date)) / 365.25 AS INTEGER) AS age FROM patients WHERE patient_id = 5;", 
    "SELECT CAST((julianday('2024-08-01') - julianday(birth_date)) / 365.25 AS INTEGER) AS age FROM patients WHERE patient_id = 5;"),

  make(44, 'hospital', 'medium', ['topic:Group By', 'Having', 'company:KaiserPermanente'], 
    "Identify cities that have provided more than 5 patients to the hospital. Return the city name and the count.", 
    "Group by city in patients.", "Use HAVING count > 5.", 
    "SELECT city, COUNT(patient_id) as patient_count FROM patients GROUP BY city HAVING COUNT(patient_id) > 5;", 
    "SELECT city, COUNT(patient_id) as patient_count FROM patients GROUP BY city HAVING COUNT(patient_id) > 5;"),

  make(45, 'hospital', 'medium', ['topic:Joins', 'Data Analysis', 'company:JohnsHopkins'], 
    "List the most common diagnosis description for patients from 'Ontario' (ON). Return description and count.", 
    "Join patients, admissions, diagnoses.", "Filter for ON, group by description, sort desc, limit 1.", 
    "SELECT d.description, COUNT(d.diagnosis_id) as count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN diagnoses d ON a.admission_id = d.admission_id WHERE p.province_id = 'ON' GROUP BY d.description ORDER BY count DESC LIMIT 1;", 
    "SELECT d.description, COUNT(d.diagnosis_id) as count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN diagnoses d ON a.admission_id = d.admission_id WHERE p.province_id = 'ON' GROUP BY d.description ORDER BY count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'hospital', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:UCLAHealth'], 
    "Identify 'Frequent Flyers' - patients who were readmitted within 30 days of their previous discharge. Return patient_id, the prior discharge_date, and the new admission_date.", 
    "Use LAG() OVER(PARTITION BY patient_id ORDER BY admission_date) to get previous discharge.", "Check time difference.", 
    "WITH Readmits AS (SELECT patient_id, admission_date, LAG(discharge_date) OVER(PARTITION BY patient_id ORDER BY admission_date) as prev_discharge FROM admissions) SELECT DISTINCT patient_id, prev_discharge, admission_date FROM Readmits WHERE prev_discharge IS NOT NULL AND (julianday(admission_date) - julianday(prev_discharge)) <= 30;", 
    "WITH Readmits AS (SELECT patient_id, admission_date, LAG(discharge_date) OVER(PARTITION BY patient_id ORDER BY admission_date) as prev_discharge FROM admissions) SELECT DISTINCT patient_id, prev_discharge, admission_date FROM Readmits WHERE prev_discharge IS NOT NULL AND (julianday(admission_date) - julianday(prev_discharge)) <= 30;"),

  make(47, 'hospital', 'hard', ['topic:Window Functions', 'Rank', 'company:NYULangone'], 
    "For each department, rank the doctors based on the total number of admissions they've handled. Return department name, doctor name, admission count, and rank (1 being highest).", 
    "Use DENSE_RANK() OVER(PARTITION BY department_name ORDER BY admission_count DESC).", "Join tables.", 
    "WITH DocCounts AS (SELECT dep.department_name, doc.first_name || ' ' || doc.last_name as doc_name, COUNT(a.admission_id) as admission_count FROM doctors doc JOIN departments dep ON doc.department_id = dep.department_id LEFT JOIN admissions a ON doc.doctor_id = a.attending_doctor_id GROUP BY doc.doctor_id) SELECT department_name, doc_name, admission_count, DENSE_RANK() OVER(PARTITION BY department_name ORDER BY admission_count DESC) as rank FROM DocCounts;", 
    "WITH DocCounts AS (SELECT dep.department_name, doc.first_name || ' ' || doc.last_name as doc_name, COUNT(a.admission_id) as admission_count FROM doctors doc JOIN departments dep ON doc.department_id = dep.department_id LEFT JOIN admissions a ON doc.doctor_id = a.attending_doctor_id GROUP BY doc.doctor_id) SELECT department_name, doc_name, admission_count, DENSE_RANK() OVER(PARTITION BY department_name ORDER BY admission_count DESC) as rank FROM DocCounts;"),

  make(48, 'hospital', 'hard', ['topic:CTEs', 'Window Functions', 'company:MassGeneral'], 
    "Calculate the rolling 3-month average of total admissions. Group admissions by month (YYYY-MM). Return month and rolling_avg rounded to 2 decimals.", 
    "First, count monthly admissions.", "Then apply a window function ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', admission_date) as mth, COUNT(*) as adm_count FROM admissions GROUP BY mth) SELECT mth, ROUND(AVG(adm_count) OVER(ORDER BY mth ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as rolling_avg FROM Monthly;", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', admission_date) as mth, COUNT(*) as adm_count FROM admissions GROUP BY mth) SELECT mth, ROUND(AVG(adm_count) OVER(ORDER BY mth ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as rolling_avg FROM Monthly;"),

  make(49, 'hospital', 'hard', ['topic:Window Functions', 'Partition By', 'company:StanfordHealth'], 
    "Identify 'High Risk Patients'. Find patients whose most recent diagnosis severity is 'Critical'. Return patient_id, first_name, last_name, and the diagnosis description.", 
    "Use ROW_NUMBER() OVER(PARTITION BY patient_id ORDER BY admission_date DESC).", "Filter for rn=1 and severity='Critical'.", 
    "WITH RecentDiag AS (SELECT a.patient_id, d.severity, d.description, ROW_NUMBER() OVER(PARTITION BY a.patient_id ORDER BY a.admission_date DESC) as rn FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id) SELECT p.patient_id, p.first_name, p.last_name, r.description FROM patients p JOIN RecentDiag r ON p.patient_id = r.patient_id WHERE r.rn = 1 AND r.severity = 'Critical';", 
    "WITH RecentDiag AS (SELECT a.patient_id, d.severity, d.description, ROW_NUMBER() OVER(PARTITION BY a.patient_id ORDER BY a.admission_date DESC) as rn FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id) SELECT p.patient_id, p.first_name, p.last_name, r.description FROM patients p JOIN RecentDiag r ON p.patient_id = r.patient_id WHERE r.rn = 1 AND r.severity = 'Critical';"),

  make(50, 'hospital', 'hard', ['topic:CTEs', 'Self Join', 'company:CedarSinai'], 
    "Detect 'Drug Interactions'. Assume 'Penicillin' (in allergies) and 'Amoxicillin' (in medications) is a bad combination. Find any admissions where a patient allergic to Penicillin was prescribed Amoxicillin. Return admission_id and patient_id.", 
    "Join patients, admissions, and medications.", "Filter for allergies LIKE '%Penicillin%' AND drug_name = 'Amoxicillin'.", 
    "SELECT a.admission_id, p.patient_id FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN medications m ON a.admission_id = m.admission_id WHERE p.allergies LIKE '%Penicillin%' AND m.drug_name = 'Amoxicillin';", 
    "SELECT a.admission_id, p.patient_id FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN medications m ON a.admission_id = m.admission_id WHERE p.allergies LIKE '%Penicillin%' AND m.drug_name = 'Amoxicillin';"),

  make(51, 'hospital', 'hard', ['topic:Window Functions', 'Math', 'company:MountSinai'], 
    "Calculate the percentage of total hospital admissions handled by each doctor. Return doctor name and the percentage rounded to 2 decimals.", 
    "Count admissions per doctor.", "Divide by SUM(count) OVER().", 
    "WITH DocAdms AS (SELECT d.first_name || ' ' || d.last_name as doc_name, COUNT(a.admission_id) as adm_count FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) SELECT doc_name, ROUND(adm_count * 100.0 / NULLIF(SUM(adm_count) OVER(), 0), 2) as adm_percentage FROM DocAdms;", 
    "WITH DocAdms AS (SELECT d.first_name || ' ' || d.last_name as doc_name, COUNT(a.admission_id) as adm_count FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) SELECT doc_name, ROUND(adm_count * 100.0 / NULLIF(SUM(adm_count) OVER(), 0), 2) as adm_percentage FROM DocAdms;"),

  make(52, 'hospital', 'hard', ['topic:CTEs', 'Data Analysis', 'company:MayoClinic'], 
    "Identify 'Bottleneck Departments'. A department is a bottleneck if its average patient length of stay is more than 5 days AND it has handled more than 10 total admissions. Return department_name.", 
    "Calculate average stay and count per department.", "Use having or CTE to filter.", 
    "WITH DeptStats AS (SELECT dep.department_name, AVG(julianday(a.discharge_date) - julianday(a.admission_date)) as avg_stay, COUNT(a.admission_id) as total_adm FROM admissions a JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id WHERE a.discharge_date IS NOT NULL GROUP BY dep.department_name) SELECT department_name FROM DeptStats WHERE avg_stay > 5 AND total_adm > 10;", 
    "WITH DeptStats AS (SELECT dep.department_name, AVG(julianday(a.discharge_date) - julianday(a.admission_date)) as avg_stay, COUNT(a.admission_id) as total_adm FROM admissions a JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id WHERE a.discharge_date IS NOT NULL GROUP BY dep.department_name) SELECT department_name FROM DeptStats WHERE avg_stay > 5 AND total_adm > 10;"),

  make(53, 'hospital', 'hard', ['topic:Window Functions', 'Ntile', 'company:ClevelandClinic'], 
    "Create a patient BMI quartile system. Divide all patients into 4 quartiles based on their BMI (1 being lowest BMI). Return patient_id, BMI, and quartile.", 
    "Calculate BMI = weight / (height/100)^2.", "Use NTILE(4) OVER(ORDER BY BMI).", 
    "SELECT patient_id, ROUND(weight / ((height/100.0) * (height/100.0)), 2) as bmi, NTILE(4) OVER(ORDER BY (weight / ((height/100.0) * (height/100.0))) ASC) as quartile FROM patients;", 
    "SELECT patient_id, ROUND(weight / ((height/100.0) * (height/100.0)), 2) as bmi, NTILE(4) OVER(ORDER BY (weight / ((height/100.0) * (height/100.0))) ASC) as quartile FROM patients;"),

  make(54, 'hospital', 'hard', ['topic:CTEs', 'Self Join', 'company:KaiserPermanente'], 
    "Find 'Diagnostic Shifts'. Identify admissions where a patient was given a 'Mild' diagnosis, but in a subsequent admission, they received a 'Critical' diagnosis for the exact same ICD code. Return patient_id and icd_code.", 
    "Join admissions and diagnoses twice.", "Filter by date and severity.", 
    "WITH PatientDiag AS (SELECT a.patient_id, a.admission_date, d.icd_code, d.severity FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id) SELECT DISTINCT p1.patient_id, p1.icd_code FROM PatientDiag p1 JOIN PatientDiag p2 ON p1.patient_id = p2.patient_id AND p1.icd_code = p2.icd_code WHERE p1.severity = 'Mild' AND p2.severity = 'Critical' AND p1.admission_date < p2.admission_date;", 
    "WITH PatientDiag AS (SELECT a.patient_id, a.admission_date, d.icd_code, d.severity FROM admissions a JOIN diagnoses d ON a.admission_id = d.admission_id) SELECT DISTINCT p1.patient_id, p1.icd_code FROM PatientDiag p1 JOIN PatientDiag p2 ON p1.patient_id = p2.patient_id AND p1.icd_code = p2.icd_code WHERE p1.severity = 'Mild' AND p2.severity = 'Critical' AND p1.admission_date < p2.admission_date;"),

  make(55, 'hospital', 'hard', ['topic:CTEs', 'Data Analysis', 'company:JohnsHopkins'], 
    "Calculate the 'Polypharmacy Rate' for the hospital. Formula: (Number of admissions with >= 5 concurrent medications) / (Total number of admissions). Return as percentage.", 
    "Count meds per admission.", "Sum how many have >= 5, divide by total admissions.", 
    "WITH MedCounts AS (SELECT admission_id, COUNT(*) as med_count FROM medications GROUP BY admission_id), PolyCount AS (SELECT COUNT(*) as poly_adms FROM MedCounts WHERE med_count >= 5), TotalAdms AS (SELECT COUNT(*) as total_adms FROM admissions) SELECT ROUND(CAST(poly_adms AS REAL) * 100.0 / total_adms, 2) as polypharmacy_rate FROM PolyCount CROSS JOIN TotalAdms;", 
    "WITH MedCounts AS (SELECT admission_id, COUNT(*) as med_count FROM medications GROUP BY admission_id), PolyCount AS (SELECT COUNT(*) as poly_adms FROM MedCounts WHERE med_count >= 5), TotalAdms AS (SELECT COUNT(*) as total_adms FROM admissions) SELECT ROUND(CAST(poly_adms AS REAL) * 100.0 / total_adms, 2) as polypharmacy_rate FROM PolyCount CROSS JOIN TotalAdms;"),

  make(56, 'hospital', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:UCLAHealth'], 
    "For patient_id 7, find the time difference in days between consecutive admissions. Return the admission_dates and the days_since_last_admission.", 
    "Use LAG() OVER(ORDER BY admission_date).", "Calculate julianday difference.", 
    "WITH AdmDates AS (SELECT admission_date, LAG(admission_date) OVER(ORDER BY admission_date) as prev_adm FROM admissions WHERE patient_id = 7) SELECT admission_date, ROUND(julianday(admission_date) - julianday(prev_adm)) as days_since_last_admission FROM AdmDates WHERE prev_adm IS NOT NULL;", 
    "WITH AdmDates AS (SELECT admission_date, LAG(admission_date) OVER(ORDER BY admission_date) as prev_adm FROM admissions WHERE patient_id = 7) SELECT admission_date, ROUND(julianday(admission_date) - julianday(prev_adm)) as days_since_last_admission FROM AdmDates WHERE prev_adm IS NOT NULL;"),

  make(57, 'hospital', 'hard', ['topic:CTEs', 'Null Handling', 'company:NYULangone'], 
    "Identify 'Ghost Doctors'. Doctors who are assigned as the head of a department but have NOT attended to any admissions in the entire database. Return their doctor_id and name.", 
    "Check head_doctor_id in departments.", "Use NOT IN (SELECT attending_doctor_id FROM admissions).", 
    "SELECT d.doctor_id, d.first_name, d.last_name FROM doctors d JOIN departments dep ON d.doctor_id = dep.head_doctor_id WHERE d.doctor_id NOT IN (SELECT attending_doctor_id FROM admissions WHERE attending_doctor_id IS NOT NULL);", 
    "SELECT d.doctor_id, d.first_name, d.last_name FROM doctors d JOIN departments dep ON d.doctor_id = dep.head_doctor_id WHERE d.doctor_id NOT IN (SELECT attending_doctor_id FROM admissions WHERE attending_doctor_id IS NOT NULL);"),

  make(58, 'hospital', 'hard', ['topic:Window Functions', 'Rank', 'company:MassGeneral'], 
    "Who is the most commonly prescribed drug in each department? Return department_name, drug_name, prescription_count, and rank.", 
    "Group by department and drug_name.", "Use ROW_NUMBER() OVER(PARTITION BY department ORDER BY count DESC).", 
    "WITH DrugCounts AS (SELECT dep.department_name, m.drug_name, COUNT(*) as pres_count FROM medications m JOIN admissions a ON m.admission_id = a.admission_id JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id GROUP BY dep.department_name, m.drug_name), RankedDrugs AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY department_name ORDER BY pres_count DESC) as rn FROM DrugCounts) SELECT department_name, drug_name, pres_count, rn as rank FROM RankedDrugs WHERE rn = 1;", 
    "WITH DrugCounts AS (SELECT dep.department_name, m.drug_name, COUNT(*) as pres_count FROM medications m JOIN admissions a ON m.admission_id = a.admission_id JOIN doctors doc ON a.attending_doctor_id = doc.doctor_id JOIN departments dep ON doc.department_id = dep.department_id GROUP BY dep.department_name, m.drug_name), RankedDrugs AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY department_name ORDER BY pres_count DESC) as rn FROM DrugCounts) SELECT department_name, drug_name, pres_count, rn as rank FROM RankedDrugs WHERE rn = 1;"),

  make(59, 'hospital', 'hard', ['topic:Math', 'Data Analysis', 'company:StanfordHealth'], 
    "Calculate the 'Severity Index' for each province. (Count of Critical Diagnoses * 10) / Total Patients from that province. Return province_name and severity_index.", 
    "Use CTEs to get critical diagnoses and patient counts per province.", "Join and calculate.", 
    "WITH ProvCrit AS (SELECT p.province_id, COUNT(d.diagnosis_id) as crit_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.severity = 'Critical' GROUP BY p.province_id), ProvPat AS (SELECT province_id, COUNT(patient_id) as total_pats FROM patients GROUP BY province_id) SELECT pn.province_name, ROUND(COALESCE(pc.crit_count, 0) * 10.0 / pp.total_pats, 2) as severity_index FROM province_names pn JOIN ProvPat pp ON pn.province_id = pp.province_id LEFT JOIN ProvCrit pc ON pp.province_id = pc.province_id;", 
    "WITH ProvCrit AS (SELECT p.province_id, COUNT(d.diagnosis_id) as crit_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id JOIN diagnoses d ON a.admission_id = d.admission_id WHERE d.severity = 'Critical' GROUP BY p.province_id), ProvPat AS (SELECT province_id, COUNT(patient_id) as total_pats FROM patients GROUP BY province_id) SELECT pn.province_name, ROUND(COALESCE(pc.crit_count, 0) * 10.0 / pp.total_pats, 2) as severity_index FROM province_names pn JOIN ProvPat pp ON pn.province_id = pp.province_id LEFT JOIN ProvCrit pc ON pp.province_id = pc.province_id;"),

  make(60, 'hospital', 'hard', ['topic:CTEs', 'Data Analysis', 'company:CedarSinai'], 
    "Identify 'Complex Admissions'. An admission is complex if it has > 1 diagnosis AND > 2 medications. Return admission_id.", 
    "Count diagnoses and medications per admission.", "Filter using HAVING or in a CTE.", 
    "WITH DiagCount AS (SELECT admission_id, COUNT(*) as d_count FROM diagnoses GROUP BY admission_id), MedCount AS (SELECT admission_id, COUNT(*) as m_count FROM medications GROUP BY admission_id) SELECT d.admission_id FROM DiagCount d JOIN MedCount m ON d.admission_id = m.admission_id WHERE d.d_count > 1 AND m.m_count > 2;", 
    "WITH DiagCount AS (SELECT admission_id, COUNT(*) as d_count FROM diagnoses GROUP BY admission_id), MedCount AS (SELECT admission_id, COUNT(*) as m_count FROM medications GROUP BY admission_id) SELECT d.admission_id FROM DiagCount d JOIN MedCount m ON d.admission_id = m.admission_id WHERE d.d_count > 1 AND m.m_count > 2;")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT hospital questions!');
