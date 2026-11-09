# 🎓 Student Mental Health Score Prediction

A Machine Learning project that predicts students' mental health scores based on their social media usage, lifestyle habits, academic activities, and stress levels.

The project uses **Random Forest Regression** as its primary prediction algorithm and compares its performance with Linear Regression. A FastAPI backend and web-based frontend provide an interactive prediction application.

# 📌 1. Project Overview

Social media has become an important part of students' daily lives. This project explores the relationship between social media usage, lifestyle habits, stress levels, and students' mental health scores.

The objective is to develop a supervised Machine Learning regression model that estimates a student's mental health score using relevant demographic, social media, and lifestyle features.

The trained model is integrated into a web application where users can enter student-related information and receive a predicted mental health score.

# 🎯 2. Project Objectives

- Perform Exploratory Data Analysis (EDA) on student social media and mental health data.
- Identify relationships between social media usage, lifestyle factors, and mental health scores.
- Clean and preprocess the dataset.
- Apply appropriate feature engineering and categorical encoding techniques.
- Develop and compare Linear Regression and Random Forest Regression models.
- Improve model parameters using RandomizedSearchCV.
- Evaluate model performance using regression evaluation metrics.
- Deploy the trained model using FastAPI.
- Develop an interactive frontend using HTML, CSS, and JavaScript.

# 📊 3. Dataset Description

**Dataset:** Student Social Media And Mental Health Impact.csv

The dataset contains:

- Total records: 5,000 students
- Original columns: 13
- Target variable: `Mental_Health_Score`

# Features

| Feature | Description |
|---|---|
| Age | Student's age |
| Gender | Student's gender |
| Country | Student's country |
| Academic_Level | Academic level |
| Most_Used_Platform | Most frequently used social media platform |
| Purpose_Of_Use | Purpose of using social media |
| Avg_Daily_Usage_Hours | Average daily social media usage |
| Daily_Unlocks | Number of daily device unlocks |
| Study_Hours | Daily study hours |
| Physical_Activity_Hours | Daily physical activity hours |
| Sleep_Hours_Per_Night | Hours of sleep per night |
| Stress_Level | Student's stress category |
| Mental_Health_Score | Target variable |

**Target variable:** `Mental_Health_Score`

The model predicts a continuous numerical score.

## 🔍 4. Exploratory Data Analysis (EDA)

Exploratory Data Analysis was performed to understand the dataset and identify patterns before model development.

The following analyses were performed:

- Dataset structure and statistical summary.
- Missing-value analysis.
- Duplicate-record identification.
- Target variable distribution.
- Correlation heatmap.
- Stress level versus mental health score.
- Social media usage versus mental health score.
- Sleep hours versus mental health score.
- Most-used social media platform distribution.
- Outlier detection using the Interquartile Range (IQR) method.
- Numerical feature skewness analysis.

Visualization libraries:
- Matplotlib
- Seaborn

## 🧹 5. Data Cleaning and Feature Engineering

The following preprocessing and feature engineering operations were implemented:

**1. Duplicate removal**

Duplicate records were identified and removed using `drop_duplicates()`.

**2. Handling unrealistic values**

Negative values in `Physical_Activity_Hours` were corrected using:

```python
df['Physical_Activity_Hours'] = (
    df['Physical_Activity_Hours'].clip(lower=0)
)
```

**3. Country grouping**

The dataset contains 111 unique country categories.

To reduce high cardinality:
- The 10 most frequent countries were retained.
- All remaining countries were grouped into an `Other` category.
- A new feature called `Grouped_country` was created.

This reduced the country categories to 11 groups.

**4. Skewness handling**

A logarithmic transformation using `log1p` was applied to `Study_Hours`.

## ⚙️ 6. Data Preprocessing

Different preprocessing techniques were applied according to the feature types.

| Feature type | Features | Technique |
|---|---|---|
| Skewed numerical | Study_Hours | Log transformation and StandardScaler |
| Numerical | Age, Avg_Daily_Usage_Hours, Physical_Activity_Hours, Sleep_Hours_Per_Night, Daily_Unlocks | StandardScaler |
| Ordinal categorical | Stress_Level | OrdinalEncoder |
| Nominal categorical | Gender, Academic_Level, Most_Used_Platform, Purpose_Of_Use, Grouped_country | OneHotEncoder |

### Encoding techniques

**Ordinal Encoding**

Stress levels were encoded according to their natural order:

- Low → 0
- Medium → 1
- High → 2
- Very High → 3

**One-Hot Encoding**

OneHotEncoder was used for categorical features without a natural ranking.

The preprocessing operations were combined using:

- `ColumnTransformer`
- `Pipeline`

This ensures that preprocessing and prediction are performed consistently.

## 🤖 7. Machine Learning Algorithms

This project implements two supervised regression algorithms.

### 1. Linear Regression

Linear Regression was implemented as the baseline model.

It estimates the relationship between input features and the continuous target variable.

### 2. Random Forest Regressor

Random Forest Regression was implemented as the primary Machine Learning algorithm.

