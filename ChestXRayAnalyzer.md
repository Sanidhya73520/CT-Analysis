## 🤖 Machine Learning Backend

The **MedX Chest X-Ray Analyzer** uses a **deep learning model** to detect multiple chest conditions from X-ray images.

### 🔹 Model Architecture

* **Base Model:** DenseNet121 (pretrained on ImageNet)
* **Type:** Convolutional Neural Network (CNN) for multi-label classification
* **Input:** 256×256 RGB chest X-ray images
* **Output:** Probabilities for 15 chest conditions (including *No Finding*)

### 🔹 Preprocessing

1. Image is resized to **256×256 pixels**
2. Converted to a NumPy array and normalized to **\[0, 1]**
3. Expanded to **batch size 1** for model prediction

### 🔹 Prediction & Confidence

* The model outputs **probabilities for each condition**.
* A **threshold** (default 0.3) determines which findings are reported.
* Findings are mapped to **severity indicators** in the frontend (high, medium, low).

### 🔹 Explainable AI (XAI)

* Uses **Grad-CAM** to highlight important regions influencing the model’s predictions
* Generates **heatmaps** superimposed on original X-rays for visual explanation
* Helps clinicians understand **why the AI flagged certain abnormalities**

### 🔹 Integration

* Python backend handles **image preprocessing, prediction, and heatmap generation**
* Can be connected to the frontend via a **REST API** for real-time analysis

---

**Summary:**
The backend leverages a **CNN-based DenseNet121** for multi-label chest X-ray classification, with **probabilistic confidence scoring** and **Grad-CAM visualization** for explainability.
