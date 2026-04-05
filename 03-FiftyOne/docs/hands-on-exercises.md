# Hands-On Exercises

Four practical exercises aligned with the FiftyOne training domains. Each exercise builds on the previous one, progressing from basic exploration to end-to-end workflows. All exercises run locally on Windows with Python 3.13 and FiftyOne 1.14.0.

**Prerequisites:** FiftyOne installed and verified (Module 02, Task 2.3).

---

## Exercise 1: FiftyOne Quickstart — Your First Dataset

**Domains practiced:** Domain 2, Domain 3

**Task statements:** 2.3, 2.4, 2.5, 3.3

### Overview
Load a pre-built dataset from FiftyOne's Zoo, explore it in the App, and practice basic navigation. This exercise confirms your installation works and builds comfort with the core interface.

### Instructions

1. Open a terminal and activate your FiftyOne virtual environment
2. Start a Python session (or Jupyter notebook)
3. Load the quickstart dataset:
   ```python
   import fiftyone as fo
   import fiftyone.zoo as foz

   dataset = foz.load_zoo_dataset("quickstart")
   print(dataset)
   ```
4. Launch the App:
   ```python
   session = fo.launch_app(dataset)
   ```
5. In the App:
   - Browse the image grid — note the bounding box overlays
   - Click an image to open the sample modal — examine the labels
   - Use the Filters sidebar to show only "person" detections
   - Filter to detections with confidence > 0.8
   - Count how many images remain after filtering
6. Return to Python:
   ```python
   # Create a filtered view
   from fiftyone import ViewField as F
   high_conf_people = dataset.filter_labels("ground_truth", F("label") == "person")
   print(f"Samples with people: {len(high_conf_people)}")
   ```
7. Explore the dataset summary:
   ```python
   print(dataset.count_values("ground_truth.detections.label"))
   ```

### Success Criteria
- FiftyOne App opens in browser and displays images with annotations
- You can apply filters in the sidebar and see the grid update
- You can navigate between grid view and sample modal
- You can create a filtered view in Python and count results
- You can list the class distribution of labels in the dataset

### Jupyter Notebook
See `labs/lab-01-quickstart.ipynb` for the guided notebook version of this exercise.

---

## Exercise 2: Explore and Audit a Dataset

**Domains practiced:** Domain 3, Domain 4

**Task statements:** 3.1, 3.4, 4.1, 4.2, 4.4

### Overview
Load a larger dataset, add custom metadata, use ViewStages to investigate data quality, and identify potential issues — class imbalance, missing annotations, and low-confidence predictions.

### Instructions

1. Load the COCO-2017 validation dataset (5,000 images):
   ```python
   import fiftyone as fo
   import fiftyone.zoo as foz

   dataset = foz.load_zoo_dataset(
       "coco-2017",
       split="validation",
       max_samples=1000  # Start with 1000 for speed
   )
   ```

2. Examine the class distribution:
   ```python
   counts = dataset.count_values("ground_truth.detections.label")
   for label, count in sorted(counts.items(), key=lambda x: -x[1])[:10]:
       print(f"  {label}: {count}")
   ```

3. Find the most and least common classes. Are there any classes with fewer than 10 instances?

4. Tag samples that have more than 10 detections (crowded scenes):
   ```python
   from fiftyone import ViewField as F
   crowded = dataset.match(F("ground_truth.detections").length() > 10)
   crowded.tag_samples("crowded")
   print(f"Crowded scenes: {len(crowded)}")
   ```

5. Launch the App and visually inspect the "crowded" tagged samples. Do the annotations look correct?

6. Find samples with very small bounding boxes (potential annotation quality issues):
   ```python
   tiny = dataset.filter_labels(
       "ground_truth",
       (F("bounding_box")[2] * F("bounding_box")[3]) < 0.001
   )
   session.view = tiny
   ```

7. Write a summary of what you found — class imbalances, annotation quality concerns, and any patterns in the data.

### Success Criteria
- You can load a Zoo dataset with specific parameters
- You can compute and interpret class distributions
- You can use ViewStages (match, filter_labels) to isolate subsets
- You can tag samples programmatically
- You can identify at least 2 data quality concerns from visual inspection
- You write a brief data quality summary with specific findings

### Jupyter Notebook
See `labs/lab-02-explore-dataset.ipynb` for the guided notebook version.

---

## Exercise 3: Evaluate Model Predictions

**Domains practiced:** Domain 4, Domain 5

**Task statements:** 4.1, 4.2, 5.1, 5.2

### Overview
Load a dataset with both ground truth annotations and model predictions, run FiftyOne's evaluation API, and analyze where the model succeeds and fails.

