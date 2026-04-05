# Domain 5 Assessment — Model Evaluation & AI Workflows

---

## Question 1
**Scenario:** A logistics company evaluates their forklift detection model using FiftyOne's `evaluate_detections()` with `iou=0.5` and gets mAP of 0.88. Satisfied, they deploy to production. Within a week, the safety team reports that the system frequently triggers false alarms — bounding boxes fire on empty floor areas near forklifts. A post-mortem reveals that the model's predicted boxes were consistently 40% larger than the actual forklifts, but at IoU=0.5 these sloppy boxes still qualified as true positives.

What evaluation change would have caught this before deployment?

A) Use a lower IoU threshold (0.3) to be more lenient and reduce false positives
B) Re-evaluate with a stricter IoU threshold (e.g., 0.75 or COCO-style 0.5:0.95 averaging) — the gap between mAP@0.5 and mAP@0.75 would have revealed poor localization quality
C) Increase the confidence threshold for predictions to filter out low-confidence detections
D) Switch from mAP to accuracy as the evaluation metric since accuracy better captures localization quality

**Answer:** B

**Explanation:** The gap between mAP@0.5 and mAP@0.75 is a direct indicator of localization quality. A model that finds objects in the right area but draws imprecise boxes will score well at IoU=0.5 (where 50% overlap is sufficient) but poorly at IoU=0.75 (where 75% overlap is required). COCO-style evaluation averages across IoU thresholds from 0.5 to 0.95 in steps of 0.05, specifically to penalize sloppy localization. If this team had seen mAP drop from 0.88 at IoU=0.5 to 0.52 at IoU=0.75, they would have known the model needed tighter box regression before deployment. Option A makes the problem worse by accepting even sloppier boxes. Option C filters by confidence, which is orthogonal to localization quality — a model can be highly confident and still draw oversized boxes. Option D is wrong because accuracy is a classification metric that does not measure bounding box quality at all.

**Task Statement:** 5.1

---

## Question 2
**Scenario:** A retail shelf monitoring system has 0.91 overall mAP across 25 product categories. The operations team reports that inventory counts for energy drinks are consistently wrong. A data scientist runs `results.print_report()` and sees that the "energy_drink" class has precision of 0.94 but recall of 0.31.

What does this metric pattern tell you about the failure mode, and what is the most targeted diagnostic step?

A) The model is producing too many false positives for energy drinks — filter to `F("eval") == "fp"` on predictions with label "energy_drink" to see what's being incorrectly detected
B) The model correctly identifies energy drinks when it detects them (high precision) but misses most of them (low recall) — filter ground truth labels to `F("eval") == "fn"` with label "energy_drink" to visually inspect what's being missed
C) The class has too few training samples — add more energy drink images without further investigation
D) The IoU threshold is too strict for small objects — lower it to 0.3 for the energy drink class

**Answer:** B

**Explanation:** High precision (0.94) means that when the model predicts "energy_drink," it is almost always correct. Low recall (0.31) means the model misses 69% of actual energy drinks — they are present in the image but the model fails to detect them. The diagnostic step is to find the false negatives: `dataset.filter_labels("ground_truth", (F("eval") == "fn") & (F("label") == "energy_drink"))` and visually inspect them in the App. Common patterns you might discover: the model misses energy drinks in certain orientations (lying sideways), under specific lighting (reflective cans), or when partially occluded by other products. Each pattern points to a different remediation. Option A misreads the metrics — precision is high, so false positives are not the problem. Option C skips diagnosis entirely and assumes a data quantity problem without evidence. Option D changes the evaluation criteria rather than investigating the actual failure — and IoU=0.3 would accept detections with only 30% overlap, which is meaningless for inventory counting.

**Task Statement:** 5.2

---

## Question 3
**Scenario:** A self-driving car team is deciding whether to replace their production pedestrian detector (Model A, mAP 0.84) with a new model (Model B, mAP 0.87). Both models' predictions are stored on the same FiftyOne dataset as `predictions_a` and `predictions_b`. A team lead says, "Model B has higher mAP, so we ship it."

You run a regression analysis and find 127 samples where Model A correctly detects pedestrians that Model B misses entirely. Forty-three of those samples involve children near crosswalks.

What should you recommend?

