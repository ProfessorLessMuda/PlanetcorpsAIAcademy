# Domain 4 Assessment — Visual Data Exploration & Quality

---

## Question 1
**Scenario:** A computer vision engineer has a dataset of 50,000 street scene images with object detection labels. She needs to quickly isolate the subset of images that contain at least 3 pedestrian detections where the model confidence is above 0.8, sorted by the number of detections in descending order, so she can audit high-confidence predictions first.

Which ViewStage pipeline accomplishes this?

A) `dataset.match(F("predictions.detections").filter(F("label") == "pedestrian").length() >= 3).sort_by(F("predictions.detections").length(), reverse=True)`
B) `dataset.filter_labels("predictions", F("confidence") > 0.8).filter_labels("predictions", F("label") == "pedestrian").match(F("predictions.detections").length() >= 3).sort_by(F("predictions.detections").length(), reverse=True)`
C) `dataset.select_fields("predictions").match(F("label") == "pedestrian" and F("confidence") > 0.8)`
D) `dataset.take(3).sort_by("confidence")`

**Answer:** B

**Explanation:** The correct approach chains ViewStages in sequence: first `filter_labels` to keep only detections above 0.8 confidence, then `filter_labels` again to keep only pedestrian labels, then `match` to retain only samples with 3 or more remaining detections, and finally `sort_by` in descending order. Option A filters by label count but never applies the confidence threshold — it counts all pedestrian detections regardless of confidence, which defeats the purpose of auditing high-confidence predictions. Option C uses `select_fields`, which controls which fields are visible in the view but does not filter samples or labels — and the Python `and` operator does not work correctly with ViewField expressions (you need `&`). Option D uses `take(3)`, which simply grabs 3 random samples from the dataset, completely ignoring the filtering requirements.

**Task Statement:** 4.1

---

## Question 2
**Scenario:** After running evaluation on an object detection model, a data scientist notices that 2% of samples have detections where the model assigns confidence above 0.95 but the ground truth label for the same spatial region is a completely different class. She suspects these are annotation errors rather than model failures and wants to surface them efficiently.

What is the best approach to identify and resolve these suspected label errors?

A) Manually browse all 50,000 samples in the FiftyOne App and look for mismatches visually
B) Use `dataset.filter_labels("predictions", F("confidence") > 0.95)` to isolate high-confidence predictions, run `evaluate_detections()` to match predictions against ground truth, then filter for samples with false positives to review likely annotation errors
C) Delete all ground truth labels where the model disagrees, since high-confidence predictions are more reliable than human annotations
D) Re-train the model with higher learning rate to force it to agree with the existing annotations

**Answer:** B

**Explanation:** High-confidence model predictions that contradict ground truth are strong signals of potential annotation errors. By filtering to high-confidence predictions and running `evaluate_detections()`, you get per-detection match results (true positive, false positive, false negative). Filtering for false positives at high confidence reveals cases where the model is confident about a class but the ground truth says otherwise — these are prime candidates for annotation review. Option A is prohibitively slow at scale and relies on catching errors visually without any prioritization. Option C blindly trusts the model over annotators, which is dangerous — high confidence does not guarantee correctness, and this would corrupt the dataset without human review. Option D addresses a symptom rather than the root cause — forcing a model to memorize incorrect labels degrades generalization and bakes in the annotation errors permanently.

**Task Statement:** 4.2

---

## Question 3
**Scenario:** A robotics team has collected 100,000 images from multiple warehouse cameras over several months. They suspect significant redundancy because cameras have overlapping fields of view and the environment changes slowly. Storage and annotation costs are a concern. They want to remove near-duplicate images while keeping at least one representative from each visually distinct scene.

Which FiftyOne workflow best addresses this?

A) Sort images by file size and delete any that have identical byte counts
B) Use `fob.compute_similarity()` to generate embeddings, then use `fob.compute_near_duplicates()` with a threshold to find near-duplicate clusters, review flagged pairs in the App, and delete confirmed duplicates
C) Compare filenames and timestamps — if two images were captured within 1 second of each other, delete one
D) Resize all images to 32x32 pixels and compare pixel values directly

**Answer:** B

