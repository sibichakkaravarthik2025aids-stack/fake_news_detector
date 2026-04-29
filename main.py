# Fake News Detection System - Python Implementation
# Requirements: pandas, numpy, scikit-learn, nltk

import pandas as pd
import numpy as np
import re
import string
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import nltk
from nltk.corpus import stopwords

# Download NLTK stopwords
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    """
    Preprocess the text: lowercase, remove punctuation, remove stopwords.
    """
    # Convert to lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    # Remove stopwords
    words = text.split()
    words = [w for w in words if w not in stop_words]
    return " ".join(words)

def train_model(csv_path):
    # 1. Load the dataset
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # 2. Preprocess the text
    print("Preprocessing text...")
    df['clean_text'] = df['text'].apply(preprocess_text)
    
    # 3. Convert text into numerical features using TF-IDF
    print("Vectorizing text...")
    tfidf = TfidfVectorizer(max_features=5000)
    X = tfidf.fit_transform(df['clean_text'])
    y = df['label']
    
    # 4. Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 5. Train a Machine Learning model (Logistic Regression)
    print("Training model...")
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # 6. Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return model, tfidf

def predict_news(model, tfidf):
    print("\n--- Fake News Detection System ---")
    user_input = input("Enter the news text to check: ")
    
    # Preprocess and vectorize user input
    clean_input = preprocess_text(user_input)
    vectorized_input = tfidf.transform([clean_input])
    
    # Predict
    prediction = model.predict(vectorized_input)[0]
    
    print(f"\nResult: The news is predicted to be {prediction}")

if __name__ == "__main__":
    try:
        # Train the model using the sample data
        model, tfidf = train_model('data.csv')
        
        # Start the console interaction
        while True:
            predict_news(model, tfidf)
            cont = input("\nDo you want to check another news? (y/n): ")
            if cont.lower() != 'y':
                break
    except FileNotFoundError:
        print("Error: data.csv not found. Please ensure the dataset is in the same directory.")
    except Exception as e:
        print(f"An error occurred: {e}")
