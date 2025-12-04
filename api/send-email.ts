
// This is a Vercel Serverless Function, which will be deployed at the `/api/send-email` endpoint.

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  console.log('API route /api/send-email hit.');

  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed.`);
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const { name, email } = await req.json();
    console.log(`Received request to send email to: ${email}`);

    if (!name || !email) {
      console.error('Missing name or email in request body.');
      return new Response(JSON.stringify({ message: 'Missing required fields: name and email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL;

    if (!SENDGRID_API_KEY || !SENDGRID_SENDER_EMAIL) {
      console.error('CRITICAL: SendGrid environment variables are not configured on the server.');
      return new Response(JSON.stringify({ message: 'Server configuration error. Administrator has been notified.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailBody = {
      personalizations: [
        {
          to: [{ email, name }],
          subject: 'Hello there fellow user 4 dec 2025',
        },
      ],
      from: { email: SENDGRID_SENDER_EMAIL, name: 'Contact Form' },
      content: [
        {
          type: 'text/plain',
          value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
      ],
    };

    console.log('Sending request to SendGrid API...');
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    console.log(`Received response from SendGrid with status: ${sendgridResponse.status}`);

    // SendGrid returns 202 Accepted on success. `response.ok` covers all 2xx statuses.
    if (sendgridResponse.ok) {
       console.log('Successfully sent email via SendGrid.');
       return new Response(JSON.stringify({ message: 'Email sent successfully! Check your inbox.' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // If not OK, parse the specific error response from SendGrid for better feedback.
      const errorData = await sendgridResponse.json().catch(() => ({})); // Attempt to parse JSON, fallback to empty object
      const errorMessage = errorData?.errors?.[0]?.message || 'Failed to send email due to an unknown SendGrid error.';
      console.error(`SendGrid API error (${sendgridResponse.status}):`, JSON.stringify(errorData, null, 2));
      return new Response(JSON.stringify({ message: errorMessage }), {
        status: sendgridResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Unhandled error in send-email handler:', error);
    // This catches errors like failure to parse `req.json()`
    const message = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