### Instructions

1. Load the quickstart dataset (it includes both ground truth and predictions):
   ```python
   import fiftyone as fo
   import fiftyone.zoo as foz

   dataset = foz.load_zoo_dataset("quickstart")
   print(dataset)
   ```

2. Run evaluation comparing predictions to ground truth:
   ```python
   results = dataset.evaluate_detections(
       "predictions",
       gt_field="ground_truth",
       eval_key="eval",
       compute_mAP=True
   )
   print(f"mAP: {results.mAP():.3f}")
   results.print_report()
   ```

3. Examine per-class performance:
   ```python
   results.print_report(classes=["person", "car", "dog", "cat"])
   ```

4. Find the worst-performing class and investigate why:
   ```python
   # Sort by lowest per-sample performance
   from fiftyone import ViewField as F

   # Find samples with false positives
   fp_view = dataset.filter_labels("predictions", F("eval") == "fp")
   session = fo.launch_app(fp_view)
   ```

5. Visually inspect 10-15 false positive predictions. Look for patterns:
   - Are false positives concentrated in certain classes?
   - Do they occur more in certain image conditions (dark, cluttered, small objects)?
   - Are any "false positives" actually correct predictions with wrong ground truth labels?

6. Document your findings with specific examples.

### Success Criteria
- You can run `evaluate_detections` and interpret the mAP score
- You can print and read a per-class evaluation report
- You can filter to specific evaluation outcomes (TP, FP, FN)
- You can visually identify patterns in model failures
- You distinguish between model errors and label errors in your analysis

### Jupyter Notebook
See `labs/lab-03-evaluate-model.ipynb` for the guided notebook version.

---

## Exercise 4: End-to-End Data Quality Workflow

**Domains practiced:** Domain 3, Domain 4, Domain 5

**Task statements:** 3.4, 4.3, 4.5, 5.3, 5.4

### Overview
Design and execute a complete data quality improvement workflow: load data, compute embeddings, find duplicates, identify outliers, evaluate a model, find systematic failures, and produce a curated dataset for retraining.

### Instructions

1. Load the quickstart dataset and compute embeddings:
   ```python
   import fiftyone as fo
   import fiftyone.zoo as foz
   import fiftyone.brain as fob

   dataset = foz.load_zoo_dataset("quickstart")

   # Compute image embeddings for similarity analysis
   fob.compute_similarity(dataset, brain_key="img_sim")
   ```

2. Find near-duplicate images:
   ```python
   # Find duplicate groups
   fob.compute_uniqueness(dataset)

   # Sort by least unique (most likely duplicates)
   dups_view = dataset.sort_by("uniqueness")
   session = fo.launch_app(dups_view)
   ```

3. Visualize the embedding space:
   ```python
   fob.compute_visualization(dataset, brain_key="img_viz")

   # Open the embeddings panel in the App
   session.view = dataset
   ```

4. Identify outliers (samples far from any cluster in embedding space). Tag them for review:
   ```python
   # Samples with lowest uniqueness scores are potential duplicates
   # Samples that are visually distinct from clusters are outliers
   from fiftyone import ViewField as F
   outliers = dataset.sort_by("uniqueness", reverse=True).limit(20)
   outliers.tag_samples("outlier_review")
   ```

5. Run model evaluation:
   ```python
   results = dataset.evaluate_detections(
       "predictions", gt_field="ground_truth",
       eval_key="eval", compute_mAP=True
   )
   ```

6. Find systematic failure patterns:
   ```python
   # Samples where the model made the most false negatives
   from fiftyone import ViewField as F
   fn_view = dataset.filter_labels("ground_truth", F("eval") == "fn")
   print(f"Samples with missed detections: {len(fn_view)}")
   session.view = fn_view
   ```

7. Create a curated export for retraining (excluding duplicates and outliers):
   ```python
   clean = dataset.match_tags("outlier_review", bool=False)
   clean.export(
       export_dir="./clean_dataset",
       dataset_type=fo.types.COCODetectionDataset
   )
   print(f"Exported {len(clean)} clean samples")
   ```

8. Write a data quality report summarizing:
   - How many duplicates/near-duplicates were found
   - What outlier patterns you identified
   - Model performance metrics before and after data curation
   - Recommendations for the next training iteration

### Success Criteria
- You can compute embeddings and similarity scores
- You can identify duplicate and near-duplicate images
- You can visualize the embedding space and identify clusters/outliers
- You can connect model failures to data quality issues
- You can export a curated dataset in a standard format
- Your data quality report includes specific numbers and actionable recommendations

### Jupyter Notebook
See `labs/lab-04-end-to-end.ipynb` for the guided notebook version.
