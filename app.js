const fs = require("fs/promises");
const myArgs = process.argv.slice(2);

const { createCanvas, loadImage } = require("canvas");
const WIDTH = 2000;
const HEIGHT = 2000;
const totalSupply = myArgs.length > 0 ? Number(myArgs[0]) : 1;

const { LoadTraitData } = require("./traits");
const { UNIQUES } = require("./uniques");

const progressBar = require("cli-progress");
const collectionProg = new progressBar.SingleBar({}, progressBar.Presets.legacy);

let ImageCache = {};

function LoadTraitImages(TraitInfo) {
	return new Promise((resolve, reject) => {
		let promises = [];

		for (let traitCategory in TraitInfo) {
			let categoryData = TraitInfo[traitCategory];

			for (let trait in categoryData.types) {
				let traitData = categoryData.types[trait];

				if (traitData.image.length == 0) continue;
				
				promises.push(loadImage(`./traits/${categoryData.path}/${traitData.image}`));
			}
		}

		Promise.allSettled(promises)
			.then(results => {
				results.forEach(result => {
					let imageObj = result.value;
					if (!imageObj) {
						console.log(result);
					}

					let split = imageObj.src.split("/");
					let traitCategory = split[2].toLowerCase();
					let traitImage = split[3];

					if (!ImageCache[traitCategory]) {
						ImageCache[traitCategory] = {};
					}

					ImageCache[traitCategory][traitImage] = imageObj;
				});

				resolve();
			})
	});
}

function CreateTokenData(traitInfo, start, end) {
	return new Promise((resolve, reject) => {
		let generatedTokens = [];

		for (let i = start; i < end; i++) {
			let tokenData = [];
			
			//console.log(i);
			for (let traitCategory in traitInfo) {
				/*let categoryData = traitInfo[traitCategory];
				let random = Math.random();
				let min = Math.min();
				let selected;

				let keys = Object.keys(categoryData.types);
				keys.forEach(key => {
					let traitData = categoryData.types[key];

					let absVal = Math.abs(traitData.chance - random)
					if(min > absVal) {
						min = absVal;
						selected = key;
					}
				});

				if (selected) {
					tokenData.push({
						image: categoryData.types[selected].image, 
						category: traitCategory,
						name: selected
					});

					console.log(`Selected ${selected} for ${traitCategory} because RNG ${random} is closest to ${categoryData.types[selected].chance}`)
				};*/

				let categoryData = traitInfo[traitCategory];
				let traitTypes = categoryData.types;
				let traits = Object.entries(traitTypes);
				let traitWeights = traits.map(value => value[1].chance);
				let traitKeys = Object.keys(traitTypes);

				const distribution = [];
				const sum = traitWeights.reduce((a, b) => a + b);
				for (let i = 0; i < traitKeys.length; ++i) {
					const count = (traitWeights[i] / sum) * 100;

					for (let j = 0; j < count; ++j) {
						distribution.push(i);
					}
				}

				let selected = traitKeys[distribution[Math.floor(distribution.length * Math.random())]];

				tokenData.push({
					image: categoryData.types[selected].image, 
					category: traitCategory,
					name: selected
				});

				//console.log(`Selected ${selected} for ${traitCategory}`)
			}

			generatedTokens.push(tokenData);
		}

		resolve(generatedTokens);
	});
}

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

const canvasNoBG = createCanvas(WIDTH, HEIGHT);
const ctxNoBG = canvasNoBG.getContext("2d");

function RenderTokenData(tokenID, tokenData) {
	return new Promise((resolve, reject) => {
		ctxNoBG.clearRect(0, 0, WIDTH, HEIGHT);

		let attributes = [];

		tokenData.forEach(traitData => {
			if (traitData.image.length == 0) return;
			
			let imageData = ImageCache[traitData.category.toLowerCase()][traitData.image];

			ctx.drawImage(
                imageData,
               	0,
                0,
                WIDTH,
                HEIGHT
            );

			if (traitData.category != "Background") {
				ctxNoBG.drawImage(
					imageData,
					0,
					0,
					WIDTH,
					HEIGHT
				);
			}

			attributes.push({trait_type: traitData.category, value: traitData.name});
		});

		let metadata = JSON.stringify({
			"name": `DimWits #${tokenID}`,
			"description": "",
			"image": "",
			"secret": "",
			"attributes": attributes
		});

		let canvasBuffer = canvas.toBuffer("image/png");
		let noBgBuffer = canvasNoBG.toBuffer("image/png");

		fs.writeFile(`./output/${tokenID}.png`, canvasBuffer)
			.then(() => {
				fs.writeFile(`./output/${tokenID}_noBG.png`, noBgBuffer)
					.then(() => {
						fs.writeFile(`./output/${tokenID}.json`, metadata)
							.then(() => {
								resolve();
							});
					});
			});
	});
}

function RenderTokens(data) {
	return new Promise((resolve, reject) => {
		//let promises = [];
		let totalResolved = 0;

		for (let tokenID = 0; tokenID < data.length; tokenID++) {
			let tokenData = data[tokenID];

			RenderTokenData(tokenID, tokenData)
				.then(() => {
					collectionProg.increment();

					totalResolved += 1;

					if (totalResolved == data.length) {
						resolve();
					}
				});
		}

		/*
		data.forEach((tokenData, tokenID) => {
			promises.push(RenderTokenData(tokenID, tokenData));
		});

		Promise.allSettled(promises)
			.then(results => {
				results.forEach(result => {
					if (result.status != "fulfilled") {
						console.log(result);
					}
				});

				resolve();
			});
		*/
	});
}

console.log("Loading trait data from file...")
LoadTraitData()
	.then(TraitData => {
		console.log("Loading images...")

		LoadTraitImages(TraitData)
			.then(() => {
				console.log("Images loaded and cached...")

				CreateTokenData(TraitData, 0, totalSupply)
					.then(tokenData => {
						console.log("Token data created, rendering images...");
						collectionProg.start(totalSupply, 0);

						RenderTokens(tokenData)
							.then(() => {
								process.exit();
							});
					});
			});
	});