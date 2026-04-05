# Module 04 — Visual Data Exploration & Quality

## Domain Weighting: 25%

## Objective
Master the core data exploration and quality workflows that make FiftyOne indispensable: filtering and slicing datasets with ViewStages, identifying label errors, detecting duplicates, analyzing class distributions, and using FiftyOne Brain for embedding-based insights. This is where FiftyOne delivers the most value and where exam questions will hit hardest.

## Task Statements Covered
- 4.1: Use ViewStages to filter, sort, match, and slice datasets
- 4.2: Identify and resolve label errors using confidence-based analysis
- 4.3: Detect and remove duplicate and near-duplicate images
- 4.4: Analyze class distributions and identify dataset imbalances
- 4.5: Use FiftyOne Brain for embedding visualization and data insights

## Why This Matters

Data quality is the single largest lever in AI performance. Research consistently shows that cleaning and curating training data produces bigger accuracy gains than architecture changes, hyperparameter tuning, or longer training runs. Yet most teams spend 80% of their effort on model code and 20% on data — the inverse of what actually moves the needle.

This module covers the workflows that flip that ratio. ViewStages give you surgical precision in isolating the data that matters. Label error detection catches the mistakes that silently poison your model. Duplicate detection eliminates the redundancy that wastes compute and biases evaluation. Class distribution analysis reveals the imbalances that cause models to ignore minority classes. And FiftyOne Brain brings embedding-level intelligence to all of these tasks.

If you only master one domain in this certification, make it this one. Everything else supports what happens here.

---

## Key Concepts

### 4.1 ViewStages: Filtering, Sorting, Matching, and Slicing

**Plain Language:**
ViewStages are the query language of FiftyOne. Every time you want to look at a subset of your data — images with low-confidence predictions, samples from a specific camera, only images that have detections — you chain ViewStages together to create a DatasetView. A view is a filtered window into your dataset. It doesn't copy or modify the underlying data; it defines which samples you see and how they're ordered.

Think of ViewStages like a SQL WHERE clause, but designed specifically for visual data and nested label structures. The key ViewStages you need to know:

- **`match()`** — filter samples by a condition on sample-level fields
- **`filter_labels()`** — filter individual labels within samples (not the samples themselves)
- **`sort_by()`** — order samples by any field
- **`limit()`** — take the first N samples from a view
- **`exists()`** — keep only samples that have a value for a given field
- **`select_fields()`** — restrict which fields are loaded (performance optimization)
- **`exclude()`** — remove specific samples by ID
- **`skip()`** — skip the first N samples (pagination)
- **`shuffle()`** — randomize sample order

**How It Works:**

```python
import fiftyone as fo
from fiftyone import ViewField as F

dataset = fo.load_dataset("my_detection_dataset")

# Match: samples with more than 5 ground truth detections
crowded_scenes = dataset.match(F("ground_truth.detections").length() > 5)

# Filter labels: only keep detections with confidence > 0.8
high_conf = dataset.filter_labels("predictions", F("confidence") > 0.8)

# Sort by number of detections (descending) and take the top 50
busiest = dataset.sort_by(
    F("ground_truth.detections").length(), reverse=True
).limit(50)

# Samples that have model predictions (field exists)
evaluated = dataset.exists("predictions")

# Chain ViewStages together: match, then sort, then limit
pipeline = (
    dataset
    .match(F("metadata.width") > 1920)
    .sort_by("filepath")
    .limit(100)
    .select_fields(["ground_truth", "predictions"])
)

# Launch App to see the view
session = fo.launch_app(view=pipeline)
```

ViewStages are lazy — they define a computation but don't execute it until you iterate over the view or display it. This means chaining ten stages costs no more than chaining one until you actually access the data. The `ViewField` class (`F`) lets you reference nested fields using dot notation: `F("predictions.detections.label")` reaches into the label of each detection within the predictions field.

A critical distinction: `match()` filters at the **sample** level (include or exclude entire images), while `filter_labels()` filters at the **label** level (keep the image but remove specific annotations from it). Confusing these two is a common exam trap.

