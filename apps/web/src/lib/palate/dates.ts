/** Local calendar date as YYYY-MM-DD (not UTC), so an evening meal counts for today. */
export function today() {
  return new Date().toLocaleDateString("en-CA");
}
