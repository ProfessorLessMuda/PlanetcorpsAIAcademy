# Key Concepts Glossary

Alphabetical reference of technical terms, tools, and patterns covered in the FiftyOne 1.14.0 training program. Each entry notes which domain(s) and task statement(s) it relates to.

---

**Annotation** — A label applied to an image or region of an image, such as a bounding box, polygon mask, or class tag. Annotations are the raw material that turns unlabeled pixels into supervised training data. (Domain 1, Task 1.2; Domain 3, Task 3.3)

**Bounding Box** — A rectangular region defined by [x, y, width, height] in normalized coordinates (0 to 1) that localizes an object within an image. FiftyOne stores these as `fo.Detection` labels. Getting the coordinate format wrong is one of the most common data loading bugs. (Domain 1, Task 1.2; Domain 3, Task 3.3)

**Class Imbalance** — When some label classes appear far more frequently than others in a dataset. A model trained on 90% "car" and 10% "bicycle" will look accurate on aggregate metrics but fail on the minority class. FiftyOne's count and histogram views make imbalance easy to spot. (Domain 4, Task 4.3)

**CNN (Convolutional Neural Network)** — A neural network architecture that uses convolutional filters to learn spatial features from images. CNNs were the dominant architecture for computer vision before Vision Transformers, and many production models still use them. (Domain 1, Task 1.1)

**COCO Format** — A widely used JSON-based annotation format originally from the COCO benchmark dataset. FiftyOne can import and export COCO format directly, making it one of the most common interchange formats for detection and segmentation tasks. (Domain 3, Task 3.2)

**Confidence Score** — A float between 0 and 1 representing how certain a model is about a prediction. Filtering by confidence threshold is a primary tool for understanding model behavior: low-confidence predictions often highlight ambiguous or mislabeled samples. (Domain 5, Task 5.1)

**Data Augmentation** — Techniques that synthetically expand training data by applying transformations like rotation, flipping, cropping, or color jitter. Augmentation helps models generalize but can introduce artifacts that FiftyOne helps you inspect visually. (Domain 1, Task 1.4)

**Dataset** — The core FiftyOne object (`fo.Dataset`) that holds a collection of samples with their fields, labels, and metadata. Datasets are backed by MongoDB and persist between sessions. Think of it as a programmable, queryable container for your visual data. (Domain 2, Task 2.1; Domain 3, Task 3.1)

**DatasetView** — A filtered, sorted, or transformed view of a Dataset created by chaining ViewStages. Views are lazy and non-destructive: they don't copy data, they just change what you see. This is how you slice and dice data in FiftyOne without modifying the underlying dataset. (Domain 2, Task 2.2; Domain 4, Task 4.1)

**Detection** — An `fo.Detection` label type that combines a bounding box with a class label and optional confidence score. Used for object detection tasks where you need to identify what objects are present and where they are in the image. (Domain 1, Task 1.2; Domain 5, Task 5.1)

**Distribution Mismatch** — When the statistical properties of your training data differ from the data the model encounters in production. FiftyOne Brain embeddings can reveal this by showing clusters of deployment data that have no neighbors in the training set. (Domain 4, Task 4.3; Domain 5, Task 5.3)

**Embedding** — A dense numerical vector that represents a sample or patch in a learned feature space. FiftyOne Brain uses embeddings to compute similarity, find near-duplicates, identify outliers, and visualize dataset structure. They are the backbone of most data quality workflows. (Domain 2, Task 2.4; Domain 4, Task 4.4)

**Epoch** — One complete pass through the entire training dataset during model training. Tracking performance across epochs helps you catch overfitting: when validation metrics plateau or degrade while training metrics keep improving. (Domain 1, Task 1.4)

**Evaluation** — The process of comparing model predictions against ground truth labels using metrics like mAP, precision, and recall. FiftyOne's `evaluate_detections` and `evaluate_classifications` methods compute per-sample results so you can inspect exactly where the model fails. (Domain 5, Task 5.1)

