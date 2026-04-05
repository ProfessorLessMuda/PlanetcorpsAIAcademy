# Training Domains

The FiftyOne 1.14.0 training program covers five domains. Each domain is weighted differently, reflecting its relative importance in the overall curriculum.

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Computer Vision Fundamentals | 15% |
| 2 | FiftyOne Platform & Architecture | 20% |
| 3 | Data Loading & Management | 20% |
| 4 | Visual Data Exploration & Quality | 25% |
| 5 | Model Evaluation & AI Workflows | 20% |

---

## Domain 1: Computer Vision Fundamentals (15%)

Foundational concepts in computer vision that you need before working with FiftyOne effectively. Covers architectures, task types, and training principles.

### Task Statements

- **1.1** Understand core neural network architectures for visual data
  - Convolutional Neural Networks (CNNs) and their layer structure
  - Vision Transformers (ViTs) and patch-based attention mechanisms
  - Feature extraction and representation learning
  - Choosing architectures based on task requirements and compute constraints

- **1.2** Distinguish between computer vision task types and their label representations
  - Image classification (single-label and multi-label)
  - Object detection with bounding boxes
  - Ground truth labels vs model predictions
  - Annotation formats and coordinate systems (normalized vs absolute)

- **1.3** Identify segmentation and keypoint task types
  - Semantic segmentation (per-pixel class labeling)
  - Instance segmentation (per-object masks)
  - Keypoint detection and pose estimation
  - When to use each task type for a given problem

- **1.4** Apply training concepts relevant to data quality assessment
  - Epochs, overfitting, and generalization
  - Train/validation/test splits and data leakage
  - Transfer learning and fine-tuning pretrained models
  - Data augmentation strategies and their tradeoffs

---

## Domain 2: FiftyOne Platform & Architecture (20%)

Covers the core FiftyOne abstractions, the App interface, Brain module, and underlying infrastructure.

### Task Statements

- **2.1** Work with Datasets and Samples as core data structures
  - Creating, loading, and persisting Datasets
  - Sample structure: filepath, fields, labels, metadata
  - Field types and schema definition
  - Dataset persistence and naming conventions

- **2.2** Build DatasetViews using ViewStage pipelines
  - Chaining ViewStages: match, filter_labels, sort_by, exists, limit, select_fields
  - Views are lazy and non-destructive
  - Combining multiple filter conditions
  - Aggregating statistics from views

- **2.3** Navigate and use the FiftyOne App for visual exploration
  - Launching the App and connecting sessions
  - Using the sidebar for filtering and field selection
  - Sample grid, expanded sample view, and label overlays
  - Selecting samples and creating views from selections

- **2.4** Apply FiftyOne Brain methods for data intelligence
  - Embedding computation and visualization
  - Near-duplicate detection
  - Label mistake identification (mistakenness)
  - Representativeness and hardness scoring
  - How Brain results are stored as sample fields

- **2.5** Understand FiftyOne infrastructure and ecosystem
  - MongoDB as the backing datastore
  - FiftyOne Teams for collaborative deployments
  - Voxel51 and the open-source ecosystem
  - Plugin architecture and extensibility

---

## Domain 3: Data Loading & Management (20%)

Covers getting data into FiftyOne, working with annotation formats, organizing datasets, and using the Zoo.

### Task Statements

- **3.1** Load data from common sources into FiftyOne Datasets
  - Loading images from directories
  - Importing from labeled datasets with existing structure
  - Programmatic sample creation with `fo.Sample`
  - Handling video and grouped datasets

- **3.2** Import and export standard annotation formats
  - COCO format (detections, segmentation, keypoints)
  - VOC (Pascal VOC XML format)
  - YOLO format and its variants
  - Custom format importers and exporters

- **3.3** Add and manage labels, fields, and metadata on samples
  - Attaching Detection, Classification, Segmentation, and Keypoint labels
  - Adding custom fields (numeric, string, boolean, list, embedded)
  - Bounding box coordinate conventions (normalized [x, y, w, h])
  - Bulk operations for field population

- **3.4** Organize datasets using tags, groups, and splits
  - Tagging samples and labels for workflow stages
  - Creating and managing train/val/test splits
  - Grouping related samples (e.g., multi-view or sensor data)
  - Cloning and merging datasets

- **3.5** Use the FiftyOne Dataset Zoo and Model Zoo
  - Loading popular benchmark datasets (COCO, CIFAR, Open Images)
  - Filtering Zoo datasets by split, classes, and max samples
  - Listing and loading pretrained Zoo models
  - Running Zoo model inference on custom datasets

---

## Domain 4: Visual Data Exploration & Quality (25%)

The highest-weighted domain. Covers querying, filtering, identifying data quality issues, and understanding dataset health.

### Task Statements

- **4.1** Construct queries to find specific samples and labels
  - Field-based filtering with match and filter_labels
  - Boolean expressions using ViewField (F)
  - Combining conditions with logical operators
  - Sorting and limiting results for targeted inspection

- **4.2** Use tags and saved views for dataset organization workflows
  - Applying tags to track review status and issues
  - Creating and saving named views for repeated queries
  - Tag-based workflows for annotation QA pipelines
  - Bulk tagging from App selections

- **4.3** Identify and diagnose data quality issues
  - Detecting class imbalance with counts and histograms
  - Finding missing or incomplete annotations
  - Spotting distribution mismatch between splits
  - Identifying underrepresented scenarios or edge cases

- **4.4** Apply FiftyOne Brain for automated quality analysis
  - Computing and using embeddings for dataset visualization
  - Finding near-duplicates to prevent data leakage
  - Detecting likely label errors with mistakenness scores
  - Measuring sample hardness and representativeness
  - Using uniqueness to curate diverse subsets

- **4.5** Detect and investigate systematic data biases
  - Identifying shortcut learning patterns in model failures
  - Finding spurious correlations between features and labels
  - Analyzing failure clusters in embedding space
  - Verifying dataset diversity across demographic or environmental axes

---

## Domain 5: Model Evaluation & AI Workflows (20%)

Covers evaluating model predictions, computing metrics, comparing models, and integrating FiftyOne into ML pipelines.

### Task Statements

- **5.1** Evaluate model predictions against ground truth
  - Running evaluate_detections and evaluate_classifications
  - Computing precision, recall, F1 score, and mAP at various IoU thresholds
  - Per-sample evaluation results for failure analysis
  - Confidence threshold tuning and its effect on precision/recall tradeoff

- **5.2** Analyze model errors and failure modes
  - Identifying false positives and false negatives
  - Filtering to specific error types for visual inspection
  - Confusion matrix analysis across classes
  - Connecting evaluation results to data quality issues

- **5.3** Compare multiple models and detect performance issues
  - Running multiple prediction sets on the same dataset
  - Side-by-side model comparison in the App
  - Diagnosing overfitting, distribution mismatch, and shortcut reliance
  - Tracking model performance across dataset versions

- **5.4** Integrate FiftyOne into end-to-end ML workflows
  - Using Zoo models for rapid prototyping and baselining
  - Transfer learning workflows with FiftyOne data curation
  - Connecting FiftyOne to training frameworks (PyTorch, TensorFlow)
  - Building iterative data improvement loops: train, evaluate, curate, retrain
