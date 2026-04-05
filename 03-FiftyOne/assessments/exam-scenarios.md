# Exam Scenario Assessments

These scenario-based questions test integrated understanding across multiple domains. Each scenario presents a realistic situation requiring judgment about data quality, FiftyOne usage, and workflow design.

---

## Scenario 1: Manufacturing Defect Detection

**Context:** SteelVision Inc. manufactures precision steel components for aerospace applications. Their quality control team has collected 120,000 images of steel surfaces captured by line-scan cameras on the production floor. The images contain six defect classes: scratches, pitting, inclusions, cracks, delamination, and roll marks. Defect frequency varies dramatically — cracks appear in only 0.3% of images while scratches appear in 18%.

The team has hired two annotation firms to label the data. Firm A used bounding boxes, and Firm B used instance segmentation masks. Both firms worked from the same images but were given slightly different annotation guidelines. The team wants to build a real-time defect detection model that can flag parts for rejection at line speed (200ms per image). They plan to use FiftyOne to consolidate the annotations, assess data quality, train a model, and validate its readiness for deployment.

The factory runs three shifts, and image quality differs noticeably between shifts due to lighting calibration drift. The night shift images tend to be slightly darker with more noise, and the quality team suspects this is causing annotation inconsistencies.

**Domains tested:** 1, 3, 4

### Question 1.1

The team loads Firm A's COCO-format bounding box annotations and Firm B's instance segmentation masks into FiftyOne. They want both annotation sets visible on the same images to compare them. What is the correct approach?

A) Export both to a common format first, then load the unified export as a single label field
B) Load each format using its native dataset type into separate datasets, then use `merge_samples()` to combine them with distinct label field names (e.g., `detections_firma` and `segmentations_firmb`)
C) Load only the segmentation masks since they contain more spatial information than bounding boxes
D) Load both into the same label field using `add_samples()` and let FiftyOne auto-merge overlapping annotations

**Answer:** B

**Explanation:** Loading each in its native format preserves fidelity and avoids conversion artifacts. Using `merge_samples()` with distinct field names lets you overlay both annotation sets on the same images in the App, making visual comparison straightforward. Option A introduces conversion risk — errors from format translation could masquerade as annotation disagreements. Option C discards half the data, making comparison impossible. Option D conflates two fundamentally different label types (Detections vs Segmentation) in a single field, which would cause schema errors or data corruption.

**Task Statement:** 3.2

### Question 1.2

After merging the annotations, the team notices that Firm A labeled 4,200 images as containing "inclusions" while Firm B labeled only 1,100 of those same images with inclusion masks. The team suspects Firm B missed many inclusions. What FiftyOne workflow would most efficiently identify the disagreements?

A) Export both label sets to CSV and compare counts in a spreadsheet
B) Use `match()` with a ViewField expression to find samples where `detections_firma` contains an "inclusion" label but `segmentations_firmb` does not, then visually inspect those samples in the App
C) Compute embeddings using the Brain and look for clusters that correspond to inclusions
D) Retrain the model using only Firm A's labels since they found more defects

**Answer:** B

**Explanation:** A `match()` expression like `F("detections_firma.detections").filter(F("label") == "inclusion").length() > 0 & F("segmentations_firmb.detections").filter(F("label") == "inclusion").length() == 0` isolates exactly the disagreement set. Viewing these in the App lets the team determine whether Firm B genuinely missed defects or whether Firm A over-annotated ambiguous surfaces. Option A loses the visual context needed to judge who is correct. Option C is useful for finding data structure patterns but doesn't directly answer the annotation disagreement question. Option D assumes Firm A is correct without verification, which could introduce thousands of false positive labels.

**Task Statement:** 4.1

### Question 1.3

The team discovers that the night shift images (roughly 35,000 samples) have systematically lower annotation agreement between the two firms. They hypothesize that lighting degradation makes defects harder to see. Using FiftyOne Brain, which analysis would best confirm or reject this hypothesis?

A) Run near-duplicate detection to find redundant night shift images
B) Compute embeddings for all images and visualize them, checking whether night shift images cluster separately from day shift images — then cross-reference those clusters with annotation disagreement rates
C) Calculate the mean pixel intensity of night shift images versus day shift images
D) Run mistakenness scoring on the night shift subset only

