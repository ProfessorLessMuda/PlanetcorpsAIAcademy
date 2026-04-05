# Module 05 — Model Evaluation & AI Workflows

## Domain Weighting: 20%

## Objective
Learn how to evaluate object detection and classification models using FiftyOne's evaluation API, interpret per-class and per-sample results to diagnose failure patterns, compare multiple models side by side, and design iterative data improvement workflows that close the loop between evaluation and retraining.

## Task Statements Covered
- 5.1: Evaluate object detection models using FiftyOne's evaluation API
- 5.2: Analyze per-class and per-sample evaluation results to find failure patterns
- 5.3: Compare multiple models on the same dataset
- 5.4: Design end-to-end data quality improvement workflows using FiftyOne

## Why This Matters

Most teams treat model evaluation as a single number: "We got 0.82 mAP." That number tells you almost nothing about where your model actually fails, which classes are dragging performance down, or what you should do next. Aggregate metrics hide the problems that matter most in production — the pedestrian detector that works perfectly on adults but misses children, the manufacturing inspector that catches large defects but ignores hairline cracks.

FiftyOne's evaluation API turns model evaluation from a single number into an interactive investigation. You can drill from mAP down to per-class precision, down to the individual images where your model confused a stop sign with a yield sign. More importantly, you can build repeatable workflows: evaluate, find failures, fix the data, retrain, re-evaluate. This is how production AI teams actually improve models — not by architecture search, but by systematic data iteration.

If you manage an AI initiative, this module shows you how to hold your team accountable for model quality at the sample level, not just the dashboard level. If you build models, this is the workflow that turns a 0.82 into a 0.93.

---

## Key Concepts

### 5.1 Evaluating Object Detection Models with FiftyOne

**Plain Language:**
Object detection evaluation answers a deceptively simple question: did the model find the right objects in the right places? A prediction is "correct" only if it identifies the right class and its bounding box overlaps sufficiently with the ground truth box. FiftyOne's `evaluate_detections()` method handles the matching, scoring, and metric computation in one call, then stores results directly on each sample so you can explore them visually.

The critical parameter is the IoU (Intersection over Union) threshold — the minimum overlap between a predicted box and a ground truth box for the prediction to count as a match. An IoU of 0.5 is the traditional PASCAL VOC standard (the boxes must overlap by at least 50%). COCO-style evaluation averages across multiple IoU thresholds from 0.5 to 0.95, which is stricter and rewards tighter localization.

**How It Works:**

```python
import fiftyone as fo
import fiftyone.zoo as foz

# Load a dataset with ground truth and predictions
dataset = foz.load_zoo_dataset("quickstart")

# Evaluate object detections against ground truth
# "predictions" = the field containing model predictions
# "ground_truth" = the field containing annotations
results = dataset.evaluate_detections(
    "predictions",
    gt_field="ground_truth",
    eval_key="eval",          # stores results under this key
    iou=0.50,                 # IoU threshold for matching
    compute_mAP=True,         # compute mean Average Precision
)

# Print aggregate metrics
results.print_report()

# Access mAP directly
print(f"mAP@0.50: {results.mAP():.4f}")
```

After evaluation, FiftyOne adds fields to every sample and every detection label. Each prediction gets a boolean `eval` field indicating whether it was a true positive (TP), false positive (FP), or unmatched. Each ground truth label gets a field indicating whether it was matched (TP) or missed (false negative, FN). This per-label tagging is what makes FiftyOne's evaluation different from just running a script that spits out a number — the results live on the data itself.

For classification evaluation, the equivalent method is `evaluate_classifications()`:

```python
# For image classification tasks
results = dataset.evaluate_classifications(
    "predictions",
    gt_field="ground_truth",
    eval_key="eval",
)

# Print per-class precision, recall, F1
results.print_report()
```

**Real-World Example:**
An autonomous vehicle team had a pedestrian detector reporting 0.78 mAP. They ran `evaluate_detections()` at IoU=0.75 (stricter than the default 0.5) and mAP dropped to 0.51. The model was finding pedestrians in roughly the right area, but its bounding boxes were consistently too large — cutting off at the feet or including background. This distinction between "model can't find pedestrians" and "model finds pedestrians but draws sloppy boxes" leads to completely different remediation strategies. With IoU=0.5, the problem was invisible.

