# Farm Help AI Backend

This Django backend provides API services for crop prediction, pest recognition, and other farming assistance features.

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Download model files:
   - Place `best.pt` (YOLOv5 model) in the project root directory
   - Place `cropmodel2.pkl` in the `ml_models` directory

5. Apply migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

- `/admin/` - Django admin interface
- `/api/` - Main API endpoints
- `/api/predict-crop/` - Crop recommendation endpoint
- `/api/detect-pest/` - Plant disease detection endpoint
- `/api/prediction-history/` - User prediction history
- `/users/token/` - Obtain JWT tokens
- `/users/register/` - Register new users

## Project Structure

- `api/` - Main API application
- `crop_prediction/` - Crop recommendation functionality
- `pest_recognition/` - Plant disease detection functionality  
- `users/` - User authentication and profiles
- `farm_help/` - Core farm assistance features
- `farm_help_project/` - Project settings and configuration

## Models

- YOLOv5 (best.pt): Used for plant disease detection
- Crop Recommendation Model (cropmodel2.pkl): Used for crop suggestions
