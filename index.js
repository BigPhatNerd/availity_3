const fs = require("fs");
const parse = require("csv-parse");
var stringify = require("csv-stringify");
const _ = require("lodash");

//function alphabetizing the order of the objects in the array alphabetically
const alphabetizeNames = (a, b) => {
	if (a["First and Last Name"] < b["First and Last Name"]) return -1;
	
	if (a["First and Last Name"] > b["First and Last Name"]) return 1;
	
	return 0;
};

const readSortWrite = (filename) => {
	//parse the data into an array of objects
	const parser = parse({ columns: true }, function (err, records) {
		//Group the records by Insurance Company 
		var group = _.groupBy(records, function (b) {
			{
				return b["Insurance Company"];
			}
		});
	//Iterate through the grouped records to do additional ordering/filtering
		for (const [key, values] of Object.entries(group)) {
			//sort by version in descending order
			const sortedValues = [...values].sort((a, b) => {
				return b["Version"] - a["Version"];
			});
			//filter values to remove duplicate ids and keep the one with the highest version number (which was ordered in the sortedValues varaible)
			const filteredValues = [...sortedValues].filter(
				(value, index, self) =>
					index ===
					self.findIndex((t) => t["User Id"] === value["User Id"])
			);

			//sort alphabetically
			const finalValues = [...filteredValues].sort(alphabetizeNames);
			

			//start of writeFile
			stringify(
				finalValues,
				{
					header: true,
				},
				function (err, output) {
					const fileName = values[0]["Insurance Company"].replace(
						" ",
						"_"
					);
					fs.writeFile(
						`${__dirname}/${fileName}.csv`,
						output,
						function (err, result) {
							if (err) console.log({ err });
						}
					);
				}
			);
			//end of writeFile
		}
	});

	const arrFromCSV = fs
		.createReadStream(__dirname + "/" + filename)
		.pipe(parser);
};

readSortWrite("test.csv");
