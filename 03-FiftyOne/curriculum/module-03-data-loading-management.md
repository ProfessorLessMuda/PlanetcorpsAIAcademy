# Module 03 — Data Loading & Management

## Domain Weighting: 20%

## Objective
Learn how to get visual data into FiftyOne from any source — local directories, industry-standard annotation formats, and curated benchmark datasets — and how to enrich, organize, and export that data for downstream training pipelines.

## Task Statements Covered
- 3.1: Load images from local directories into FiftyOne datasets
- 3.2: Import datasets in standard formats (COCO, VOC, YOLO, CSV)
- 3.3: Use FiftyOne Zoo to load benchmark datasets
- 3.4: Add and manage custom fields, tags, and metadata on samples
- 3.5: Export datasets in various formats for training pipelines

## Why This Matters

The most common failure mode in computer vision projects is not a bad model — it is bad data management. Teams accumulate images across network drives, annotation exports sit in inconsistent formats, and nobody knows which version of the dataset was used for which experiment. When a model underperforms, the debugging conversation becomes "which data did we actually train on?" rather than "what went wrong."

FiftyOne's data loading and management layer solves this by giving you a single, programmatic entry point for any visual dataset regardless of where it came from or how it was annotated. Whether your images are in a flat directory, exported from CVAT in COCO format, or pulled from a benchmark zoo, they end up in the same unified structure — browsable, filterable, and traceable. For business leaders, this means reproducibility and audit trails. For builders, this means less time writing data wrangling scripts and more time on actual analysis.

---

## Key Concepts

### 3.1 Loading Images from Local Directories

**Plain Language:**
The most basic operation in FiftyOne is pointing it at a folder of images and saying "make this a dataset." FiftyOne scans the directory, creates one sample per image file, and stores the file paths and basic metadata in its database. No annotations required — you can start exploring immediately and add labels later.

**How It Works:**
FiftyOne provides `fo.Dataset.from_dir()` as the primary method for directory-based loading. You specify the directory path and the dataset type. For unlabeled images, use `fo.types.ImageDirectory`.

```python
import fiftyone as fo

# Load all images from a flat directory
dataset = fo.Dataset.from_dir(
    dataset_dir="/data/inspection_photos",
    dataset_type=fo.types.ImageDirectory,
    name="plant-inspection-q1"
)

print(dataset)
# Name:        plant-inspection-q1
# Media type:  image
# Num samples: 4,237
# Sample fields:
#     id:       fiftyone.core.fields.ObjectIdField
#     filepath: fiftyone.core.fields.StringField
#     metadata: fiftyone.core.fields.EmbeddedDocumentField(fiftyone.core.metadata.ImageMetadata)
#     tags:     fiftyone.core.fields.ListField(fiftyone.core.fields.StringField)
```

For labeled datasets in directory-tree format (where subdirectory names represent classes), use `fo.types.ImageClassificationDirectoryTree`:

```python
# Directory structure:
# /data/defects/
#   crack/
#     img001.jpg
#     img002.jpg
#   scratch/
#     img003.jpg
#   good/
#     img004.jpg

dataset = fo.Dataset.from_dir(
    dataset_dir="/data/defects",
    dataset_type=fo.types.ImageClassificationDirectoryTree,
    name="defect-classification"
)

# Each sample now has a "ground_truth" field with the class label
sample = dataset.first()
print(sample.ground_truth)
# <Classification: {'label': 'crack', 'confidence': None, ...}>
```

You can also build datasets sample by sample for maximum control:

```python
dataset = fo.Dataset(name="manual-load")

for filepath in glob.glob("/data/images/*.png"):
    sample = fo.Sample(filepath=filepath)
    dataset.add_sample(sample)

# Or add multiple samples at once (faster for large datasets)
samples = [fo.Sample(filepath=f) for f in image_paths]
dataset.add_samples(samples)
```

**Real-World Example:**
A quality assurance team receives daily uploads of product photos from three factory lines. Each line dumps images into its own network folder. The team writes a nightly script that loads each folder into FiftyOne as a separate dataset, tags each with the line ID and date, then merges them into a rolling weekly dataset for analysis. No annotations exist yet — they first use FiftyOne to sort by visual similarity and identify which images are worth sending to annotators.

