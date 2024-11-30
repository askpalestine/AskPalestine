package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"database/sql"

	_ "github.com/lib/pq"
)

var (
	db *sql.DB
)

const (
	questionsQuery = `
SELECT q.id, qf.question_form
 FROM questions q
CROSS JOIN LATERAL unnest(q.question_forms) AS qf(question_form)
WHERE is_accepted = true
`
	questionEmbeddingsTableName = "question_form_embeddings"
)

type question struct {
	questionID   int64
	questionForm string
}

func getQuestions(ctx context.Context) []question {
	var questions []question

	rows, err := db.QueryContext(ctx, questionsQuery)
	if err != nil {
		log.Fatal("Error executing query: ", err)
	}
	defer rows.Close()

	for rows.Next() {
		var q question
		if err := rows.Scan(&q.questionID, &q.questionForm); err != nil {
			log.Fatal("Error scanning row: ", err)
		}
		questions = append(questions, q)
	}

	if err := rows.Err(); err != nil {
		log.Fatal("Error iterating rows: ", err)
	}

	return questions
}

func insertQuestionEmbedding(ctx context.Context, q question, embedding []float64) error {
	// Convert embedding to a PostgreSQL array
	embStr := strings.Join(strings.Fields(fmt.Sprint(embedding)), ",")

	_, err := db.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (question_id, question_form, embedding) VALUES ($1, $2, $3)", questionEmbeddingsTableName), q.questionID, q.questionForm, embStr)
	if err != nil {
		return fmt.Errorf("Error inserting question embedding: %v", err)
	}

	return nil
}

func embeddingExists(ctx context.Context, q question) (bool, error) {
	var count int
	err := db.QueryRowContext(ctx, fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE question_id = $1 AND question_form = $2", questionEmbeddingsTableName), q.questionID, q.questionForm).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("Error checking embedding existence: %v", err)
	}

	return count > 0, nil
}

func deleteThenCreateEmbeddingsTable(embeddingDimension int) {
	dropTableSQL := fmt.Sprintf(`DROP TABLE IF EXISTS %s;`, questionEmbeddingsTableName)
	if _, err := db.Exec(dropTableSQL); err != nil {
		log.Fatalf("Failed to drop table question_embeddings: %v", err)
	}

	createTableSQL := fmt.Sprintf(`
	CREATE EXTENSION IF NOT EXISTS vector;

	CREATE TABLE IF NOT EXISTS %s (
		id bigserial PRIMARY KEY,
		question_id bigint NOT NULL,
		question_form text NOT NULL,
		embedding vector(%d),
		UNIQUE (question_id, question_form),
		FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
	);
	`, questionEmbeddingsTableName, embeddingDimension)
	_, err := db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Failed to create table question_embeddings: %v", err)
	}
}

func initDB(embeddingDimension int) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASS")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "postgres"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	// Attempt to connect to the database
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Couldn't open database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	} else {
		log.Println("Connected to database successfully.")
	}

	deleteThenCreateEmbeddingsTable(embeddingDimension)
}
