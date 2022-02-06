const TRAITS = {}

const fs = require("fs/promises")

function LoadTraitData() {
	return new Promise((resolve, reject) => {
		let TraitData = Object.assign({}, TRAITS);

		fs.readFile("./traits.json")
			.then(data => {
				let rawTraitData = JSON.parse(data);
				let curIndex = 0;

				rawTraitData.forEach(traitData => {
					curIndex += 1;

					if (!TraitData[traitData.LAYER]) {
						TraitData[traitData.LAYER] = {
							path: traitData.LAYER.toLowerCase(),
							types: []
						};

						curIndex = 0;
					}
					
					let lastChance = 0;
					if (curIndex > 0) {
						let keys = Object.keys(TraitData[traitData.LAYER].types);
						
						lastChance = TraitData[traitData.LAYER].types[keys[curIndex - 1]].chance;
					}
					
					let existingData = TraitData[traitData.LAYER].types[traitData.NAME] || {canUse: function() {return true}};
					TraitData[traitData.LAYER].types[traitData.NAME] = Object.assign(existingData, {
						image: traitData.IMAGE,
						chance: curIndex > 0 ? traitData.PROBABILITY + lastChance : traitData.PROBABILITY,
					});
				});

				resolve(TraitData);
			});
	});
}

exports.LoadTraitData = LoadTraitData;