A) Deploy Model B since it has higher mAP, and the 127 regression samples are statistically insignificant relative to the full dataset
B) Deploy Model A since it is safer, and reject Model B entirely
C) Do not deploy Model B yet — tag the 127 regression samples, investigate whether Model B's failures correlate with a specific sub-population (e.g., small stature, low contrast), and require the team to fix those regressions before deployment
D) Average the predictions of both models to get the best of both

**Answer:** C

**Explanation:** A 3-point mAP improvement is meaningless if it introduces regressions on a safety-critical sub-population. The correct response is to investigate, not to blindly deploy or reject. Tagging the 127 regression samples with `v2_regressions.tag_samples("b_regression")` and inspecting them in the FiftyOne App reveals whether the failures are random or systematic. If 43 of 127 regressions involve children near crosswalks, that is a systematic pattern — Model B likely struggles with smaller pedestrian instances or has weaker feature detection at lower pixel heights. The team should diagnose root cause, augment training data for that sub-population, retrain Model B, and re-evaluate before any deployment decision. Option A ignores that safety-critical regressions cannot be dismissed by aggregate statistics — a single missed child detection can be fatal. Option B is overly conservative — Model B's improvements on other scenarios may be valuable once the regressions are fixed. Option D (ensembling) adds latency and complexity without addressing the root cause of Model B's failures.

**Task Statement:** 5.3

---

## Question 4
**Scenario:** A manufacturing defect detection model achieves 0.72 mAP on initial evaluation. The team runs per-class analysis and discovers that "hairline_crack" has AP of 0.19 with 340 false negatives, "dent" has AP of 0.91, and "scratch" has AP of 0.65 with 85 false negatives. The team has budget for one round of annotation improvement before the next model release.

Using FiftyOne's data improvement workflow, which action will produce the largest mAP improvement?

A) Collect 5,000 new images of all defect types to increase overall dataset size
B) Focus on the "hairline_crack" class — export the 340 false negative samples using `fn_view.export()`, send them for re-annotation to verify ground truth quality, add augmented variants of confirmed examples, and retrain
C) Focus on improving "dent" detection from 0.91 to 0.95 since it's the closest to perfect
D) Lower the confidence threshold for all predictions to reduce false negatives across all classes

**Answer:** B

**Explanation:** The data improvement workflow prioritizes classes with the highest failure count and lowest AP, because that is where targeted fixes yield the largest metric gains. "hairline_crack" at 0.19 AP with 340 false negatives is the clear priority — fixing even half of those false negatives could dramatically increase that class's AP, which directly lifts overall mAP. The workflow: (1) create a view of false negatives with `dataset.filter_labels("ground_truth", (F("eval") == "fn") & (F("label") == "hairline_crack"))`, (2) visually inspect to determine whether failures are from poor annotations, insufficient training data, or inherent visual ambiguity, (3) export for re-annotation, (4) retrain, (5) re-evaluate. Option A spreads resources across all classes including "dent" which already performs well — this violates Pareto prioritization. Option C chases diminishing returns; improving from 0.91 to 0.95 requires significant effort for minimal mAP impact. Option D lowers confidence threshold, which reduces false negatives but increases false positives — it's a knob adjustment, not a data fix, and does nothing to address why the model misses hairline cracks.

**Task Statement:** 5.4

---

## Question 5
**Scenario:** A wildlife monitoring team evaluates two camera trap object detection models. Both achieve 0.82 mAP overall. The team concludes the models are equivalent and picks the faster one. A week later, field biologists complain that the system misses nearly all nighttime detections of small mammals while correctly identifying large animals day and night.

What FiftyOne analysis should the team have done before concluding the models were equivalent?

A) Compare inference speed benchmarks more carefully, since the faster model likely trades accuracy for speed
B) Run per-class analysis with `results.print_report()` to compare AP for each species, and create filtered views by time-of-day metadata to check whether performance degrades under specific conditions
C) Increase the IoU threshold to make the evaluation stricter, which would reveal the performance gap
D) Evaluate on a larger test set, since the current set was probably too small to capture the difference

**Answer:** B

**Explanation:** Identical aggregate mAP does not mean identical performance profiles. Two models can achieve the same mAP through completely different class-level performance — one might excel at large animals and struggle with small ones, while the other might be more balanced. The team should have run `results.print_report()` for both models and compared per-class AP, paying special attention to the species they care about most. If the dataset has time-of-day metadata (or the team adds it as a custom field), creating views like `dataset.match(F("time_of_day") == "night")` and re-evaluating on that subset would reveal condition-specific degradation. This combination of per-class and per-condition analysis is how you move from aggregate equivalence to operational understanding. Option A is unrelated to the detection accuracy problem. Option C might widen the gap but doesn't explain the class-level or condition-level breakdown. Option D assumes sample size is the issue, but the problem is analytical granularity, not statistical power.

