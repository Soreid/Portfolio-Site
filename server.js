import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

const secret_name = "Portfolio_Email";

const client = new SecretsManagerClient({
  region: "us-east-2",
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret_string = response.SecretString;
const api_key = JSON.parse(secret_string).Resend_API;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const mailer = new Resend(api_key);

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
  const mailDetails = req.body;

  const mailingStatus = await sendMail(mailDetails.name, mailDetails.email, mailDetails.message);

  if(mailingStatus === 200) {
    res.status(200).send();
  } else {
    res.status(400).send(mailingStatus);
  }
});

app.get('/api/status', (req, res) => {
  res.status(200).send("The server is currently operational.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});