const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Previous incident summaries
const previousSummaries = [
    "Hi All,\nWe are experiencing a P1/P2/P3 incident for __(Product name). The issue started at __(time in GMT) and is being triaged with help of PRE/SRE/RE teams,",
    "Hi All,\nWe are currently investigating ---format2",
    "Hi All,\nWe are currently investigating ---format3",
    "Hi All,\nWe are currently investigating ---format4",
    "Hi All,\nWe are currently investigating ---format5"
];

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the static index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the send_rca.html file
app.get('/send-rca', (req, res) => {
    res.sendFile(path.join(__dirname, 'send_rca.html'));
});

// Serve previous summaries
app.get('/previous-summaries', (req, res) => {
    res.json({ summaries: previousSummaries });
});

// Handle form submission to send email
app.post('/send-email', (req, res) => {
    const { recipientEmails, incident, priority, startTime, endTime, impact, incidentSummary } = req.body;

    // Split the recipient emails by comma and trim any extra spaces
    const recipients = recipientEmails.split(',').map(email => email.trim());

    let transporter = nodemailer.createTransport({
        host: 'smtp.yourhost.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@example.com',
            pass: 'your-password'
        }
    });

    let mailOptions = {
        from: 'your-email@example.com',
        to: recipients,
        subject: `Incident Communication: ${incident}`,
        text: `
            Priority: ${priority}
            Start Time: ${startTime}
            End Time: ${endTime}
            Impact: ${impact}
            
            Incident Summary:
            ${incidentSummary}
        `
    };

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

// Handle form submission to send email with attachment
app.post('/send-rca', upload.single('attachment'), (req, res) => {
    const { email, subject, message } = req.body;
    const attachmentPath = req.file.path;

    // Split the recipient emails by comma and trim any extra spaces
    const recipients = email.split(',').map(email => email.trim());

    let transporter = nodemailer.createTransport({
        host: 'smtp.yourhost.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@example.com',
            pass: 'your-password'
        }
    });

    let mailOptions = {
        from: 'your-email@example.com',
        to: recipients,
        subject: subject,
        text: message,
        attachments: [
            {
                filename: req.file.originalname,
                path: attachmentPath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        // Delete the file after sending email
        fs.unlink(attachmentPath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            }
        });

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
