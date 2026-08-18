CREATE TYPE user_role AS ENUM ('ADMIN', 'STUDENT');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE quiz_status AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');
CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED', 'EXPIRED');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    difficulty difficulty_level NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    passing_percentage NUMERIC(5,2) NOT NULL
        CHECK (passing_percentage >= 0 AND passing_percentage <= 100),
    max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts > 0),
    status quiz_status NOT NULL DEFAULT 'DRAFT',
    thumbnail_url TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    marks NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (marks > 0),
    explanation TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'MEDIUM',
    position INTEGER NOT NULL CHECK (position > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (quiz_id, position)
);

CREATE TABLE options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL CHECK (position > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (question_id, position)
);

CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    total_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
    obtained_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (percentage >= 0 AND percentage <= 100),
    correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
    incorrect_answers INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_answers >= 0),
    unanswered INTEGER NOT NULL DEFAULT 0 CHECK (unanswered >= 0),
    time_taken_seconds INTEGER CHECK (time_taken_seconds >= 0),
    status attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    UNIQUE (quiz_id, user_id, attempt_number)
);

CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (marks_awarded >= 0),
    answered_at TIMESTAMPTZ,
    UNIQUE (attempt_id, question_id)
);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);

CREATE INDEX idx_quizzes_category ON quizzes(category_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_options_question ON options(question_id);

CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_quiz ON attempts(quiz_id);
CREATE INDEX idx_attempts_status ON attempts(status);
CREATE INDEX idx_attempts_started_at ON attempts(started_at DESC);

CREATE INDEX idx_answers_attempt ON answers(attempt_id);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);