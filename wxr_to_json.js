#!/usr/bin/env node

const   fs = require('fs'),
    xml2js = require('xml2js'),
       map = require('lodash.map');

const encoding = 'utf-8';

const fieldsToFlatten = [
  "title",
  "pubDate",
  "link",
  "dc:creator",
  "content:encoded",
  "excerpt:encoded",
  "wp:post_id",
  "wp:post_date",
  "wp:post_date_gmt",
  "wp:post_name",
  "wp:status",
  "wp:post_type",
]

function flattenPosts(posts) {
  return map(posts, (post) => {
    fieldsToFlatten.forEach(field => {
      post[field] = post[field][0]
    });
    return post
  });
}

function decorateCategoryAndTags(posts) {
  return map(posts, (post) => {
    const categoryAndTags = post.category;
    post.tidyCategory = null;
    post.tidyTags = [];

    if(categoryAndTags) {
      categoryAndTags.forEach(element => {
        if(element["$"]["domain"] == 'category') {
          post.tidyCategory = element._;
        }
        if(element["$"]["domain"] == 'post_tag') {
          post.tidyTags.push(element._);
        }
      });
    }
    return post
  });
}

function processData(data) {
  const parser = new xml2js.Parser();
  parser.parseString(data, function (err, result) {
    data = result.rss.channel[0].item;
    data = flattenPosts(data);
    data = decorateCategoryAndTags(data);

    console.log(JSON.stringify(data,null,2));
  });
}

function help() {
  return `  wxr_to_json <file> [args]

  Process contents of WXR file <file> to JSON, returned on STDOUT.

  <file> contents can also be supplied as STDIN.

  Options:
    --help, -h     Show help    
    --version, -v  Show version number
`;
}

function version() {
  return "1.0.0";
}


const argv = require('minimist')(process.argv.slice(2));

if(argv.help || argv.h) {
  console.log(help());
  process.exit();
}

if(argv.version || argv.v) {
  console.log(version());
  process.exit();
}



if (process.stdin.isTTY) {
  // we've perhaps got data in our arguments?
  if(argv._[0]) {
    // try to read file in first argument
    fs.readFile(argv._[0], function (err, data) {
      processData(data);
    });
  } else {
    // oops, no arguments!
    console.log(help());
  }
} else {
  // we've got data piped in via STDIN - maybe?
  data = '';
  process.stdin.setEncoding(encoding);
 
  process.stdin.on('readable', function() {
    var chunk;
    while (chunk = process.stdin.read()) {
      data += chunk;
    }
  });
 
  process.stdin.on('end', function () {
    // There will be a trailing \n from the user hitting enter. Get rid of it.
    data = data.replace(/\n$/, '');
    if(data != '') {
      // yep, we've got data: try to parse it
      processData(data);
    } else {
      // oops, no data: show help.
      console.log(help());
    }
  });
}
