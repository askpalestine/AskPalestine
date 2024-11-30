package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var apiKey string

type embeddingRequest struct {
	Input      string `json:"input"`
	Model      string `json:"model"`
	Dimensions int    `json:"dimensions"`
}

type embeddingResponse struct {
	Object string `json:"object"`
	Data   []struct {
		Object    string    `json:"object"`
		Index     int       `json:"index"`
		Embedding []float64 `json:"embedding"`
	} `json:"data"`
	Model string `json:"model"`
	Usage struct {
		PromptTokens int `json:"prompt_tokens"`
		TotalTokens  int `json:"total_tokens"`
	} `json:"usage"`
}

type embeddingErrorResponse struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func getEmbedding(ctx context.Context, text string, dimensions int) ([]float64, error) {
	body := embeddingRequest{
		Input:      text,
		Dimensions: dimensions,
		Model:      "text-embedding-3-small",
	}

	reqBodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("Error marshaling request body for text %v: %v", text, err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/embeddings", bytes.NewBuffer(reqBodyBytes))
	if err != nil {
		return nil, fmt.Errorf("Error creating request for text %v: %v", text, err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	// Create an HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Error sending request with body %+v: %v", body, err)
	}
	defer resp.Body.Close()

	respBodyBytes, err := ioutil.ReadAll(resp.Body)

	var errorResp embeddingErrorResponse
	if err := json.Unmarshal(respBodyBytes, &errorResp); err == nil {
		// If there is an error message, return it as an error
		if errorResp.Error.Message != "" {
			return nil, fmt.Errorf("OpenAI error: %s", errorResp.Error.Message)
		}
	}

	var embeddingResp embeddingResponse
	if err := json.Unmarshal(respBodyBytes, &embeddingResp); err != nil {
		return nil, fmt.Errorf("Error unmarshaling response for request %+v: %v", req, err)
	}

	return embeddingResp.Data[0].Embedding, nil
}

func init() {
	apiKey = os.Getenv("OPENAI_KEY")
	if apiKey == "" {
		log.Fatal("OPENAI_KEY environment variable is required")
	}
}
