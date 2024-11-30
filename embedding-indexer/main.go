package main

import (
	"context"
	"flag"
	"log"
)

const embeddingDimension = 1536

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	flag.Parse()
}

func main() {
	ctx := context.Background()

	initDB(embeddingDimension)

	questions := getQuestions(ctx)

	for _, q := range questions {
		// To not waste OpenAI quota, we should check if the embedding already exists
		exist, err := embeddingExists(ctx, q)
		if err != nil {
			log.Printf("Error checking if embedding exists for question %+v: %v", q, err)
		}
		if exist {
			log.Printf("Embedding already exists for question %+v", q)
			continue
		}

		embedding, err := getEmbedding(ctx, q.questionForm, embeddingDimension)
		if err != nil {
			log.Printf("Error getting embedding for question %v: %v", q.questionForm, err)
			continue
		}

		if err := insertQuestionEmbedding(ctx, q, embedding); err != nil {
			log.Printf("Error inserting embedding for question %v: %v", q.questionForm, err)
			continue
		}

		log.Println("Inserted embedding for question", q.questionForm)
	}
}