**Real-World Example:**
An autonomous driving team has 2 million frames with object detections. A safety review requires them to find every frame where a pedestrian was detected with confidence between 0.3 and 0.7 — the "uncertainty zone" where the model might miss a real person. They chain `match()` to select highway frames, then `filter_labels()` to isolate pedestrian detections in that confidence range, then `sort_by("confidence")` to prioritize review from lowest confidence up. What would be a multi-hour database query becomes three lines of Python.

**Lean AI Sigma Connection:**
ViewStages are **process stratification**. In statistical quality control, stratification means separating data into meaningful subgroups to reveal patterns hidden in aggregate data. A factory's overall defect rate might be 2%, but stratifying by shift reveals that the night shift runs at 5% while the day shift runs at 0.5%. ViewStages let you stratify your AI data the same way — by confidence, by class, by source, by metadata — to find the subgroups where quality is breaking down.

---

### 4.2 Finding and Resolving Label Errors

**Plain Language:**
Label errors are annotations that are wrong — a "dog" labeled as "cat," a bounding box that misses half the object, a "benign" pathology slide that's actually malignant. These errors are pervasive. Academic research has found label error rates of 3-10% in major public datasets like ImageNet, CIFAR, and COCO. In enterprise datasets with less rigorous annotation pipelines, rates of 10-20% are common.

Label errors are dangerous because they corrupt your model in two directions. Errors in training data teach the model wrong patterns. Errors in evaluation data give you false confidence in model performance. FiftyOne's approach to finding label errors is practical: use your model's predictions as a second opinion on your annotations. Where the model strongly disagrees with the label, there's likely an error — sometimes in the model's prediction, sometimes in the annotation.

**How It Works:**

```python
import fiftyone as fo
from fiftyone import ViewField as F

dataset = fo.load_dataset("my_classification_dataset")

# Step 1: Run your model and store predictions
# (assume predictions are already added as a "predictions" field)

# Step 2: Find samples where the model's top prediction
# disagrees with the ground truth label
mismatches = dataset.match(
    F("predictions.label") != F("ground_truth.label")
)

# Step 3: Among mismatches, sort by model confidence (descending)
# High-confidence disagreements are the most likely label errors
likely_errors = mismatches.sort_by(
    "predictions.confidence", reverse=True
)

# Step 4: View the top 200 most suspicious samples
session = fo.launch_app(view=likely_errors.limit(200))

# For detection tasks: find low-confidence predictions that
# might indicate missed annotations
low_conf_detections = dataset.filter_labels(
    "predictions", F("confidence") < 0.4
)

# Use evaluation results to find specific error types
results = dataset.evaluate_detections(
    "predictions",
    gt_field="ground_truth",
    eval_key="eval"
)

# Find false positives — model predicted something that
# doesn't exist in ground truth
false_positives = dataset.match(
    F("eval_fp") > 0
).sort_by("eval_fp", reverse=True)

# Find false negatives — ground truth objects the model missed
false_negatives = dataset.match(
    F("eval_fn") > 0
).sort_by("eval_fn", reverse=True)
```

The confidence-based approach works because a well-trained model that confidently predicts "car" on an image labeled "truck" is often right — the annotator may have used the wrong label. Conversely, when the model gives a low-confidence correct prediction, the image might be genuinely ambiguous and worth reviewing for annotation consistency.

**Real-World Example:**
A medical imaging startup trained a skin lesion classifier on 80,000 dermatologist-annotated images. Before deploying, they ran the model's predictions back through FiftyOne and sorted mismatches by confidence. In the top 500 most confident disagreements, they found 312 genuine annotation errors — including 23 malignant lesions labeled as benign. Those 23 errors, left uncorrected, would have trained the model to sometimes classify cancer as healthy tissue. The 30 minutes spent reviewing in FiftyOne potentially prevented misdiagnoses.

**Lean AI Sigma Connection:**
This is **error-proofing** (poka-yoke). In Lean manufacturing, you design systems that catch defects before they propagate downstream. Using model predictions to cross-check annotations is a poka-yoke for the data pipeline — it creates an automated checkpoint that flags potential defects before they reach the training process. The key insight is the same in both domains: catching a defect at the source costs a fraction of catching it in production.

