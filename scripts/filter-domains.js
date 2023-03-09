const config = require('config');
const fs = require('fs');

let count = 0;
let _count = 0;

(async () => {
    const domains = [...config.get("domains")];
    const handledDomains = [...config.get("handledDomains")];

    for(const domain of domains) {
        if(handledDomains.some((_domain) => _domain === domain.replace("#overview", "").trim())) {
            console.log('Duplicated: ' + ++_count)
        } else {
            fs.appendFileSync('./filtered_domains.txt', `'${domain}',\n`, { encoding: 'utf-8' });
            console.log('Unique: ' + ++count);
        }
    }

    console.log('Finished...');
})()