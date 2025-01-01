// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./models/Item');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/itemsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB:', err));

// Define the API endpoint for the bar chart data
app.get('/api/bar-chart/:month', async (req, res) => {
  const month = req.params.month; // Get the month from the URL parameter

  // Define the price ranges
  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: Infinity }
  ];

  try {
    // Aggregate items for the selected month
    const itemsInMonth = await Item.aggregate([
      { $project: { price: 1, month: { $month: "$date" } } },
      { $match: { month: parseInt(month) } }
    ]);

    // Count the number of items in each price range
    const data = priceRanges.map(range => {
      const count = itemsInMonth.filter(item =>
        item.price >= range.min && item.price <= range.max
      ).length;

      return { range: `${range.min}-${range.max}`, count };
    });

    res.json(data); // Send the data to the frontend
  } catch (err) {
    res.status(500).send('Error retrieving bar chart data');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
