const AiBridge = require("./AiBridge");
const fs = require("fs");
const path = require("path");
const Hjson = require('hjson');

// Special direct execution handling, allowing us to easily test and debug the commands via CLI
// https://stackoverflow.com/questions/6398196/detect-if-called-through-require-or-directly-by-command-line
if( require.main === module ) {
	(async function() {
		try {
			// Argument check
			const args = process.argv.slice(2);
			if( args == null || args.length < 2 ) {
				console.error( "[ERROR] Missing mode & prompt" );
				console.error( `[ERROR] Example: node ${process.argv[1]} "<mode>" "<prompt>"` );
				process.exit(1);
			}
			const mode = args[0];
			const promptStr = args.slice(1).join(" ");
	
			// Read the config file
			let configJsonStr = await fs.promises.readFile( path.resolve( process.cwd(), "./config.jsonc" ), "utf8" );
			let configJson = Hjson.parse(configJsonStr);

			// Given the config, setup the AiBridge
			let bridge = new AiBridge(configJson);
			await bridge.setup();

			// Lets get the result
			let res = null;
			if( mode == "chat" ) {
				res = await bridge.getChatCompletion( promptStr );
			} else if( mode == "embed" ) {
				res = await bridge.getEmbedding( promptStr );
			} else if( mode == "completion" ) {
				res = await bridge.getCompletion( promptStr );
			} else {
				console.error( "[ERROR] Unknown mode" );
				process.exit(1);
			}
	
			console.log("---");
			console.log( res );
			console.log("---");
		} catch(e) {
			console.error( e );
		}

		// Exit, and cleanup any hanging connection
		process.exit();
	})();
} else {
	throw "Not executed directly via CLI"
}