**Answer:** B

**Explanation:** Embedding visualization reveals whether night shift images occupy a distinct region of feature space, which would confirm a distribution shift. Cross-referencing those clusters with disagreement rates (using tags or custom fields for agreement scores) connects the visual distribution difference to the annotation quality issue. If night shift images cluster separately and that cluster has higher disagreement, the lighting hypothesis is supported. Option A addresses data redundancy, not quality. Option C captures only one dimension (brightness) and misses texture, contrast, and noise differences that affect annotation quality. Option D scores label errors but doesn't establish the causal link to lighting conditions.

**Task Statement:** 4.4

### Question 1.4

Given the extreme class imbalance (cracks at 0.3% vs scratches at 18%), the team is concerned their defect detection model will fail on rare defect types. Before training, what FiftyOne-based data curation strategy would best address this?

A) Randomly downsample the scratch class to match the crack class count, discarding 99% of scratch images
B) Use the Brain's representativeness scoring on each defect class separately, then curate a balanced training set that preserves the most representative examples of each class while ensuring minimum coverage thresholds for rare classes
C) Duplicate the crack images until the class counts are equal
D) Ignore the imbalance since the model will learn to weight rare classes automatically

**Answer:** B

**Explanation:** Representativeness scoring identifies which samples best represent the distribution of each class, allowing intelligent curation rather than blind sampling. By setting minimum coverage thresholds for rare classes (e.g., ensuring at least N crack examples survive curation), the team builds a training set that is balanced without sacrificing diversity within each class. Option A is destructive — discarding 99% of scratches throws away valuable variation in scratch appearance. Option C creates exact duplicates that contribute no new information and can cause overfitting. Option D is incorrect because standard training losses are not inherently class-balanced; without intervention, the model will optimize for majority class accuracy.

**Task Statement:** 1.4

---

## Scenario 2: Retail Shelf Monitoring

**Context:** FreshMart, a national grocery chain with 800 stores, is deploying a shelf monitoring system. Ceiling-mounted cameras capture images of store shelves every 30 minutes. The system must detect three conditions: out-of-stock positions (empty shelf slots), misplaced products (products in wrong locations), and planogram compliance (whether the shelf layout matches the corporate plan).

The team has collected 2 million shelf images across 50 pilot stores over 6 months. They have planogram data (expected shelf layouts) as structured metadata and product detection annotations from an annotation vendor who labeled product bounding boxes with SKU identifiers. The model needs to achieve 90%+ recall for out-of-stock detection to be commercially viable.

A complication has emerged: the annotation vendor used absolute pixel coordinates for bounding boxes, but images from different stores have different resolutions (some stores have 4K cameras, others have 1080p). The team also discovered that 12% of images have partial shelf occlusion from shopping carts, customers, or restocking equipment.

**Domains tested:** 2, 4, 5

### Question 2.1

The team loads all 2 million images into FiftyOne. They need to systematically identify and handle the 12% of images with shelf occlusion. What is the most effective FiftyOne workflow?

A) Manually browse through all images in the App and tag occluded ones
B) Add an `occlusion_score` field computed by a lightweight classification model, then use `sort_by("occlusion_score", reverse=True)` to surface the most occluded images first, tag confirmed occlusions, and create a saved view for the clean subset
C) Delete all images that might contain occlusion to ensure a clean dataset
D) Ignore occlusion since 12% is a small fraction of the total dataset

**Answer:** B

**Explanation:** A model-assisted workflow scales to 2 million images where manual review cannot. Sorting by occlusion score surfaces the worst cases first, letting the team tag efficiently through the highest-impact images. Creating a saved view for the clean subset preserves the occluded images (they may be useful for robustness training later) while allowing the team to work with clean data when needed. Option A is infeasible at 2 million images. Option C permanently destroys data that could be valuable for training occlusion-robust models. Option D is incorrect because 12% of 2 million is 240,000 images — enough to meaningfully degrade model performance if not handled.

