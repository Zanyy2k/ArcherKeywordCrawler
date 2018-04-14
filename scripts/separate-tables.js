const fs = require('fs');
const utils = require('./utils');

const inputFile = 'input/red-raw-data-sample.csv';

const arrays = fs.readFileSync(inputFile).toString().split('\n');
const numArrays = arrays.length;
// const numArrays = 500;

const [notes, goods] = [[], []];

let emptyLines = 0;

const indicators = [`"{"`, `"","{`];

// skit line 0 (table head)
for (let i = 1; i < numArrays; i++) {
  const current = arrays[i];
  if (current.startsWith(indicators[0])) {
    // belongs to notes
    notes.push(current);
  } else if (current.startsWith(indicators[1])) {
    // belongs to goods
    goods.push(current);
  } else {
    emptyLines++;
  }
}

console.log(notes.length);
console.log(goods.length);
console.log(`empty lines: ${emptyLines}`);

// utils.writeLine('output/goods.csv', goods.join('\n'));
utils.writeLine('output/notes.csv', notes.join('\n'));

