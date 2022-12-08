<script lang="ts">
	import { json } from "@sveltejs/kit";



	let initial_prompt = `Your task is to generate visualizations using plotly.js library. 
You will be given natural language queries and your goal is to generate graphs that answer the queries.
Output only JavaScript code in a single code block. Do not output any comments or explanations.
Assume you have the dataset loaded into a variable called data. Do not make up any data.
Assume you can use the plotly.js library already loaded. Load the graph into an element with the ID "graph".
	`;
	let data_description = `Data is a raw string loaded from a .csv file. You must parse this string.
Each row contains information about a winner of an olympic medal.
The headers are: "Games,Year,Sport,Discipline,Athlete,Team,Gender,Event,Medal,Gold,Silver,Bronze"
Example row: "Athens (1896),1896,Aquatics,Swimming,Otto Herschmann,AUT,Men,100m freestyle men,Silver,0,1,0"
	`;
	let query = `Which country has won the most gold medals in the 2008 games?
	`;

	let datasetURL = `https://raw.githubusercontent.com/the-gamma/thegamma-services/master/data/medals-expanded.csv`

	let sessionToken = ``
	let gptResponse = ``;

	let loading = false;

	const handleSendToChatGPT = async (event) => {
		event.preventDefault();
		const payload = {
			query: `${initial_prompt}\n\n${data_description}\n\nThe query is: ${query}`,
			sessionToken: sessionToken
		}
		loading = true
		const res = await fetch('/api/chatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		loading = false
		gptResponse = await res.text();

	};

	const handleExecuteGptResponse = async (event) => {

		const data = await (await fetch(datasetURL)).text();
		document.getElementById('graph').innerHTML = '';

		const minifiedPlotlyJs = await (await fetch('https://cdn.plot.ly/plotly-2.16.1.min.js')).text();
		const stringToEval = `
			var data = \`${data}\`;
			${minifiedPlotlyJs}

			${gptResponse}
		`
		eval(stringToEval)
	};
</script>

<div class="inputBoxes">
	<div class="input">
		<label for="initial_prompt"> Initial prompt </label>
		<textarea rows="5" cols="80" bind:value={initial_prompt} id="initial_prompt" />
	</div>
	<div class="input">
		<label for="data_description"> Data description </label>
		<textarea rows="5" cols="80" bind:value={data_description} id="data_description" />
	</div>
	<div class="input">
		<label for="query"> Query </label>
		<textarea rows="5" cols="80" bind:value={query} id="query" />
	</div>
	<div class="input">
		<label for="dataset"> Dataset URL </label>
		<input type="text" bind:value={datasetURL} id="dataset" />
	</div>
	<div class="input">
		<label for="session_token"> Session token </label>
		<input type="text" bind:value={sessionToken} id="session_token" />
	</div>
	<button type="submit" disabled={loading} on:click={handleSendToChatGPT}>Submit</button>
	{#if loading}
		<div> Loading... </div>
	{/if}
</div>

<div>
	The response is:
	<textarea rows="5" cols="80" bind:value={gptResponse} />
</div>


<button on:click={handleExecuteGptResponse}>Eval the code</button>
<div id="graph"></div>

<style lang="css">
	.input {
		display: flex;
		flex-direction: column;
	}
	.inputBoxes {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	#graph {
		width: 400px;
		height: 400px;
	}
</style>
