# Domain 4 Assessment — Visual Data Exploration & Quality

---

## Question 1
**Scenario:** A data scientist wants to review all images in her autonomous driving dataset where the model predicted "pedestrian" with confidence below 0.5. She writes the following code:

```python
view = dataset.match(F("predictions.detections.confidence") < 0.5)
```

She gets back far more images than expected, including many with no pedestrian predictions at all. What is wrong with her approach?

A) She should use `filter_labels()` instead of `match()` — `match()` is returning any sample that has *any* detection with confidence below 0.5, regardless of class
B) The `confidence` field doesn't exist on detections
C) She needs to use `sort_by()` before `match()` for the filter to work
D) She should use `exists("predictions")` first because `match()` can't handle missing fields

**Answer:** A

**Explanation:** `match()` operates at the sample level — it includes or excludes entire samples based on a condition. Her expression matches any sample containing any detection (of any class) with confidence below 0.5. To isolate specifically pedestrian detections with low confidence, she should use `filter_labels("predictions", (F("label") == "pedestrian") & (F("confidence") < 0.5))`, which filters at the label level within each sample. This is the most important distinction in FiftyOne's query system: `match()` filters samples, `filter_labels()` filters labels within samples. Option B is incorrect — confidence is a standard field on detections. Option C reverses the pipeline logic. Option D is a valid practice but doesn't address the core problem.

**Task Statement:** 4.1

---

## Question 2
**Scenario:** You run your trained model on a classification dataset and compare predictions to ground truth. You find 500 samples where the model predicts "cat" with >0.95 confidence but the ground truth label is "dog." You assume these are all model errors and plan to retrain with more cat vs. dog examples.

What should you do before retraining?

A) Immediately retrain with augmented cat and dog images — 500 errors is a clear signal
B) Manually review the 500 disagreements in FiftyOne, because high-confidence model disagreements are often label errors in the ground truth, not model failures
C) Delete the 500 samples since they're clearly corrupted data
D) Lower the model's confidence threshold to reduce the number of high-confidence disagreements

**Answer:** B

**Explanation:** When a well-trained model confidently disagrees with the ground truth, the label is wrong approximately as often as the model is wrong — sometimes more often. A model predicting "cat" at 0.95 confidence on an image labeled "dog" may be looking at an actual cat that the annotator mislabeled. Jumping to retraining (A) without inspecting the disagreements means you might be training the model to match incorrect labels. Deleting the samples (C) throws away valuable information. Lowering the threshold (D) hides the problem without addressing it. The correct workflow is: sort disagreements by confidence, visually review in FiftyOne, correct the labels that are genuinely wrong, then retrain.

**Task Statement:** 4.2

---

## Question 3
**Scenario:** A drone survey team has 800,000 aerial images. They compute CLIP embeddings and run `compute_similarity()` to find near-duplicates. They identify 200,000 images as near-duplicates and plan to remove all of them before training. A team member objects, saying some "duplicates" might be valuable.

When would removing near-duplicates actually hurt model performance?

A) Never — duplicates always waste compute and should be removed
B) When the "duplicates" are actually images of the same location taken under different conditions (seasons, lighting, weather) that the model needs to learn to generalize across
C) When the dataset is larger than 500,000 images, because large datasets benefit from redundancy
D) When the embedding model used for similarity is more than one year old

**Answer:** B

**Explanation:** Near-duplicate detection based on embeddings captures semantic similarity. Two images of the same field — one in summer sunlight and one in winter overcast — may have very high embedding similarity but represent exactly the variation the model needs for robust performance. Removing these "duplicates" would remove the diversity that teaches the model to handle different conditions. The correct approach is to review a sample of the flagged duplicates, establish domain-appropriate similarity thresholds, and distinguish between true redundancy (burst-mode captures of identical scenes) and valuable variation (same location, different conditions). Option A is an oversimplification. Option C has no basis in practice. Option D is irrelevant to the fundamental question.

