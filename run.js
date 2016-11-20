import crypto from 'crypto';
import fs from 'fs';

function getSha1(){
  // the file you want to get the hash
  let hash = crypto.createHash('sha1');
  const input = fs.createReadStream('/Users/doortts/repos/yona-export/exported/files/21957/bensound-cute.mp3');
  hash.setEncoding('hex');

  input.on('end', function() {
    hash.end();
    console.log(hash.read()); // the desired sha1sum
  });

  input.pipe(hash);
}

getSha1();
