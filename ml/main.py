import keras.preprocessing as preprocess
import keras.models as models
import streamlit as st
import numpy as np
import keras as keras
import os
import traceback
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout

# Function to create a simple fallback model if the original model fails to load
def create_fallback_model(num_classes=38):
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

#Tensorflow Model Prediction
def model_prediction(test_image):
    try:
        model_path = './trained_model.keras'
        
        # Check if model exists
        if not os.path.exists(model_path):
            st.warning(f"Model file not found at: {model_path}")
            st.info("Using a fallback model. Note that predictions may not be accurate.")
            model = create_fallback_model()
        else:
            try:
                # Try loading with TensorFlow/Keras directly
                model = models.load_model(model_path, compile=False)
            except Exception as e:
                st.warning(f"Failed to load model with standard method: {str(e)}")
                st.info("Trying alternative loading method...")
                
                try:
                    # Try loading with safe mode disabled
                    model = models.load_model(model_path, compile=False, safe_mode=False)
                except Exception as e2:
                    st.warning(f"Alternative loading method also failed: {str(e2)}")
                    st.info("Using a fallback model. Note that predictions may not be accurate.")
                    model = create_fallback_model()
        
        # Process the image
        image = preprocess.image.image_utils.load_img(test_image, target_size=(128, 128))
        input_arr = preprocess.image.image_utils.img_to_array(image)
        # Normalize pixel values
        input_arr = input_arr / 255.0
        input_arr = np.array([input_arr]) #Convert single image to a batch
        
        # Make prediction
        prediction = model.predict(input_arr)
        result_index = np.argmax(prediction)
        return result_index
    except Exception as e:
        st.error(f"Error in model prediction: {str(e)}")
        st.error(traceback.format_exc())
        return -1

#Sidebar
st.sidebar.title("Dashboard")
app_mode = st.sidebar.selectbox("Select Page",["Home","About","Disease Recognition"])

#Home Page
if(app_mode=="Home"):
    st.header("PLANT DISEASE RECOGNITION SYSTEM")
    image_path = "home_page.jpeg"
    st.image(image_path,use_column_width=True)
    st.markdown("""
    Welcome to the Plant Disease Recognition System! 🌿🔍
    
    Our mission is to help in identifying plant diseases efficiently. Upload an image of a plant, and our system will analyze it to detect any signs of diseases. Together, let's protect our crops and ensure a healthier harvest!

    ### How It Works
    1. **Upload Image:** Go to the **Disease Recognition** page and upload an image of a plant with suspected diseases.
    2. **Analysis:** Our system will process the image using advanced algorithms to identify potential diseases.
    3. **Results:** View the results and recommendations for further action.

    ### Why Choose Us?
    - **Accuracy:** Our system utilizes state-of-the-art machine learning techniques for accurate disease detection.
    - **User-Friendly:** Simple and intuitive interface for seamless user experience.
    - **Fast and Efficient:** Receive results in seconds, allowing for quick decision-making.

    ### Get Started
    Click on the **Disease Recognition** page in the sidebar to upload an image and experience the power of our Plant Disease Recognition System!

    ### About Us
    Learn more about the project, our team, and our goals on the **About** page.
""")

#About Page
elif(app_mode=="About"):
    st.header("About")
    st.markdown("""
    #### About Dataset
    This dataset is recreated using offline augmentation from the original dataset. The original dataset can be found on this github repo. This dataset consists of about 87K rgb images of healthy and diseased crop leaves which is categorized into 38 different classes. The total dataset is divided into 80/20 ratio of training and validation set preserving the directory structure. A new directory containing 33 test images is created later for prediction purpose.
    #### Content
    1. Train (70295 images)
    2. Valid (17572 image)
    3. Test (33 images)
""")
    
#Prediction Page
elif(app_mode=="Disease Recognition"):
    st.header("Disease Recognition")
    test_image = st.file_uploader("Choose an Image:")
    if(st.button("Show Image")):
        if test_image is not None:
            st.image(test_image,use_column_width=True)
        else:
            st.warning("Please upload an image first.")
    #Predict Button
    if(st.button("Predict")):
        if test_image is None:
            st.warning("Please upload an image before prediction.")
        else:
            with st.spinner("Please Wait.."):
                st.write("Our Prediction")
                result_index = model_prediction(test_image)
                if result_index >= 0:
                    #Define Class
                    class_name = ['Apple___Apple_scab',
                    'Apple___Black_rot',
                    'Apple___Cedar_apple_rust',
                    'Apple___healthy',
                    'Blueberry___healthy',
                    'Cherry_(including_sour)___Powdery_mildew',
                    'Cherry_(including_sour)___healthy',
                    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
                    'Corn_(maize)___Common_rust_',
                    'Corn_(maize)___Northern_Leaf_Blight',
                    'Corn_(maize)___healthy',
                    'Grape___Black_rot',
                    'Grape___Esca_(Black_Measles)',
                    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
                    'Grape___healthy',
                    'Orange___Haunglongbing_(Citrus_greening)',
                    'Peach___Bacterial_spot',
                    'Peach___healthy',
                    'Pepper,_bell___Bacterial_spot',
                    'Pepper,_bell___healthy',
                    'Potato___Early_blight',
                    'Potato___Late_blight',
                    'Potato___healthy',
                    'Raspberry___healthy',
                    'Soybean___healthy',
                    'Squash___Powdery_mildew',
                    'Strawberry___Leaf_scorch',
                    'Strawberry___healthy',
                    'Tomato___Bacterial_spot',
                    'Tomato___Early_blight',
                    'Tomato___Late_blight',
                    'Tomato___Leaf_Mold',
                    'Tomato___Septoria_leaf_spot',
                    'Tomato___Spider_mites Two-spotted_spider_mite',
                    'Tomato___Target_Spot',
                    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
                    'Tomato___Tomato_mosaic_virus',
                    'Tomato___healthy']
                    st.success("Model is Predicting it's a {}".format(class_name[result_index]))
                else:
                    st.error("Failed to make prediction. Please check the logs for details.")
