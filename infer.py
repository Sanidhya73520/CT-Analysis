# skolyn_inference.py
import os
import numpy as np
import cv2
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import load_model, Model

# ======================================================
# CONFIGURATION
# ======================================================
MASTER_FINDINGS = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion',
    'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'Nodule',
    'Pleural_Thickening', 'Pneumonia', 'Pneumothorax', 'No Finding'
]

IMG_SIZE = (256, 256)
CHECKPOINT_PATH = "skolyn_comprehensive_chest_model_v1.h5"  # Your trained model file

# ======================================================
# LOAD MODEL
# ======================================================
print("Loading model...")
model = load_model(CHECKPOINT_PATH, compile=False)
print("Model loaded successfully!")

# ======================================================
# IMAGE PREPROCESSING
# ======================================================
def preprocess_single_image(img_path, target_size=(256, 256)):
    """Loads and preprocesses a single image."""
    if not os.path.exists(img_path):
        print(f"❌ ERROR: File not found - {img_path}")
        return None, None

    img = cv2.imread(img_path)
    if img is None:
        print(f"❌ ERROR: Could not read the image - {img_path}")
        return None, None

    img_resized = cv2.resize(img, target_size)
    img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array, img

# ======================================================
# GRAD-CAM FUNCTIONS
# ======================================================
def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index):
    grad_model = Model(model.inputs, [model.get_layer(last_conv_layer_name).output, model.output])
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        class_channel = preds[:, pred_index]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def superimpose_gradcam(original_img, heatmap, alpha=0.5):
    heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    superimposed_img = heatmap * alpha + original_img
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    return superimposed_img

# ======================================================
# MASTER REPORTING FUNCTION
# ======================================================
def generate_skolyn_comprehensive_report(image_path, model, threshold=0.3):
    """Generates a full diagnostic report for a single chest X-ray image."""
    img_array, original_img = preprocess_single_image(image_path, target_size=IMG_SIZE)
    if img_array is None:
        return

    predictions = model.predict(img_array)[0]
    detected_findings = {
        MASTER_FINDINGS[i]: pred for i, pred in enumerate(predictions)
        if pred > threshold and MASTER_FINDINGS[i] != 'No Finding'
    }

    # === TEXTUAL REPORT ===
    print("=" * 60)
    print("      💙MedX DIAGNOSTIC REPORT")
    print("=" * 60)
    print(f"Image File: {os.path.basename(image_path)}\n")
    print("--- PRIMARY FINDINGS (Prob > {:.0f}%) ---".format(threshold * 100))

    if not detected_findings:
        no_finding_prob = predictions[MASTER_FINDINGS.index('No Finding')]
        print(" - No significant pathological findings detected.")
        print(f"   (Confidence for 'No Finding': {no_finding_prob * 100:.2f}%)")
    else:
        for finding, confidence in detected_findings.items():
            print(f" - {finding.replace('_', ' ')}: Detected "
                  f"(Confidence: {confidence * 100:.2f}%)")

    # === VISUAL REPORT ===
    print("\n--- VISUAL EXPLANATION (XAI HEATMAPS) ---")
    last_conv_layer_name = 'conv5_block16_concat'  # Last conv layer of DenseNet121

    num_plots = len(detected_findings) if detected_findings else 1
    fig, axes = plt.subplots(1, num_plots + 1, figsize=(6 * (num_plots + 1), 6))

    if not isinstance(axes, np.ndarray): 
        axes = [axes]  # Handle single case

    # Original Image
    axes[0].imshow(cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB))
    axes[0].set_title("Original X-Ray")
    axes[0].axis('off')

    if not detected_findings:
        axes[1].imshow(cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB))
        axes[1].set_title("Result: Normal")
        axes[1].axis('off')
    else:
        plot_idx = 1
        for finding in detected_findings.keys():
            finding_index = MASTER_FINDINGS.index(finding)
            heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name, finding_index)
            superimposed_img = superimpose_gradcam(original_img, heatmap)
            axes[plot_idx].imshow(cv2.cvtColor(superimposed_img, cv2.COLOR_BGR2RGB))
            axes[plot_idx].set_title(f"XAI: {finding.replace('_', ' ')}")
            axes[plot_idx].axis('off')
            plot_idx += 1

    plt.tight_layout()
    plt.show()

# ======================================================
# USAGE
# ======================================================
if __name__ == "__main__":
    # 🔽 Replace this with your own image path
    image_path = "person21_virus_52.jpeg"

    generate_skolyn_comprehensive_report(image_path, model, threshold=0.3)
