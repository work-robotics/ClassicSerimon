import path from "path";
import checker from "license-checker";
import fs from "fs";

console.log(path.dirname(__dirname));
checker.init({ start: path.dirname(__dirname), production: true, json: true }, (err, packages) => {
  if (err) {
    console.log(err);
  } else {
    //The sorted package data
    //as an Object
    let content = "";
    content += "<!DOCTYPE html>";
    content += "<html>";
    content += "<head>";
    content += '<meta charset="UTF-8" />';
    content += '<link href="./licence.css" rel="stylesheet" type="text/css" />';
    content += "</head>";
    content += "<body>";
    content += "<h1>使用ライブラリ一覧</h1>";
    content += "この一覧は、Serimonに含まれるオープンソースソフトウェア（OSS）のライセンスを記載したものです。";
    content += "<hr/>";
    console.log();

    for (const key in packages) {
      // 自分自身は除外
      if (key == process.env.npm_package_name + "@" + process.env.npm_package_version) {
        continue;
      }

      content += "<h2>" + key + "</h2>";
      content += "<pre>";
      content += "<code>";
      content += fs.readFileSync(packages[key].licenseFile);
      content += "</code>";
      content += "</pre>";
      content += "<hr/>";
    }
    content += "</body>";
    content += "</html>";
    fs.writeFileSync("src/licence.html", content);
  }
});
