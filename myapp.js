const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Previous incident summaries (this could be from a database in a real application)
const previousSummaries = [
    "Incident 1 summary...",
    "Incident 2 summary...",
    "Incident 3 summary..."
];

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the static index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve previous summaries
app.get('/previous-summaries', (req, res) => {
    res.json({ summaries: previousSummaries });
});

// Handle form submission to send email
app.post('/send-email', (req, res) => {
    const { recipient, incident, priority, startTime, endTime, impact, incidentSummary } = req.body;

    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.yourhost.com', // Your SMTP host
        port: 587, // Your SMTP port
        secure: false, // false for TLS; true for SSL
        auth: {
            user: 'your-email@example.com', // Your email address
            pass: 'your-password' // Your email password or app password
        }
    });

    // Setup email data with unicode symbols
    let mailOptions = {
        from: 'your-email@example.com', // Sender address
        to: recipient, // Recipient address from form input
        subject: `Incident Communication: ${incident}`, // Subject line
        text: `
            Priority: ${priority}
            Start Time: ${startTime}
            End Time: ${endTime}
            Impact: ${impact}
            
            Incident Summary:
            ${incidentSummary}
        ` // Plain text body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
