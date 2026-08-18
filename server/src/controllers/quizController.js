const { pool } = require("../config/db");

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      difficulty,
      durationMinutes,
      passingPercentage,
      maxAttempts,
      thumbnailUrl,
    } = req.body;

    const categoryResult = await pool.query(
      "SELECT id, name FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO quizzes (
          title,
          description,
          category_id,
          difficulty,
          duration_minutes,
          passing_percentage,
          max_attempts,
          status,
          thumbnail_url,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT', $8, $9)
        RETURNING
          id,
          title,
          description,
          category_id,
          difficulty,
          duration_minutes,
          passing_percentage,
          max_attempts,
          status,
          thumbnail_url,
          created_by,
          created_at,
          updated_at
      `,
      [
        title.trim(),
        description?.trim() || null,
        categoryId,
        difficulty,
        durationMinutes,
        passingPercentage,
        maxAttempts,
        thumbnailUrl?.trim() || null,
        req.user.id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create quiz",
    });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const values = [];
    const conditions = [];

    if (req.user.role !== "ADMIN") {
      values.push("PUBLISHED");
      conditions.push(`q.status = $${values.length}`);
    }

    if (req.query.categoryId) {
      values.push(req.query.categoryId);
      conditions.push(`q.category_id = $${values.length}`);
    }

    if (req.query.difficulty) {
      values.push(req.query.difficulty);
      conditions.push(`q.difficulty = $${values.length}`);
    }

    if (req.query.search) {
      values.push(`%${req.query.search.trim()}%`);
      conditions.push(
        `(q.title ILIKE $${values.length} OR q.description ILIKE $${values.length})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
        SELECT
          q.id,
          q.title,
          q.description,
          q.difficulty,
          q.duration_minutes,
          q.passing_percentage,
          q.max_attempts,
          q.status,
          q.thumbnail_url,
          q.created_at,
          q.updated_at,
          c.id AS category_id,
          c.name AS category_name,
          u.id AS created_by_id,
          u.name AS created_by_name,
          COUNT(DISTINCT qu.id)::INTEGER AS question_count,
          COUNT(DISTINCT a.id)::INTEGER AS attempt_count
        FROM quizzes q
        INNER JOIN categories c ON c.id = q.category_id
        INNER JOIN users u ON u.id = q.created_by
        LEFT JOIN questions qu ON qu.quiz_id = q.id
        LEFT JOIN attempts a ON a.quiz_id = q.id
        ${whereClause}
        GROUP BY q.id, c.id, u.id
        ORDER BY q.created_at DESC
      `,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      quizzes: result.rows,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve quizzes",
    });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          q.id,
          q.title,
          q.description,
          q.category_id,
          q.difficulty,
          q.duration_minutes,
          q.passing_percentage,
          q.max_attempts,
          q.status,
          q.thumbnail_url,
          q.created_at,
          q.updated_at,
          c.name AS category_name,
          COUNT(questions.id)::INTEGER AS question_count
        FROM quizzes q
        INNER JOIN categories c
          ON c.id = q.category_id
        LEFT JOIN questions
          ON questions.quiz_id = q.id
        WHERE q.id = $1
        GROUP BY q.id, c.name
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = result.rows[0];

    // Students can only access published quizzes.
    // Admins can access DRAFT, PUBLISHED and UNPUBLISHED quizzes.
    if (
      req.user.role !== "ADMIN" &&
      quiz.status !== "PUBLISHED"
    ) {
      return res.status(403).json({
        success: false,
        message: "This quiz is not currently available",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Get quiz by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve quiz",
    });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      categoryId,
      difficulty,
      durationMinutes,
      passingPercentage,
      maxAttempts,
      thumbnailUrl,
    } = req.body;

    const quizResult = await pool.query(
      "SELECT id FROM quizzes WHERE id = $1",
      [id]
    );

    if (quizResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const categoryResult = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const result = await pool.query(
      `
        UPDATE quizzes
        SET
          title = $1,
          description = $2,
          category_id = $3,
          difficulty = $4,
          duration_minutes = $5,
          passing_percentage = $6,
          max_attempts = $7,
          thumbnail_url = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `,
      [
        title.trim(),
        description?.trim() || null,
        categoryId,
        difficulty,
        durationMinutes,
        passingPercentage,
        maxAttempts,
        thumbnailUrl?.trim() || null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quiz",
    });
  }
};

const changeQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quizResult = await pool.query(
      `
        SELECT
          q.id,
          q.status,
          COUNT(qu.id)::INTEGER AS question_count
        FROM quizzes q
        LEFT JOIN questions qu ON qu.quiz_id = q.id
        WHERE q.id = $1
        GROUP BY q.id
      `,
      [id]
    );

    if (quizResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = quizResult.rows[0];

    if (status === "PUBLISHED" && quiz.question_count === 0) {
      return res.status(409).json({
        success: false,
        message: "Add at least one question before publishing the quiz",
      });
    }

    const result = await pool.query(
      `
        UPDATE quizzes
        SET status = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          title,
          status,
          updated_at
      `,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Quiz status changed to ${status}`,
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Change quiz status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change quiz status",
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await pool.query(
      `
        SELECT
          q.id,
          q.title,
          COUNT(a.id)::INTEGER AS attempt_count
        FROM quizzes q
        LEFT JOIN attempts a ON a.quiz_id = q.id
        WHERE q.id = $1
        GROUP BY q.id
      `,
      [id]
    );

    if (quizResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quizResult.rows[0].attempt_count > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a quiz that already has attempts",
      });
    }

    await pool.query("DELETE FROM quizzes WHERE id = $1", [id]);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete quiz",
    });
  }
};



module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  changeQuizStatus,
  deleteQuiz,
};