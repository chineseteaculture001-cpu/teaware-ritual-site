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
  <div id="status" style="font-family: sans-serif; text-align: center; margin-top: 50px;">
    Authenticating with GitHub...
  </div>
  <script>
    (function() {
      const status = document.getElementById('status');
      try {
        const tokenData = ${JSON.stringify({
          token: data.access_token,
          provider: 'github',
        })};
        const successMessage = 'authorization:github:success:' + JSON.stringify(tokenData);
        
        function sendToOpener(message) {
          if (window.opener) {
            window.opener.postMessage(message, "*");
            return true;
          }
          return false;
        }

        console.log("Sending handshake...");
        if (sendToOpener("authorizing:github")) {
          status.innerText = "Handshake sent, transferring token...";
          sendToOpener(successMessage);
          
          window.addEventListener("message", function(e) {
            console.log("Received handshake response:", e.data);
            sendToOpener(successMessage);
          }, false);

          setTimeout(function() {
            status.innerText = "Success! Closing window...";
            window.close();
          }, 1500);
        } else {
          status.innerHTML = '<span style="color: red;">Error: Opener window lost. Please try again from the admin panel.</span>';
        }
      } catch (err) {
        status.innerHTML = '<span style="color: red;">Error: ' + err.message + '</span>';
      }
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
