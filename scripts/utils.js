const fs = require('fs');
const writeOptions = {encoding: 'utf8', mode: 438, flag: 'a'};

module.exports = {
  writeLine: (outputFile, data, message = `data written to ${outputFile}`) => {
    fs.writeFile(outputFile, data, writeOptions, (err) => {
      err ? console.error(err) : console.log(message);
    })
  },
  
  writeLog: (str, logFile = 'log.txt', message = `written to log: ${str}`) => {
    fs.writeFile('log.txt', str + '\n', writeOptions, (err) => {
      err ? console.error(err) : console.log(message);
    });
  }
  
};