**Task Statement:** 4.2

### Question 2.2

The team discovers the coordinate system mismatch: some annotations use absolute pixel coordinates while FiftyOne expects normalized `[x, y, w, h]` format in the range `[0, 1]`. Images range from 1920x1080 to 3840x2160 resolution. What must they do when loading this data?

A) Load the annotations as-is since FiftyOne automatically detects and converts absolute coordinates
B) Write a custom importer or post-load transformation that normalizes each bounding box by dividing x and w by image width and y and h by image height, ensuring all coordinates fall in `[0, 1]`
C) Resize all images to the same resolution before loading so the absolute coordinates become consistent
D) Store the absolute coordinates in a custom field and use them directly for evaluation

**Answer:** B

**Explanation:** FiftyOne's `Detection` label type expects bounding boxes as normalized `[x, y, w, h]` where each value is relative to image dimensions and falls in `[0, 1]`. Absolute pixel coordinates must be explicitly normalized using each image's actual dimensions. This can be done via a custom `DatasetImporter` or by iterating samples post-load and transforming the coordinates using `sample.metadata.width` and `sample.metadata.height`. Option A is incorrect — FiftyOne does not auto-detect coordinate systems; it trusts the values you provide. Option C alters the original images and introduces interpolation artifacts without solving the annotation format issue. Option D would cause evaluation functions to produce incorrect IoU calculations since they expect normalized coordinates.

**Task Statement:** 2.1

### Question 2.3

After training their out-of-stock detection model, the team achieves 78% recall — below the 90% commercial target. They run `evaluate_detections()` in FiftyOne. The per-class results show that "empty shelf slot" has 0.65 recall while individual product SKU detection has 0.89 recall. What FiftyOne analysis would best diagnose why empty shelf detection is underperforming?

A) Increase the model's confidence threshold to filter out low-confidence predictions
B) Filter to false negative empty-slot detections using the evaluation results, visualize them in the App, and look for patterns — such as whether failures cluster around specific shelf positions, lighting conditions, or partial occlusion scenarios
C) Retrain with more epochs since the model has not converged
D) Switch to a larger model architecture to improve capacity

**Answer:** B

**Explanation:** Evaluation results from `evaluate_detections()` store per-sample match information, including which ground truth boxes were missed (false negatives). Filtering to `match(F("eval_tp") == 0)` or examining the `eval_fn` field isolates exactly the failure cases. Visualizing these in the App often reveals systematic patterns: empty slots near shelf edges might be cropped, certain shelf colors might blend with the empty background, or partial occlusions might hide the empty space. These insights drive targeted data collection or annotation fixes — far more actionable than the model-side interventions in Options C and D. Option A would reduce recall further, moving in the wrong direction.

**Task Statement:** 5.2

### Question 2.4

The team wants to compare their current model against a newer architecture trained on the same data. Both models have been run on the validation set with predictions stored as `predictions_v1` and `predictions_v2`. What is the most informative FiftyOne comparison workflow?

A) Compare only the aggregate mAP numbers and choose the higher one
B) Run `evaluate_detections()` for each prediction field separately, then use the App to filter for samples where v1 is correct but v2 fails (and vice versa), examining whether the errors are random or systematic
C) Visually scan through random samples in the App to get a general impression
D) Average the predictions from both models and evaluate the ensemble

**Answer:** B

**Explanation:** Aggregate metrics hide important failure mode differences. Model v2 might have higher overall mAP but fail catastrophically on a specific store layout or product category that v1 handles well. By filtering to disagreement cases — where one model succeeds and the other fails — the team discovers whether v2's errors are in the same distribution as v1's or represent new failure modes. This is critical for deployment decisions: a model that fails on a new set of edge cases may require different mitigation than one that simply has slightly lower overall performance. Option A oversimplifies the decision. Option C is unsystematic at scale. Option D is a valid technique but doesn't answer the diagnostic question about where each model fails.

**Task Statement:** 5.3

---

## Scenario 3: Medical Imaging Audit