**Lean AI Sigma Connection:**
IoU threshold selection is a **measurement system analysis** decision. In manufacturing quality, you calibrate your gauges before measuring parts — if your gauge isn't precise enough, you can't tell good parts from bad. The IoU threshold is your gauge resolution for detection quality. Setting it too low (0.3) means you can't distinguish good detections from sloppy ones. Setting it too high (0.95) means almost nothing qualifies as correct. The threshold must match your production tolerance — a self-driving car needs tighter bounding boxes than a photo organizer.

---

### 5.2 Analyzing Per-Class and Per-Sample Results

**Plain Language:**
Aggregate mAP is an average of averages. It can hide catastrophic failures on rare but critical classes. A model with 0.90 mAP might have 0.98 AP on "car" (which dominates the dataset) and 0.35 AP on "cyclist" (which is rare but safety-critical). Per-class analysis breaks open the aggregate to show you where the model actually struggles. Per-sample analysis goes one level deeper — finding the specific images where failures concentrate.

**How It Works:**

```python
# Per-class breakdown
results.print_report(classes=["car", "pedestrian", "cyclist", "truck"])

# Get the confusion matrix to see systematic misclassifications
plot = results.plot_confusion_matrix(classes=["car", "truck", "bus"])
plot.show()

# Find all false positives — predictions that don't match any ground truth
from fiftyone import ViewField as F

false_positives_view = dataset.filter_labels(
    "predictions",
    F("eval") == "fp",
)

# Find all false negatives — ground truth objects the model missed
false_negatives_view = dataset.filter_labels(
    "ground_truth",
    F("eval") == "fn",
)

# Find samples with the most false positives (noisiest predictions)
sorted_by_fp = dataset.sort_by(
    F("predictions.detections").filter(F("eval") == "fp").length(),
    reverse=True,
)

# Launch the App to visually inspect failure cases
session = fo.launch_app(sorted_by_fp)
```

The confusion matrix is especially valuable. If your model consistently confuses "truck" with "bus," that tells you either the classes are visually ambiguous in your data, your annotations are inconsistent between those classes, or you need more diverse training examples of both. Each diagnosis leads to a different fix.

```python
# Drill into a specific confusion: where did the model predict "bus"
# but ground truth says "truck"?
confused_view = dataset.filter_labels(
    "predictions",
    (F("label") == "bus") & (F("eval_iou") < 0.5),
).filter_labels(
    "ground_truth",
    F("label") == "truck",
)

session.view = confused_view
```

**Real-World Example:**
A retail inventory system used object detection to count products on shelves. Overall mAP was 0.85 — "good enough" by typical standards. Per-class analysis revealed that AP for "small_bottle" was 0.41 while "large_box" was 0.97. The model was accurate for large, distinct items but failed on small, visually similar ones. The team focused annotation and augmentation efforts specifically on small bottle variants. Two weeks of targeted data work brought "small_bottle" AP from 0.41 to 0.79 without touching model architecture.

**Lean AI Sigma Connection:**
Per-class analysis is a **Pareto chart** for model failures. In Lean, you don't try to fix everything at once — you identify the vital few problems that cause the majority of defects. Sorting classes by AP from lowest to highest gives you a prioritized list of where data improvement work will have the highest ROI. The class with 0.35 AP and high sample frequency is your top target. The class with 0.40 AP but only 12 samples might not justify the effort yet.

---

### 5.3 Comparing Multiple Models

**Plain Language:**
You rarely have just one model. You might be comparing an older production model against a new candidate, testing different architectures, or evaluating the same model before and after a data improvement cycle. FiftyOne lets you store predictions from multiple models on the same dataset and evaluate them independently, so you can see exactly where one model outperforms another — not just in aggregate, but on specific classes and specific images.

**How It Works:**