---

### 4.3 Detecting and Removing Duplicates

**Plain Language:**
Duplicate and near-duplicate images in a dataset cause two problems. First, they inflate your dataset size without adding information — you're paying compute costs to train on redundant data. Second, if duplicates end up in both your training and evaluation splits, your evaluation metrics are artificially inflated. The model appears to perform well on "new" test images that are actually copies of training images.

Exact duplicates (identical files) are easy to find with file hashing. Near-duplicates — images that are slightly cropped, resized, color-adjusted, or taken a fraction of a second apart — are harder. FiftyOne handles both cases, using embeddings for near-duplicate detection.

**How It Works:**

```python
import fiftyone as fo
import fiftyone.brain as fob

dataset = fo.load_dataset("my_dataset")

# Method 1: Exact duplicates via file hash
import fiftyone.utils.data as foud
from collections import Counter

# Compute file hashes
dataset.compute_metadata()
filepaths = dataset.values("filepath")

# Find exact duplicates using FiftyOne's utilities
filehash_counts = Counter(dataset.values("metadata.mime_type"))

# Method 2: Near-duplicates via embeddings (recommended)
# First, compute similarity index using embeddings
fob.compute_similarity(
    dataset,
    model="clip-vit-base32-torch",    # embedding model
    brain_key="img_sim",               # key to store results
)

# Find near-duplicate pairs within a threshold
# Lower threshold = stricter matching
results = dataset.sort_by_similarity(
    dataset.first().id,
    brain_key="img_sim",
    k=10,  # top-10 most similar
)

# Use the similarity results to find duplicates
# across the entire dataset
dup_view = fob.compute_exact_duplicates(dataset)

# For near-duplicates with the similarity index:
# retrieve neighbors for every sample and flag groups
sim_results = dataset.load_brain_results("img_sim")

# Find duplicate groups with a similarity threshold
import numpy as np
from fiftyone import ViewField as F

# Tag near-duplicates for review
# (threshold depends on your use case; 0.95+ often works)
for sample in dataset.iter_samples(progress=True):
    similar = dataset.sort_by_similarity(
        sample.id,
        brain_key="img_sim",
        k=5,
    )
    # Check if any neighbor is too similar
    # Then tag or remove as needed
```

The embedding-based approach works because image embeddings capture semantic content. Two images of the same scene from slightly different angles will have nearly identical embeddings even though every pixel is different. The CLIP model is commonly used because it produces high-quality general-purpose embeddings without requiring task-specific training.

**Real-World Example:**
A drone survey company collected 1.2 million aerial images across 50 flights for a crop monitoring project. Due to overlapping flight paths and camera burst mode, an estimated 30% of images were near-duplicates. Loading the dataset into FiftyOne, computing CLIP embeddings, and running similarity analysis identified 340,000 near-duplicate images. Removing them reduced training time by 28% and, more importantly, fixed an evaluation leak that had been inflating their accuracy metric by 6 percentage points.

**Lean AI Sigma Connection:**
Duplicate detection is **muda elimination** — specifically, the waste of overprocessing. Processing the same image twice (or five times) in training adds cost without value. In Lean terms, it's like machining the same part multiple times on the production line. The evaluation split contamination is even worse — it's analogous to quality inspection theater, where you test units you already know pass instead of testing genuinely new units. Removing duplicates eliminates both forms of waste simultaneously.

---

### 4.4 Class Distribution Analysis

**Plain Language:**
Class imbalance is one of the most common dataset problems. If your object detection dataset has 50,000 "car" annotations and 200 "bicycle" annotations, your model will learn to detect cars and effectively ignore bicycles. This is a data problem, not a model problem, and it needs to be understood before you choose a mitigation strategy (oversampling, class weights, data augmentation, or collecting more minority-class data).

FiftyOne makes class distribution analysis visual and interactive. Instead of writing aggregation queries and staring at numbers in a terminal, you can see the distribution and immediately drill into the underrepresented classes.

**How It Works:**