**Explanation:** FiftyOne Brain's similarity and near-duplicate detection uses learned embeddings that capture semantic visual content, not superficial properties like filenames or byte counts. `compute_near_duplicates()` groups visually similar images into clusters based on an embedding distance threshold, letting you review flagged pairs in the App before deleting. This ensures you catch near-duplicates even when file metadata differs (different cameras, compression settings, or timestamps) while preserving human oversight. Option A fails because images with identical byte counts can look completely different (different content, same compression ratio), and visually identical images from different cameras will have different byte counts. Option C assumes temporal proximity equals visual similarity, which is false — two cameras might capture different scenes at the same timestamp, or the same camera might capture an identical static scene hours apart. Option D destroys spatial detail needed to distinguish similar-but-different scenes, and raw pixel comparison is brittle to minor camera variations like white balance or exposure shifts.

**Task Statement:** 4.3

---

## Question 4
**Scenario:** A team is building a defect detection model for a manufacturing line with 12 defect categories. After collecting 60,000 labeled images, the model shows strong overall accuracy but catastrophically fails on "hairline crack" and "surface pit" classes. Before collecting more data, the team lead wants to understand the class distribution and confirm whether imbalance is the root cause.

How should they analyze this in FiftyOne?

A) Export all labels to CSV and build a histogram in Excel
B) Use `dataset.count_values("ground_truth.detections.label")` to get per-class counts, then visualize the distribution in the FiftyOne App's fields panel to confirm imbalance and identify which classes are underrepresented
C) Assume imbalance is the issue and immediately start collecting more data for the failing classes
D) Remove the underperforming classes from the dataset entirely so the model can focus on the remaining 10 classes

**Answer:** B

**Explanation:** `count_values()` returns a dictionary of label-to-count mappings across all detections, giving you an immediate quantitative view of class distribution without leaving FiftyOne. The App's fields panel can display this distribution visually, making severe imbalances obvious at a glance. This data-driven approach confirms whether imbalance is actually the problem before committing resources to data collection. Option A adds unnecessary export-and-switch overhead when FiftyOne provides the same analysis natively — and manually building histograms introduces a disconnection from the visual data that makes follow-up investigation slower. Option C skips diagnosis entirely; the failure could stem from labeling inconsistency, class confusion between similar defect types, or poor image quality for those classes — collecting more data of the same problematic quality wastes resources. Option D eliminates valid business requirements; if hairline cracks and surface pits are real defects that reach customers, removing them from the model creates a blind spot in production quality control.

**Task Statement:** 4.4

---

## Question 5
**Scenario:** A self-driving car team has a dataset of 200,000 frames with diverse driving conditions. Before training, they want to understand the internal structure of their data — whether certain driving scenarios cluster together, whether there are outlier frames that might represent sensor malfunctions, and which regions of the visual embedding space are underrepresented.

Which tool provides these insights?

A) Train a classifier on the dataset and examine the confusion matrix
B) Use `fob.compute_visualization()` to generate a UMAP or t-SNE embedding visualization, then explore clusters and outliers interactively in the FiftyOne App
C) Sort the dataset alphabetically by filename and browse sequentially
D) Calculate the mean pixel intensity of each frame and plot a histogram

**Answer:** B

**Explanation:** `fob.compute_visualization()` applies dimensionality reduction (UMAP or t-SNE) to learned image embeddings, producing a 2D scatter plot where visually similar images cluster together. Exploring this in the FiftyOne App lets you click on clusters to understand what driving scenarios they represent, identify isolated points as potential sensor malfunctions or edge cases, and spot sparse regions indicating underrepresented conditions. This gives a holistic structural view of the dataset that no single metric can provide. Option A requires training a model first, which is premature — the goal is to understand the data before training, and a confusion matrix only shows class-level errors, not data structure. Option C imposes an arbitrary ordering with no relationship to visual content and makes it impossible to detect clusters or outliers. Option D reduces each image to a single scalar, losing all semantic information — a nighttime highway and a nighttime parking lot would have similar mean intensity but represent completely different scenarios.

**Task Statement:** 4.5

---

## Question 6
**Scenario:** An agricultural AI team has a drone image dataset with crop disease annotations. They want to create a view containing only images from the "corn" field group where disease severity is labeled "high" and the images were captured in July, excluding any samples that have already been reviewed by annotators. The dataset has `field_type`, `severity`, `capture_date`, and `reviewed` fields.

Which ViewStage chain is correct?

