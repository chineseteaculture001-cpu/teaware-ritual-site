export default function handler(req, res) {
  const client_id = process.env.GITHUB_CLIENT_ID;
  if (!client_id) {
    return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
  }
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${Math.random().toString(36).substring(7)}`;
  res.redirect(url);
}