**Task Statement:** 5.2

---

## Question 6
**Scenario:** An insurance company uses aerial drone imagery to detect roof damage. They store predictions from their current production model as `predictions_v3` and a retrained candidate as `predictions_v4`. After running `evaluate_detections()` on both, they see:

- Model V3: mAP 0.79
- Model V4: mAP 0.83

Before deploying V4, the team lead asks you to verify there are no regressions. You write:

```python
v4_regressions = dataset.match(
    F("predictions_v3.detections").filter(F("eval_v3") == "tp").length()
    > F("predictions_v4.detections").filter(F("eval_v4") == "tp").length()
)
```

This returns 312 regression samples. What is the correct next step?

A) Ignore the regressions — 312 out of tens of thousands is an acceptable loss for a 4-point mAP gain
B) Tag the 312 samples, visually inspect them in the FiftyOne App to determine whether regressions cluster around a specific damage type, roof material, or image condition, then decide whether to deploy, fix, or conditionally deploy
C) Reject Model V4 entirely and keep V3 in production
D) Re-run the evaluation with a lower IoU threshold so the regressions disappear

**Answer:** B

**Explanation:** The number alone (312) is not enough to make a deployment decision — you need to understand what the regressions are. Tag them with `v4_regressions.tag_samples("v4_regression")` and inspect in the App. If the regressions are random and spread across damage types with no systematic pattern, they may be acceptable noise offset by V4's improvements elsewhere. If they cluster on a specific category (e.g., V4 misses hail damage on dark shingles that V3 caught), that is a systematic regression requiring targeted remediation before deployment. The investigation might also reveal that V3's "correct" detections on those samples were actually lucky matches on ambiguous annotations — visual inspection resolves this. Option A dismisses regressions without investigation, which is reckless in a claims-related application. Option C is overly conservative — V4 may be genuinely better once a targeted fix addresses the regression cluster. Option D manipulates the evaluation threshold to hide the problem rather than understanding it.

**Task Statement:** 5.3

---

## Question 7
**Scenario:** A team completes their second iteration of the FiftyOne data improvement workflow. Iteration 1 fixed annotation inconsistencies and raised mAP from 0.68 to 0.77. Iteration 2 added augmented low-light images and raised mAP to 0.81. The team has budget for one more iteration and needs to reach 0.85 mAP for production approval.

They run per-class analysis and find two underperforming classes: "bicycle" (AP 0.52, 180 false negatives) and "traffic_cone" (AP 0.44, 95 false negatives). The team debates which class to prioritize. An engineer argues for "traffic_cone" because it has the lower AP.

What is the flaw in the engineer's reasoning, and how should they decide?

A) The engineer is correct — always prioritize the class with the lowest AP because it has the most room for improvement
B) AP alone is insufficient — they should prioritize based on false negative count multiplied by the class's representation in the dataset, because fixing "bicycle" (180 false negatives) likely contributes more to overall mAP than fixing "traffic_cone" (95 false negatives), and they should visually inspect both failure sets to determine which is more actionable
C) They should split the budget equally between both classes to ensure balanced improvement
D) They should ignore per-class analysis and instead add more images across all classes to raise the aggregate

**Answer:** B

**Explanation:** Overall mAP is a weighted function of per-class AP, where the weight depends on the number of ground truth instances for each class. A class with more samples in the dataset contributes more to the aggregate mAP. "bicycle" has nearly twice the false negatives (180 vs 95), suggesting it may have more ground truth instances and thus a larger pull on overall mAP. More importantly, the team should inspect both failure sets in FiftyOne: `dataset.filter_labels("ground_truth", (F("eval") == "fn") & (F("label") == "bicycle"))`. If bicycle false negatives show a clear pattern (e.g., occluded by cars, nighttime scenes) that can be fixed with targeted augmentation, that class offers a more actionable path to improvement. If traffic_cone false negatives stem from ambiguous annotations that require expensive re-labeling, the ROI is lower. Option A uses a single metric in isolation. Option C ignores the asymmetric impact of each class on overall mAP. Option D wastes budget on classes already performing well and violates the Pareto principle.

**Task Statement:** 5.4
