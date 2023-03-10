const fs = require("fs");

try {
  const data = fs.readFileSync(
    `${__dirname}/../results/similarweb.com/successful_results/ranked_domains.txt`,
    "utf8"
  );
  const urls = data.split("\n");
  for (const url of urls) {
    const _url = url.split(",")[0];
    fs.appendFileSync("test.txt", `${_url},\n`, { encoding: "utf-8" });
  }
} catch (err) {
  console.error(err);
}

// try {
//   const data = fs.readFileSync(
//     `${__dirname}/../results/similarweb.com/successful_results/unranked_domains.txt`,
//     "utf8"
//   );
//   const urls = data.split("\n");
//   for (const url of urls) {
//     fs.appendFileSync("test.txt", `${url},\n`, { encoding: "utf-8" });
//   }
// } catch (err) {
//   console.error(err);
// }
