export const hospitalQuestions = [
// ══════════════════════════════════════════════
// EASY (20)
// ══════════════════════════════════════════════
{
  id: 1,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'company:Amazon', 'topic:Aggregate Functions'],
  prompt: 'List all patients showing their first_name, last_name, and gender.',
  hint1: 'Use a basic SELECT statement to retrieve specific columns from the patients table.',
  hint2: 'SELECT first_name, last_name, gender FROM ...',
  hint3: 'SELECT first_name, last_name, gender FROM patients;',
  solutionSQL: 'SELECT first_name, last_name, gender FROM patients;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'gender'],
    rows: [['John', 'Smith', 'M'], ['Maria', 'Garcia', 'F'], ['James', 'Johnson', 'M'], ['Emily', 'Brown', 'F'], ['Robert', 'Davis', 'M'], ['Linda', 'Wilson', 'F'], ['Michael', 'Martinez', 'M'], ['Barbara', 'Taylor', 'F'], ['Charles', 'Anderson', 'M'], ['Jennifer', 'Thomas', 'F'], ['Daniel', 'Jackson', 'M'], ['Susan', 'White', 'F'], ['Matthew', 'Harris', 'M'], ['Karen', 'Martin', 'F'], ['Anthony', 'Thompson', 'M'], ['Lisa', 'Garcia', 'F'], ['Mark', 'Martinez', 'M'], ['Nancy', 'Robinson', 'F'], ['Paul', 'Clark', 'M'], ['Sandra', 'Rodriguez', 'F'], ['Kevin', 'Lewis', 'M'], ['Betty', 'Lee', 'F'], ['George', 'Walker', 'M'], ['Donna', 'Hall', 'F'], ['Ronald', 'Allen', 'M'], ['Carol', 'Young', 'F'], ['Kenneth', 'Hernandez', 'M'], ['Ruth', 'King', 'F'], ['Steven', 'Rodriguez', 'M'], ['Sharon', 'Lopez', 'F'], ['Edward', 'Hill', 'M'], ['Deborah', 'Scott', 'F'], ['Brian', 'Green', 'M'], ['Rachel', 'Adams', 'F'], ['Timothy', 'Baker', 'M'], ['Carolyn', 'Gonzalez', 'F'], ['Jeffrey', 'Nelson', 'M'], ['Amy', 'Carter', 'F'], ['Gary', 'Mitchell', 'M'], ['Anna', 'Perez', 'F'], ['Frank', 'Roberts', 'M'], ['Melissa', 'Turner', 'F'], ['Eric', 'Phillips', 'M'], ['Debra', 'Campbell', 'F'], ['Walter', 'Parker', 'M'], ['Stephanie', 'Evans', 'F'], ['Peter', 'Edwards', 'M'], ['Rebecca', 'Collins', 'F'], ['Henry', 'Stewart', 'M'], ['Virginia', 'Sanchez', 'F'], ['Jack', 'Morris', 'M'], ['Jacqueline', 'Rogers', 'F'], ['Albert', 'Reed', 'M'], ['Maria', 'Cook', 'F'], ['Terry', 'Morgan', 'M'], ['Judith', 'Bell', 'F'], ['Sean', 'Murphy', 'M'], ['Kelly', 'Bailey', 'F'], ['Donald', 'Rivera', 'M'], ['Christine', 'Cooper', 'F'], ['Larry', 'Richardson', 'M'], ['Helen', 'Cox', 'F'], ['Joe', 'Howard', 'M'], ['Joan', 'Ward', 'F'], ['Todd', 'Torres', 'M'], ['Evelyn', 'Peterson', 'F'], ['Carl', 'Gray', 'M'], ['Angela', 'Ramirez', 'F'], ['Arthur', 'James', 'M'], ['Katherine', 'Watson', 'F'], ['Keith', 'Brooks', 'M'], ['Shirley', 'Kelly', 'F'], ['Douglas', 'Sanders', 'M'], ['Carolyn', 'Price', 'F'], ['Lawrence', 'Bennett', 'M'], ['Lori', 'Wood', 'F'], ['Jesse', 'Barnes', 'M'], ['Theresa', 'Ross', 'F'], ['Harold', 'Henderson', 'M'], ['Alice', 'Coleman', 'F'], ['Ralph', 'Jenkins', 'M'], ['Frances', 'Perry', 'F'], ['Ryan', 'Powell', 'M'], ['Virginia', 'Long', 'F'], ['Roy', 'Patterson', 'M'], ['Joyce', 'Hughes', 'F'], ['Eugene', 'Flores', 'M'], ['Gloria', 'Washington', 'F'], ['Wayne', 'Butler', 'M'], ['Mildred', 'Simmons', 'F'], ['Randy', 'Foster', 'M'], ['Phyllis', 'Gonzales', 'F'], ['Louis', 'Bryant', 'M'], ['Debra', 'Alexander', 'F'], ['Dennis', 'Russell', 'M'], ['Cheryl', 'Griffin', 'F'], ['Clarence', 'Diaz', 'M'], ['Julie', 'Hayes', 'F'], ['Victor', 'Myers', 'M'], ['Martha', 'Ford', 'F']]
  }
}, {
  id: 2,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Oracle', 'topic:Basic SQL'],
  prompt: 'Find all patients who are male (gender = \'M\'). Show patient_id, first_name, and last_name.',
  hint1: 'Use a WHERE clause to filter rows based on the gender column.',
  hint2: 'SELECT ... FROM patients WHERE gender = ?',
  hint3: "SELECT patient_id, first_name, last_name FROM patients WHERE gender = 'M';",
  solutionSQL: "SELECT patient_id, first_name, last_name FROM patients WHERE gender = 'M';",
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name'],
    rows: [[1, 'John', 'Smith'], [3, 'James', 'Johnson'], [5, 'Robert', 'Davis'], [7, 'Michael', 'Martinez'], [9, 'Charles', 'Anderson'], [11, 'Daniel', 'Jackson'], [13, 'Matthew', 'Harris'], [15, 'Anthony', 'Thompson'], [17, 'Mark', 'Martinez'], [19, 'Paul', 'Clark'], [21, 'Kevin', 'Lewis'], [23, 'George', 'Walker'], [25, 'Ronald', 'Allen'], [27, 'Kenneth', 'Hernandez'], [29, 'Steven', 'Rodriguez'], [31, 'Edward', 'Hill'], [33, 'Brian', 'Green'], [35, 'Timothy', 'Baker'], [37, 'Jeffrey', 'Nelson'], [39, 'Gary', 'Mitchell'], [41, 'Frank', 'Roberts'], [43, 'Eric', 'Phillips'], [45, 'Walter', 'Parker'], [47, 'Peter', 'Edwards'], [49, 'Henry', 'Stewart'], [51, 'Jack', 'Morris'], [53, 'Albert', 'Reed'], [55, 'Terry', 'Morgan'], [57, 'Sean', 'Murphy'], [59, 'Donald', 'Rivera'], [61, 'Larry', 'Richardson'], [63, 'Joe', 'Howard'], [65, 'Todd', 'Torres'], [67, 'Carl', 'Gray'], [69, 'Arthur', 'James'], [71, 'Keith', 'Brooks'], [73, 'Douglas', 'Sanders'], [75, 'Lawrence', 'Bennett'], [77, 'Jesse', 'Barnes'], [79, 'Harold', 'Henderson'], [81, 'Ralph', 'Jenkins'], [83, 'Ryan', 'Powell'], [85, 'Roy', 'Patterson'], [87, 'Eugene', 'Flores'], [89, 'Wayne', 'Butler'], [91, 'Randy', 'Foster'], [93, 'Louis', 'Bryant'], [95, 'Dennis', 'Russell'], [97, 'Clarence', 'Diaz'], [99, 'Victor', 'Myers']]
  }
}, {
  id: 3,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Airbnb', 'topic:Basic SQL'],
  prompt: "List all patients who are allergic to 'Penicillin'. Show first_name, last_name, and allergies.",
  hint1: 'Filter by the allergies column. Use = for exact match.',
  hint2: "SELECT ... FROM patients WHERE allergies = ?",
  hint3: "SELECT first_name, last_name, allergies FROM patients WHERE allergies = 'Penicillin';",
  solutionSQL: "SELECT first_name, last_name, allergies FROM patients WHERE allergies = 'Penicillin';",
  expectedResult: {
    columns: ['first_name', 'last_name', 'allergies'],
    rows: [['Maria', 'Garcia', 'Penicillin'], ['Linda', 'Wilson', 'Penicillin'], ['Anthony', 'Thompson', 'Penicillin'], ['Sandra', 'Rodriguez', 'Penicillin'], ['Frank', 'Roberts', 'Penicillin'], ['Terry', 'Morgan', 'Penicillin'], ['Ryan', 'Powell', 'Penicillin'], ['Victor', 'Myers', 'Penicillin']]
  }
}, {
  id: 4,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'Order By', 'company:Snowflake', 'topic:Aggregate Functions'],
  prompt: "Show all patients born after 1990-01-01, ordered by birth_date ascending. Show first_name, last_name, birth_date.",
  hint1: 'Use a WHERE clause with a date comparison and ORDER BY to sort the results.',
  hint2: "SELECT ... FROM patients WHERE birth_date > '1990-01-01' ORDER BY birth_date",
  hint3: "SELECT first_name, last_name, birth_date FROM patients WHERE birth_date > '1990-01-01' ORDER BY birth_date ASC;",
  solutionSQL: "SELECT first_name, last_name, birth_date FROM patients WHERE birth_date > '1990-01-01' ORDER BY birth_date ASC;",
  expectedResult: {
    columns: ['first_name', 'last_name', 'birth_date'],
    rows: [['Emily', 'Brown', '1990-01-30'], ['Anna', 'Perez', '1990-04-18'], ['Joyce', 'Hughes', '1990-03-20'], ['Maria', 'Garcia', '1992-07-24'], ['Jack', 'Morris', '1992-08-25'], ['Lisa', 'Garcia', '1993-06-30'], ['Melissa', 'Turner', '1993-02-22'], ['Angela', 'Ramirez', '1993-09-14'], ['Deborah', 'Scott', '1994-04-02'], ['Debra', 'Alexander', '1994-07-06'], ['Michael', 'Martinez', '1995-04-14'], ['Maria', 'Cook', '1995-11-16'], ['Carol', 'Young', '1991-01-16'], ['Julie', 'Hayes', '1995-03-14'], ['Carolyn', 'Gonzalez', '1996-10-10'], ['Frances', 'Perry', '1996-07-12'], ['Sandra', 'Rodriguez', '1997-08-13'], ['Carolyn', 'Price', '1997-03-26'], ['Helen', 'Cox', '1997-03-02'], ['Jennifer', 'Thomas', '1998-02-27'], ['Rebecca', 'Collins', '1999-07-04'], ['Steven', 'Rodriguez', '1999-02-11'], ['Virginia', 'Sanchez', '1986-04-08'], ['Stephanie', 'Evans', '1988-09-30'], ['Alice', 'Coleman', '1989-09-08'], ['Kelly', 'Bailey', '1990-07-24']].sort((a, b) => a[2] < b[2] ? -1 : 1)
  }
}, {
  id: 5,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'String Function', 'company:Salesforce', 'topic:Basic SQL'],
  prompt: "Find all patients whose first_name starts with the letter 'J'. Show first_name and last_name.",
  hint1: 'Use LIKE with a wildcard pattern to match names starting with a letter.',
  hint2: "WHERE first_name LIKE 'J%'",
  hint3: "SELECT first_name, last_name FROM patients WHERE first_name LIKE 'J%';",
  solutionSQL: "SELECT first_name, last_name FROM patients WHERE first_name LIKE 'J%';",
  expectedResult: {
    columns: ['first_name', 'last_name'],
    rows: [['John', 'Smith'], ['James', 'Johnson'], ['Jennifer', 'Thomas'], ['Jeffrey', 'Nelson'], ['Jack', 'Morris'], ['Jacqueline', 'Rogers'], ['Judith', 'Bell'], ['Joe', 'Howard'], ['Joan', 'Ward'], ['Jesse', 'Barnes'], ['Julie', 'Hayes'], ['Joyce', 'Hughes']]
  }
}, {
  id: 6,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Apple', 'topic:Basic SQL'],
  prompt: 'List patients with a weight between 70 and 90 kg (inclusive). Show first_name, last_name, and weight.',
  hint1: 'Use BETWEEN to filter numeric ranges. It is inclusive on both ends.',
  hint2: 'WHERE weight BETWEEN 70 AND 90',
  hint3: 'SELECT first_name, last_name, weight FROM patients WHERE weight BETWEEN 70 AND 90;',
  solutionSQL: 'SELECT first_name, last_name, weight FROM patients WHERE weight BETWEEN 70 AND 90;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'weight'],
    rows: [['John', 'Smith', 82.5], ['Linda', 'Wilson', 70.1], ['Daniel', 'Jackson', 84.7], ['Susan', 'White', 73.5], ['Anthony', 'Thompson', 79.6], ['Mark', 'Martinez', 87.1], ['Donna', 'Hall', 71.7], ['Ronald', 'Allen', 85.4], ['Kevin', 'Lewis', 80.3], ['George', 'Walker', null], ['Ruth', 'King', null], ['Brian', 'Green', 86.2], ['Jeffrey', 'Nelson', 88.7], ['Frank', 'Roberts', null], ['Melissa', 'Turner', 70.3], ['Debra', 'Campbell', null], ['Peter', 'Edwards', 84.0], ['Jack', 'Morris', 75.8], ['Albert', 'Reed', 82.3], ['Terry', 'Morgan', 86.7], ['Judith', 'Bell', null], ['Larry', 'Richardson', 80.1], ['Carl', 'Gray', 85.8], ['Ralph', 'Jenkins', 81.7], ['Ryan', 'Powell', 87.9], ['Eugene', 'Flores', 85.0], ['Wayne', 'Butler', null], ['Randy', 'Foster', 88.3], ['Louis', 'Bryant', 84.8], ['Clarence', 'Diaz', 82.6]].filter(r => {
      const w = r[2];
      return w !== null && w >= 70 && w <= 90;
    })
  }
}, {
  id: 7,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Group By', 'company:Netflix', 'topic:Basic SQL'],
  prompt: 'Count the total number of patients in the database. Return a single number labeled total_patients.',
  hint1: 'Use the COUNT() aggregate function to count rows.',
  hint2: 'SELECT COUNT(*) AS total_patients FROM ...',
  hint3: 'SELECT COUNT(*) AS total_patients FROM patients;',
  solutionSQL: 'SELECT COUNT(*) AS total_patients FROM patients;',
  expectedResult: {
    columns: ['total_patients'],
    rows: [[100]]
  }
}, {
  id: 8,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'company:Netflix', 'topic:Keys & Constraints'],
  prompt: 'Show all distinct cities that patients come from. Order alphabetically.',
  hint1: 'Use the DISTINCT keyword to eliminate duplicate city values.',
  hint2: 'SELECT DISTINCT city FROM patients ORDER BY city',
  hint3: 'SELECT DISTINCT city FROM patients ORDER BY city;',
  solutionSQL: 'SELECT DISTINCT city FROM patients ORDER BY city;',
  expectedResult: {
    columns: ['city'],
    rows: [['Calgary'], ['Edmonton'], ['Fredericton'], ['Halifax'], ['Montreal'], ['Ottawa'], ['Saskatoon'], ["St. John's"], ['Toronto'], ['Vancouver'], ['Winnipeg']]
  }
}, {
  id: 9,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'Null Handling', 'company:Google', 'topic:Database Design'],
  prompt: 'Find patients with no known allergies (allergies IS NULL). Show patient_id, first_name, and last_name.',
  hint1: 'To check for NULL values, use IS NULL — not = NULL.',
  hint2: 'WHERE allergies IS NULL',
  hint3: 'SELECT patient_id, first_name, last_name FROM patients WHERE allergies IS NULL;',
  solutionSQL: 'SELECT patient_id, first_name, last_name FROM patients WHERE allergies IS NULL;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name'],
    rows: [[1, 'John', 'Smith'], [3, 'James', 'Johnson'], [5, 'Robert', 'Davis'], [8, 'Barbara', 'Taylor'], [9, 'Charles', 'Anderson'], [11, 'Daniel', 'Jackson'], [13, 'Matthew', 'Harris'], [14, 'Karen', 'Martin'], [16, 'Lisa', 'Garcia'], [17, 'Mark', 'Martinez'], [19, 'Paul', 'Clark'], [21, 'Kevin', 'Lewis'], [22, 'Betty', 'Lee'], [23, 'George', 'Walker'], [26, 'Carol', 'Young'], [27, 'Kenneth', 'Hernandez'], [28, 'Ruth', 'King'], [30, 'Sharon', 'Lopez'], [33, 'Brian', 'Green'], [36, 'Carolyn', 'Gonzalez'], [37, 'Jeffrey', 'Nelson'], [39, 'Gary', 'Mitchell'], [40, 'Anna', 'Perez'], [42, 'Melissa', 'Turner'], [43, 'Eric', 'Phillips'], [45, 'Walter', 'Parker'], [46, 'Stephanie', 'Evans'], [47, 'Peter', 'Edwards'], [49, 'Henry', 'Stewart'], [50, 'Virginia', 'Sanchez'], [51, 'Jack', 'Morris'], [53, 'Albert', 'Reed'], [54, 'Maria', 'Cook'], [56, 'Judith', 'Bell'], [57, 'Sean', 'Murphy'], [60, 'Christine', 'Cooper'], [61, 'Larry', 'Richardson'], [63, 'Joe', 'Howard'], [64, 'Joan', 'Ward'], [66, 'Evelyn', 'Peterson'], [67, 'Carl', 'Gray'], [68, 'Angela', 'Ramirez'], [70, 'Katherine', 'Watson'], [71, 'Keith', 'Brooks'], [72, 'Shirley', 'Kelly'], [74, 'Carolyn', 'Price'], [75, 'Lawrence', 'Bennett'], [76, 'Lori', 'Wood'], [77, 'Jesse', 'Barnes'], [78, 'Theresa', 'Ross'], [79, 'Harold', 'Henderson'], [80, 'Alice', 'Coleman'], [81, 'Ralph', 'Jenkins'], [82, 'Frances', 'Perry'], [84, 'Virginia', 'Long'], [85, 'Roy', 'Patterson'], [86, 'Joyce', 'Hughes'], [87, 'Eugene', 'Flores'], [89, 'Wayne', 'Butler'], [90, 'Mildred', 'Simmons'], [91, 'Randy', 'Foster'], [93, 'Louis', 'Bryant'], [94, 'Debra', 'Alexander'], [96, 'Cheryl', 'Griffin'], [97, 'Clarence', 'Diaz'], [98, 'Julie', 'Hayes'], [100, 'Martha', 'Ford']]
  }
}, {
  id: 10,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Order By', 'company:Meta', 'topic:Basic SQL'],
  prompt: 'List the top 10 heaviest patients. Show first_name, last_name, and weight, ordered by weight descending.',
  hint1: 'Use ORDER BY ... DESC and LIMIT to get only the top rows.',
  hint2: 'ORDER BY weight DESC LIMIT 10',
  hint3: 'SELECT first_name, last_name, weight FROM patients ORDER BY weight DESC LIMIT 10;',
  solutionSQL: 'SELECT first_name, last_name, weight FROM patients ORDER BY weight DESC LIMIT 10;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'weight'],
    rows: [['George', 'Walker', 96.5], ['Donald', 'Rivera', 95.3], ['Walter', 'Parker', 93.4], ['Dennis', 'Russell', 91.5], ['Roy', 'Patterson', 92.2], ['Keith', 'Brooks', 92.6], ['Charles', 'Anderson', 91.2], ['Wayne', 'Butler', 90.8], ['Arthur', 'James', 90.2], ['Kenneth', 'Hernandez', 89.8]]
  }
}, {
  id: 11,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'company:Netflix', 'topic:Keys & Constraints'],
  prompt: 'Show all doctors with their first_name, last_name, and specialty.',
  hint1: 'Select the required columns directly from the doctors table.',
  hint2: 'SELECT first_name, last_name, specialty FROM ...',
  hint3: 'SELECT first_name, last_name, specialty FROM doctors;',
  solutionSQL: 'SELECT first_name, last_name, specialty FROM doctors;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'specialty'],
    rows: [['John', 'Smith', 'Cardiologist'], ['Sarah', 'Johnson', 'Neurologist'], ['Michael', 'Brown', 'Orthopedic Surgeon'], ['Emily', 'Davis', 'Oncologist'], ['Robert', 'Wilson', 'Emergency Physician'], ['Linda', 'Martinez', 'Pediatrician'], ['James', 'Anderson', 'General Practitioner'], ['Patricia', 'Taylor', 'Cardiologist'], ['Charles', 'Thomas', 'Neurologist'], ['Barbara', 'Jackson', 'Radiologist'], ['Christopher', 'White', 'Oncologist'], ['Jennifer', 'Harris', 'Pediatrician'], ['Daniel', 'Martin', 'Emergency Physician'], ['Susan', 'Thompson', 'General Practitioner'], ['Matthew', 'Garcia', 'Orthopedic Surgeon'], ['Karen', 'Martinez', 'Cardiologist'], ['Anthony', 'Robinson', 'Neurologist'], ['Lisa', 'Clark', 'General Practitioner'], ['Mark', 'Rodriguez', 'Oncologist'], ['Nancy', 'Lewis', 'Pediatrician']]
  }
}, {
  id: 12,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'company:Oracle', 'topic:Keys & Constraints'],
  prompt: 'List all departments with department_id and department_name.',
  hint1: 'A straightforward SELECT from the departments table.',
  hint2: 'SELECT department_id, department_name FROM departments',
  hint3: 'SELECT department_id, department_name FROM departments;',
  solutionSQL: 'SELECT department_id, department_name FROM departments;',
  expectedResult: {
    columns: ['department_id', 'department_name'],
    rows: [[1, 'Cardiology'], [2, 'Neurology'], [3, 'Orthopedics'], [4, 'Oncology'], [5, 'Emergency'], [6, 'Pediatrics'], [7, 'General Medicine'], [8, 'Radiology']]
  }
}, {
  id: 13,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'Date Function', 'company:Google', 'topic:Basic SQL'],
  prompt: 'Find all patients admitted in the year 2023. Show admission_id, patient_id, admission_date, and diagnosis.',
  hint1: "Use strftime('%Y', admission_date) to extract the year from a date in SQLite.",
  hint2: "WHERE strftime('%Y', admission_date) = '2023'",
  hint3: "SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE strftime('%Y', admission_date) = '2023';",
  solutionSQL: "SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE strftime('%Y', admission_date) = '2023';",
  expectedResult: {
    columns: ['admission_id', 'patient_id', 'admission_date', 'diagnosis'],
    rows: [[13, 13, '2023-01-10', 'Appendicitis'], [14, 14, '2023-02-05', 'Arthritis'], [15, 15, '2023-03-01', 'Hypertension'], [16, 16, '2023-04-15', 'Migraine'], [17, 17, '2023-05-10', 'Diabetes'], [18, 18, '2023-06-05', 'Bronchitis'], [19, 19, '2023-07-20', 'Fracture'], [20, 20, '2023-08-15', 'Pneumonia'], [21, 21, '2023-09-10', 'Hypertension'], [22, 22, '2023-10-01', 'Diabetes'], [23, 23, '2023-11-15', 'Stroke'], [24, 24, '2023-12-05', 'Arthritis'], [31, 1, '2023-03-12', 'Arrhythmia'], [32, 2, '2023-05-22', 'Migraine'], [35, 5, '2023-11-05', 'Hernia'], [37, 7, '2023-08-12', 'Diabetes Type 2'], [39, 9, '2023-04-30', 'TIA'], [40, 10, '2023-07-01', null], [42, 12, '2023-07-25', 'Diabetes'], [43, 13, '2023-08-01', 'Appendicitis'], [54, 41, '2023-03-25', 'Diabetes'], [55, 42, '2023-04-10', 'Arthritis'], [56, 43, '2023-05-20', 'Hypertension'], [57, 44, '2023-06-15', 'Migraine'], [58, 45, '2023-07-05', 'Heart Failure'], [59, 46, '2023-08-20', 'Bronchitis'], [60, 47, '2023-09-10', 'Fracture'], [61, 48, '2023-10-25', 'Pneumonia'], [62, 49, '2023-11-15', 'COPD'], [63, 50, '2023-12-01', 'Diabetes'], [89, 76, '2023-01-25', 'Anemia'], [90, 77, '2023-02-20', 'Hypertension'], [91, 78, '2023-03-15', 'Diabetes'], [92, 79, '2023-04-01', 'COPD'], [93, 80, '2023-05-10', 'Pneumonia'], [94, 81, '2023-06-05', 'Arthritis'], [95, 82, '2023-07-20', 'Migraine'], [96, 83, '2023-08-10', 'Hypertension'], [97, 84, '2023-09-05', 'Diabetes'], [98, 85, '2023-10-20', 'Heart Failure'], [99, 86, '2023-11-10', 'Fracture'], [100, 87, '2023-12-05', 'Stroke'], [114, 14, '2023-03-10', 'Hypertension'], [115, 30, '2022-09-01', null]].filter(r => String(r[2]).startsWith('2023'))
  }
}, {
  id: 14,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'company:Amazon', 'topic:Database Design'],
  prompt: 'Show all province names with their province_id and country.',
  hint1: 'Select directly from the province_names table.',
  hint2: 'SELECT province_id, province_name, country FROM province_names',
  hint3: 'SELECT province_id, province_name, country FROM province_names;',
  solutionSQL: 'SELECT province_id, province_name, country FROM province_names;',
  expectedResult: {
    columns: ['province_id', 'province_name', 'country'],
    rows: [['ON', 'Ontario', 'Canada'], ['BC', 'British Columbia', 'Canada'], ['AB', 'Alberta', 'Canada'], ['QC', 'Quebec', 'Canada'], ['MB', 'Manitoba', 'Canada'], ['SK', 'Saskatchewan', 'Canada'], ['NS', 'Nova Scotia', 'Canada'], ['NB', 'New Brunswick', 'Canada'], ['NL', 'Newfoundland and Labrador', 'Canada'], ['PE', 'Prince Edward Island', 'Canada'], ['NY', 'New York', 'USA'], ['CA', 'California', 'USA'], ['TX', 'Texas', 'USA'], ['FL', 'Florida', 'USA'], ['WA', 'Washington', 'USA']]
  }
}, {
  id: 15,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Group By', 'company:Microsoft', 'topic:Aggregate Functions'],
  prompt: "Count how many patients are from each province. Show province_id and patient_count, ordered by patient_count descending.",
  hint1: 'Use GROUP BY on province_id and COUNT(*) to aggregate patients per province.',
  hint2: 'SELECT province_id, COUNT(*) AS patient_count FROM patients GROUP BY province_id',
  hint3: 'SELECT province_id, COUNT(*) AS patient_count FROM patients GROUP BY province_id ORDER BY patient_count DESC;',
  solutionSQL: 'SELECT province_id, COUNT(*) AS patient_count FROM patients GROUP BY province_id ORDER BY patient_count DESC;',
  expectedResult: {
    columns: ['province_id', 'patient_count'],
    rows: [['ON', 20], ['BC', 20], ['AB', 17], ['QC', 10], ['MB', 9], ['ON', null]].filter(() => false) // computed from data
  }
}, {
  id: 16,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Order By', 'company:Airbnb', 'topic:Basic SQL'],
  prompt: 'List all admissions ordered by admission_date descending. Show admission_id, patient_id, admission_date, and diagnosis.',
  hint1: 'Use ORDER BY with DESC to get the most recent admissions first.',
  hint2: 'ORDER BY admission_date DESC',
  hint3: 'SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions ORDER BY admission_date DESC;',
  solutionSQL: 'SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions ORDER BY admission_date DESC;',
  expectedResult: {
    columns: ['admission_id', 'patient_id', 'admission_date', 'diagnosis'],
    rows: []
  }
}, {
  id: 17,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'String Function', 'company:Apple', 'topic:Aggregate Functions'],
  prompt: "Find patients whose last_name ends with 'son'. Show first_name, last_name.",
  hint1: "Use LIKE with a % wildcard before the suffix pattern to match ends of strings.",
  hint2: "WHERE last_name LIKE '%son'",
  hint3: "SELECT first_name, last_name FROM patients WHERE last_name LIKE '%son';",
  solutionSQL: "SELECT first_name, last_name FROM patients WHERE last_name LIKE '%son';",
  expectedResult: {
    columns: ['first_name', 'last_name'],
    rows: [['James', 'Johnson'], ['Sarah', null]].filter(() => false)
  }
}, {
  id: 18,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Airbnb', 'topic:Aggregate Functions'],
  prompt: 'Show all patients taller than 180 cm. Show first_name, last_name, and height, ordered by height descending.',
  hint1: 'Use a simple WHERE clause with > comparison on the height column.',
  hint2: 'WHERE height > 180 ORDER BY height DESC',
  hint3: 'SELECT first_name, last_name, height FROM patients WHERE height > 180 ORDER BY height DESC;',
  solutionSQL: 'SELECT first_name, last_name, height FROM patients WHERE height > 180 ORDER BY height DESC;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'height'],
    rows: [['Charles', 'Anderson', 188], ['Donald', 'Rivera', 188], ['George', 'Walker', null]].filter(() => false)
  }
}, {
  id: 19,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Oracle', 'topic:Keys & Constraints'],
  prompt: "List all doctors whose first_name is 'John'. Show doctor_id, first_name, last_name, and specialty.",
  hint1: "Use a WHERE clause to match the exact first name 'John'.",
  hint2: "WHERE first_name = 'John'",
  hint3: "SELECT doctor_id, first_name, last_name, specialty FROM doctors WHERE first_name = 'John';",
  solutionSQL: "SELECT doctor_id, first_name, last_name, specialty FROM doctors WHERE first_name = 'John';",
  expectedResult: {
    columns: ['doctor_id', 'first_name', 'last_name', 'specialty'],
    rows: [[1, 'John', 'Smith', 'Cardiologist']]
  }
}, {
  id: 20,
  db: 'hospital',
  difficulty: 'easy',
  keywords: ['Select', 'Where', 'company:Databricks', 'topic:Basic SQL'],
  prompt: "Find all admissions with a diagnosis of 'Diabetes'. Show admission_id, patient_id, admission_date, and diagnosis.",
  hint1: "Filter the admissions table using WHERE diagnosis = 'Diabetes'.",
  hint2: "WHERE diagnosis = 'Diabetes'",
  hint3: "SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE diagnosis = 'Diabetes';",
  solutionSQL: "SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE diagnosis = 'Diabetes';",
  expectedResult: {
    columns: ['admission_id', 'patient_id', 'admission_date', 'diagnosis'],
    rows: [[7, 7, '2022-07-01', 'Diabetes'], [12, 12, '2022-12-20', 'Diabetes'], [17, 17, '2023-05-10', 'Diabetes'], [22, 22, '2023-10-01', 'Diabetes'], [42, 12, '2023-07-25', 'Diabetes'], [46, 33, '2022-07-15', 'Diabetes'], [63, 50, '2023-12-01', 'Diabetes'], [74, 61, '2024-03-05', 'Diabetes'], [81, 68, '2022-05-15', 'Diabetes'], [91, 78, '2023-03-15', 'Diabetes'], [97, 84, '2023-09-05', 'Diabetes'], [106, 93, '2024-06-15', 'Diabetes'], [113, 100, '2024-05-10', 'Diabetes']]
  }
},
// ══════════════════════════════════════════════
// MEDIUM (25)
// ══════════════════════════════════════════════
{
  id: 21,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Select', 'Join', 'Group By', 'company:Netflix', 'topic:Views'],
  prompt: 'List each patient with their most recent admission date. Show patient_id, first_name, last_name, and last_admission_date. Order by last_admission_date DESC.',
  hint1: 'Use MAX() aggregation with GROUP BY to find the most recent admission per patient, then JOIN back to patients.',
  hint2: 'SELECT p.patient_id, p.first_name, p.last_name, MAX(a.admission_date) AS last_admission_date FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY ...',
  hint3: 'SELECT p.patient_id, p.first_name, p.last_name, MAX(a.admission_date) AS last_admission_date FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name ORDER BY last_admission_date DESC;',
  solutionSQL: 'SELECT p.patient_id, p.first_name, p.last_name, MAX(a.admission_date) AS last_admission_date FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name ORDER BY last_admission_date DESC;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name', 'last_admission_date'],
    rows: []
  }
}, {
  id: 22,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Select', 'Join', 'Group By', 'Having', 'company:Netflix', 'topic:Normalization'],
  prompt: 'Find patients who have been admitted more than once. Show patient_id, first_name, last_name, and admission_count. Order by admission_count DESC.',
  hint1: 'COUNT the admissions per patient using GROUP BY, then use HAVING to filter for counts greater than 1.',
  hint2: 'GROUP BY patient_id HAVING COUNT(*) > 1',
  hint3: 'SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name HAVING COUNT(a.admission_id) > 1 ORDER BY admission_count DESC;',
  solutionSQL: 'SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name HAVING COUNT(a.admission_id) > 1 ORDER BY admission_count DESC;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name', 'admission_count'],
    rows: []
  }
}, {
  id: 23,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'Order By', 'company:Adobe', 'topic:Views'],
  prompt: 'Find the doctor who handled the most admissions. Show doctor_id, first_name, last_name, and admission_count.',
  hint1: 'JOIN doctors to admissions, GROUP BY doctor, COUNT admissions, and use ORDER BY + LIMIT 1.',
  hint2: 'JOIN admissions ON attending_doctor_id = doctor_id GROUP BY doctor_id ORDER BY COUNT(*) DESC LIMIT 1',
  hint3: 'SELECT d.doctor_id, d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id, d.first_name, d.last_name ORDER BY admission_count DESC LIMIT 1;',
  solutionSQL: 'SELECT d.doctor_id, d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id, d.first_name, d.last_name ORDER BY admission_count DESC LIMIT 1;',
  expectedResult: {
    columns: ['doctor_id', 'first_name', 'last_name', 'admission_count'],
    rows: []
  }
}, {
  id: 24,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'company:Salesforce', 'topic:Subqueries'],
  prompt: 'List all admissions with patient full name and attending doctor full name. Show admission_id, patient_name, doctor_name, and diagnosis.',
  hint1: 'You need to JOIN patients and doctors to admissions. Concatenate first and last names.',
  hint2: "JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.attending_doctor_id = d.doctor_id",
  hint3: "SELECT a.admission_id, p.first_name || ' ' || p.last_name AS patient_name, d.first_name || ' ' || d.last_name AS doctor_name, a.diagnosis FROM admissions a JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.attending_doctor_id = d.doctor_id;",
  solutionSQL: "SELECT a.admission_id, p.first_name || ' ' || p.last_name AS patient_name, d.first_name || ' ' || d.last_name AS doctor_name, a.diagnosis FROM admissions a JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.attending_doctor_id = d.doctor_id;",
  expectedResult: {
    columns: ['admission_id', 'patient_name', 'doctor_name', 'diagnosis'],
    rows: []
  }
}, {
  id: 25,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'Having', 'company:Oracle', 'topic:Joins'],
  prompt: 'Show departments that have more than 3 doctors. Display department_name and doctor_count.',
  hint1: 'JOIN doctors to departments, GROUP BY department, and HAVING COUNT > 3.',
  hint2: 'JOIN doctors ON department_id GROUP BY department_name HAVING COUNT(*) > 3',
  hint3: 'SELECT dep.department_name, COUNT(d.doctor_id) AS doctor_count FROM departments dep JOIN doctors d ON dep.department_id = d.department_id GROUP BY dep.department_name HAVING COUNT(d.doctor_id) > 3;',
  solutionSQL: 'SELECT dep.department_name, COUNT(d.doctor_id) AS doctor_count FROM departments dep JOIN doctors d ON dep.department_id = d.department_id GROUP BY dep.department_name HAVING COUNT(d.doctor_id) > 3;',
  expectedResult: {
    columns: ['department_name', 'doctor_count'],
    rows: []
  }
}, {
  id: 26,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Select', 'Where', 'Date Function', 'company:Netflix', 'topic:ER Modeling'],
  prompt: 'Find patients admitted and discharged on the same day. Show admission_id, patient_id, admission_date, discharge_date.',
  hint1: 'Compare admission_date and discharge_date directly. They must both be non-NULL.',
  hint2: 'WHERE admission_date = discharge_date',
  hint3: 'SELECT admission_id, patient_id, admission_date, discharge_date FROM admissions WHERE admission_date = discharge_date AND discharge_date IS NOT NULL;',
  solutionSQL: 'SELECT admission_id, patient_id, admission_date, discharge_date FROM admissions WHERE admission_date = discharge_date AND discharge_date IS NOT NULL;',
  expectedResult: {
    columns: ['admission_id', 'patient_id', 'admission_date', 'discharge_date'],
    rows: []
  }
}, {
  id: 27,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'Date Function', 'company:Airbnb', 'topic:Joins'],
  prompt: 'Calculate the average length of stay (in days) per department. Only include admissions with a discharge date. Show department_name and avg_stay_days rounded to 2 decimal places.',
  hint1: 'Calculate days between dates using julianday(). JOIN to departments. Use ROUND() for formatting.',
  hint2: 'ROUND(AVG(julianday(discharge_date) - julianday(admission_date)), 2)',
  hint3: 'SELECT dep.department_name, ROUND(AVG(julianday(a.discharge_date) - julianday(a.admission_date)), 2) AS avg_stay_days FROM admissions a JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE a.discharge_date IS NOT NULL GROUP BY dep.department_name ORDER BY avg_stay_days DESC;',
  solutionSQL: 'SELECT dep.department_name, ROUND(AVG(julianday(a.discharge_date) - julianday(a.admission_date)), 2) AS avg_stay_days FROM admissions a JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE a.discharge_date IS NOT NULL GROUP BY dep.department_name ORDER BY avg_stay_days DESC;',
  expectedResult: {
    columns: ['department_name', 'avg_stay_days'],
    rows: []
  }
}, {
  id: 28,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'company:Salesforce', 'topic:Subqueries'],
  prompt: 'List all patients with their total number of admissions. Show first_name, last_name, and admission_count. Include patients with zero admissions.',
  hint1: 'Use a LEFT JOIN so patients with no admissions are still returned. COUNT the admission_id (not *).',
  hint2: 'LEFT JOIN admissions ON patient_id GROUP BY patient_id',
  hint3: 'SELECT p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p LEFT JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name ORDER BY admission_count DESC;',
  solutionSQL: 'SELECT p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p LEFT JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id, p.first_name, p.last_name ORDER BY admission_count DESC;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'admission_count'],
    rows: []
  }
}, {
  id: 29,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Group By', 'Date Function', 'company:Databricks', 'topic:Subqueries'],
  prompt: "Show the number of admissions per month in 2023. Show month (as 'YYYY-MM') and admission_count, ordered chronologically.",
  hint1: "Use strftime to extract year-month. Filter to 2023 with WHERE.",
  hint2: "strftime('%Y-%m', admission_date) AS month WHERE strftime('%Y', admission_date) = '2023'",
  hint3: "SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS admission_count FROM admissions WHERE strftime('%Y', admission_date) = '2023' GROUP BY month ORDER BY month;",
  solutionSQL: "SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS admission_count FROM admissions WHERE strftime('%Y', admission_date) = '2023' GROUP BY month ORDER BY month;",
  expectedResult: {
    columns: ['month', 'admission_count'],
    rows: []
  }
}, {
  id: 30,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Where', 'Date Function', 'company:Uber', 'topic:Views'],
  prompt: "Find all admissions where the patient was over 60 years old at the time of admission. Show admission_id, patient full name, age_at_admission, and admission_date.",
  hint1: 'Calculate age by comparing birth_date to admission_date using julianday difference divided by 365.',
  hint2: "CAST((julianday(a.admission_date) - julianday(p.birth_date)) / 365 AS INTEGER) AS age",
  hint3: "SELECT a.admission_id, p.first_name || ' ' || p.last_name AS patient_name, CAST((julianday(a.admission_date) - julianday(p.birth_date)) / 365 AS INTEGER) AS age_at_admission, a.admission_date FROM admissions a JOIN patients p ON a.patient_id = p.patient_id WHERE CAST((julianday(a.admission_date) - julianday(p.birth_date)) / 365 AS INTEGER) > 60 ORDER BY age_at_admission DESC;",
  solutionSQL: "SELECT a.admission_id, p.first_name || ' ' || p.last_name AS patient_name, CAST((julianday(a.admission_date) - julianday(p.birth_date)) / 365 AS INTEGER) AS age_at_admission, a.admission_date FROM admissions a JOIN patients p ON a.patient_id = p.patient_id WHERE CAST((julianday(a.admission_date) - julianday(p.birth_date)) / 365 AS INTEGER) > 60 ORDER BY age_at_admission DESC;",
  expectedResult: {
    columns: ['admission_id', 'patient_name', 'age_at_admission', 'admission_date'],
    rows: []
  }
}, {
  id: 31,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Left Join', 'Null Handling', 'company:Microsoft', 'topic:ER Modeling'],
  prompt: 'List doctors who have never had an admission assigned to them. Show doctor_id, first_name, last_name, and specialty.',
  hint1: 'Use a LEFT JOIN from doctors to admissions, then filter WHERE the admission key IS NULL.',
  hint2: 'LEFT JOIN admissions ON attending_doctor_id = doctor_id WHERE admission_id IS NULL',
  hint3: 'SELECT d.doctor_id, d.first_name, d.last_name, d.specialty FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id WHERE a.admission_id IS NULL;',
  solutionSQL: 'SELECT d.doctor_id, d.first_name, d.last_name, d.specialty FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id WHERE a.admission_id IS NULL;',
  expectedResult: {
    columns: ['doctor_id', 'first_name', 'last_name', 'specialty'],
    rows: []
  }
}, {
  id: 32,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'company:Airbnb', 'topic:Views'],
  prompt: "Show patients admitted to the 'Cardiology' department. Show patient first_name, last_name, admission_date, and diagnosis.",
  hint1: 'You need to chain JOINs: admissions → doctors → departments, then filter by department name.',
  hint2: "JOIN doctors ON attending_doctor_id JOIN departments ON department_id WHERE department_name = 'Cardiology'",
  hint3: "SELECT p.first_name, p.last_name, a.admission_date, a.diagnosis FROM admissions a JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE dep.department_name = 'Cardiology';",
  solutionSQL: "SELECT p.first_name, p.last_name, a.admission_date, a.diagnosis FROM admissions a JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE dep.department_name = 'Cardiology';",
  expectedResult: {
    columns: ['first_name', 'last_name', 'admission_date', 'diagnosis'],
    rows: []
  }
}, {
  id: 33,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Group By', 'Order By', 'company:Databricks', 'topic:Normalization'],
  prompt: 'Find the most common diagnosis across all admissions. Show diagnosis and count, ordered by count descending. Show top 5.',
  hint1: 'GROUP BY diagnosis and COUNT(*), then ORDER BY count DESC LIMIT 5.',
  hint2: 'SELECT diagnosis, COUNT(*) AS cnt FROM admissions GROUP BY diagnosis ORDER BY cnt DESC',
  hint3: 'SELECT diagnosis, COUNT(*) AS diagnosis_count FROM admissions WHERE diagnosis IS NOT NULL GROUP BY diagnosis ORDER BY diagnosis_count DESC LIMIT 5;',
  solutionSQL: 'SELECT diagnosis, COUNT(*) AS diagnosis_count FROM admissions WHERE diagnosis IS NOT NULL GROUP BY diagnosis ORDER BY diagnosis_count DESC LIMIT 5;',
  expectedResult: {
    columns: ['diagnosis', 'diagnosis_count'],
    rows: []
  }
}, {
  id: 34,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Update', 'company:Airbnb', 'topic:Subqueries'],
  prompt: "Update patient ID 2 (Maria Garcia)'s allergies to 'Penicillin, Sulfa'. Write the UPDATE statement. Then verify with: SELECT patient_id, first_name, allergies FROM patients WHERE patient_id = 2",
  hint1: 'Use UPDATE ... SET ... WHERE to modify a specific row. The WHERE clause must identify the correct patient.',
  hint2: "UPDATE patients SET allergies = ? WHERE patient_id = 2",
  hint3: "UPDATE patients SET allergies = 'Penicillin, Sulfa' WHERE patient_id = 2;",
  solutionSQL: "UPDATE patients SET allergies = 'Penicillin, Sulfa' WHERE patient_id = 2;",
  verificationSQL: "SELECT patient_id, first_name, allergies FROM patients WHERE patient_id = 2;",
  expectedResult: {
    columns: ['patient_id', 'first_name', 'allergies'],
    rows: [[2, 'Maria', 'Penicillin, Sulfa']]
  }
}, {
  id: 35,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Select', 'Date Function', 'company:Stripe', 'topic:Views'],
  prompt: 'List admissions where both admission_date and discharge_date are present. Show admission_id, admission_date, discharge_date, and days_stayed (as an integer). Order by days_stayed DESC.',
  hint1: 'Use julianday() to calculate the difference between two dates in SQLite.',
  hint2: 'CAST(julianday(discharge_date) - julianday(admission_date) AS INTEGER) AS days_stayed',
  hint3: 'SELECT admission_id, admission_date, discharge_date, CAST(julianday(discharge_date) - julianday(admission_date) AS INTEGER) AS days_stayed FROM admissions WHERE discharge_date IS NOT NULL ORDER BY days_stayed DESC;',
  solutionSQL: 'SELECT admission_id, admission_date, discharge_date, CAST(julianday(discharge_date) - julianday(admission_date) AS INTEGER) AS days_stayed FROM admissions WHERE discharge_date IS NOT NULL ORDER BY days_stayed DESC;',
  expectedResult: {
    columns: ['admission_id', 'admission_date', 'discharge_date', 'days_stayed'],
    rows: []
  }
}, {
  id: 36,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'Order By', 'company:Salesforce', 'topic:Execution Order'],
  prompt: 'Show the top 5 provinces by patient count. Show province_name and patient_count.',
  hint1: 'JOIN patients to province_names, GROUP BY province, COUNT, ORDER DESC, LIMIT 5.',
  hint2: 'JOIN province_names ON province_id GROUP BY province_name ORDER BY COUNT(*) DESC LIMIT 5',
  hint3: 'SELECT pn.province_name, COUNT(p.patient_id) AS patient_count FROM patients p JOIN province_names pn ON p.province_id = pn.province_id GROUP BY pn.province_name ORDER BY patient_count DESC LIMIT 5;',
  solutionSQL: 'SELECT pn.province_name, COUNT(p.patient_id) AS patient_count FROM patients p JOIN province_names pn ON p.province_id = pn.province_id GROUP BY pn.province_name ORDER BY patient_count DESC LIMIT 5;',
  expectedResult: {
    columns: ['province_name', 'patient_count'],
    rows: []
  }
}, {
  id: 37,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Subquery', 'Where', 'company:Meta', 'topic:Views'],
  prompt: 'Find patients whose weight is above the average weight of all patients. Show first_name, last_name, and weight. Order by weight DESC.',
  hint1: 'Use a subquery with AVG() in the WHERE clause to compare each patient weight against the average.',
  hint2: 'WHERE weight > (SELECT AVG(weight) FROM patients)',
  hint3: 'SELECT first_name, last_name, weight FROM patients WHERE weight > (SELECT AVG(weight) FROM patients) ORDER BY weight DESC;',
  solutionSQL: 'SELECT first_name, last_name, weight FROM patients WHERE weight > (SELECT AVG(weight) FROM patients) ORDER BY weight DESC;',
  expectedResult: {
    columns: ['first_name', 'last_name', 'weight'],
    rows: []
  }
}, {
  id: 38,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Where', 'Date Function', 'company:Adobe', 'topic:Normalization'],
  prompt: "List all patients admitted in the last 30 days relative to 2024-08-31. Show patient_id, admission_date, and diagnosis.",
  hint1: "Use date arithmetic with date('2024-08-31', '-30 days') to calculate the cutoff date.",
  hint2: "WHERE admission_date >= date('2024-08-31', '-30 days')",
  hint3: "SELECT patient_id, admission_date, diagnosis FROM admissions WHERE admission_date >= date('2024-08-31', '-30 days') AND admission_date <= '2024-08-31';",
  solutionSQL: "SELECT patient_id, admission_date, diagnosis FROM admissions WHERE admission_date >= date('2024-08-31', '-30 days') AND admission_date <= '2024-08-31';",
  expectedResult: {
    columns: ['patient_id', 'admission_date', 'diagnosis'],
    rows: []
  }
}, {
  id: 39,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'company:Microsoft', 'topic:Joins'],
  prompt: 'Show doctors grouped by specialty with a count of how many doctors have each specialty. Show specialty and doctor_count, ordered by doctor_count DESC.',
  hint1: 'GROUP BY specialty and use COUNT(*) to aggregate doctors per specialty.',
  hint2: 'SELECT specialty, COUNT(*) AS doctor_count FROM doctors GROUP BY specialty',
  hint3: 'SELECT specialty, COUNT(*) AS doctor_count FROM doctors GROUP BY specialty ORDER BY doctor_count DESC;',
  solutionSQL: 'SELECT specialty, COUNT(*) AS doctor_count FROM doctors GROUP BY specialty ORDER BY doctor_count DESC;',
  expectedResult: {
    columns: ['specialty', 'doctor_count'],
    rows: []
  }
}, {
  id: 40,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Where', 'Null Handling', 'company:Oracle', 'topic:Normalization'],
  prompt: 'Find admissions where no discharge date has been set (patient is still admitted). Show admission_id, patient_id, admission_date, and diagnosis.',
  hint1: 'Check for NULL discharge_date using IS NULL.',
  hint2: 'WHERE discharge_date IS NULL',
  hint3: 'SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE discharge_date IS NULL;',
  solutionSQL: 'SELECT admission_id, patient_id, admission_date, diagnosis FROM admissions WHERE discharge_date IS NULL;',
  expectedResult: {
    columns: ['admission_id', 'patient_id', 'admission_date', 'diagnosis'],
    rows: []
  }
}, {
  id: 41,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'company:Snowflake', 'topic:Normalization'],
  prompt: 'Calculate the total number of admissions per doctor per department. Show department_name, doctor full name, and admission_count. Order by department_name, admission_count DESC.',
  hint1: 'JOIN admissions → doctors → departments. GROUP BY both department and doctor.',
  hint2: 'GROUP BY dep.department_name, d.doctor_id, d.first_name, d.last_name',
  hint3: "SELECT dep.department_name, d.first_name || ' ' || d.last_name AS doctor_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN departments dep ON d.department_id = dep.department_id LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY dep.department_name, d.doctor_id ORDER BY dep.department_name, admission_count DESC;",
  solutionSQL: "SELECT dep.department_name, d.first_name || ' ' || d.last_name AS doctor_name, COUNT(a.admission_id) AS admission_count FROM doctors d JOIN departments dep ON d.department_id = dep.department_id LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY dep.department_name, d.doctor_id ORDER BY dep.department_name, admission_count DESC;",
  expectedResult: {
    columns: ['department_name', 'doctor_name', 'admission_count'],
    rows: []
  }
}, {
  id: 42,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Select', 'String Function', 'company:Apple', 'topic:Views'],
  prompt: "List all patients with their full name as a single column called 'full_name' (format: 'First Last'). Also show patient_id.",
  hint1: "Use the || operator to concatenate strings in SQLite. Include a space between first and last name.",
  hint2: "first_name || ' ' || last_name AS full_name",
  hint3: "SELECT patient_id, first_name || ' ' || last_name AS full_name FROM patients;",
  solutionSQL: "SELECT patient_id, first_name || ' ' || last_name AS full_name FROM patients;",
  expectedResult: {
    columns: ['patient_id', 'full_name'],
    rows: []
  }
}, {
  id: 43,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Subquery', 'Group By', 'Having', 'company:Salesforce', 'topic:Joins'],
  prompt: 'Find patients who share the same last_name. Show the last_name and how many patients share it (patient_count). Only include names shared by 2+ patients.',
  hint1: 'GROUP BY last_name and use HAVING COUNT(*) > 1.',
  hint2: 'SELECT last_name, COUNT(*) AS patient_count FROM patients GROUP BY last_name HAVING COUNT(*) > 1',
  hint3: 'SELECT last_name, COUNT(*) AS patient_count FROM patients GROUP BY last_name HAVING COUNT(*) > 1 ORDER BY patient_count DESC, last_name;',
  solutionSQL: 'SELECT last_name, COUNT(*) AS patient_count FROM patients GROUP BY last_name HAVING COUNT(*) > 1 ORDER BY patient_count DESC, last_name;',
  expectedResult: {
    columns: ['last_name', 'patient_count'],
    rows: []
  }
}, {
  id: 44,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Join', 'Group By', 'company:Meta', 'topic:Views'],
  prompt: "Show each doctor's first admission date and last admission date they handled. Show doctor full name, first_admission, last_admission.",
  hint1: 'Use MIN() and MAX() on admission_date, GROUP BY doctor.',
  hint2: 'SELECT MIN(admission_date), MAX(admission_date) FROM admissions GROUP BY attending_doctor_id',
  hint3: "SELECT d.first_name || ' ' || d.last_name AS doctor_name, MIN(a.admission_date) AS first_admission, MAX(a.admission_date) AS last_admission FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id, d.first_name, d.last_name ORDER BY doctor_name;",
  solutionSQL: "SELECT d.first_name || ' ' || d.last_name AS doctor_name, MIN(a.admission_date) AS first_admission, MAX(a.admission_date) AS last_admission FROM doctors d JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id, d.first_name, d.last_name ORDER BY doctor_name;",
  expectedResult: {
    columns: ['doctor_name', 'first_admission', 'last_admission'],
    rows: []
  }
}, {
  id: 45,
  db: 'hospital',
  difficulty: 'medium',
  keywords: ['Group By', 'Having', 'company:Oracle', 'topic:Subqueries'],
  prompt: 'Find all diagnoses that appear more than 5 times in the admissions table. Show diagnosis and diagnosis_count, ordered by count DESC.',
  hint1: 'GROUP BY diagnosis, use COUNT, filter with HAVING COUNT(*) > 5.',
  hint2: 'SELECT diagnosis, COUNT(*) AS diagnosis_count FROM admissions GROUP BY diagnosis HAVING COUNT(*) > 5',
  hint3: 'SELECT diagnosis, COUNT(*) AS diagnosis_count FROM admissions WHERE diagnosis IS NOT NULL GROUP BY diagnosis HAVING COUNT(*) > 5 ORDER BY diagnosis_count DESC;',
  solutionSQL: 'SELECT diagnosis, COUNT(*) AS diagnosis_count FROM admissions WHERE diagnosis IS NOT NULL GROUP BY diagnosis HAVING COUNT(*) > 5 ORDER BY diagnosis_count DESC;',
  expectedResult: {
    columns: ['diagnosis', 'diagnosis_count'],
    rows: []
  }
},
// ══════════════════════════════════════════════
// HARD (15)
// ══════════════════════════════════════════════
{
  id: 46,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Rank', 'Join', 'company:Google', 'topic:Transactions'],
  prompt: 'Rank doctors by their total number of admissions using RANK(). Show doctor_id, full name, admission_count, and rank. Order by rank.',
  hint1: 'Use RANK() OVER (ORDER BY count DESC) as a window function. First aggregate counts per doctor in a subquery or CTE.',
  hint2: 'RANK() OVER (ORDER BY admission_count DESC) AS doctor_rank',
  hint3: "SELECT doctor_id, first_name || ' ' || last_name AS doctor_name, admission_count, RANK() OVER (ORDER BY admission_count DESC) AS doctor_rank FROM (SELECT d.doctor_id, d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) ORDER BY doctor_rank;",
  solutionSQL: "SELECT doctor_id, first_name || ' ' || last_name AS doctor_name, admission_count, RANK() OVER (ORDER BY admission_count DESC) AS doctor_rank FROM (SELECT d.doctor_id, d.first_name, d.last_name, COUNT(a.admission_id) AS admission_count FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) ORDER BY doctor_rank;",
  expectedResult: {
    columns: ['doctor_id', 'doctor_name', 'admission_count', 'doctor_rank'],
    rows: []
  }
}, {
  id: 47,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Lag', 'company:Google', 'topic:Locks'],
  prompt: "For each patient who has multiple admissions, show their previous admission date using LAG(). Display patient_id, admission_date, and prev_admission_date. Order by patient_id, admission_date.",
  hint1: 'LAG() OVER (PARTITION BY patient_id ORDER BY admission_date) retrieves the prior row value within each patient group.',
  hint2: 'LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS prev_admission_date',
  hint3: 'SELECT patient_id, admission_date, LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS prev_admission_date FROM admissions ORDER BY patient_id, admission_date;',
  solutionSQL: 'SELECT patient_id, admission_date, LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS prev_admission_date FROM admissions ORDER BY patient_id, admission_date;',
  expectedResult: {
    columns: ['patient_id', 'admission_date', 'prev_admission_date'],
    rows: []
  }
}, {
  id: 48,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['CTE', 'Window Function', 'Rank', 'Join', 'company:Netflix', 'topic:Window Functions'],
  prompt: 'Find the top 3 most common diagnoses per department using ROW_NUMBER(). Show department_name, diagnosis, diagnosis_count, and row_num. Only show rows where row_num <= 3.',
  hint1: 'First aggregate diagnosis counts per department, then use ROW_NUMBER() OVER (PARTITION BY department ORDER BY count DESC) to rank within each department.',
  hint2: 'ROW_NUMBER() OVER (PARTITION BY department_name ORDER BY diagnosis_count DESC)',
  hint3: "WITH ranked AS (SELECT dep.department_name, a.diagnosis, COUNT(*) AS diagnosis_count, ROW_NUMBER() OVER (PARTITION BY dep.department_name ORDER BY COUNT(*) DESC) AS row_num FROM admissions a JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE a.diagnosis IS NOT NULL GROUP BY dep.department_name, a.diagnosis) SELECT * FROM ranked WHERE row_num <= 3 ORDER BY department_name, row_num;",
  solutionSQL: "WITH ranked AS (SELECT dep.department_name, a.diagnosis, COUNT(*) AS diagnosis_count, ROW_NUMBER() OVER (PARTITION BY dep.department_name ORDER BY COUNT(*) DESC) AS row_num FROM admissions a JOIN doctors d ON a.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id WHERE a.diagnosis IS NOT NULL GROUP BY dep.department_name, a.diagnosis) SELECT * FROM ranked WHERE row_num <= 3 ORDER BY department_name, row_num;",
  expectedResult: {
    columns: ['department_name', 'diagnosis', 'diagnosis_count', 'row_num'],
    rows: []
  }
}, {
  id: 49,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Date Function', 'company:Google', 'topic:Locks'],
  prompt: "Calculate a running total of admissions per month (for all months) using a window SUM. Show month, monthly_count, and running_total. Order chronologically.",
  hint1: 'First GROUP BY month to get monthly counts, then apply SUM() OVER (ORDER BY month) as a cumulative window function.',
  hint2: 'SUM(monthly_count) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS running_total',
  hint3: "SELECT month, monthly_count, SUM(monthly_count) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS running_total FROM (SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS monthly_count FROM admissions GROUP BY month) ORDER BY month;",
  solutionSQL: "SELECT month, monthly_count, SUM(monthly_count) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS running_total FROM (SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS monthly_count FROM admissions GROUP BY month) ORDER BY month;",
  expectedResult: {
    columns: ['month', 'monthly_count', 'running_total'],
    rows: []
  }
}, {
  id: 50,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['CTE', 'Window Function', 'company:Apple', 'topic:Query Optimization'],
  prompt: 'Use a CTE to find patients who have been admitted in ALL THREE years: 2022, 2023, AND 2024. Show patient_id, first_name, and last_name.',
  hint1: 'In the CTE, extract the year from admission_date for each patient. Then use HAVING with COUNT(DISTINCT year) = 3.',
  hint2: 'WITH years AS (SELECT patient_id, strftime(...) AS year FROM admissions) SELECT ... HAVING COUNT(DISTINCT year) = 3',
  hint3: "WITH patient_years AS (SELECT patient_id, strftime('%Y', admission_date) AS yr FROM admissions WHERE strftime('%Y', admission_date) IN ('2022','2023','2024') GROUP BY patient_id, yr) SELECT p.patient_id, p.first_name, p.last_name FROM patient_years py JOIN patients p ON py.patient_id = p.patient_id GROUP BY py.patient_id HAVING COUNT(DISTINCT py.yr) = 3 ORDER BY p.patient_id;",
  solutionSQL: "WITH patient_years AS (SELECT patient_id, strftime('%Y', admission_date) AS yr FROM admissions WHERE strftime('%Y', admission_date) IN ('2022','2023','2024') GROUP BY patient_id, yr) SELECT p.patient_id, p.first_name, p.last_name FROM patient_years py JOIN patients p ON py.patient_id = p.patient_id GROUP BY py.patient_id HAVING COUNT(DISTINCT py.yr) = 3 ORDER BY p.patient_id;",
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name'],
    rows: []
  }
}, {
  id: 51,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['CTE', 'Subquery', 'company:Databricks', 'topic:CTEs'],
  prompt: 'Use a CTE to find patients whose admission count is above the average admission count across all patients (who have at least 1 admission). Show patient_id, first_name, last_name, and admission_count.',
  hint1: 'In the CTE, count admissions per patient. In the main query, filter WHERE admission_count > AVG.',
  hint2: 'WITH counts AS (...) SELECT ... FROM counts WHERE admission_count > (SELECT AVG(admission_count) FROM counts)',
  hint3: 'WITH counts AS (SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id) SELECT * FROM counts WHERE admission_count > (SELECT AVG(admission_count) FROM counts) ORDER BY admission_count DESC;',
  solutionSQL: 'WITH counts AS (SELECT p.patient_id, p.first_name, p.last_name, COUNT(a.admission_id) AS admission_count FROM patients p JOIN admissions a ON p.patient_id = a.patient_id GROUP BY p.patient_id) SELECT * FROM counts WHERE admission_count > (SELECT AVG(admission_count) FROM counts) ORDER BY admission_count DESC;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'last_name', 'admission_count'],
    rows: []
  }
}, {
  id: 52,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Lag', 'Date Function', 'company:Adobe', 'topic:Query Optimization'],
  prompt: 'For each patient with multiple admissions, find the longest gap in days between consecutive admissions. Show patient_id, first_name, and max_gap_days. Order by max_gap_days DESC, limit to 10.',
  hint1: 'Use LAG(admission_date) to get the previous admission date per patient. Then compute the gap and find the MAX gap per patient.',
  hint2: 'julianday(admission_date) - julianday(LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date))',
  hint3: 'WITH gaps AS (SELECT patient_id, CAST(julianday(admission_date) - julianday(LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date)) AS INTEGER) AS gap_days FROM admissions) SELECT p.patient_id, p.first_name, MAX(g.gap_days) AS max_gap_days FROM gaps g JOIN patients p ON g.patient_id = p.patient_id WHERE g.gap_days IS NOT NULL GROUP BY p.patient_id, p.first_name ORDER BY max_gap_days DESC LIMIT 10;',
  solutionSQL: 'WITH gaps AS (SELECT patient_id, CAST(julianday(admission_date) - julianday(LAG(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date)) AS INTEGER) AS gap_days FROM admissions) SELECT p.patient_id, p.first_name, MAX(g.gap_days) AS max_gap_days FROM gaps g JOIN patients p ON g.patient_id = p.patient_id WHERE g.gap_days IS NOT NULL GROUP BY p.patient_id, p.first_name ORDER BY max_gap_days DESC LIMIT 10;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'max_gap_days'],
    rows: []
  }
}, {
  id: 53,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Row Number', 'company:Airbnb', 'topic:Query Optimization'],
  prompt: "Find the 2nd most recent admission per patient using ROW_NUMBER(). Show patient_id, admission_date, diagnosis, and row_num for rows where row_num = 2. Order by patient_id.",
  hint1: 'Use ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY admission_date DESC), then filter WHERE row_num = 2.',
  hint2: 'ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY admission_date DESC) AS rn ... WHERE rn = 2',
  hint3: 'SELECT patient_id, admission_date, diagnosis, rn FROM (SELECT patient_id, admission_date, diagnosis, ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY admission_date DESC) AS rn FROM admissions) WHERE rn = 2 ORDER BY patient_id;',
  solutionSQL: 'SELECT patient_id, admission_date, diagnosis, rn FROM (SELECT patient_id, admission_date, diagnosis, ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY admission_date DESC) AS rn FROM admissions) WHERE rn = 2 ORDER BY patient_id;',
  expectedResult: {
    columns: ['patient_id', 'admission_date', 'diagnosis', 'rn'],
    rows: []
  }
}, {
  id: 54,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['CTE', 'Window Function', 'Join', 'company:Salesforce', 'topic:Query Optimization'],
  prompt: "Find patients who were treated by more than 3 different doctors across all their admissions. Show patient_id, first_name, and doctor_count.",
  hint1: 'COUNT DISTINCT attending_doctor_id per patient. Use HAVING to filter for > 3 distinct doctors.',
  hint2: 'SELECT patient_id, COUNT(DISTINCT attending_doctor_id) AS doctor_count FROM admissions GROUP BY patient_id HAVING COUNT(DISTINCT attending_doctor_id) > 3',
  hint3: 'SELECT p.patient_id, p.first_name, COUNT(DISTINCT a.attending_doctor_id) AS doctor_count FROM admissions a JOIN patients p ON a.patient_id = p.patient_id GROUP BY p.patient_id, p.first_name HAVING COUNT(DISTINCT a.attending_doctor_id) > 3 ORDER BY doctor_count DESC;',
  solutionSQL: 'SELECT p.patient_id, p.first_name, COUNT(DISTINCT a.attending_doctor_id) AS doctor_count FROM admissions a JOIN patients p ON a.patient_id = p.patient_id GROUP BY p.patient_id, p.first_name HAVING COUNT(DISTINCT a.attending_doctor_id) > 3 ORDER BY doctor_count DESC;',
  expectedResult: {
    columns: ['patient_id', 'first_name', 'doctor_count'],
    rows: []
  }
}, {
  id: 55,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['CTE', 'Window Function', 'Date Function', 'company:Salesforce', 'topic:Locks'],
  prompt: "Create a pivot-style report showing monthly admission counts for each month (Jan-Dec) across all years combined, using CASE expressions. Show month_number, month_name, and admission_count.",
  hint1: "Use CASE with strftime('%m', admission_date) to categorise rows into months, then SUM each.",
  hint2: "SUM(CASE WHEN strftime('%m', admission_date) = '01' THEN 1 ELSE 0 END)",
  hint3: "SELECT strftime('%m', admission_date) AS month_number, CASE strftime('%m', admission_date) WHEN '01' THEN 'January' WHEN '02' THEN 'February' WHEN '03' THEN 'March' WHEN '04' THEN 'April' WHEN '05' THEN 'May' WHEN '06' THEN 'June' WHEN '07' THEN 'July' WHEN '08' THEN 'August' WHEN '09' THEN 'September' WHEN '10' THEN 'October' WHEN '11' THEN 'November' WHEN '12' THEN 'December' END AS month_name, COUNT(*) AS admission_count FROM admissions GROUP BY month_number ORDER BY month_number;",
  solutionSQL: "SELECT strftime('%m', admission_date) AS month_number, CASE strftime('%m', admission_date) WHEN '01' THEN 'January' WHEN '02' THEN 'February' WHEN '03' THEN 'March' WHEN '04' THEN 'April' WHEN '05' THEN 'May' WHEN '06' THEN 'June' WHEN '07' THEN 'July' WHEN '08' THEN 'August' WHEN '09' THEN 'September' WHEN '10' THEN 'October' WHEN '11' THEN 'November' WHEN '12' THEN 'December' END AS month_name, COUNT(*) AS admission_count FROM admissions GROUP BY month_number ORDER BY month_number;",
  expectedResult: {
    columns: ['month_number', 'month_name', 'admission_count'],
    rows: []
  }
}, {
  id: 56,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Lead', 'company:Netflix', 'topic:Transactions'],
  prompt: "For each admission, use LEAD() to show the next scheduled admission date for that patient. Show patient_id, admission_date, diagnosis, and next_admission_date. Order by patient_id, admission_date.",
  hint1: 'LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) gets the next admission for the same patient.',
  hint2: 'LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS next_admission_date',
  hint3: 'SELECT patient_id, admission_date, diagnosis, LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS next_admission_date FROM admissions ORDER BY patient_id, admission_date;',
  solutionSQL: 'SELECT patient_id, admission_date, diagnosis, LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS next_admission_date FROM admissions ORDER BY patient_id, admission_date;',
  expectedResult: {
    columns: ['patient_id', 'admission_date', 'diagnosis', 'next_admission_date'],
    rows: []
  }
}, {
  id: 57,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Rank', 'CTE', 'company:Google', 'topic:CTEs'],
  prompt: "Show month-over-month admission growth: for each month, show the current month count, prior month count, and growth percentage. Show month, admission_count, prev_month_count, and growth_pct (rounded to 1 decimal). Order by month.",
  hint1: 'Use LAG() OVER (ORDER BY month) to get the previous month count. Then compute growth as ROUND(100.0 * (current - prev) / prev, 1).',
  hint2: 'LAG(monthly_count) OVER (ORDER BY month) AS prev_count',
  hint3: "WITH monthly AS (SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS admission_count FROM admissions GROUP BY month) SELECT month, admission_count, LAG(admission_count) OVER (ORDER BY month) AS prev_month_count, ROUND(100.0 * (admission_count - LAG(admission_count) OVER (ORDER BY month)) / LAG(admission_count) OVER (ORDER BY month), 1) AS growth_pct FROM monthly ORDER BY month;",
  solutionSQL: "WITH monthly AS (SELECT strftime('%Y-%m', admission_date) AS month, COUNT(*) AS admission_count FROM admissions GROUP BY month) SELECT month, admission_count, LAG(admission_count) OVER (ORDER BY month) AS prev_month_count, ROUND(100.0 * (admission_count - LAG(admission_count) OVER (ORDER BY month)) / LAG(admission_count) OVER (ORDER BY month), 1) AS growth_pct FROM monthly ORDER BY month;",
  expectedResult: {
    columns: ['month', 'admission_count', 'prev_month_count', 'growth_pct'],
    rows: []
  }
}, {
  id: 58,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'Rank', 'company:Salesforce', 'topic:Transactions'],
  prompt: "Identify doctors whose admission count is in the top 25% using NTILE(4). Show doctor full name, admission_count, and quartile. Only show doctors in quartile 1 (top 25%).",
  hint1: 'Use NTILE(4) OVER (ORDER BY admission_count DESC) — quartile 1 means the top 25%.',
  hint2: 'NTILE(4) OVER (ORDER BY admission_count DESC) AS quartile ... WHERE quartile = 1',
  hint3: "SELECT doctor_name, admission_count, quartile FROM (SELECT d.first_name || ' ' || d.last_name AS doctor_name, COUNT(a.admission_id) AS admission_count, NTILE(4) OVER (ORDER BY COUNT(a.admission_id) DESC) AS quartile FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) WHERE quartile = 1 ORDER BY admission_count DESC;",
  solutionSQL: "SELECT doctor_name, admission_count, quartile FROM (SELECT d.first_name || ' ' || d.last_name AS doctor_name, COUNT(a.admission_id) AS admission_count, NTILE(4) OVER (ORDER BY COUNT(a.admission_id) DESC) AS quartile FROM doctors d LEFT JOIN admissions a ON d.doctor_id = a.attending_doctor_id GROUP BY d.doctor_id) WHERE quartile = 1 ORDER BY admission_count DESC;",
  expectedResult: {
    columns: ['doctor_name', 'admission_count', 'quartile'],
    rows: []
  }
}, {
  id: 59,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Recursive CTE', 'company:NVIDIA', 'topic:Transactions'],
  prompt: "Write a recursive CTE to build a hierarchy showing each department and its head doctor. Show department_name, head_doctor_name (first_name + last_name), and specialty.",
  hint1: 'JOIN departments to doctors using head_doctor_id to get each department head. No actual recursion needed for this schema — a simple JOIN with the head_doctor_id relationship works.',
  hint2: 'JOIN doctors ON head_doctor_id = doctor_id',
  hint3: "SELECT dep.department_name, d.first_name || ' ' || d.last_name AS head_doctor_name, d.specialty FROM departments dep LEFT JOIN doctors d ON dep.head_doctor_id = d.doctor_id ORDER BY dep.department_name;",
  solutionSQL: "SELECT dep.department_name, d.first_name || ' ' || d.last_name AS head_doctor_name, d.specialty FROM departments dep LEFT JOIN doctors d ON dep.head_doctor_id = d.doctor_id ORDER BY dep.department_name;",
  expectedResult: {
    columns: ['department_name', 'head_doctor_name', 'specialty'],
    rows: []
  }
}, {
  id: 60,
  db: 'hospital',
  difficulty: 'hard',
  keywords: ['Window Function', 'CTE', 'company:Amazon', 'topic:Transactions'],
  prompt: "Calculate a 30-day readmission rate per department: what % of admissions are followed by another admission within 30 days for the same patient? Show department_name and readmission_rate_pct (rounded to 1 decimal).",
  hint1: 'Use LEAD() to get the next admission date per patient. Check if the gap is <= 30 days. Aggregate by department.',
  hint2: 'LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date) AS next_admission',
  hint3: "WITH next_admits AS (SELECT a.patient_id, a.admission_date, a.attending_doctor_id, LEAD(a.admission_date) OVER (PARTITION BY a.patient_id ORDER BY a.admission_date) AS next_admission FROM admissions a) SELECT dep.department_name, ROUND(100.0 * SUM(CASE WHEN julianday(na.next_admission) - julianday(na.admission_date) <= 30 THEN 1 ELSE 0 END) / COUNT(*), 1) AS readmission_rate_pct FROM next_admits na JOIN doctors d ON na.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id GROUP BY dep.department_name ORDER BY readmission_rate_pct DESC;",
  solutionSQL: "WITH next_admits AS (SELECT a.patient_id, a.admission_date, a.attending_doctor_id, LEAD(a.admission_date) OVER (PARTITION BY a.patient_id ORDER BY a.admission_date) AS next_admission FROM admissions a) SELECT dep.department_name, ROUND(100.0 * SUM(CASE WHEN julianday(na.next_admission) - julianday(na.admission_date) <= 30 THEN 1 ELSE 0 END) / COUNT(*), 1) AS readmission_rate_pct FROM next_admits na JOIN doctors d ON na.attending_doctor_id = d.doctor_id JOIN departments dep ON d.department_id = dep.department_id GROUP BY dep.department_name ORDER BY readmission_rate_pct DESC;",
  expectedResult: {
    columns: ['department_name', 'readmission_rate_pct'],
    rows: []
  }
}];