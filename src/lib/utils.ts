export function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for(let i=2; i<=n; i++) res *= i;
  return res;
}

export function poisson(k: number, lambda: number): number {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}
