import path from "path";
import checker from "license-checker";
import fs from "fs";

checker.init({ start: path.dirname(__dirname), production: true }, (err, packages) => {
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
    content += "<h1>OSSライセンスに基づく表記</h1>";
    content += "この一覧は、Serimonに含まれるオープンソースソフトウェア（OSS）のライセンスを記載したものです。";
    content += "<hr/>";

    for (const key in packages) {
      // 自分自身は除外
      if (key == process.env.npm_package_name + "@" + process.env.npm_package_version) {
        continue;
      }

      content += "<h2>" + key + "</h2>";
      content += "<pre>";
      content += "<code>";
      if (path.basename(packages[key].licenseFile).indexOf("README") != -1) {
        content += "Licence:" + packages[key].licenses + "\n";
      } else {
        content += fs.readFileSync(packages[key].licenseFile);
      }
      content += "</code>";
      content += "</pre>";
      content += "<hr/>";
    }
    // フォントに関するライセンス
    // JetBrainsMono
    content += "<h1>" + "フォントに関するライセンス" + "</h1>";
    content += "本ソフト（Serimon）では表示フォントに以下のフォントを使用しています。";
    content += "<hr/>";
    content += "<h2>JetBrains Mono</h2>";
    content += "<pre>";
    content += "<code>";
    content += fs.readFileSync(path.dirname(__dirname) + "/src/Fonts/JetBrainsMono-LICENSE.txt");
    content += "</code>";
    content += "</pre>";
    // SourceHanCodeJP
    content += "<hr/>";
    content += "<h2>Source Han Code JP</h2>";
    content += "<pre>";
    content += "<code>";
    content += fs.readFileSync(path.dirname(__dirname) + "/src/Fonts/SourceHanCodeJP-LICENSE.txt");
    content += "</code>";
    content += "</pre>";
    content += "</body>";
    content += "</html>";
    fs.writeFileSync("src/licence.html", content);
  }
});
