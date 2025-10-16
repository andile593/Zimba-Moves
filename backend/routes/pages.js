const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('Welcome to ZimbaMoves API!');
});

router.get('/about', (req, res) => {
  res.json({
    title: 'About ZimbaMoves',
    description: 'ZimbaMoves connects customers with providers and helpers for moving services.',
    howItWorks: [
      'Search providers by location, service type, and availability',
      'Get instant quotes or request custom quotes',
      'Book and pay securely',
      'Providers and helpers manage their availability and earnings via dashboards'
    ]
  });
});


router.get('/faq', (req, res) => {
  res.json({
    faqs: [
      {
        question: 'How do I book a service?',
        answer: 'Use the search tool to find a provider and click "Book Now".'
      },
      {
        question: 'Can I request additional helpers?',
        answer: 'Yes, you can add helpers during the quote request or checkout process.'
      },
      {
        question: 'How do I get paid as a provider?',
        answer: 'Earnings are tracked in your provider dashboard and can be withdrawn securely.'
      }
    ]
  });
});


router.get('/contact', (req, res) => {
  res.json({
    email: 'support@zimbamoves.com',
    phone: '+1234567890',
    message: 'Use this endpoint to view contact details. A complaint form endpoint will also exist.'
  });
});

module.exports = router;
