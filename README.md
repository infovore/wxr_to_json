# wxr_to_json

Convert Wordpress eXtended RSS - WXR - files to JSON at the command line. Because sometimes you'd rather have JSON than a mangled form of XML.

Built entirely for myself, but maybe you'll find this useful to. Consider this code as 100% "works for me".

## Prerequisites

Tested on node 10; it'll probably work on 8 too. I like `yarn` as a package manager.

## Installation

    yarn

## Usage

`wxr_to_json` converts a wordpress XML file to JSON, emitted on STDOUT.

You can supply the xml file as an argument:

    ./wxr_to_json.js my_export_file.xml

or on STDIN:§

    cat my_export_file.xml | ./wxr_to_json.js

Note that in this examples, I've made the `wxr_to_json.js` file executable.

That's it.

The script does a few pieces of highly opinionated 'tidying':

* it flattens various fields with `xml2js` turns into arrays into strings; these are described by the array `fieldsToFlatten` in the code.
* it assumes a single category per post, because that's how I used Wordpress, and tidies this to `tidyCategory`, a single string
* it tidies tags to a string array, `tidyTags`
* these 'tidied' fields are good enough for most purposes. You still have access to the full-fat `categories` and `tags` objects.
