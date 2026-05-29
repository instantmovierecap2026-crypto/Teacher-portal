import { Result } from '../types';

export const calculateSubjectAverage = (s1: string, s2: string): string => {
  const n1 = parseFloat(s1);
  const n2 = parseFloat(s2);
  
  if (isNaN(n1) && isNaN(n2)) return "Unfilled";
  if (isNaN(n1)) return n2.toFixed(2);
  if (isNaN(n2)) return n1.toFixed(2);
  
  return ((n1 + n2) / 2).toFixed(2);
};

export const calculateStatus = (avg: string): string => {
  const n = parseFloat(avg);
  if (isNaN(n)) return "Unfilled";
  return n >= 50 ? "Passed" : "Failed";
};

// This function will be used to update rankings for a list of values
export const calculateRanks = (values: number[]): number[] => {
  const sorted = [...new Set(values)].sort((a, b) => b - a);
  return values.map(v => sorted.indexOf(v) + 1);
};
