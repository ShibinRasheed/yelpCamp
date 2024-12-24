const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
require("dotenv").config();

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomPhoto = async () => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const collectionId = "483251";
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?collections=${collectionId}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch a random photo:", response.statusText);
      return "https://via.placeholder.com/600"; // Fallback image
    }

    const data = await response.json();
    return data.urls.full;
  } catch (error) {
    console.error("Error fetching photo:", error);
    return "https://via.placeholder.com/600"; // Fallback image
  }
};

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 30; i++) {
    const price = Math.floor(Math.random() * 30);
    const random1000 = Math.floor(Math.random() * 1000);
    const image = await getRandomPhoto();
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: image,
      author: "676a64120c16988b1e775ecb",
      price: price,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est rerum autem velit, natus ullam facere voluptate atque? Ad ab cumque perspiciatis molestias explicabo in, dolore porro soluta non expedita natus.",
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

// Last seeded @ 1 : 35
