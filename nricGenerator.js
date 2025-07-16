const moment = require('moment');
const fs = require('fs');
const path = require('path');

const logFilePath = path.resolve(__dirname, '../../nric_log.txt');

function generateNRIC() {
  const currentYear = moment().year();
  const minYear = currentYear - 65;
  const maxYear = currentYear - 21;

  const birthYear = getRandomInt(minYear, maxYear);
  const birthDate = moment(`${birthYear}-01-01`).add(getRandomInt(0, 364), 'days');
  const YYMMDD = birthDate.format('YYMMDD');

  const uniqueId = String(getRandomInt(100000, 999999));
  const nric = `${YYMMDD}${uniqueId}`;

  fs.appendFileSync(
    logFilePath,
    `${new Date().toISOString()}  Generated NRIC: ${nric}\n`
  );

  return nric;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = generateNRIC;