**F1 Score** — The harmonic mean of precision and recall, providing a single metric that balances both. An F1 of 0.80 tells you more than accuracy alone because it accounts for both false positives and false negatives. (Domain 5, Task 5.1)

**Feature** — A measurable property of data that a model uses to make predictions. In CNNs, early layers learn low-level features like edges and textures; deeper layers learn high-level features like object parts and shapes. (Domain 1, Task 1.1)

**Field** — A named attribute on a FiftyOne Sample, such as `filepath`, `ground_truth`, `predictions`, or any custom field you add. Fields are schema-defined and can hold primitives, labels, embeddings, or nested structures. Understanding the field schema is essential for querying. (Domain 2, Task 2.1; Domain 3, Task 3.3)

**FiftyOne App** — The browser-based visual interface for exploring datasets, viewing samples, filtering labels, and inspecting model predictions. Launched via `fo.launch_app()` or `session.show()`. The App is where data-centric AI becomes tangible. (Domain 2, Task 2.3)

**FiftyOne Brain** — A module (`fiftyone.brain`) providing compute methods for embeddings visualization, near-duplicate detection, label mistakes, representativeness, and hardness analysis. Brain methods write results back to the dataset so you can filter and explore them in the App. (Domain 2, Task 2.4; Domain 4, Task 4.4)

**Ground Truth** — The human-verified correct labels for a dataset, used as the reference when evaluating model predictions. Ground truth quality directly limits model quality; finding errors in ground truth is one of FiftyOne's most valuable capabilities. (Domain 1, Task 1.2; Domain 5, Task 5.1)

**Image Classification** — A computer vision task where the goal is to assign a single label (or multiple labels) to an entire image. FiftyOne represents this with `fo.Classification` or `fo.Classifications` label types. (Domain 1, Task 1.2)

**Instance Segmentation** — A task that detects individual objects and produces a pixel-level mask for each one. Goes beyond bounding boxes to give exact object boundaries. FiftyOne stores these as `fo.Detection` labels with a `mask` attribute. (Domain 1, Task 1.3)

**IoU (Intersection over Union)** — A metric that measures the overlap between a predicted region and a ground truth region. IoU = area of overlap / area of union. An IoU threshold (commonly 0.5) determines whether a detection counts as a true positive. (Domain 5, Task 5.1)

**Keypoint Detection** — A task that identifies specific anatomical or structural points on objects, such as body joints in pose estimation. FiftyOne represents keypoints with `fo.Keypoint` and `fo.Keypoints` label types. (Domain 1, Task 1.3)

**Label Error** — An incorrect annotation in the ground truth data, such as a wrong class, missing bounding box, or imprecise mask. FiftyOne Brain's `compute_mistakenness` method flags samples likely to contain label errors, which is often more impactful than collecting more data. (Domain 4, Task 4.4; Domain 5, Task 5.3)

**mAP (Mean Average Precision)** — The primary evaluation metric for object detection, computed by averaging the area under precision-recall curves across all classes. FiftyOne computes mAP at various IoU thresholds (e.g., mAP@0.5, mAP@0.5:0.95). (Domain 5, Task 5.1)

**MongoDB** — The database engine that FiftyOne uses under the hood to store dataset metadata, labels, and fields. FiftyOne bundles a MongoDB instance automatically, but you can also connect to an external MongoDB for team deployments. (Domain 2, Task 2.5)

**Near-Duplicate** — Samples that are visually almost identical, such as consecutive video frames or images with minor crops. FiftyOne Brain's `compute_near_duplicates` method finds these using embedding similarity, helping you clean training sets and avoid data leakage between splits. (Domain 4, Task 4.4)

**Object Detection** — A computer vision task that identifies and localizes objects in an image with bounding boxes and class labels. The workhorse task of applied computer vision, used in everything from autonomous driving to retail analytics. (Domain 1, Task 1.2)

