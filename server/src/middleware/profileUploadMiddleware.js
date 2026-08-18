const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "profile-pictures"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(
      null,
      uploadDirectory
    );
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const filename =
      `user-${req.user.id}-${Date.now()}${extension}`;

    callback(
      null,
      filename
    );
  },
});

const fileFilter = (
  req,
  file,
  callback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.mimetype
    )
  ) {
    return callback(
      new Error(
        "Only JPG, PNG and WEBP images are allowed"
      )
    );
  }

  callback(
    null,
    true
  );
};

const profilePictureUpload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });

module.exports =
  profilePictureUpload;