**Lean AI Sigma Connection:**
Loading raw images into FiftyOne before annotation is the equivalent of **incoming inspection** in manufacturing. You don't feed raw materials into a production line without checking them first. By loading images into FiftyOne immediately, you can spot corrupted files, duplicates, and off-spec captures before wasting annotation budget on them. This is defect prevention, not defect detection.

---

### 3.2 Importing Standard Annotation Formats

**Plain Language:**
Real-world datasets rarely start in FiftyOne. They come from annotation tools (CVAT, Labelbox, Label Studio) that export in standard formats — COCO JSON, Pascal VOC XML, YOLO text files, TFRecords, or simple CSV files. FiftyOne can ingest all of these directly, mapping their labels, bounding boxes, segmentation masks, and metadata into its unified sample model.

**How It Works:**
The same `fo.Dataset.from_dir()` method handles format imports — you just change the `dataset_type` parameter. FiftyOne v1.14.0 supports over 30 dataset formats out of the box.

**COCO Format** (JSON annotations with image references):

```python
# COCO detection format
dataset = fo.Dataset.from_dir(
    dataset_type=fo.types.COCODetectionDataset,
    data_path="/data/coco/images",
    labels_path="/data/coco/annotations/instances_train.json",
    name="coco-import"
)

# Samples will have "detections" field with bounding boxes, categories, etc.
sample = dataset.first()
print(sample.detections)
# <Detections: {
#     'detections': [
#         <Detection: {'label': 'car', 'bounding_box': [0.1, 0.2, 0.3, 0.4], ...}>,
#         ...
#     ]
# }>
```

**Pascal VOC Format** (per-image XML files):

```python
dataset = fo.Dataset.from_dir(
    dataset_type=fo.types.VOCDetectionDataset,
    dataset_dir="/data/voc",
    name="voc-import"
)
# Expects VOC directory structure: images in JPEGImages/, annotations in Annotations/
```

**YOLO Format** (text files with class_id + normalized coordinates):

```python
dataset = fo.Dataset.from_dir(
    dataset_type=fo.types.YOLOv5Dataset,
    dataset_dir="/data/yolo_project",
    name="yolo-import"
)
# Reads data.yaml for class names, images/ and labels/ subdirectories
```