**Overfitting** — When a model memorizes training data patterns (including noise) and fails to generalize to new data. FiftyOne helps diagnose overfitting by letting you compare per-sample performance between training, validation, and test sets. (Domain 1, Task 1.4; Domain 5, Task 5.3)

**Precision** — The fraction of positive predictions that are actually correct: TP / (TP + FP). High precision means the model rarely produces false alarms. In safety-critical applications, you often tune for high precision even at the cost of recall. (Domain 5, Task 5.1)

**Recall** — The fraction of actual positives that the model successfully detects: TP / (TP + FN). High recall means the model rarely misses real objects. In medical imaging, high recall is typically prioritized over precision. (Domain 5, Task 5.1)

**Sample** — A single data point in a FiftyOne Dataset, typically representing one image, video, or 3D scene. Each Sample has a `filepath` and zero or more fields containing labels, metadata, and computed attributes. Samples are the fundamental unit of FiftyOne. (Domain 2, Task 2.1; Domain 3, Task 3.1)

**Segmentation** — A label type (`fo.Segmentation`) that stores a pixel-level class mask covering the entire image. Each pixel value maps to a class. Used for semantic segmentation tasks where every pixel needs a label. (Domain 1, Task 1.3)

**Semantic Segmentation** — A task that assigns a class label to every pixel in an image without distinguishing between individual objects. Useful for scene understanding tasks like autonomous driving where you need to know what region is road, sky, sidewalk, etc. (Domain 1, Task 1.3)

**Shortcut Learning** — When a model relies on spurious statistical shortcuts (like background color or watermarks) instead of learning the actual visual concept. FiftyOne's embedding visualizations and failure analysis help uncover these shortcuts. (Domain 4, Task 4.5; Domain 5, Task 5.3)

**Spurious Correlation** — A statistical association in training data that does not reflect a real causal relationship. For example, if all "boat" images happen to have blue backgrounds, the model learns to predict "boat" for any blue-heavy image. Closely related to shortcut learning. (Domain 4, Task 4.5; Domain 5, Task 5.3)

**Tags** — String labels attached to samples or individual labels for organizational purposes. Tags let you mark samples for review, flag issues, or create workflow stages (e.g., "needs_review", "approved", "hard_negative") without modifying the label schema. (Domain 3, Task 3.4; Domain 4, Task 4.2)

**Transfer Learning** — Reusing a model pretrained on a large dataset (like ImageNet) and fine-tuning it on your specific task. Transfer learning dramatically reduces the amount of labeled data needed. FiftyOne Zoo provides pretrained models ready for this workflow. (Domain 1, Task 1.4; Domain 5, Task 5.4)

**ViewStage** — A single filtering, sorting, or transformation operation in FiftyOne's query pipeline, such as `match`, `filter_labels`, `sort_by`, `exists`, or `limit`. ViewStages chain together to build DatasetViews. Mastering ViewStages is the key to productive data exploration. (Domain 2, Task 2.2; Domain 4, Task 4.1)

**Vision Transformer (ViT)** — A neural network architecture that applies the transformer mechanism (originally from NLP) to image patches. ViTs have matched or exceeded CNN performance on many benchmarks and are increasingly common in production vision systems. (Domain 1, Task 1.1)

**Voxel51** — The company that builds and maintains FiftyOne. Voxel51 also offers FiftyOne Teams for collaborative, cloud-hosted dataset management in enterprise environments. (Domain 2, Task 2.5)

**Zoo Dataset** — A dataset available through FiftyOne's Dataset Zoo (`fiftyone.zoo`), which provides one-line access to popular benchmarks like COCO, CIFAR-10, Open Images, and more. Zoo datasets come pre-formatted for immediate use in FiftyOne. (Domain 3, Task 3.5)

**Zoo Model** — A pretrained model available through FiftyOne's Model Zoo, ready to run inference on your data. Zoo models let you generate predictions on any FiftyOne dataset with a few lines of code, useful for baselining or transfer learning. (Domain 5, Task 5.4)