**Context:** Regional Medical Center has been using an AI-assisted radiology system for 18 months to help radiologists detect lung nodules in chest X-rays. The hospital's AI governance committee has commissioned an audit to evaluate the system's real-world performance. The audit team has collected 45,000 chest X-rays from the deployment period, each with: (1) the AI system's predictions (bounding boxes around suspected nodules with confidence scores), (2) the radiologist's final diagnosis (ground truth), and (3) patient metadata including age bracket, imaging equipment ID, and whether the image was taken in the ER or during a scheduled visit.

The governance committee is particularly concerned about two issues: whether the AI system performs equitably across patient demographics and imaging conditions, and whether the system's false negative rate (missed nodules) is within acceptable clinical thresholds. A false negative in this context means a nodule present in the image that the AI system failed to flag, potentially delaying diagnosis.

The audit must produce evidence-based findings with specific examples, not just aggregate statistics.

**Domains tested:** 1, 4, 5

### Question 3.1

The audit team loads all 45,000 X-rays into FiftyOne with the AI predictions and radiologist ground truth as separate label fields. They need to assess the AI system's false negative rate segmented by imaging equipment. The hospital uses three different X-ray machines. What FiftyOne workflow produces the required analysis?

A) Run `evaluate_detections()` once on the full dataset and report the overall false negative rate
B) Add the equipment ID as a sample field, then run `evaluate_detections()` on the full dataset. Use `match()` to create views filtered by each equipment ID, and compute per-equipment recall from the evaluation results using `values()` and aggregation methods
C) Export the data to a statistical analysis tool since FiftyOne cannot segment evaluation metrics
D) Train three separate models, one per equipment type, and compare their performance

**Answer:** B

**Explanation:** FiftyOne stores evaluation results at the sample level, which means you can slice and aggregate results by any sample field after running evaluation once. Creating views filtered by `equipment_id` and then computing recall within each view reveals whether certain machines produce images that systematically degrade AI performance. For example, an older machine might produce lower-contrast images that cause the AI to miss smaller nodules. This approach is both efficient (single evaluation run) and flexible (any metadata field can be used as a segmentation axis). Option A provides only aggregate numbers that could mask equipment-specific disparities. Option C underestimates FiftyOne's aggregation capabilities. Option D conflates model training with model evaluation — the audit evaluates an existing deployed model, not new models.

**Task Statement:** 5.1

### Question 3.2

The audit reveals that the AI system's false negative rate is 11% overall but 23% for images taken in the ER. The audit team hypothesizes that ER images are often lower quality (patient positioning, portable equipment, motion artifacts). How should they use FiftyOne to investigate this hypothesis?

A) Compare the average file size of ER images versus scheduled visit images
B) Compute embeddings for all images using FiftyOne Brain, visualize the embedding space, and check whether ER images form a distinct cluster separated from scheduled visit images — then overlay the false negative indicators to see if failures concentrate in the ER cluster
C) Randomly sample 100 ER false negatives and 100 scheduled visit images and compare them visually
D) Recommend the hospital stop using AI in the ER until the issue is resolved

**Answer:** B

**Explanation:** Embedding visualization captures the full visual characteristics of images — not just brightness or resolution, but positioning, artifacts, contrast patterns, and equipment signatures. If ER images cluster separately in embedding space, it confirms a distribution shift. Overlaying false negative status on the visualization shows whether failures are concentrated in this shifted distribution or scattered randomly. This provides the governance committee with visual, quantifiable evidence rather than anecdotal observations. Option A is a crude proxy that misses most image quality dimensions. Option C is too small a sample to establish systematic patterns in a 45,000-image dataset. Option D is a policy recommendation without diagnostic evidence.

**Task Statement:** 4.4

### Question 3.3

The governance committee wants to understand whether the AI system exhibits bias related to patient age. The audit team has age brackets (18-40, 41-60, 61-80, 80+) as metadata. They compute per-bracket recall and find that recall drops from 94% for patients aged 41-60 to 72% for patients aged 80+. Before reporting this as bias, what additional FiftyOne analysis is essential?

