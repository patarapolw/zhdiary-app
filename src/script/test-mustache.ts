import mustache from "mustache";

console.log(mustache.render(`
{{#c}}
  {{c}}
{{/c}}`, {a: [{b: 1}, {b: 2}], c: 4}));