```python
import fiftyone as fo
from fiftyone import ViewField as F

dataset = fo.load_dataset("my_detection_dataset")

# Count annotations per class
counts = dataset.count_values("ground_truth.detections.label")
print(counts)
# Output: {'car': 48521, 'truck': 12340, 'person': 31200,
#           'bicycle': 187, 'motorcycle': 423, ...}

# Visualize in the App — the sidebar shows distributions automatically
session = fo.launch_app(dataset)

# Isolate the underrepresented class for review
bicycles_only = dataset.filter_labels(
    "ground_truth",
    F("label") == "bicycle"
).match(
    F("ground_truth.detections").length() > 0
)
print(f"Samples with bicycles: {len(bicycles_only)}")

# Compare label distributions across splits
for split in ["train", "val", "test"]:
    split_view = dataset.match_tags(split)
    split_counts = split_view.count_values(
        "ground_truth.detections.label"
    )
    print(f"\n{split} split distribution:")
    for label, count in sorted(
        split_counts.items(), key=lambda x: x[1], reverse=True
    ):
        print(f"  {label}: {count}")

# Find classes that appear in fewer than N samples
rare_classes = [
    label for label, count in counts.items()
    if count < 500
]
print(f"Rare classes (< 500 annotations): {rare_classes}")

# View all samples containing any rare class
from functools import reduce
import operator

rare_view = dataset.match(
    F("ground_truth.detections.label").contains(rare_classes)
)

# Histogram of annotations per sample
import matplotlib.pyplot as plt

num_dets = dataset.values(
    F("ground_truth.detections").length()
)
plt.hist(num_dets, bins=50)
plt.xlabel("Number of detections per image")
plt.ylabel("Count")
plt.title("Detection Density Distribution")
plt.show()
```

Beyond simple class counts, you should also check: (1) whether the distribution is consistent across train/val/test splits, (2) whether rare classes appear in diverse enough contexts (100 bicycle images all from the same intersection is not the same as 100 bicycle images from varied scenes), and (3) whether co-occurrence patterns are realistic (do certain classes always appear together in ways that might create spurious correlations).

**Real-World Example:**
A retail AI company building a product recognition model discovered through FiftyOne analysis that their "organic produce" class had 15,000 annotations — seemingly sufficient. But drilling into the data revealed that 14,200 of those annotations came from a single store with identical lighting. The model had learned to recognize that store's lighting, not organic produce. Class distribution was numerically balanced but contextually skewed. Without visual exploration, the numerical count alone would have masked this critical issue.

**Lean AI Sigma Connection:**
Class distribution analysis is **process capability analysis**. In Six Sigma, you measure whether a process is capable of meeting specifications across the full range of operating conditions. A model trained on imbalanced data is like a process that only works within a narrow range — it meets spec on the common case but fails on the tails. Understanding your class distribution is the first step toward building a process (model) that's capable across its full operating range. The contextual analysis — checking that the 15,000 samples are genuinely diverse — maps to verifying that your process capability holds across different conditions, not just in the lab.

---

### 4.5 FiftyOne Brain: Embedding Visualization and Data Insights

**Plain Language:**
FiftyOne Brain is a module of built-in analytical methods that use embeddings and machine learning to surface insights about your data that would be impossible to find through manual inspection. It includes:

- **`compute_visualization()`** — reduces high-dimensional embeddings to 2D/3D for visual clustering
- **`compute_uniqueness()`** — scores each sample by how unique it is relative to the rest of the dataset
- **`compute_similarity()`** — creates an index for finding similar images to any query sample

These methods turn abstract mathematical representations into visual, actionable insights. Instead of looking at images one by one, you can see your entire dataset as a point cloud where similar images cluster together, outliers stand alone, and data gaps become visible.

**How It Works:**