A) Report the finding immediately since a 22-percentage-point gap is clearly evidence of bias
B) Investigate whether the performance gap is driven by age itself or by confounding factors — use FiftyOne to cross-tabulate age bracket with equipment type, visit context (ER vs scheduled), and nodule size distribution, since elderly patients may disproportionately present via ER with portable equipment and may have smaller or more diffuse nodules that are inherently harder to detect
C) Increase the confidence threshold for elderly patients to compensate for the lower recall
D) Exclude elderly patients from the analysis since their images are inherently more challenging

**Answer:** B

**Explanation:** Apparent bias in aggregate metrics can result from confounding variables rather than direct discrimination. If elderly patients disproportionately arrive via ER (where image quality is lower) and tend to present with smaller or more diffuse nodules (which are objectively harder to detect regardless of patient age), then the performance gap may reflect data quality and clinical presentation differences rather than age-based model bias. FiftyOne's filtering and aggregation capabilities allow cross-tabulating these factors: create views filtered by age AND visit type, compute recall within each combination, and determine whether the age effect persists after controlling for confounders. Option A reports correlation as causation. Option C adjusts the wrong parameter — lower confidence thresholds would increase recall but also increase false positives. Option D removes a critical population from the audit.

**Task Statement:** 4.5

---

## Scenario 4: Autonomous Vehicle Data Pipeline

**Context:** DriveAI, a self-driving vehicle startup, operates a fleet of 30 test vehicles collecting sensor data across three cities. Each vehicle produces approximately 2TB of data per day from cameras, LiDAR, and radar. The perception team focuses on camera data: eight cameras per vehicle capturing synchronized frames at 10Hz. Their current training dataset contains 8 million labeled frames with 3D bounding boxes for vehicles, pedestrians, cyclists, and traffic signs.

The team is preparing for a new model release and needs to curate a high-quality training set from the last three months of data collection (approximately 500 million unlabeled frames). Their goals are: (1) select the most valuable 2 million frames for annotation to maximize model improvement, (2) ensure the new data covers known failure modes from the current model, and (3) avoid duplicating scenarios already well-represented in the existing training set.

They have identified three critical failure modes from field testing: the current model struggles with partially occluded pedestrians at intersections, cyclists making hand signals, and vehicles in heavy rain or fog.

**Domains tested:** 3, 4, 5

### Question 4.1

The team needs to load 500 million unlabeled frames into FiftyOne for curation. The frames are stored in a hierarchical directory structure: `/{city}/{vehicle_id}/{date}/{camera_id}/{timestamp}.jpg`. What is the most effective loading strategy?

A) Use `fo.Dataset.from_dir()` with `ImageDirectory` type pointed at the root directory to load all 500 million images at once
B) Use programmatic sample creation with `fo.Sample`, iterating through the directory structure and parsing the path components to populate metadata fields (city, vehicle_id, date, camera_id) as custom sample fields, loading in batches and using `add_samples()` with batch_size parameter
C) Create separate datasets for each city and never combine them
D) Convert all images to a standard format first, then load them using a Zoo dataset type

**Answer:** B

**Explanation:** At 500 million frames, the loading strategy must be both metadata-aware and memory-efficient. Programmatic creation lets the team parse the directory path structure to extract city, vehicle_id, date, and camera_id as structured sample fields — enabling powerful downstream filtering. Batch loading with `add_samples()` manages memory by processing chunks rather than loading all samples into memory at once. These metadata fields are essential for stratified sampling later. Option A would load all images as flat samples with no metadata, making stratified curation impossible. At 500 million images, it would also likely exhaust memory. Option C prevents cross-city analysis and makes balanced sampling harder. Option D is unnecessary — FiftyOne handles standard image formats natively, and Zoo dataset types are for benchmark datasets, not custom data.

**Task Statement:** 3.1

### Question 4.2

To identify frames containing their three critical failure modes (occluded pedestrians, cyclist hand signals, vehicles in adverse weather), the team runs the current model on all 500 million frames and stores predictions. They want to find frames where the model is likely failing. What FiftyOne approach best surfaces these failure candidates without ground truth labels?

