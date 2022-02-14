const fs = require("fs/promises");
const myArgs = process.argv.slice(2);

const { createCanvas, loadImage } = require("canvas");
const WIDTH = 2000;
const HEIGHT = 2000;
const totalSupply = myArgs.length > 0 ? Number(myArgs[0]) : 1;

const { LoadTraitData } = require("./traits");

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

const NoNecklaceIfClothing = {
	"Wiseguy": true,
	"White Button-up": true,
	"Puffer Vest": true,
	"Flannel Shirt": true,
	"Hawaiian Shirt": true,
	"Bomber Jacket": true,
	"Leather Jacket": true,
	"Denim Jacket": true,
	"Sherpa Jacket": true,
	"Cheap Suit": true,
	"Candyman": true
}

const IfGhoulOnlyEyes = {
	"Angry Dead": true,
	"Crossed Dead": true,
	"Dead": true,
	"Sad Dead": true,
	"Surprised Dead": true,
	"Wink Dead": true,
	"Sad X": true,
	"Surprised X": true,
	"Wink X": true,
	"X": true,
	"Angry X": true,
}

const IfSkiMaskNo = {
	"Fly Blue": true,
	"Fly Dark Brown": true,
	"Fly Dead": true,
	"Fly Green": true,
	"Fly Light Brown": true,
	"Fly Magenta": true,
	"Fly Orange": true,
	"Fly Red": true,
	"Fly X": true,
	"Blackbeard": true,
	"Lumberjack": true,
	"Hipster": true,
	"Cigarette": true,
	"Cigar": true,
	"Pipe": true,
	"Soulpatch": true,
	"Surgical Mask": true,
	"Bubblegum": true,
	"Pill": true,
}

const NoEarringsIf = {
	"Football Helment": true,
	"Balaclava": true,
	"Jheri Curls": true,
	"Metalhead": true,
}

const IfFootballHelmet = {
	"Blackbeard": true,
	"Lumberjack": true,
	"Hipster": true,
	"Soulpatch": true,
	"Cigarette": true,
	"Pipe": true,
	"Cigar": true,
	"Bubblegum": true,
	"Pill": true
}

const IfMetalHair = {
	"Surgical Mask": true,
	"Pipe": true,
	"Cigarette": true,
	"Cigar": true,
	"Bubblegum": true,
	"Tongue": true,
	"Pill": true,
	"Soulpatch": true,
	"Blackbeard": true,
	"Lumberjack": true,
	"Hipster": true,
	"Patchy": true,
}

const IfGoldenSkin = {
	"Fly Blue": true,
	"Fly Dark Brown": true,
	"Fly Dead": true,
	"Fly Green": true,
	"Fly Light Brown": true,
	"Fly Magenta": true,
	"Fly Orange": true,
	"Fly Red": true,
	"Fly X": true,
	"Surgical Mask": true,
	"Balaclava": true,
}

const NoGlasses = {
	"Cyborg": true,
	"Balaclava": true,
	"Football Helmet": true,
	"Fly Blue": true,
	"Fly Dark Brown": true,
	"Fly Dead": true,
	"Fly Green": true,
	"Fly Light Brown": true,
	"Fly Magenta": true,
	"Fly Orange": true,
	"Fly Red": true,
	"Fly X": true,
	"Blue Eye Patch": true,
	"Red Eye Patch": true,
	"Orange Eye Patch": true,
	"Green Eye Patch": true,
	"Magenta Eye Patch": true,
	"Dark Brown Eye Patch": true,
	"Light Brown Eye Patch": true,
	"Dead Eye Patch": true,
	"X Eye Patch": true
}

const IfDogCollarNo = {
	"Yuppie": true,
	"Trenchcoat": true,
	"Labcoat": true,
	"Pink Polo": true,
	"Tracksuit": true
}

const IfFriedChickenBucketNo = {
	"Surgical Mask": true,
	"Hipster": true,
	"Lumberjack": true,
	"Blackbeard": true,
	"Patchy": true,
	"Cyborg": true,
	"Blue Eye Patch": true,
	"Red Eye Patch": true,
	"Orange Eye Patch": true,
	"Green Eye Patch": true,
	"Magenta Eye Patch": true,
	"Dark Brown Eye Patch": true,
	"Light Brown Eye Patch": true,
	"Dead Eye Patch": true,
	"X Eye Patch": true
}

const IfCyborgEyePutUnder = {
	"Windy": true,
	"Tinfoil Hat": true,
	"Combover": true,
	"Chad": true,
}