**Task Statement:** 4.3

---

## Question 4
**Scenario:** Your object detection dataset has the following class distribution:

| Class | Annotations |
|-------|------------|
| car | 45,000 |
| person | 32,000 |
| truck | 8,500 |
| bicycle | 350 |
| motorcycle | 420 |

Your model achieves 94% mAP overall but only 31% AP on "bicycle." A manager suggests collecting 10,000 more bicycle images to balance the dataset.

What analysis should you perform in FiftyOne before committing to data collection?

A) Compute embeddings on the bicycle images to verify they represent diverse enough scenarios — 350 images from one intersection will not train a general bicycle detector regardless of how many more you collect from that same intersection
B) No analysis needed — the low count clearly explains the low AP, so just collect more data
C) Remove the bicycle class entirely since it will never reach the performance of the majority classes
D) Apply 100x data augmentation to the existing bicycle images instead of collecting new data

**Answer:** A

**Explanation:** The count alone does not tell the full story. If the 350 bicycle annotations are from varied scenes, lighting conditions, and viewpoints, the representation might be adequate and the low AP might stem from a different problem (annotation quality, class confusion with motorcycle, etc.). If all 350 come from the same few scenes, collecting more from similar contexts will not help. FiftyOne's embedding visualization and uniqueness analysis can reveal whether the existing samples are diverse. Check for: annotation quality on existing bicycle samples, confusion between bicycle and motorcycle predictions, and whether the 350 samples cover the deployment scenarios. Then you can make an informed collection decision. Option B skips critical diagnostic work. Option C abandons a requirement without investigation. Option D can help but doesn't address potential diversity issues.

**Task Statement:** 4.4

---

## Question 5
**Scenario:** You run `compute_visualization()` with CLIP embeddings on a 50,000-image wildlife dataset. In the Embeddings panel, you notice that "deer" and "elk" samples form a single overlapping cluster, but the model's classification accuracy for both classes individually is only 62%. A colleague suggests adding more training epochs to improve separation.

What does the embedding visualization tell you about this problem, and what is the right next step?

A) More epochs will eventually separate the clusters — the model just needs more training time
B) The overlapping clusters indicate that CLIP embeddings cannot distinguish these classes at the visual feature level, suggesting either the classes need more visually distinctive training examples, the taxonomy should be revised (merge into one class with a downstream specialist), or the annotation criteria need clarification
C) The visualization is just an approximation and should be ignored in favor of the accuracy metric
D) Switch from CLIP to a larger embedding model, which will always produce better separation

**Answer:** B

**Explanation:** Embedding overlap means the images of deer and elk are semantically similar at the feature level — they look alike to the model. More training epochs (A) cannot create separation that doesn't exist in the feature space; it will just lead to overfitting. The visualization is revealing a structural problem: either the classes are genuinely hard to distinguish visually (requiring images with diagnostic features like antler shape), the annotation guidelines are inconsistent (annotators disagree on which is which), or the taxonomy is too fine-grained for the available visual evidence. Option C dismisses a powerful diagnostic tool. Option D might help marginally but doesn't address the fundamental data or taxonomy issue. The right workflow is: review the overlapping region in FiftyOne, check annotation consistency, and decide whether to improve the training data, merge classes, or build a specialized sub-classifier.

**Task Statement:** 4.5

---

## Question 6
**Scenario:** You run `compute_uniqueness()` on a 100,000-image manufacturing inspection dataset. You sort by uniqueness ascending and find that the bottom 5,000 samples (lowest uniqueness scores) are all images of "good" parts with no defects, taken under identical lighting.

Should you remove all 5,000 low-uniqueness samples?

A) Yes — they're redundant and removing them will improve training efficiency without affecting performance
B) No — you should check what fraction of the total "good" class they represent first, because if removing them creates a class imbalance or reduces the model's ability to learn the baseline "good" appearance, you'd be trading one problem for another
C) Yes — low uniqueness always means the samples are worthless
D) No — you should never remove any samples from a dataset

