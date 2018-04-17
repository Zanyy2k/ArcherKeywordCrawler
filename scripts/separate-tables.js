const fs = require('fs');
const utils = require('./utils');

const inputFile = 'input/red-raw-data-sample.csv';

const arrays = fs.readFileSync(inputFile).toString().split('\n');
const numArrays = arrays.length;
// const numArrays = 500;

const [notes, goods] = [[], []];

let emptyLines = 0;

const startPatterns = [`"{"`, `"","{`];

// skit line 0 (table head)
for (let i = 1; i < numArrays; i++) {
  const current = arrays[i];
  if (current.startsWith(startPatterns[0])) {
    // belongs to notes
    notes.push(current.replace(/^"(.*)","",$/, '$1').replace(/""/g, '"'));
  } else if (current.startsWith(startPatterns[1])) {
    // belongs to goods
    goods.push(current.replace(/^"","(.*)",$/, '$1').replace(/""/g, '"'));
  } else {
    emptyLines++;
  }
}

console.log(notes.length);
console.log(goods.length);
console.log(`empty lines: ${emptyLines}`);

utils.writeLine('output/notes.json', JSON.stringify(notes));
utils.writeLine('output/goods.json', JSON.stringify(goods));
/*utils.writeLine('output/notes.tsv', notes.join('\t'));
utils.writeLine('output/goods.tsv', goods.join('\t'));*/
/*utils.writeLine('output/notes.txt', notes.join('\n'));
utils.writeLine('output/goods.txt', goods.join('\n'));*/