const NoHoopEarring = {
	"Yuge": true,
	"Wizard Hat": true,
	"Mullet": true,
	"Mohawk": true,
	"Gothic Cowboy Hat": true,
	"Fried Chicken Bucket": true,
	"Bowler Hat": true
}

const FlyEyes = {
	"Fly Blue": true,
	"Fly Dark Brown": true,
	"Fly Dead": true,
	"Fly Green": true,
	"Fly Light Brown": true,
	"Fly Magenta": true,
	"Fly Orange": true,
	"Fly Red": true,
	"Fly X": true,
}

const IfFlyEyes = {
	"Balaclava": true,
	"Surgical Mask": true,
	// no shades
}

const EarringHoops = {
	"Steel Hoop": true,
	"Gold Hoop": true,
	"Black Hoop": true
}

function CheckRequirements(curData, meme) {
	let traitName = meme[0]
	let traitData = meme[1]

	let isGhoul = false;
	let isFlyEyes = false;
	let isCyborgEyes = false;
	let isTinfoilHat = false;
	let isFriedChickenBucket = false;
	let isDogCollar = false;
	let isGoldenSkin = false;
	let isMetalhead = false;
	let isFootballHelmet = false;
	let noBalaclava = false;
	let noEarrings = false;
	let noGlasses = false;
	let noHoopEarring = false;
	let noNecklace = false;
	let noFootballHelmet = false;

	for (let i = 0; i < curData.length; i++) {
		let data = curData[i];

		if (data.name == "Ghoul") {
			isGhoul = true;
		}

		if (FlyEyes[data.name]) {
			isFlyEyes = true;
		}

		if (data.name == "Cyborg") {
			isCyborgEyes = true;
		}

		if (data.name == "Tinfoil Hat") {
			isTinfoilHat = true;
		}

		if (data.name == "Fried-Chicken Bucket") {
			isFriedChickenBucket = true;
		}

		if (data.name == "Dog Collar") {
			isDogCollar = true;
		}

		if (data.name == "Golden") {
			isGoldenSkin = true;
		}

		if (data.name == "Metalhead") {
			isMetalhead = true;
		}

		if (data.name == "Football Helmet") {
			isFootballHelmet = true;
		}

		if (IfSkiMaskNo[data.name]) {
			noBalaclava = true;
		}

		if (NoEarringsIf[data.name]) {
			noEarrings = true;
		}

		if (NoGlasses[data.name]) {
			noGlasses = true;
		}

		if (NoHoopEarring[data.name]) {
			noHoopEarring = true;
		}

		if (NoNecklaceIfClothing[data.name]) {
			noNecklace = true;
		}

		if (IfFootballHelmet[data.name]) {
			noFootballHelmet = true;
		}

		if (data.category == "Shades" && data.name != "None") {
			noBalaclava = true;
			noFootballHelmet = true;
		}
	}

	if (traitData.category == "Neck" && noNecklace) return true;
	if (traitData.category == "Eyes" && isGhoul && !IfGhoulOnlyEyes[traitName]) return true;
	if (isMetalhead && IfMetalHair[traitName]) return true;
	if (isGoldenSkin && IfGoldenSkin[traitName]) return true;
	if (traitData.category == "Shades" && noGlasses) return true;
	if (isDogCollar && IfDogCollarNo[traitName]) return true;
	if (isFriedChickenBucket && IfFriedChickenBucketNo[traitName]) return true;
	if (isTinfoilHat && traitName == "Patchy") return true;
	if (EarringHoops[traitName] && noHoopEarring) return true;
	if (isFlyEyes && (IfFlyEyes[traitName] || traitData.category == "Shades")) return true;
	if (isFootballHelmet && IfFootballHelmet[data.name]) return true;
	if (noBalaclava && traitName == "Balaclava") return true;
	if (noFootballHelmet && traitName == "Football Helmet") return true;
	if (noEarrings && traitData.category == "Earrings") return true;
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
					let trait = traits[i];
					const count = (traitWeights[i] / sum) * 100;

					if (CheckRequirements(tokenData, trait)) {
						continue
					};

					for (let j = 0; j < count; ++j) {
						distribution.push(i);
					}
				}

				let selected = traitKeys[distribution[Math.floor(distribution.length * Math.random())]];
				if (!selected) {
					continue
				}

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
			"description": "DimWits is a collection of 7,777 NFT’s that also serve as a “ticket.” Each DimWit holder has access to exclusive content.",
			"image": `https://storage.googleapis.com/dimwitsnft/${tokenID}.png`,
			"secret": `https://storage.googleapis.com/dimwitsnft/${tokenID}_noBG.png`,
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