**Answer:** B

**Explanation:** Low uniqueness means these samples are similar to each other, but that doesn't automatically make them expendable. If the "good" class has 60,000 samples and you remove 5,000 nearly identical ones, the impact is minimal. But if "good" only has 8,000 samples, removing 5,000 might leave too few examples for the model to learn the normal baseline appearance — which is critical for anomaly detection. Additionally, some apparent "redundancy" in manufacturing datasets is intentional: many images of normal parts ensure the model develops a robust representation of "good." The right approach is to analyze what you're removing relative to the overall distribution, then subsample the redundant cluster rather than eliminating it entirely.

**Task Statement:** 4.5

---

## Question 7
**Scenario:** You have a dataset split into train (70%), validation (15%), and test (15%). After running `compute_similarity()`, you discover that 1,200 images in the test set have near-exact duplicates in the training set. Your model's test accuracy is 96%.

How should you interpret the 96% test accuracy?

A) The accuracy is valid — duplicates between splits don't affect evaluation
B) The accuracy is inflated — the model has effectively memorized 1,200 test images during training, so the true generalization accuracy is lower than 96%. You need to deduplicate across splits and re-evaluate
C) The accuracy is deflated — duplicates between splits make evaluation harder
D) Remove the duplicates from the training set only and keep the test set intact

**Answer:** B

**Explanation:** Data leakage between train and test splits is one of the most insidious evaluation errors. When near-duplicate images exist in both splits, the model's test performance reflects partial memorization, not generalization. On those 1,200 leaked samples, the model is being "tested" on data it has already seen. The 96% accuracy overestimates real-world performance. The fix is to deduplicate across splits: for each duplicate pair, keep one copy in one split and remove it from the other. Then re-run evaluation. Option A ignores a well-documented evaluation pitfall. Option C is backwards. Option D is partially correct but incomplete — you need to ensure no leakage exists in either direction and then re-evaluate, not just remove from one side.

**Task Statement:** 4.3

---

## Question 8
**Scenario:** You're building a ViewStage pipeline to prepare a dataset review for your team. You need to: (1) find all images with at least one "defect" detection, (2) among those, keep only defect detections with confidence above 0.6, (3) sort by confidence descending, and (4) limit to the top 200. A colleague writes:

```python
view = (
    dataset
    .filter_labels("predictions", F("label") == "defect")
    .filter_labels("predictions", F("confidence") > 0.6)
    .sort_by("predictions.detections.confidence", reverse=True)
    .limit(200)
)
```

She gets an error on the `sort_by()` line. What is wrong, and how would you fix the pipeline?

A) `sort_by()` cannot sort by a nested list field — you need to compute a sample-level aggregation first (like max confidence) and sort by that
B) The two `filter_labels()` calls cancel each other out
C) You should use `match()` instead of `filter_labels()` for the first filter
D) `limit()` must come before `sort_by()`

**Answer:** A

**Explanation:** `sort_by()` operates at the sample level — it needs a single value per sample to define the sort order. `predictions.detections.confidence` is a list of values (one per detection), not a scalar, so FiftyOne cannot determine how to sort. The fix is to either: (1) chain `filter_labels()` to isolate the desired detections, then compute a sample-level max confidence using a ViewExpression like `F("predictions.detections.confidence").max()` and sort by that, or (2) use `set_field()` to store the max defect confidence as a sample-level field and sort by it. Additionally, the two `filter_labels()` calls can be combined into one: `filter_labels("predictions", (F("label") == "defect") & (F("confidence") > 0.6))`. Option B is incorrect — the calls apply sequentially and are compatible. Option C would change the semantics (removing entire samples vs. filtering labels within samples). Option D has the logic reversed — sorting must happen before limiting.

**Task Statement:** 4.1
