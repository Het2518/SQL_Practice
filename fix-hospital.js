import fs from 'fs';
import path from 'path';

const file = path.join('src/data/databases', 'hospital.sql');
let c = fs.readFileSync(file, 'utf-8');

// departments.head_doctor_id
c = c.replace(/head_doctor_id\s+INTEGER\s*\n/g, 'head_doctor_id  INTEGER REFERENCES doctors(doctor_id)\n');

fs.writeFileSync(file, c);
console.log('Fixed hospital.sql again');