It is an ensemble learning technique that combines predictions from multiple decision trees.

**Why Random Forest?**

- Captures nonlinear relationships.
- Handles interactions between multiple features.
- Combines multiple decision trees to generate predictions.
- Provides a flexible alternative to a linear regression model.

### Model Training

The dataset was divided using:

```python
train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42
)
```

- Training data: 70%
- Testing data: 30%
- Random state: 42

## 🔧 8. Hyperparameter Tuning

RandomizedSearchCV was used to identify suitable Random Forest hyperparameters.

### Search space

| Hyperparameter | Values |
|---|---|
| n_estimators | 100, 200, 300 |
| max_depth | 5, 10, 15 |
| min_samples_split | 2, 5, 10 |
| min_samples_leaf | 1, 2, 4 |

### RandomizedSearchCV configuration

```python
RandomizedSearchCV(
    estimator=rf_pipeline,
    param_distributions=param_grid,
    n_iter=15,
    cv=5,
    scoring='r2',
    random_state=42,
    n_jobs=-1
)
```

### Best parameters identified

```python
{
    'randomforest__n_estimators': 200,
    'randomforest__max_depth': 15,
    'randomforest__min_samples_split': 5,
    'randomforest__min_samples_leaf': 2
}
```

## 📈 9. Model Evaluation and Performance

The models were evaluated using the following regression metrics:

- **R² Score:** Measures how much variation in the target variable is explained by the model.
- **MAE (Mean Absolute Error):** Measures the average absolute difference between actual and predicted values.
- **RMSE (Root Mean Squared Error):** Measures prediction error while penalizing larger errors more heavily.

### Model comparison results

| Model | Training R² | Testing R² | MAE | RMSE |
|---|---:|---:|---:|---:|
| Linear Regression | 0.7237 | 0.7398 | 0.5362 | 0.6760 |
| Random Forest (Default) | 0.9809 | 0.8767 | 0.3480 | 0.4655 |
| Random Forest (Tuned) | 0.9547 | 0.8653 | 0.3685 | 0.4863 |

### Performance observations

- Random Forest outperformed Linear Regression on the test dataset.
- Default Random Forest achieved the highest test R² score of approximately 0.8767.
- Default Random Forest achieved the lowest MAE and RMSE.
- Hyperparameter tuning reduced the training R² score but did not improve test performance in this experiment.

**Note:** The saved model file in this repository is generated from the default Random Forest pipeline (`rf_pipeline`), not the tuned pipeline.

## 🚀 10. Application Development

The trained Machine Learning pipeline is integrated into a web application.

### Backend

**FastAPI**

- Loads the saved Machine Learning pipeline.
- Accepts student information through an API endpoint.
- Processes incoming prediction requests.
- Returns the predicted mental health score.

### Frontend

**HTML, CSS, JavaScript**

- Provides an interactive user interface.
- Accepts student-related inputs.
- Sends prediction requests to the FastAPI backend.
- Displays the predicted mental health score using a visual gauge.

### API Endpoint

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Welcome message |
| POST | `/predict` | Generate a mental health score prediction |

## 📁 11. Project Structure

```text
student_mental_health_prediction/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── Script.js
│
├── main.py
├── Mental_Health_Model.pkl
├── Mental_Health_Score_Prediction.ipynb
├── Student Social Media And Mental Health Impact.csv
├── README.md
└── .gitignore
```

## 💻 12. Installation and Execution

### Step 1: Clone the repository

```bash
git clone https://github.com/Umashankar925/student_mental_health_prediction.git
```

### Step 2: Navigate to the project directory

```bash
cd student_mental_health_prediction
```

### Step 3: Install the required dependencies

```bash
pip install fastapi uvicorn pandas numpy scikit-learn joblib
```

Use a compatible Scikit-learn version when loading the saved model, since serialized scikit-learn objects may not be compatible across different versions.

### Step 4: Start the FastAPI backend

```bash
python3 -m uvicorn main:app --host 127.0.0.1 --port 2200 --reload
```

### Step 5: Access the API

Backend:

```text
http://127.0.0.1:2200
```

Interactive API documentation:

```text
http://127.0.0.1:2200/docs
```

### Step 6: Open the frontend

Open the following file in your browser:

```text
frontend/index.html
```

Ensure that the FastAPI backend is running before submitting predictions.

## 🔮 13. Future Enhancements

- Experiment with additional regression algorithms.
- Improve model generalization through further experimentation.
- Add feature importance analysis.
- Improve prediction interface and visualizations.
- Deploy the application to a cloud platform.
- Add more robust input validation and error handling.

## ⚠️ 14. Disclaimer

This project is developed for educational and Machine Learning demonstration purposes.

The predicted mental health score is an estimate generated from the available dataset and trained model. It is not a clinical diagnosis and must not replace professional mental health assessment or advice.

## 👨‍💻 15. Author

**Umashankar**

GitHub: [Umashankar925](https://github.com/Umashankar925)

Project Repository: [Student Mental Health Score Prediction](https://github.com/Umashankar925/student_mental_health_prediction)