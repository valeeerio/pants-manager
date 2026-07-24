// Le dueDate sono salvate come mezzanotte UTC della data di calendario
// (new Date("YYYY-MM-DD")): i confronti "oggi" devono quindi partire dalla
// data di calendario del laboratorio (Europe/Rome), non dal fuso del server.
const TIMEZONE = "Europe/Rome";

function dataCalendarioOggi(): [number, number, number] {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE })
    .format(new Date())
    .split("-")
    .map(Number);
  return [y, m, d];
}

export function inizioGiornoUTC(offsetGiorni = 0): Date {
  const [y, m, d] = dataCalendarioOggi();
  return new Date(Date.UTC(y, m - 1, d + offsetGiorni));
}

export function inizioMeseUTC(): Date {
  const [y, m] = dataCalendarioOggi();
  return new Date(Date.UTC(y, m - 1, 1));
}
