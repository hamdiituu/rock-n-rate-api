const router = require("express").Router();
const Song = require("../db/models/Song");
const Rating = require("../db/models/Rating");
const { Topic } = require("../db/models/Rating");
const authenticate = require("../middlewares/authenticate");
const paginateSongs = require("../middlewares/paginateSongs");
const identifyUser = require("../middlewares/identifyUser");

router.get("/", paginateSongs, async (req, res) => {
  try {
    const songs = await Song.find(req.find)
      .sort(req.sort)
      .skip(req.skip)
      .limit(req.limit);
    const count = await Song.countDocuments(req.find);
    const pageCount = Math.ceil(count / req.limit);

    songs.forEach((song) => {
      song.rating = song.rating.toFixed(1);
    });

    res.status(200).send({ count, pageCount, songs });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.get("/mostRatedSongs", async (req, res) => {
  try {
    const mostRatedSongs = await Song.find({})
      .sort({ ratingCount: -1 })
      .limit(18);

    mostRatedSongs.forEach((song) => {
      song.rating = song.rating.toFixed(1);
    });

    res.status(200).send({ mostRatedSongs });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.get("/similarSongs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findOne({ _id: id });

    const similarSongs = await Song.find({
      _id: { $ne: song._id },
      genres: { $in: song.genres },
    })
      .sort({ genres: -1 })
      .limit(4);

    res.status(200).send({ similarSongs });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.get("/:id", identifyUser, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;
    const song = await Song.findOne({ _id: songId }).lean();
    const userRating = await Rating.findOne({ topicId: songId, userId });

    song.ratingOfRelevantUser = userRating?.rating;
    song.rating = +song.rating.toFixed(1);

    res.status(200).send({ song });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.post("/", identifyUser, authenticate, async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();

    res.status(201).send(song);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.post("/rate/:id", identifyUser, authenticate, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;
    const { rating } = req.body;
    const song = await Song.findOne({ _id: songId });
    const userRating = await Rating.findOne({ topicId: songId, userId });

    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      await Rating.create({
        topic: Topic.Song,
        topicId: songId,
        userId,
        rating,
      });
    }

    const songRatings = await Rating.find({ topicId: songId });
    song.updateRating(songRatings);
    await song.save();

    song._doc.ratingOfRelevantUser = rating;
    song.rating = +song.rating.toFixed(1);

    res.status(200).send({ song });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

router.delete(
  "/removeRating/:id",
  identifyUser,
  authenticate,
  async (req, res) => {
    try {
      const songId = req.params.id;
      const userId = req.user._id;
      const song = await Song.findOne({ _id: songId });
      await Rating.findOneAndDelete({ topicId: songId, userId });

      const songRatings = await Rating.find({ topicId: songId });
      song.updateRating(songRatings);
      await song.save();

      res.status(200).send({ song });
    } catch (e) {
      res.status(400).json({
        message: e.message,
      });
    }
  }
);

module.exports = { router };
