# Talking Figure

A web application that generates famous quotes from a person and speaks them out using Google's Generative AI and Text-to-Speech services.

## Features

-   Get famous quotes from any person.
-   Listen to the quotes spoken in different voices and languages.
-   Simple and intuitive web interface.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/talking-figure.git
    cd talking-figure
    ```

2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Create a `config.py` file and add your Google API key:
    ```python
    GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"
    ```

## Usage

1.  Run the application:
    ```bash
    uvicorn main:app --reload
    ```

2.  Open your browser and go to `http://127.0.0.1:8000`.

## Deployment

This application can be deployed to any platform that supports FastAPI applications, such as Vercel, Heroku, or Google App Engine.

## API Endpoints

-   `POST /api/quotes`: Get famous quotes from a person.
-   `GET /api/voices`: Get a list of available voices.
-   `POST /api/speak`: Generate speech from text.