A) Filter to predictions with confidence scores below 0.3 since low confidence indicates model uncertainty
B) Use a multi-pronged approach: (1) compute embeddings and find frames that are distant from existing training data in embedding space, (2) apply hardness scoring from the Brain to rank frames by model difficulty, and (3) filter by metadata (rain/fog weather tags, intersection locations) to target known failure scenarios — then combine these signals to prioritize annotation
C) Randomly sample 2 million frames since any selection is equally likely to contain failure modes
D) Only select frames from the city with the most traffic since it will have the most edge cases

**Answer:** B

**Explanation:** Each signal targets a different aspect of data value. Embedding distance from training data identifies frames the model has not seen similar examples of — high novelty. Hardness scoring uses the model's own uncertainty patterns to flag frames it finds difficult. Metadata filtering uses domain knowledge to target specific known failure scenarios (adverse weather, intersections where occlusion occurs). Combining these signals through weighted scoring or intersection produces a curation strategy that is both data-driven and informed by known failure modes. Option A uses only one weak signal — low confidence can indicate many things beyond the target failure modes. Option C ignores all available signals. Option D introduces geographic bias and misses failure modes that occur across all cities.

**Task Statement:** 4.4

### Question 4.3

After annotating 2 million curated frames, the team trains a new model and evaluates it on a held-out test set. They run `evaluate_detections()` in FiftyOne and find that overall mAP improved from 0.71 to 0.78. However, when they filter evaluation results to the three critical failure modes, they find: occluded pedestrian recall improved (0.45 to 0.68), cyclist hand signal recall barely changed (0.32 to 0.35), and adverse weather vehicle detection actually regressed (0.61 to 0.54). What should the team investigate first?

A) The overall mAP improved, so the new model is strictly better and should be deployed
B) Filter to adverse weather false negatives in FiftyOne, visualize them, and determine whether the regression is caused by annotation quality issues in the new weather data, a distribution mismatch between curated weather samples and the test set, or a model capacity issue where improving on pedestrians came at the cost of weather performance
C) Discard the new model entirely since it regressed on one failure mode
D) Increase the IoU threshold for weather evaluations since weather images are inherently harder

**Answer:** B

**Explanation:** Performance regression on a targeted failure mode after intentionally curating data for it signals a problem that requires root cause analysis, not blind acceptance or rejection. FiftyOne's evaluation results let you filter to the specific false negatives in adverse weather and visually inspect them. Common causes include: poor annotation quality on the new weather data (annotators unfamiliar with rain-distorted bounding boxes), a mismatch between the types of weather in the curated set versus the test set (e.g., curated mostly fog but tested mostly rain), or a capacity tradeoff where the model redistributed its limited capacity toward pedestrians at the expense of weather robustness. Each cause demands a different fix. Option A ignores a critical safety regression. Option C is premature without understanding the cause. Option D changes the evaluation criteria rather than fixing the underlying problem.

**Task Statement:** 5.2

### Question 4.4

The team needs to ensure their new 2 million curated frames do not introduce near-duplicates of images already in the existing 8 million frame training set. Near-duplicates could cause data leakage between training and validation splits. What FiftyOne workflow addresses this?

A) Compare file names between the old and new datasets to find matches
B) Compute embeddings for both the existing and new datasets, then use FiftyOne Brain's near-duplicate detection across the combined dataset to identify pairs with similarity above a threshold, and remove or flag new frames that are near-duplicates of existing training data
C) Visually inspect random samples from both datasets to check for overlap
D) Use different random seeds for the train/val split to minimize leakage probability

**Answer:** B

**Explanation:** Near-duplicates are visually similar images that may have different filenames, resolutions, or minor crops — filename comparison misses these entirely. Brain near-duplicate detection uses embedding similarity to find semantically similar images regardless of surface-level differences. Running it across the combined 10 million frames (merged via `merge_samples()` or by combining datasets) with a configurable similarity threshold surfaces candidates for removal. The team can then tag duplicates in the new data and exclude them before training. Option A catches only exact filename matches, missing the vast majority of near-duplicates. Option C is infeasible at 10 million frames. Option D is a probabilistic mitigation that does not prevent leakage — it merely reduces its expected impact, which is insufficient for safety-critical autonomous vehicle applications.

**Task Statement:** 3.4
