const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * Backend gamification calculations logic mirror from progressController.js
 */
function calculateLevel(totalXp) {
  return Math.max(1, Math.floor(Math.sqrt((totalXp || 0) / 50)) + 1);
}

function calculateRankTitle(totalXp) {
  if (totalXp >= 3000) return 'Grandmaster';
  if (totalXp >= 1500) return 'Master';
  if (totalXp >= 700) return 'Expert';
  if (totalXp >= 300) return 'Specialist';
  if (totalXp >= 100) return 'Apprentice';
  return 'Novice';
}

function calculateXpGain(difficulty) {
  const diff = (difficulty || 'easy').toLowerCase();
  const XP_MAP = { easy: 10, medium: 30, hard: 50 };
  return XP_MAP[diff] ?? 10;
}

test('Level boundaries verification', () => {
  // Test boundary 0 XP
  assert.equal(calculateLevel(0), 1, '0 XP should be Level 1');

  // Test boundary 49 XP (just below Level 2)
  assert.equal(calculateLevel(49), 1, '49 XP should be Level 1');

  // Test boundary 50 XP (threshold for Level 2: sqrt(50/50)+1 = 2)
  assert.equal(calculateLevel(50), 2, '50 XP should be Level 2');

  // Test boundary 199 XP (just below Level 3: sqrt(199/50)+1 = 1.99+1 = 2)
  assert.equal(calculateLevel(199), 2, '199 XP should be Level 2');

  // Test boundary 200 XP (threshold for Level 3: sqrt(200/50)+1 = 2+1 = 3)
  assert.equal(calculateLevel(200), 3, '200 XP should be Level 3');

  // Test boundary 4999 XP
  assert.equal(calculateLevel(4999), 10, '4999 XP should be Level 10');

  // Test boundary 5000 XP (threshold for Level 11: sqrt(5000/50)+1 = 10+1 = 11)
  assert.equal(calculateLevel(5000), 11, '5000 XP should be Level 11');
});

test('Rank title tier verification', () => {
  assert.equal(calculateRankTitle(0), 'Novice');
  assert.equal(calculateRankTitle(49), 'Novice');
  assert.equal(calculateRankTitle(99), 'Novice');

  assert.equal(calculateRankTitle(100), 'Apprentice');
  assert.equal(calculateRankTitle(199), 'Apprentice');
  assert.equal(calculateRankTitle(299), 'Apprentice');

  assert.equal(calculateRankTitle(300), 'Specialist');
  assert.equal(calculateRankTitle(699), 'Specialist');

  assert.equal(calculateRankTitle(700), 'Expert');
  assert.equal(calculateRankTitle(1499), 'Expert');

  assert.equal(calculateRankTitle(1500), 'Master');
  assert.equal(calculateRankTitle(2999), 'Master');

  assert.equal(calculateRankTitle(3000), 'Grandmaster');
  assert.equal(calculateRankTitle(5000), 'Grandmaster');
});

test('XP Gain calculation per question difficulty', () => {
  assert.equal(calculateXpGain('easy'), 10);
  assert.equal(calculateXpGain('EASY'), 10);
  assert.equal(calculateXpGain('medium'), 30);
  assert.equal(calculateXpGain('MEDIUM'), 30);
  assert.equal(calculateXpGain('hard'), 50);
  assert.equal(calculateXpGain('HARD'), 50);
  assert.equal(calculateXpGain('unknown'), 10);
  assert.equal(calculateXpGain(null), 10);
});

test('First-time solve vs repeated solve idempotency simulation', () => {
  let userProgress = {
    totalXp: 0,
    eloRating: 1000,
    level: 1,
    rankTitle: 'Novice'
  };

  const submissions = [];

  function recordAttempt(question, isAccepted) {
    const priorAccepted = submissions.some(
      s => s.questionId === String(question.id) && s.status === 'Accepted'
    );
    const isFirstTimeSolve = isAccepted && !priorAccepted;

    submissions.push({
      questionId: String(question.id),
      status: isAccepted ? 'Accepted' : 'Error'
    });

    if (isFirstTimeSolve) {
      const gain = calculateXpGain(question.difficulty);
      userProgress.totalXp += gain;
      userProgress.eloRating += Math.round(gain / 2);
    }

    userProgress.level = calculateLevel(userProgress.totalXp);
    userProgress.rankTitle = calculateRankTitle(userProgress.totalXp);

    return { isFirstTimeSolve, totalXp: userProgress.totalXp };
  }

  // 1. First solve of Q1 (easy)
  const res1 = recordAttempt({ id: 1, difficulty: 'easy' }, true);
  assert.equal(res1.isFirstTimeSolve, true);
  assert.equal(res1.totalXp, 10);
  assert.equal(userProgress.totalXp, 10);
  assert.equal(userProgress.eloRating, 1005);

  // 2. Second solve of Q1 (easy) - should NOT award XP
  const res2 = recordAttempt({ id: 1, difficulty: 'easy' }, true);
  assert.equal(res2.isFirstTimeSolve, false);
  assert.equal(res2.totalXp, 10, 'Total XP must remain 10 on repeated solve');
  assert.equal(userProgress.totalXp, 10);

  // 3. Tenth solve of Q1 (easy) - should NOT award XP
  for (let i = 0; i < 8; i++) {
    recordAttempt({ id: 1, difficulty: 'easy' }, true);
  }
  assert.equal(userProgress.totalXp, 10, 'Total XP must still remain 10 after 10 runs');

  // 4. Solve a new question Q2 (medium) -> awards 30 XP -> total 40 XP
  const res3 = recordAttempt({ id: 2, difficulty: 'medium' }, true);
  assert.equal(res3.isFirstTimeSolve, true);
  assert.equal(userProgress.totalXp, 40);
  assert.equal(userProgress.level, 1); // 40 < 50, still Level 1

  // 5. Solve Q3 (easy) -> awards 10 XP -> total 50 XP -> Level 2 reached!
  const res4 = recordAttempt({ id: 3, difficulty: 'easy' }, true);
  assert.equal(res4.isFirstTimeSolve, true);
  assert.equal(userProgress.totalXp, 50);
  assert.equal(userProgress.level, 2, 'Reaching 50 XP must transition user to Level 2');
});
