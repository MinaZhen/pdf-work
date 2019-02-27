const pdf = require('pdf-parse');
const fs = require('fs');
const jsonData = require('../info.json');

function readFile(file, index) {
  const dataOfFile = fs.readFileSync(`./${jsonData.newPathName}/${file}`);
  return pdf(dataOfFile).then((dof) => {
    const text = dof.text.substr(dof.text.indexOf(jsonData.keyword1)).toLowerCase();
    if (!text) return `No text founded in ${file}`;
    const d = text.substr(text.indexOf(jsonData.keyword2));
    const date = [jsonData.months.filter(m => d.includes(m)).toString(), d.substr(d.indexOf('20'), 4)];
    const data = {date};

    for (let i = 0; i < jsonData.workers.length; i++) {
      const check = jsonData.workers[i];
      if (text.includes(check.name) && text.includes(check.dni)) {
        data.email = check.email
        data.worker = check.email.substr(0, check.email.indexOf('@')).split('.');
      }
    }
    data.index = index;
    return data
  })
  .then(res => {
    const newFile = `${res.worker.join('-')}_${res.date.join('')}.pdf`;
    return new Promise((resolve, reject) => {
      fs.rename(`./${jsonData.newPathName}/${file}`, `./${jsonData.newPathName}/${newFile}`, (err) => {
        if (err) reject(err);
        console.log(`Renamed file to ${newFile}`);
        res.filename = newFile;
        resolve(res)
      });
    })
  })
  .catch(e => {
    const error = (e.message || e || 'E');
    console.log('ERR ', error)
    throw new Error(error)
  })
};

module.exports = readFile;