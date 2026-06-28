const sql = "SELECT * FROM users u LEFT OUTER JOIN orders o ON u.id = o.user_id";
const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(OUTER\s+)?JOIN|RIGHT\s+(OUTER\s+)?JOIN|FULL\s+(OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b/gi;
const matches = Array.from(sql.matchAll(joinPattern));
console.log(matches.map(m => ({ type: m[1].trim().toUpperCase().replace(/\s+OUTER\s+/, ' '), position: m.index })));

const beforeJoin = sql.substring(0, matches[0].index);
console.log("Before join:", beforeJoin);
const leftTableMatch = beforeJoin.match(/\b(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?[a-zA-Z0-9_]+)?\s*$/i);
console.log("Left table:", leftTableMatch ? leftTableMatch[1] : null);