```python
import fiftyone as fo
import fiftyone.brain as fob

dataset = fo.load_dataset("my_dataset")

# --- Visualization: see your dataset as a 2D point cloud ---
fob.compute_visualization(
    dataset,
    model="clip-vit-base32-torch",
    brain_key="img_viz",
    method="umap",           # dimensionality reduction method
    num_dims=2,              # 2D for plotting
)

# Open the App — the Embeddings panel shows the visualization
session = fo.launch_app(dataset)

# --- Uniqueness: find the most and least unique samples ---
fob.compute_uniqueness(
    dataset,
    model="clip-vit-base32-torch",
    brain_key="img_uniqueness",
)

# Each sample now has a "uniqueness" field (0 to 1)
# Low uniqueness = many similar images exist in the dataset
# High uniqueness = this image is unlike anything else

# View the least unique samples (redundancy candidates)
redundant = dataset.sort_by("uniqueness").limit(100)
session.view = redundant

# View the most unique samples (potential outliers or rare cases)
outliers = dataset.sort_by("uniqueness", reverse=True).limit(100)
session.view = outliers

# --- Similarity: find images like a reference image ---
fob.compute_similarity(
    dataset,
    model="clip-vit-base32-torch",
    brain_key="img_sim",
)

# Find the 20 most similar images to a specific sample
query_id = dataset.first().id
similar_view = dataset.sort_by_similarity(
    query_id,
    brain_key="img_sim",
    k=20,
)
session.view = similar_view

# Text-based similarity search (CLIP supports text queries)
text_similar = dataset.sort_by_similarity(
    "a photo of a dog playing in snow",
    brain_key="img_sim",
    k=25,
)
session.view = text_similar
```

The embedding visualization is particularly powerful in the App's Embeddings panel. Each point represents one image. Points that are close together are semantically similar. You can color-code points by class label, prediction correctness, confidence, or any other field. This reveals patterns like: clusters where ground truth and prediction labels disagree (potential label errors), isolated points far from any cluster (outliers or data entry errors), dense clusters with few unique images (redundancy), and empty regions between clusters (data gaps that may cause model uncertainty).

**Real-World Example:**
A wildlife conservation team had 300,000 camera trap images classified into 45 species. Their model performed well on aggregate metrics (91% accuracy) but failed on several species in production. Using `compute_visualization()` colored by prediction correctness, they saw that three species formed overlapping clusters in embedding space — the model couldn't reliably separate them because the images were genuinely similar (three subspecies of the same genus). They addressed this by collecting more training data with diagnostic features visible, and by merging the three subspecies into a single class for initial classification with a specialized sub-classifier downstream. Without the embedding visualization, they would have continued tuning hyperparameters on an architecturally unsolvable problem.

Using `compute_uniqueness()`, they also discovered that 40,000 images were near-identical nighttime shots of empty scenes triggered by wind movement. These contributed no learning signal but slowed training by 13%. Removing them improved both training speed and model accuracy (by eliminating a noise class that was absorbing model capacity).

**Lean AI Sigma Connection:**
FiftyOne Brain methods are the **measurement system analysis (MSA)** of visual AI. In Six Sigma, before you can improve a process, you must verify that your measurement system is capable — that you're measuring what you think you're measuring with sufficient precision and accuracy. Embedding visualization is MSA for your dataset: it reveals whether your classes are actually separable (measurement precision), whether your labels are consistent (measurement accuracy), and whether your data covers the domain you need (measurement range). Uniqueness scoring identifies wasted measurement capacity — samples that add cost without adding information. Similarity indexing gives you the ability to trace any measurement back to its nearest neighbors, supporting root cause analysis when something goes wrong.

---

## Check Your Understanding

1. You have a detection dataset with both ground truth annotations and model predictions. You want to find images where the model predicted "pedestrian" with high confidence but the ground truth has no pedestrian annotation. Describe the ViewStage pipeline you would construct and explain whether you would use `match()` or `filter_labels()` at each step — and why.

2. Your team has computed CLIP embeddings and run `compute_visualization()` on a 100,000-image dataset. In the Embeddings panel, you notice a tight cluster of 2,000 points colored as "correct predictions" sitting far away from the main cluster of their class. What are three possible explanations for this pattern, and what would you investigate for each?

3. A colleague argues that removing all near-duplicate images from the training set is always the right move because it reduces waste. Describe a scenario where removing near-duplicates could actually hurt model performance, and explain what you would do instead of blanket removal.

## What's Next

Now that you can explore and assess data quality, Module 5 moves to model evaluation — comparing predictions against ground truth, computing metrics, and diagnosing model failure patterns using the exploration skills you built here.