```python
# Assume you've added predictions from two models as separate fields
# "predictions_v1" = your current production model
# "predictions_v2" = the candidate replacement

# Evaluate both against the same ground truth
results_v1 = dataset.evaluate_detections(
    "predictions_v1",
    gt_field="ground_truth",
    eval_key="eval_v1",
    compute_mAP=True,
)

results_v2 = dataset.evaluate_detections(
    "predictions_v2",
    gt_field="ground_truth",
    eval_key="eval_v2",
    compute_mAP=True,
)

# Compare aggregate metrics
print(f"Model V1 mAP: {results_v1.mAP():.4f}")
print(f"Model V2 mAP: {results_v2.mAP():.4f}")

# Per-class comparison
print("\n--- Model V1 ---")
results_v1.print_report()
print("\n--- Model V2 ---")
results_v2.print_report()

# Find samples where V2 is WORSE than V1
# (V1 has true positives that V2 misses)
from fiftyone import ViewField as F

v2_regressions = dataset.match(
    F("predictions_v1.detections").filter(F("eval_v1") == "tp").length()
    > F("predictions_v2.detections").filter(F("eval_v2") == "tp").length()
)

print(f"Regression samples: {len(v2_regressions)}")
session = fo.launch_app(v2_regressions)
```

This regression analysis is critical. A new model might improve overall mAP by 2 points but introduce failures on a safety-critical class that the old model handled correctly. Without sample-level comparison, you'd only see the aggregate improvement and miss the regression.

```python
# Tag samples where V2 regresses for manual review
v2_regressions.tag_samples("v2_regression")

# Find classes where V2 underperforms V1
v1_report = results_v1.report()
v2_report = results_v2.report()

for cls in v1_report:
    if cls == "micro avg" or cls == "macro avg" or cls == "weighted avg":
        continue
    v1_ap = v1_report[cls].get("precision", 0)
    v2_ap = v2_report[cls].get("precision", 0)
    if v2_ap < v1_ap:
        print(f"REGRESSION on '{cls}': V1={v1_ap:.3f} -> V2={v2_ap:.3f}")
```

**Real-World Example:**
A medical imaging team was evaluating a new model that achieved 3% higher overall accuracy on chest X-ray classification. Using FiftyOne's comparison workflow, they discovered the new model had worse performance on "pneumothorax" — a rare but urgent condition. The new model's overall improvement came from better performance on common findings like "cardiomegaly," while the old model was actually better at the finding that requires immediate clinical action. Without per-class comparison, they would have deployed a model that was better on average but worse where it mattered most.

**Lean AI Sigma Connection:**
Model comparison is **A/B testing for AI quality**. In manufacturing, you don't replace a process just because the new one has a higher average yield — you check whether it introduced new failure modes. The same discipline applies here. A model upgrade that improves mAP by 2 points but introduces 50 new false negatives on safety-critical classes is a quality regression, not an improvement. FiftyOne gives you the visibility to catch this before deployment.

---

### 5.4 Designing End-to-End Data Improvement Workflows

**Plain Language:**
The single most important concept in production AI is the iterative data improvement loop: evaluate the model, find where it fails, fix the underlying data, retrain, and evaluate again. Most teams do this informally — someone looks at a few bad predictions, makes some changes, and hopes things improve. FiftyOne makes this loop systematic and measurable.

The workflow has five stages:
1. **Evaluate** — run `evaluate_detections()` to get baseline metrics
2. **Diagnose** — use per-class analysis and visual inspection to identify failure patterns
3. **Curate** — select and export the problematic samples for re-annotation or augmentation
4. **Retrain** — train a new model on the improved dataset
5. **Re-evaluate** — run evaluation again and compare to the baseline

**How It Works:**

