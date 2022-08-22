const ghpages = require('gh-pages');

ghpages.publish('dist', function(err) {
    console.log({result: err ?? 'no errors'});
});