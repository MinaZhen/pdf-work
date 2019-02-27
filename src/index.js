const HummusRecipe = require('hummus-recipe');
const path = require('path');
const fs = require('fs');
const readFile = require('./readFile');
const sendEmails = require('./sendEmails');
const jsonData = require('../info.json');
const pdfDoc = new HummusRecipe(`../files/${jsonData.mainFile}`);

const outputDir = path.join(__dirname, jsonData.newPathName);

function savePDFs() {
  return new Promise((resolve, reject) => {
    resolve(pdfDoc
      .split(outputDir, 'temp')
      .endPDF());
  }).then(() => {
    console.log('PDFs saved with temporal names');
    return fs.readdirSync(`./${jsonData.newPathName}`)
  })
  .then(files => 
    Promise.all(files.map((file, idx) => readFile(file, idx)))
      .then(data => {
        let responseOk = [];
        data.forEach(v => {if (v) responseOk.push(v)})
        return responseOk
      })
  )
  .then((info) => {
    const workers = jsonData.workers.map(w => {
      const reduced = {}
      info.forEach((inf) => {
        if(inf.email && inf.email === w.email) {
          const {date, email, worker, filename} = inf;
          if (!reduced.dates) reduced.dates = {};
          if (!reduced.files) reduced.files = [];
          if (!reduced.dates[date[1]]) reduced.dates[date[1]] = [];
          reduced.email = email;
          reduced.worker = worker;
          reduced.dates[date[1]].push(date[0]);
          reduced.files.push(filename);
        }
      })
      return reduced
    })
    return workers
  })
  .then(workers => 
    Promise.all(workers.map((worker) => {
      if (worker.email) return sendEmails(worker)
      return false;
    }))
      .then(data => {
        data.forEach(v => {if (v) {
          console.log(`Email sent to ${v.envelope.to}. Message ID: ${v.messageId}`)
        }})
      })
  )
  .then(() => {
    console.log('END');
    while(true){}; // Keep console open if opened with .cmd
  })
  .catch(e => {
    console.log(e);
    console.log(e.message);
    while(true){}; // Keep console open if opened with .cmd
  })
}

savePDFs();



