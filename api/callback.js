export default async function handler(req, res) {
  const { code } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description}`);
    }

    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Authorizing...</title>
</head>
<body>
  <script>
    (function() {
      const tokenData = ${JSON.stringify({
        token: data.access_token,
        provider: 'github',
      })};
      const successMessage = 'authorization:github:success:' + JSON.stringify(tokenData);
      
      function sendToOpener(message) {
        if (window.opener) {
          window.opener.postMessage(message, "*");
        }
      }

      // 1. Initial handshake
      sendToOpener("authorizing:github");

      // 2. Send success message immediately (some versions don't send a response back)
      sendToOpener(successMessage);

      // 3. Also handle the responsive handshake if needed
      window.addEventListener("message", function(e) {
        console.log("Received message from opener:", e.data);
        sendToOpener(successMessage);
      }, false);

      // 4. Close after a delay
      setTimeout(function() {
        window.close();
      }, 2000);
    })();
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}
