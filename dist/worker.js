const html = `<!DOCTYPE html>
<body>
  <h1>Deploying your Worker...</h1>
  <p>You are seeing this because your are deploying a Worker with <a href="https://github.com/BetaHuhn/worker-setup">worker-setup</a>.</p>
</body>`

async function handleRequest() {
	return new Response(html, {
		headers: {
			'content-type': 'text/html;charset=UTF-8'
		}
	})
}

addEventListener('fetch', (event) => {
	return event.respondWith(handleRequest(event.request))
})