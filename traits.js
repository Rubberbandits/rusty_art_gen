const TRAITS = {}

const fs = require("fs/promises")

function LoadTraitData() {
	return new Promise((resolve, reject) => {
		let TraitData = Object.assign({}, TRAITS);

		fs.readFile("./traits.json")
			.then(data => {
				let rawTraitData = JSON.parse(data);

				rawTraitData.forEach(traitData => {
					if (!TraitData[traitData.LAYER]) {
						TraitData[traitData.LAYER] = {
							path: traitData.LAYER.toLowerCase(),
							types: {}
						};
					}
					
					let existingData = TraitData[traitData.LAYER].types[traitData.NAME] || {canUse: function() {return true}};
					TraitData[traitData.LAYER].types[traitData.NAME] = Object.assign(existingData, {
						image: traitData.IMAGE,
						chance: traitData.PROBABILITY,
					});
				});

				for (let traitCategory in TraitData) {
					let traitKeys = Object.keys(TraitData[traitCategory].types);
					let traitCache = Object.assign({}, TraitData[traitCategory].types);

					traitKeys.sort((a, b) => {
						let chanceA = TraitData[traitCategory].types[a].chance;
						let chanceB = TraitData[traitCategory].types[b].chance;
	
						return chanceA - chanceB;
					});

					TraitData[traitCategory].types = {};

					traitKeys.forEach((key, index) => {
						TraitData[traitCategory].types[key] = traitCache[key];

						let lastChance = 0;
						if (index > 0) {
							lastChance = TraitData[traitCategory].types[traitKeys[index - 1]].chance;
						}

						TraitData[traitCategory].types[key].chance += lastChance;
					});
				}

				//console.log(JSON.stringify(TraitData, null, 2));

				resolve(TraitData);
			});
	});
}

exports.LoadTraitData = LoadTraitData;