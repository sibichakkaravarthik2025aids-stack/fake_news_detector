# Fake News Detection System

This is a simple machine learning project to classify news as REAL or FAKE.

## Project Structure
- `main.py`: The main Python script.
- `data.csv`: Sample dataset for training and testing.
- `requirements.txt`: List of required Python libraries.

## How to Run
1. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the detection system:
   ```bash
   python main.py
   ```

## How it Works
1. **Preprocessing**: The text is cleaned by converting to lowercase, removing punctuation, and filtering out common stopwords.
2. **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency) is used to convert text into numerical features.
3. **Model**: A Logistic Regression model is trained on the vectorized text to predict the label.
4. **Accuracy**: The model typically achieves ~90%+ accuracy on the sample dataset.