A) `dataset.match(F("field_type") == "corn").match(F("severity") == "high").match(F("capture_date").month() == 7).exclude(F("reviewed") == True)`
B) `dataset.match((F("field_type") == "corn") & (F("severity") == "high") & (F("capture_date").month() == 7) & (F("reviewed") == False))`
C) `dataset.select("field_type", "severity", "capture_date").match(F("reviewed") != True)`
D) `dataset.sort_by("severity").take(100)`

**Answer:** B

**Explanation:** Combining all conditions into a single `match()` call with the `&` operator is both correct and efficient — it applies one filter pass over the dataset rather than four sequential passes. The condition `F("reviewed") == False` excludes already-reviewed samples. Option A is functionally close but uses `exclude()` incorrectly — `exclude()` in FiftyOne expects sample IDs or a view to exclude, not a boolean expression. To filter on a boolean field, you should use `match(F("reviewed") == False)` as in Option B. Option C uses `select()`, which in FiftyOne selects fields to include in the view (like a SQL SELECT), not samples — it would show only those three fields on all samples without filtering anything. Option D ignores all filtering criteria and simply sorts by severity then takes 100 arbitrary samples, which has no relationship to the stated requirements.

**Task Statement:** 4.1

---

## Question 7
**Scenario:** A medical imaging team discovers that their chest X-ray classification model consistently predicts "pneumonia" with 0.92+ confidence on a batch of 500 images that were actually labeled "healthy" by board-certified radiologists. The team needs to determine whether the model has found genuine annotation mistakes or is systematically biased.

What is the most rigorous FiftyOne-based investigation approach?

A) Trust the model and relabel all 500 images as "pneumonia" automatically
B) Isolate the 500 disputed samples into a view, use `fob.compute_visualization()` to see if they cluster with known pneumonia cases or with healthy cases in embedding space, cross-reference against samples with the highest model confidence per class, and flag ambiguous cases for expert re-review
C) Delete the 500 images from the dataset since they are causing confusion
D) Lower the model's confidence threshold to 0.5 so it stops making high-confidence mistakes

**Answer:** B

**Explanation:** This approach combines multiple signals before making any data changes. If the 500 samples cluster with known pneumonia cases in embedding space, the model may have detected genuine annotation errors. If they cluster with healthy cases, the model likely has a systematic bias that needs architectural or training intervention. Cross-referencing with the highest-confidence correct predictions provides calibration context. Flagging for expert re-review ensures a domain specialist makes the final call on medical data — no automated decision should override board-certified radiologists without human verification. Option A blindly trusts model confidence over expert radiologists, which is dangerous in medical contexts — high confidence does not mean high correctness, and the model could have learned a spurious correlation (e.g., scanner artifacts). Option C destroys potentially valuable data and does not solve the underlying issue — the bias would remain in the model. Option D does not fix the problem; it just hides the symptom by making the model less confident about everything, degrading performance across all classes.

**Task Statement:** 4.2

---

## Question 8
**Scenario:** A retail analytics company has 80,000 product images across 500 SKU categories. They want to identify which product categories have insufficient visual diversity — for example, if all "blue t-shirt" images show the same angle and background, the model will fail on real-world variations. They need to quantify within-class visual diversity, not just count samples per class.

Which FiftyOne approach best measures within-class visual diversity?

A) Count the number of samples per class — more samples always means more diversity
B) Compute embeddings with `fob.compute_similarity()`, then for each class examine the distribution of pairwise embedding distances and use `fob.compute_visualization()` to visually inspect whether class clusters are tight (low diversity) or spread (high diversity)
C) Compare file sizes within each class — varied file sizes indicate varied content
D) Check the number of unique filenames per class as a proxy for diversity

**Answer:** B

**Explanation:** Embedding-based analysis captures semantic visual diversity that surface-level metrics miss entirely. Computing pairwise embedding distances within each class quantifies how visually varied the samples are — a class with low mean pairwise distance and a tight cluster in the visualization has low diversity regardless of sample count. Classes with small, dense clusters in the UMAP visualization are candidates for additional data collection with varied angles, lighting, and backgrounds. Option A conflates quantity with diversity — 1,000 images of the same blue t-shirt on a white background at the same angle provides zero additional visual diversity beyond the first few images. The model needs variation in pose, lighting, background, and occlusion, not repetition. Option C has no meaningful correlation with visual content — image compression is affected by complexity, resolution, and format settings, not by whether the image shows a different angle or background. Option D is entirely irrelevant — filenames are arbitrary identifiers that carry no visual information whatsoever.

**Task Statement:** 4.5
