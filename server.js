const aws_client = require('@aws-sdk/client-secrets-manager');

const secret_name = "Portfolio_Email";

const client = new aws_client.SecretsManagerClient({
  region: "us-east-2",
});

let response;

try {
  response = async () => {
    console.log('waiting');
    await client.send(
      new aws_client.GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  }
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}
console.log('setting api key');

const api_key = response.SecretString;

console.log(api_key);

const express = require('express');
const resend = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mailer = new resend.Resend(api_key);

app.use(express.json());
app.use(express.static('public'));

async function sendMail (name, email, message) {
  const { data, error } = await mailer.emails.send({
    from: 'Samuel <samuel@samueldaley.com>',
    to: ['samuel@samueldaley.com'],
    subject: 'New Website Message',
    html: `Hello! You have received a new message from ${name} at ${email}:<br><br>${message}`
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
  return 200;
};

app.post('/api/send', async (req, res) => {
  mailDetails = req.body;

  mailingStatus = await sendMail(mailDetails.name, mailDetails.email, mailDetails.message);

  if(mailingStatus === 200) {
    res.status(200).send();
  } else {
    res.status(400).send(mailingStatus);
  }
});

app.get('/api/status', (req, res) => {
  res.status(200).send("The server is currently operational.");
});

app.listen(PORT);