```python
import fiftyone as fo
from fiftyone import ViewField as F

dataset = fo.load_dataset("production_defect_detection")

# STAGE 1: Evaluate baseline
results_baseline = dataset.evaluate_detections(
    "predictions_v1",
    gt_field="ground_truth",
    eval_key="eval_baseline",
    compute_mAP=True,
)
print(f"Baseline mAP: {results_baseline.mAP():.4f}")
results_baseline.print_report()

# STAGE 2: Diagnose — find systematic failure patterns
# Find false negatives (missed detections) for the worst class
fn_view = dataset.filter_labels(
    "ground_truth",
    (F("eval_baseline") == "fn") & (F("label") == "hairline_crack"),
)
print(f"Missed 'hairline_crack' detections: {len(fn_view)}")

# Find high-confidence false positives (model is confidently wrong)
confident_fp_view = dataset.filter_labels(
    "predictions_v1",
    (F("eval_baseline") == "fp") & (F("confidence") > 0.8),
)
print(f"High-confidence false positives: {len(confident_fp_view)}")

# Inspect visually
session = fo.launch_app(fn_view)

# STAGE 3: Curate — export problematic samples for re-annotation
# Tag false-negative samples for re-annotation
fn_view.tag_samples("needs_reannotation")

# Export for annotation tool
fn_view.export(
    export_dir="/path/to/reannotation_batch",
    dataset_type=fo.types.COCODetectionDataset,
)

# After re-annotation and retraining, load new predictions...

# STAGE 5: Re-evaluate and compare
results_improved = dataset.evaluate_detections(
    "predictions_v2",
    gt_field="ground_truth",
    eval_key="eval_improved",
    compute_mAP=True,
)
print(f"Improved mAP: {results_improved.mAP():.4f}")
print(f"Delta: {results_improved.mAP() - results_baseline.mAP():+.4f}")

# Verify the specific failure class improved
results_improved.print_report(classes=["hairline_crack"])
```

The key to making this workflow effective is documenting each iteration. Tag each evaluation run with a descriptive eval_key ("eval_v1_baseline", "eval_v2_after_crack_reannotation") so you can trace exactly which data changes produced which metric improvements.

A more advanced pattern involves prioritizing which data to fix based on expected impact:

```python
# Prioritize classes by failure count * business importance
class_priorities = {}
report = results_baseline.report()
for cls in report:
    if cls in ("micro avg", "macro avg", "weighted avg"):
        continue
    fn_count = dataset.filter_labels(
        "ground_truth",
        (F("eval_baseline") == "fn") & (F("label") == cls),
    ).count("ground_truth.detections")
    class_priorities[cls] = fn_count

# Sort by most missed detections
for cls, count in sorted(class_priorities.items(), key=lambda x: -x[1]):
    print(f"{cls}: {count} false negatives")
```

**Real-World Example:**
A warehouse robotics company ran three iterations of this workflow over six weeks. Iteration 1: baseline mAP was 0.71. Diagnosis showed "pallet_jack" and "forklift" were frequently confused. They re-annotated 800 ambiguous samples. Iteration 2: mAP rose to 0.79. Diagnosis now showed the model missed forklifts in dark lighting. They added 500 augmented low-light images. Iteration 3: mAP reached 0.86. Each cycle targeted a specific, diagnosed failure mode rather than randomly adding more data. Six weeks of focused data work outperformed three months of architecture experimentation.

**Lean AI Sigma Connection:**
This is the **DMAIC cycle** (Define, Measure, Analyze, Improve, Control) applied to AI data. You define the quality target (mAP threshold), measure current performance (evaluate), analyze root causes (per-class diagnosis), improve (targeted data fixes), and control (re-evaluate to confirm improvement). The difference between teams that plateau at 0.80 mAP and teams that reach 0.95 is almost never model architecture — it's whether they have a disciplined data improvement process. FiftyOne is the tooling that makes DMAIC for AI practical.

---

## Check Your Understanding

1. You run `evaluate_detections()` with `iou=0.5` and get mAP of 0.84. You then re-run with `iou=0.75` and get mAP of 0.61. What does this gap tell you about your model, and what remediation would you prioritize — more training data, tighter annotations, or a different architecture?

2. Your model achieves 0.91 overall mAP across 15 classes, but one class ("motorcycle") has AP of 0.38. You have 200 motorcycle samples in your dataset versus 5,000+ for most other classes. Describe the diagnostic steps you would take in FiftyOne before deciding whether the fix is more data, better annotations, or class-specific augmentation.

3. You are comparing Model A (0.87 mAP) against Model B (0.89 mAP). A colleague recommends deploying Model B based on the higher aggregate score. What specific analysis would you perform in FiftyOne before agreeing, and what pattern would make you reject Model B despite its higher mAP?

## What's Next
Module 06 covers FiftyOne integrations with annotation tools, model zoos, and deployment pipelines — connecting the evaluation workflows you've learned here into a production-grade AI operations system.
