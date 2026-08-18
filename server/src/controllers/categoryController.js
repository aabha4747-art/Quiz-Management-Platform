const { pool } = require("../config/db");

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.created_at,
        c.updated_at,
        COUNT(q.id)::INTEGER AS quiz_count
      FROM categories c
      LEFT JOIN quizzes q ON q.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          c.id,
          c.name,
          c.description,
          c.created_at,
          c.updated_at,
          COUNT(q.id)::INTEGER AS quiz_count
        FROM categories c
        LEFT JOIN quizzes q ON q.category_id = c.id
        WHERE c.id = $1
        GROUP BY c.id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve category",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const normalizedName = name.trim();

    const existingCategory = await pool.query(
      `
        SELECT id
        FROM categories
        WHERE LOWER(name) = LOWER($1)
      `,
      [normalizedName]
    );

    if (existingCategory.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at, updated_at
      `,
      [normalizedName, description?.trim() || null]
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const normalizedName = name.trim();

    const categoryExists = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [id]
    );

    if (categoryExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const duplicateCategory = await pool.query(
      `
        SELECT id
        FROM categories
        WHERE LOWER(name) = LOWER($1)
          AND id <> $2
      `,
      [normalizedName, id]
    );

    if (duplicateCategory.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const result = await pool.query(
      `
        UPDATE categories
        SET
          name = $1,
          description = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING id, name, description, created_at, updated_at
      `,
      [normalizedName, description?.trim() || null, id]
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await pool.query(
      `
        SELECT
          c.id,
          COUNT(q.id)::INTEGER AS quiz_count
        FROM categories c
        LEFT JOIN quizzes q ON q.category_id = c.id
        WHERE c.id = $1
        GROUP BY c.id
      `,
      [id]
    );

    if (category.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.rows[0].quiz_count > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a category that contains quizzes",
      });
    }

    await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};