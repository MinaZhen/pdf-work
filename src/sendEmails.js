const nodemailer = require("nodemailer");
const jsonData = require('../info.json');

const transporter = nodemailer.createTransport({
  service: jsonData.admin.service,
  auth: {
      user: jsonData.admin.email,
      pass: jsonData.admin.pass,
  },
  tls: { rejectUnauthorized: false }
});

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1); 

const formatSentences = (arr, idx, str, value) => {
  
  if (idx === 0) return `${value}`
  else if (idx === arr.length -1) return ` ${str} ${value}`
  else return `, ${value}`
}

const sendEmails = ({email, worker, dates, files}) => {
  str = '';
  Object.keys(dates).forEach((key, index) => {
    let s = dates[key].map((v, idx) => {
    const month = capitalize(v);
    return formatSentences(dates[key], idx, 'y', month)
    });
    s = s.join('');
    str += `${formatSentences(Object.keys(dates), index, 'y', s)} de ${key}`
  });
  str = str.trim();

  let [name, surname] = worker;
  name = capitalize(name);
  surname = capitalize(surname);

  const attachments = files.map(file => ({
    filename: file,
    path: `./${jsonData.newPathName}/${file}`,
    contentType: 'application/pdf'
  }));
  
  return transporter.sendMail({
     from: jsonData.admin.email,
     to: email,
     subject: 'Nóminas',
     html: `<p>${name} ${surname}, en este email tienes adjuntadas las siguientes nóminas:</p><br><p>${str}</p>`,
     attachments, 
     function (err, info) {
        if(err){
          console.error(err);
          res.send(err);
        }
        else{
          console.log(info);
          res.send(info);
        }
     },
   })
}

module.exports = sendEmails