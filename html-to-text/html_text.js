

const htmlToText = require('html-to-text');
 
const text = htmlToText.fromString(process.argv[2], {
  wordwrap: 130
});


console.log(text); // Hello World