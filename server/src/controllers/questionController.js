const { pool } = require("../config/db");

const getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quizResult = await pool.query(
      "SELECT id, title FROM quizzes WHERE id = $1",
      [quizId]
    );

    if (quizResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const result = await pool.query(
      `
        SELECT
          q.id,
          q.quiz_id,
          q.question_text,
          q.marks,
          q.explanation,
          q.difficulty,
          q.position,
          q.created_at,
          q.updated_at,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', o.id,
                'optionText', o.option_text,
                'isCorrect', o.is_correct,
                'position', o.position
              )
              ORDER BY o.position
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'
          ) AS options
        FROM questions q
        LEFT JOIN options o ON o.question_id = q.id
        WHERE q.quiz_id = $1
        GROUP BY q.id
        ORDER BY q.position
      `,
      [quizId]
    );

    return res.status(200).json({
      success: true,
      quiz: quizResult.rows[0],
      count: result.rowCount,
      questions: result.rows,
    });
  } catch (error) {
    console.error("Get questions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve questions",
    });
  }
};

const createQuestion = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { quizId } = req.params;

    const {
      questionText,
      marks,
      explanation,
      difficulty,
      position,
      options,
    } = req.body;

    const quizResult = await client.query(
      "SELECT id, status FROM quizzes WHERE id = $1",
      [quizId]
    );

    if (quizResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quizResult.rows[0].status === "PUBLISHED") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Unpublish the quiz before adding questions",
      });
    }

    const correctOptions = options.filter(
      (option) => option.isCorrect === true
    );

    if (correctOptions.length !== 1) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Exactly one option must be marked as correct",
      });
    }

    const duplicatePosition = await client.query(
      `
        SELECT id
        FROM questions
        WHERE quiz_id = $1
          AND position = $2
      `,
      [quizId, position]
    );

    if (duplicatePosition.rowCount > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "A question already exists at this position",
      });
    }

    const questionResult = await client.query(
      `
        INSERT INTO questions (
          quiz_id,
          question_text,
          marks,
          explanation,
          difficulty,
          position
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        quizId,
        questionText.trim(),
        marks,
        explanation?.trim() || null,
        difficulty,
        position,
      ]
    );

    const question = questionResult.rows[0];
    const createdOptions = [];

    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];

      const optionResult = await client.query(
        `
          INSERT INTO options (
            question_id,
            option_text,
            is_correct,
            position
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            question_id,
            option_text,
            is_correct,
            position
        `,
        [
          question.id,
          option.optionText.trim(),
          option.isCorrect,
          index + 1,
        ]
      );

      createdOptions.push(optionResult.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: {
        ...question,
        options: createdOptions,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create question",
    });
  } finally {
    client.release();
  }
};

const updateQuestion = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const {
      questionText,
      marks,
      explanation,
      difficulty,
      position,
      options,
    } = req.body;

    const existingQuestion = await client.query(
      `
        SELECT q.id, q.quiz_id, qu.status
        FROM questions q
        INNER JOIN quizzes qu ON qu.id = q.quiz_id
        WHERE q.id = $1
      `,
      [id]
    );

    if (existingQuestion.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (existingQuestion.rows[0].status === "PUBLISHED") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Unpublish the quiz before editing questions",
      });
    }

    const correctOptions = options.filter(
      (option) => option.isCorrect === true
    );

    if (correctOptions.length !== 1) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Exactly one option must be marked as correct",
      });
    }

    const quizId = existingQuestion.rows[0].quiz_id;

    const duplicatePosition = await client.query(
      `
        SELECT id
        FROM questions
        WHERE quiz_id = $1
          AND position = $2
          AND id <> $3
      `,
      [quizId, position, id]
    );

    if (duplicatePosition.rowCount > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "A question already exists at this position",
      });
    }

    const questionResult = await client.query(
      `
        UPDATE questions
        SET
          question_text = $1,
          marks = $2,
          explanation = $3,
          difficulty = $4,
          position = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
      [
        questionText.trim(),
        marks,
        explanation?.trim() || null,
        difficulty,
        position,
        id,
      ]
    );

    await client.query(
      "DELETE FROM options WHERE question_id = $1",
      [id]
    );

    const updatedOptions = [];

    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];

      const optionResult = await client.query(
        `
          INSERT INTO options (
            question_id,
            option_text,
            is_correct,
            position
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            question_id,
            option_text,
            is_correct,
            position
        `,
        [
          id,
          option.optionText.trim(),
          option.isCorrect,
          index + 1,
        ]
      );

      updatedOptions.push(optionResult.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: {
        ...questionResult.rows[0],
        options: updatedOptions,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update question",
    });
  } finally {
    client.release();
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const questionResult = await pool.query(
      `
        SELECT q.id, qu.status
        FROM questions q
        INNER JOIN quizzes qu ON qu.id = q.quiz_id
        WHERE q.id = $1
      `,
      [id]
    );

    if (questionResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (questionResult.rows[0].status === "PUBLISHED") {
      return res.status(409).json({
        success: false,
        message: "Unpublish the quiz before deleting questions",
      });
    }

    await pool.query(
      "DELETE FROM questions WHERE id = $1",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete question",
    });
  }
};

module.exports = {
  getQuestionsByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};