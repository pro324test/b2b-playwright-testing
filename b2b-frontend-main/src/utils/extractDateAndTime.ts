// make a function that will take strings like this and return object with date and time: 2025-02-23T12:50:44.111Z
export function extractDateAndTime(dateString: string) {
  const date = new Date(dateString);
  return {
    date: date.toISOString().split("T")[0],
    time: date.toISOString().split("T")[1].split(".")[0],
  };
}