**TFRecords** (TensorFlow's serialized binary format):

```python
dataset = fo.Dataset.from_dir(
    dataset_type=fo.types.TFObjectDetectionDataset,
    data_path="/data/tf/images",
    labels_path="/data/tf/tf_labels.record",
    name="tfrecord-import"
)
```

**CSV / Pandas DataFrames** (tabular label data):

```python
import pandas as pd

# For custom CSV formats, build samples from the DataFrame
df = pd.read_csv("/data/labels.csv")

dataset = fo.Dataset(name="csv-import")
for _, row in df.iterrows():
    sample = fo.Sample(filepath=row["image_path"])
    sample["ground_truth"] = fo.Classification(label=row["class"])
    sample["confidence"] = row["score"]
    dataset.add_sample(sample)
```

**Real-World Example:**
An autonomous vehicle team has annotations in three formats: COCO from their internal annotation pipeline, VOC from a vendor, and YOLO from a partner university. Instead of writing custom conversion scripts, they load each into FiftyOne independently, verify label consistency in the App, then merge them into a single unified dataset. They discover that the vendor used different class names for the same objects ("pedestrian" vs "person") — a discrepancy they catch visually before it contaminates training.

**Lean AI Sigma Connection:**
Supporting multiple formats without custom conversion code eliminates **muda (waste)** — specifically, the waste of over-processing. Every format conversion script is a potential source of silent data corruption. When you convert COCO to YOLO via a custom script and lose segmentation masks because YOLO doesn't support them, that's information destruction that nobody noticed until the model underperforms. FiftyOne's format-native loading preserves all original information.

---

### 3.3 FiftyOne Zoo — Benchmark Datasets on Demand

**Plain Language:**
FiftyOne Zoo is a built-in catalog of popular benchmark datasets — COCO, ImageNet, CIFAR, Open Images, and dozens more. Instead of hunting down download links, writing extraction scripts, and figuring out directory structures, you call one function and get a ready-to-use FiftyOne dataset.

**How It Works:**
The `fiftyone.zoo` module provides `load_zoo_dataset()` which handles downloading, caching, and loading in a single call.

```python
import fiftyone.zoo as foz

# Load the full COCO 2017 validation set
dataset = foz.load_zoo_dataset(
    "coco-2017",
    split="validation",
    dataset_name="coco-val-2017"
)

# Load only specific classes
dataset = foz.load_zoo_dataset(
    "coco-2017",
    split="validation",
    classes=["person", "car", "bicycle"],
    max_samples=500,
    dataset_name="coco-vehicles-subset"
)

# List all available zoo datasets
available = foz.list_zoo_datasets()
print(len(available))  # 70+ datasets available
```

Commonly used zoo datasets:

| Dataset | Task | Samples | Use Case |
|---------|------|---------|----------|
| `coco-2017` | Detection, segmentation | 118K/5K | General object detection benchmarking |
| `open-images-v7` | Detection, classification | 1.7M+ | Large-scale multi-label evaluation |
| `cifar10` | Classification | 60K | Quick prototyping and testing |
| `quickstart` | Detection | 200 | Learning FiftyOne basics |
| `quickstart-video` | Video detection | 10 clips | Video workflow prototyping |

Zoo datasets are cached locally after first download. Subsequent loads are instant:

```python
# First call: downloads ~1GB
dataset = foz.load_zoo_dataset("coco-2017", split="validation")

# Second call: loads from cache in seconds
dataset2 = foz.load_zoo_dataset("coco-2017", split="validation",
                                 dataset_name="coco-val-copy")
```

**Real-World Example:**
A startup building a retail product recognition model needs to benchmark their custom model against standard baselines. They load COCO and Open Images from the zoo, run their model's predictions through FiftyOne's evaluation tools, and produce comparison metrics — all in an afternoon. Without the zoo, setting up benchmark datasets alone would have consumed two days of engineering time.

**Lean AI Sigma Connection:**
The zoo eliminates **setup waste** — the non-value-added time between deciding to run an experiment and actually running it. In Lean terms, this is reducing **changeover time**. Just as SMED (Single Minute Exchange of Dies) transforms hours of machine setup into minutes, the zoo transforms hours of dataset preparation into a single function call. The faster you can set up an experiment, the more experiments you run, and the faster you learn.

---

### 3.4 Custom Fields, Tags, and Metadata

**Plain Language:**
Every sample in FiftyOne starts with basic fields — filepath, metadata, tags. But real data management demands more: you need to track which annotation batch an image came from, what camera captured it, whether a reviewer has approved it, what the ambient lighting was. FiftyOne lets you add arbitrary custom fields to any sample, and those fields become immediately filterable in the App.

**How It Works:**
There are three primary mechanisms for enriching samples:

**Custom Fields** — add any typed data to samples:

```python
# Add fields to individual samples
sample = dataset.first()
sample["camera_id"] = "cam-03"
sample["capture_date"] = "2025-06-15"
sample["reviewed"] = False
sample["brightness_score"] = 0.72
sample.save()

# Add a field across all samples using set_values()
from datetime import datetime

dataset.set_values(
    "ingestion_date",
    [datetime.now()] * len(dataset)
)

# Add a new field to the schema explicitly
dataset.add_sample_field("priority", fo.IntField)
```

**Tags** — lightweight string labels for grouping and filtering:

```python
# Tag individual samples
sample.tags.append("needs-review")
sample.save()

# Tag multiple samples at once
view = dataset.match(F("confidence") < 0.5)
view.tag_samples("low-confidence")

# Filter by tag in the App or Python
low_conf = dataset.match_tags("low-confidence")
print(f"Low confidence samples: {len(low_conf)}")

# Remove tags
view.untag_samples("low-confidence")
```

**Metadata** — computed image properties (dimensions, file size, type):

```python
# Compute metadata for all samples (width, height, channels, size)
dataset.compute_metadata()

sample = dataset.first()
print(sample.metadata)
# <ImageMetadata: {
#     'size_bytes': 245760,
#     'mime_type': 'image/jpeg',
#     'width': 1920,
#     'height': 1080,
#     'num_channels': 3
# }>

# Filter by metadata
large_images = dataset.match(F("metadata.width") > 3000)
```

**Real-World Example:**
A medical imaging team loads 50,000 X-rays into FiftyOne. They add custom fields for patient age group, imaging device model, and hospital site. They tag all images that came from a device known to produce slightly darker exposures. During model evaluation, they create a view filtered to that tag and discover their model's sensitivity drops 15% on those images. Without custom fields and tags, this device-specific degradation would be buried in aggregate metrics.

**Lean AI Sigma Connection:**
Custom fields and tags are **traceability controls** — the visual AI equivalent of lot tracking in manufacturing. When a defective batch is discovered in a factory, lot numbers let you trace back to the raw material supplier, the machine, the operator, and the shift. In AI, when model performance degrades on a subset, custom fields let you trace back to the camera, the lighting condition, the annotation team, or the data source. Without traceability, root cause analysis is guesswork.

---

### 3.5 Exporting Datasets for Training Pipelines

**Plain Language:**
FiftyOne is not a training framework — after you've curated, cleaned, and filtered your data, you need to export it in whatever format your training pipeline expects. FiftyOne exports to all the same formats it imports, so you can go from "raw data" to "FiftyOne-curated subset" to "YOLO-formatted training set" without writing custom conversion code.

**How It Works:**
Use `dataset.export()` or `view.export()` to write out data in any supported format:

```python
# Export entire dataset as COCO
dataset.export(
    export_dir="/output/coco_export",
    dataset_type=fo.types.COCODetectionDataset
)

# Export a curated view (not the whole dataset)
# This is the key workflow: filter in FiftyOne, export only what you need
high_quality = dataset.match_tags("approved").match(
    F("metadata.width") >= 1024
)
high_quality.export(
    export_dir="/output/training_set",
    dataset_type=fo.types.YOLOv5Dataset
)

# Export as Pascal VOC
dataset.export(
    export_dir="/output/voc_export",
    dataset_type=fo.types.VOCDetectionDataset
)

# Export as TFRecords for TensorFlow pipelines
dataset.export(
    export_dir="/output/tf_export",
    dataset_type=fo.types.TFObjectDetectionDataset
)

# Export as CSV for simple classification tasks
dataset.export(
    export_dir="/output/csv_export",
    dataset_type=fo.types.CSVDataset
)
```

The view-then-export pattern is the core workflow:

```python
# Step 1: Load raw data
dataset = fo.Dataset.from_dir(...)

# Step 2: Explore, filter, tag in FiftyOne App
session = fo.launch_app(dataset)

# Step 3: Create the exact subset you want to train on
training_view = (
    dataset
    .match_tags("approved")
    .match(F("ground_truth.detections").length() > 0)
    .take(5000)  # limit to 5000 samples
)

# Step 4: Export in the format your trainer expects
training_view.export(
    export_dir="/output/yolo_training",
    dataset_type=fo.types.YOLOv5Dataset,
    label_field="ground_truth"
)
```

**Real-World Example:**
A drone survey company collects aerial images for infrastructure inspection. After loading 100,000 images into FiftyOne, they use visual similarity to remove near-duplicates, tag images with poor visibility, and filter to only those containing structural anomalies. The curated subset — 18,000 images — is exported in YOLO format for their detection model and simultaneously in COCO format for a partner team using Detectron2. Both teams train on identical data from a single curation pass.

**Lean AI Sigma Connection:**
The view-then-export pattern implements **pull-based production**. Instead of pushing all data through the training pipeline and hoping the model learns to ignore the bad samples, you pull only the data that meets your quality criteria. This is the difference between batch-and-queue (train on everything, fix problems later) and single-piece flow (curate precisely, train on what matters). Every image in your training set earns its place through explicit selection, not default inclusion.

---

## Check Your Understanding

1. **You have 50,000 images in a folder with no annotations. What is the minimum code to load them into FiftyOne and start exploring them visually?** Think about which dataset type is appropriate and what sample fields you'll have available before adding any labels.

2. **Your team receives annotations in COCO format from one vendor and YOLO format from another for the same set of images. How would you load both into FiftyOne and verify that the annotations are consistent?** Consider what problems might arise from different annotation conventions.

3. **After curating a dataset in FiftyOne — tagging approved samples, removing duplicates, and filtering by metadata — you need to export the result for two different training frameworks. What is the general workflow, and why is exporting a view different from exporting the full dataset?** Think about what would happen if you exported the unfiltered dataset instead.

## What's Next

Now that you can get data into FiftyOne, organize it with fields and tags, and export it for training, Module 4 shifts focus to what you do with data once it's loaded: **Querying, Filtering, and Views**. You'll learn how to slice datasets using FiftyOne's ViewExpression language, build complex queries that combine label criteria with metadata filters, and create saved views that serve as reproducible snapshots of specific data subsets. This is where FiftyOne transforms from a data loader into an analytical tool.
