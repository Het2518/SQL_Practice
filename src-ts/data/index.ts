// Central registry for all 600 questions across 10 databases
import type { Question, DatabaseName } from '../types';
import { hospitalQuestions } from './questions/hospital';
import { ecommerceQuestions } from './questions/ecommerce';
import { universityQuestions } from './questions/university';
import { airlinesQuestions } from './questions/airlines';
import { bankingQuestions } from './questions/banking';
import { hrQuestions } from './questions/hr';
import { moviesQuestions } from './questions/movies';
import { libraryQuestions } from './questions/library';
import { sportsQuestions } from './questions/sports';
import { musicQuestions } from './questions/music';

export const allQuestions: Question[] = [
  ...hospitalQuestions,
  ...ecommerceQuestions,
  ...universityQuestions,
  ...airlinesQuestions,
  ...bankingQuestions,
  ...hrQuestions,
  ...moviesQuestions,
  ...libraryQuestions,
  ...sportsQuestions,
  ...musicQuestions,
];

export function getQuestionsForDb(db: DatabaseName): Question[] {
  return allQuestions.filter(q => q.db === db);
}

export function getQuestionById(id: number): Question | undefined {
  return allQuestions.find(q => q.id === id);
}

export {
  hospitalQuestions,
  ecommerceQuestions,
  universityQuestions,
  airlinesQuestions,
  bankingQuestions,
  hrQuestions,
  moviesQuestions,
  libraryQuestions,
  sportsQuestions,
  musicQuestions,
};
